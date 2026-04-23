import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mirror of src/hooks/useJobs.ts SERVICE_TYPES. Kept inline to avoid client-server import.
const SERVICE_LABELS: Record<string, string> = {
  mowing: 'Mowing',
  edging: 'Edging',
  leaf_removal: 'Leaf Removal',
  aeration: 'Aeration',
  landscaping: 'Landscaping',
  garden_bed_design: 'Garden Bed Design',
  hedge_trimming: 'Hedge Trimming',
  tree_removal: 'Tree Removal',
  tilling: 'Tilling',
  snow_removal: 'Snow Removal',
  spraying: 'Spraying',
  weed_removal: 'Weed Removal',
  mulching: 'Mulching',
  seeding_grass: 'Seeding Grass',
  french_drain: 'French Drain Installation',
}

function getServiceLabels(serviceType: string): string {
  return serviceType
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(t => SERVICE_LABELS[t] ?? t)
    .join(', ')
}

async function getNextInvoiceNumber(supabase: SupabaseClient): Promise<string> {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
  const prefix = `INV-${today}`
  const { data } = await supabase
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `${prefix}%`)
    .order('invoice_number', { ascending: false })
    .limit(1)
  if (data && data.length > 0) {
    const lastNum = parseInt(data[0].invoice_number.split('-')[2] || '0', 10)
    return `${prefix}-${String(lastNum + 1).padStart(3, '0')}`
  }
  return `${prefix}-001`
}

// Ensure a Stripe Customer exists and return its ID. Handles the concurrent-create race
// via UNIQUE constraint + re-read (Decision 14 / AC16).
async function ensureStripeCustomer(
  supabase: SupabaseClient,
  stripe: Stripe,
  customerId: string
): Promise<string> {
  const { data: customer, error } = await supabase
    .from('customers')
    .select('id, name, phone, email, stripe_customer_id')
    .eq('id', customerId)
    .single()
  if (error || !customer) throw new Error(`Customer ${customerId} not found`)

  // Stripe's `collection_method: 'send_invoice'` REQUIRES a valid email on the
  // Customer. Spec Decision 20 wrongly said to omit email — Stripe rejects
  // that with "Missing email." We pass the real email when available, or a
  // no-op placeholder on aaronslawncare.com (a domain Aaron controls, so the
  // black-hole address can't collide with anyone else). Email delivery is
  // still suppressed via `auto_advance: false` on the invoice and the Stripe
  // Dashboard "Email customer invoices" / "Email invoice reminders" toggles.
  const placeholderEmail = `no-reply+${customerId}@aaronslawncare.com`
  const email = customer.email ?? placeholderEmail

  if (customer.stripe_customer_id) {
    // A previously-created Stripe Customer may lack an email (created
    // before this fix). Patch it so `collection_method: 'send_invoice'`
    // doesn't reject the invoice on finalization.
    try {
      const existing = await stripe.customers.retrieve(customer.stripe_customer_id)
      if (!('deleted' in existing && existing.deleted) && !existing.email) {
        await stripe.customers.update(customer.stripe_customer_id, { email })
      }
    } catch (err) {
      console.warn('Stripe Customer verify/patch failed', err)
    }
    return customer.stripe_customer_id
  }

  const created = await stripe.customers.create({
    name: customer.name,
    phone: customer.phone,
    email,
    metadata: { app_customer_id: customerId },
  })

  const { error: updateError } = await supabase
    .from('customers')
    .update({ stripe_customer_id: created.id })
    .eq('id', customerId)

  if (updateError) {
    // UNIQUE-constraint violation from concurrent write — re-read and use the winner's ID.
    const { data: reread } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', customerId)
      .single()
    if (reread?.stripe_customer_id) return reread.stripe_customer_id
    throw updateError
  }

  return created.id
}

type BranchAInput = {
  invoiceId: string
  jobData: {
    customer_id: string
    job_id?: string
    service_type: string
    amount: number
    notes?: string
    due_days?: number
  }
  photoPath?: string
}

type BranchBInput = {
  existingInvoiceId: string
}

type Input = BranchAInput | BranchBInput

