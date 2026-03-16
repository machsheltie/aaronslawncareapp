import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { invoiceId, paymentMethodType } = await req.json()

    if (!invoiceId) {
      return new Response(
        JSON.stringify({ error: 'invoiceId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch invoice details
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*, customers(name, email)')
      .eq('id', invoiceId)
      .single()

    if (fetchError || !invoice) {
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (invoice.payment_status === 'paid') {
      return new Response(
        JSON.stringify({ error: 'Invoice already paid' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const amount = Math.round(Number(invoice.total) * 100) // cents
    const methodType = paymentMethodType || 'card'

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount,
      currency: 'usd',
      payment_method_types: [methodType],
      metadata: { invoiceId, invoiceNumber: invoice.invoice_number },
    }

    // Add ACH-specific options
    if (methodType === 'us_bank_account') {
      paymentIntentParams.payment_method_options = {
        us_bank_account: {
          financial_connections: { permissions: ['payment_method'] },
        },
      }
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)

    // Store the payment intent ID on the invoice
    await supabase
      .from('invoices')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        stripe_payment_status: paymentIntent.status,
      })
      .eq('id', invoiceId)

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
