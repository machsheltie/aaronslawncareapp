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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const { invoiceId, photoPath } = await req.json()

    if (!invoiceId) {
      return new Response(
        JSON.stringify({ error: 'invoiceId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch invoice with customer details
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*, customers(name, phone, email)')
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
        JSON.stringify({ error: 'Invoice already paid', alreadyPaid: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const customerPhone = invoice.customers?.phone
    if (!customerPhone) {
      return new Response(
        JSON.stringify({ error: 'Customer has no phone number on file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a Stripe Checkout Session (hosted payment page - no frontend needed)
    const amount = Math.round(Number(invoice.total) * 100)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Aaron's Lawn Care — ${invoice.invoice_number}`,
              description: invoice.notes || 'Lawn care service',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
      },
      success_url: `${Deno.env.get('APP_URL') || 'https://aaronslawncare502.com'}/pay/success?invoice=${invoice.invoice_number}`,
      cancel_url: `${Deno.env.get('APP_URL') || 'https://aaronslawncare502.com'}/pay/cancelled`,
    })

    // Store the checkout session URL on the invoice
    await supabase
      .from('invoices')
      .update({
        stripe_checkout_url: session.url,
        stripe_checkout_session_id: session.id,
      })
      .eq('id', invoiceId)

    // Send SMS via Twilio
    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuth = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!twilioSid || !twilioAuth || !twilioPhone) {
      // Twilio not configured — return the URL but skip SMS
      return new Response(
        JSON.stringify({
          success: true,
          paymentUrl: session.url,
          smsSent: false,
          reason: 'Twilio not configured',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Format phone to E.164 (strip non-digits, add +1 if needed)
    let phone = customerPhone.replace(/\D/g, '')
    if (phone.length === 10) phone = '1' + phone
    if (!phone.startsWith('+')) phone = '+' + phone

    const totalFormatted = Number(invoice.total).toFixed(2)
    const message = `Aaron's Lawn Care\n\nInvoice ${invoice.invoice_number}\nAmount: $${totalFormatted}\n\nPay securely here:\n${session.url}\n\nThank you for your business!`

    // Generate a signed URL for the job photo if provided
    let photoUrl: string | null = null
    if (photoPath) {
      const { data: signedData } = await supabase.storage
        .from('job-photos')
        .createSignedUrl(photoPath, 7200) // 2 hour expiry
      if (signedData?.signedUrl) {
        photoUrl = signedData.signedUrl
      }
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`
    const twilioBody = new URLSearchParams({
      To: phone,
      From: twilioPhone,
      Body: message,
    })
    // Attach photo as MMS if available
    if (photoUrl) {
      twilioBody.append('MediaUrl', photoUrl)
    }

    const twilioResp = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${twilioSid}:${twilioAuth}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: twilioBody.toString(),
    })

    const twilioResult = await twilioResp.json()

    if (!twilioResp.ok) {
      console.error('Twilio error:', twilioResult)
      return new Response(
        JSON.stringify({
          success: true,
          paymentUrl: session.url,
          smsSent: false,
          reason: twilioResult.message || 'Twilio send failed',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Record that SMS was sent
    await supabase
      .from('invoices')
      .update({ sms_sent_at: new Date().toISOString() })
      .eq('id', invoiceId)

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: session.url,
        smsSent: true,
        messageSid: twilioResult.sid,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('send-invoice-sms error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
