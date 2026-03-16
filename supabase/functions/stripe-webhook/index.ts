import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.0.0'

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      const invoiceId = pi.metadata.invoiceId
      if (invoiceId) {
        await supabase
          .from('invoices')
          .update({
            payment_status: 'paid',
            stripe_payment_status: 'succeeded',
            paid_at: new Date().toISOString(),
            amount_paid: pi.amount / 100,
            payment_method: pi.payment_method_types?.[0] === 'us_bank_account' ? 'ach' : 'credit_card',
          })
          .eq('id', invoiceId)
      }
      break
    }

    case 'payment_intent.processing': {
      const pi = event.data.object as Stripe.PaymentIntent
      const invoiceId = pi.metadata.invoiceId
      if (invoiceId) {
        await supabase
          .from('invoices')
          .update({
            payment_status: 'processing',
            stripe_payment_status: 'processing',
          })
          .eq('id', invoiceId)
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      const invoiceId = pi.metadata.invoiceId
      if (invoiceId) {
        await supabase
          .from('invoices')
          .update({
            payment_status: 'failed',
            stripe_payment_status: 'failed',
          })
          .eq('id', invoiceId)
      }
      break
    }

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const invoiceId = session.metadata?.invoiceId
      if (invoiceId && session.payment_status === 'paid') {
        await supabase
          .from('invoices')
          .update({
            payment_status: 'paid',
            stripe_payment_status: 'succeeded',
            paid_at: new Date().toISOString(),
            amount_paid: (session.amount_total ?? 0) / 100,
            payment_method: 'credit_card',
          })
          .eq('id', invoiceId)
      }
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
