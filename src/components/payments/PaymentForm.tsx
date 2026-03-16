import { useState } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import type { InvoiceWithCustomer } from '@/hooks/useInvoices'

type PaymentMethod = 'card' | 'us_bank_account'

export default function PaymentForm({ invoice, onSuccess }: { invoice: InvoiceWithCustomer; onSuccess: () => void }) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!stripePromise) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        Stripe is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to your .env file.
      </div>
    )
  }

  const handleStartPayment = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-payment-intent', {
        body: { invoiceId: invoice.id, paymentMethodType: paymentMethod },
      })
      if (fnError) throw fnError
      if (data?.error) throw new Error(data.error)
      setClientSecret(data.clientSecret)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start payment')
    } finally {
      setLoading(false)
    }
  }

  if (!clientSecret) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Amount Due</p>
          <p className="text-2xl font-bold text-gray-800">${Number(invoice.total).toFixed(2)}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                paymentMethod === 'card'
                  ? 'border-brand-green bg-green-50 text-brand-green'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              Credit/Debit Card
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('us_bank_account')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                paymentMethod === 'us_bank_account'
                  ? 'border-brand-green bg-green-50 text-brand-green'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              Bank Account (ACH)
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleStartPayment}
          disabled={loading}
          className="w-full bg-brand-green text-white py-3 rounded-md font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
        >
          {loading ? 'Setting up...' : 'Continue to Payment'}
        </button>
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: { colorPrimary: '#2D5016' },
        },
      }}
    >
      <CheckoutForm
        amount={Number(invoice.total)}
        onSuccess={onSuccess}
        onBack={() => setClientSecret(null)}
      />
    </Elements>
  )
}

function CheckoutForm({
  amount,
  onSuccess,
  onBack,
}: {
  amount: number
  onSuccess: () => void
  onBack: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/invoices`,
      },
      redirect: 'if_required',
    })

    if (submitError) {
      setError(submitError.message ?? 'Payment failed')
      setProcessing(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-sm text-gray-600 mb-1">Paying</p>
        <p className="text-2xl font-bold text-gray-800">${amount.toFixed(2)}</p>
      </div>

      <PaymentElement />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 bg-brand-green text-white py-3 rounded-md font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
        >
          {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      </div>
    </form>
  )
}