function isBranchA(input: Input): input is BranchAInput {
  return 'invoiceId' in input && 'jobData' in input
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const input = (await req.json()) as Input

    if (isBranchA(input)) {
      return await handleBranchA(supabase, stripe, input)
    }
    if ('existingInvoiceId' in input && input.existingInvoiceId) {
      return await handleBranchB(supabase, stripe, input)
    }
    return new Response(
      JSON.stringify({ error: 'Invalid input: expected {invoiceId, jobData} or {existingInvoiceId}' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('send-invoice-sms error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function buildLineItemDescription(
  baseDescription: string,
  supabase: SupabaseClient,
  photoPath?: string
): Promise<{ itemDescription: string; footerText?: string }> {
  if (!photoPath) return { itemDescription: baseDescription }

  const { data: signed } = await supabase.storage
    .from('job-photos')
    .createSignedUrl(photoPath, 7_776_000) // 90 days
  const photoUrl = signed?.signedUrl
  if (!photoUrl) return { itemDescription: baseDescription }

  const combined = `${baseDescription} — After photo: ${photoUrl}`
  if (combined.length <= 500) {
    return { itemDescription: combined }
  }
  const footerCandidate = `After photo: ${photoUrl}`
  if (footerCandidate.length <= 500) {
    return { itemDescription: baseDescription, footerText: footerCandidate }
  }
  // Either too long — silently skip the photo link.
  return { itemDescription: baseDescription }
}

async function handleBranchA(
  supabase: SupabaseClient,
  stripe: Stripe,
  input: BranchAInput
): Promise<Response> {
  const { invoiceId, jobData, photoPath } = input
  const {
    customer_id,
    job_id,
    service_type,
    amount,
    notes,
    due_days = 7,
  } = jobData

  const stripeCustomerId = await ensureStripeCustomer(supabase, stripe, customer_id)

  const baseDescription = getServiceLabels(service_type) || 'Lawn care service'
  const { itemDescription, footerText } = await buildLineItemDescription(
    baseDescription,
    supabase,
    photoPath
  )

  // Create the invoice FIRST (empty draft), then attach line items to it
  // explicitly via the `invoice` param on invoiceItems.create. Stripe no
  // longer auto-pulls pending customer invoice items into manual (non-
  // subscription) invoices, so we can't rely on create-item-then-create-
  // invoice — it produces a $0 invoice with the item orphaned.
  const createdInvoice = await stripe.invoices.create(
    {
      customer: stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: due_days,
      auto_advance: false, // Decision 20: suppress Stripe dunning
      metadata: { app_invoice_id: invoiceId },
      ...(footerText ? { footer: footerText } : {}),
    },
    { idempotencyKey: invoiceId }
  )

  await stripe.invoiceItems.create({
    customer: stripeCustomerId,
    invoice: createdInvoice.id!,
    amount: Math.round(amount * 100),
    currency: 'usd',
    description: itemDescription,
  })

  const finalized = await stripe.invoices.finalizeInvoice(createdInvoice.id!)

  // Build app invoice row. Due date derived from due_days.
  const today = new Date()
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + due_days)

  const invoiceNumber = await getNextInvoiceNumber(supabase)

  const { error: insertError } = await supabase.from('invoices').insert({
    id: invoiceId,
    customer_id,
    job_id: job_id ?? null,
    invoice_number: invoiceNumber,
    invoice_date: today.toISOString().split('T')[0],
    due_date: dueDate.toISOString().split('T')[0],
    subtotal: amount,
    tax: 0,
    total: amount,
    payment_status: 'unpaid',
    notes: notes ?? null,
    stripe_invoice_id: finalized.id,
    stripe_invoice_url: finalized.hosted_invoice_url,
  })
  if (insertError) throw insertError

  return new Response(
    JSON.stringify({
      success: true,
      invoiceId,
      stripe_invoice_id: finalized.id,
      hosted_invoice_url: finalized.hosted_invoice_url,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleBranchB(
  supabase: SupabaseClient,
  stripe: Stripe,
  input: BranchBInput
): Promise<Response> {
  const { existingInvoiceId } = input

  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select(
      'id, customer_id, job_id, subtotal, total, notes, payment_status, stripe_invoice_id, stripe_invoice_url, jobs(service_type)'
    )
    .eq('id', existingInvoiceId)
    .single()

  if (fetchError || !invoice) {
    return new Response(
      JSON.stringify({ error: 'Invoice not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (invoice.payment_status === 'paid') {
    return new Response(
      JSON.stringify({ error: 'Invoice already paid', alreadyPaid: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Fast path: Stripe Invoice already exists for this row — return it unchanged.
  if (invoice.stripe_invoice_id && invoice.stripe_invoice_url) {
    return new Response(
      JSON.stringify({
        success: true,
        invoiceId: invoice.id,
        stripe_invoice_id: invoice.stripe_invoice_id,
        hosted_invoice_url: invoice.stripe_invoice_url,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const stripeCustomerId = await ensureStripeCustomer(supabase, stripe, invoice.customer_id)

  // Resolve line item description: joined jobs.service_type > notes > generic.
  const jobServiceType = (invoice.jobs as { service_type?: string } | null)?.service_type
  let baseDescription: string
  if (jobServiceType) {
    baseDescription = getServiceLabels(jobServiceType) || 'Lawn care service'
  } else if (invoice.notes) {
    baseDescription = invoice.notes
  } else {
    baseDescription = 'Lawn care service'
  }

  const amount = Number(invoice.total)

  const createdInvoice = await stripe.invoices.create(
    {
      customer: stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: 7,
      auto_advance: false,
      metadata: { app_invoice_id: invoice.id },
    },
    // Branch B (resend path): use a fresh idempotency key per call, otherwise
    // a failed first attempt caches its error for 24h and every retry replays
    // it. Double-tap protection on this branch comes from the UI button
    // disabled-while-pending state, not Stripe idempotency.
    { idempotencyKey: `${invoice.id}-${Date.now()}` }
  )

  await stripe.invoiceItems.create({
    customer: stripeCustomerId,
    invoice: createdInvoice.id!,
    amount: Math.round(amount * 100),
    currency: 'usd',
    description: baseDescription,
  })

  const finalized = await stripe.invoices.finalizeInvoice(createdInvoice.id!)

  const { error: updateError } = await supabase
    .from('invoices')
    .update({
      stripe_invoice_id: finalized.id,
      stripe_invoice_url: finalized.hosted_invoice_url,
    })
    .eq('id', invoice.id)
  if (updateError) throw updateError

  return new Response(
    JSON.stringify({
      success: true,
      invoiceId: invoice.id,
      stripe_invoice_id: finalized.id,
      hosted_invoice_url: finalized.hosted_invoice_url,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
