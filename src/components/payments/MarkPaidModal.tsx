import { useState } from 'react'
import { useUpdateInvoiceStatus } from '@/hooks/useInvoices'

type PaymentMethod = 'cash' | 'check' | 'ach' | 'credit_card'

type Props = {
  isOpen: boolean
  onClose: () => void
  invoiceId: string
  invoiceNumber?: string
  onSuccess?: () => void
}

const METHODS: Array<{ value: PaymentMethod; label: string; emoji: string }> = [
  { value: 'cash', label: 'Cash', emoji: '💵' },
  { value: 'check', label: 'Check', emoji: '🧾' },
  { value: 'ach', label: 'ACH', emoji: '🏦' },
  { value: 'credit_card', label: 'Credit Card', emoji: '💳' },
]

export default function MarkPaidModal({ isOpen, onClose, invoiceId, invoiceNumber, onSuccess }: Props) {
  const updateStatus = useUpdateInvoiceStatus()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<PaymentMethod | null>(null)

  if (!isOpen) return null

  const handlePick = async (method: PaymentMethod) => {
    setError(null)
    setPending(method)
    try {
      await updateStatus.mutateAsync({ id: invoiceId, status: 'paid', paymentMethod: method })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark invoice as paid')
    } finally {
      setPending(null)
    }
  }

  const disabled = pending !== null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Mark Paid{invoiceNumber ? ` — ${invoiceNumber}` : ''}
          </h3>
          <button
            onClick={onClose}
            disabled={disabled}
            className="text-gray-400 hover:text-gray-600 text-xl disabled:opacity-50"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">How was this invoice paid?</p>

        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => handlePick(m.value)}
              disabled={disabled}
              className="border-2 border-gray-200 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {pending === m.value ? (
                <span className="inline-block w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{m.emoji} {m.label}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
