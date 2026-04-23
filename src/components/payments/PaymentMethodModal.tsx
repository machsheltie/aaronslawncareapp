import { useState } from 'react'
import { useUploadPhoto } from '@/hooks/usePhotos'
import {
  useCreateInvoice,
  useCreateStripeInvoice,
  useUpdateInvoiceStatus,
  type InvoiceWithCustomer,
} from '@/hooks/useInvoices'
import { getServiceLabels } from '@/hooks/useJobs'
import type { JobWithCustomer } from '@/hooks/useJobs'
import { normalizeToE164 } from '@/lib/phone'

type Props = {
  isOpen: boolean
  onClose: () => void
  /** Invoked after the user should see the job transition to completed. */
  onComplete: () => void
  /** Invoked with a newly created app invoice when user chose Card Now — parent opens PaymentForm. */
  onCardNow?: (invoice: InvoiceWithCustomer) => void
  job: JobWithCustomer
  /** Raw photo file — uploaded only on Text Invoice path (Decision 17 / AC15). */
  photoFile?: File
}

type UiState =
  | { kind: 'idle' }
  | { kind: 'loading'; method: 'text' | 'cash' | 'check' | 'card' }
  | { kind: 'text_ready'; smsUri: string; hostedUrl: string; copied: boolean }
  | { kind: 'success' }
  | { kind: 'error'; message: string }

export default function PaymentMethodModal({
  isOpen,
  onClose,
  onComplete,
  onCardNow,
  job,
  photoFile,
}: Props) {
  const [state, setState] = useState<UiState>({ kind: 'idle' })
  const uploadPhoto = useUploadPhoto()
  const createStripeInvoice = useCreateStripeInvoice()
  const createInvoice = useCreateInvoice()
  const updateStatus = useUpdateInvoiceStatus()

  if (!isOpen) return null

  const customer = job.customers
  const customerName = customer?.name ?? 'Customer'
  const firstName = customerName.split(' ')[0]
  const phone = customer?.phone ?? ''
  const hasPhone = Boolean(phone)

  const amount = Number(job.actual_price ?? job.estimated_price ?? 0)
  const notes = `${getServiceLabels(job.service_type)} — ${new Date().toISOString().split('T')[0]}`

  const disabled = state.kind === 'loading' || state.kind === 'success'

  const flashSuccessThenClose = (after: () => void) => {
    setState({ kind: 'success' })
    setTimeout(() => {
      after()
      setState({ kind: 'idle' })
    }, 500)
  }

  const launchSmsUri = (uri: string) => {
    // iOS Safari (and PWAs especially) blocks sms: navigation via
    // window.location when the user-gesture chain has been broken by
    // setTimeout. A synthetic anchor click is the most reliable trigger.
    const a = document.createElement('a')
    a.href = uri
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleTextInvoice = async () => {
    if (!hasPhone) return
    setState({ kind: 'loading', method: 'text' })
    try {
      let photoPath: string | undefined
      if (photoFile) {
        const uploaded = await uploadPhoto.mutateAsync({
          jobId: job.id,
          file: photoFile,
          photoType: 'after',
        })
        photoPath = uploaded.storage_path
      }

      const invoiceId = crypto.randomUUID()
      const result = await createStripeInvoice.mutateAsync({
        invoiceId,
        jobData: {
          customer_id: job.customer_id,
          job_id: job.id,
          service_type: job.service_type,
          amount,
          notes,
          due_days: 7,
        },
        photoPath,
      })

      const body = `Hi ${firstName}, your invoice from Aaron's Lawn Care is ready: ${result.hosted_invoice_url}`
      const smsUri = `sms:${normalizeToE164(phone)}?body=${encodeURIComponent(body)}`

      // Stop here — do NOT auto-launch sms: or tear down the modal. iOS
      // Safari/PWA regularly blocks sms: navigation when the initiating
      // gesture was consumed by awaits above. Hand the user an explicit
      // "Open Messages" button that fires the URI from a fresh tap.
      setState({ kind: 'text_ready', smsUri, hostedUrl: result.hosted_invoice_url, copied: false })
    } catch (err) {
      setState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Failed to create invoice',
      })
    }
  }

  const handleOpenMessages = () => {
    if (state.kind !== 'text_ready') return
    launchSmsUri(state.smsUri)
  }

  const handleCopyLink = async () => {
    if (state.kind !== 'text_ready') return
    try {
      await navigator.clipboard.writeText(state.hostedUrl)
      setState({ ...state, copied: true })
    } catch {
      // Clipboard API unavailable (insecure context, older browser) — fall
      // back to a visible URL the user can long-press to copy manually.
      setState({ ...state, copied: false })
    }
  }

  const handleFinishText = () => {
    onComplete()
    onClose()
    setState({ kind: 'idle' })
  }

  const handleCashOrCheck = async (method: 'cash' | 'check') => {
    setState({ kind: 'loading', method })
    try {
      const invoice = await createInvoice.mutateAsync({
        customer_id: job.customer_id,
        job_id: job.id,
        subtotal: amount,
        notes,
      })
      await updateStatus.mutateAsync({
        id: invoice.id,
        status: 'paid',
        paymentMethod: method,
      })
      flashSuccessThenClose(() => {
        onComplete()
        onClose()
      })
    } catch (err) {
      setState({
        kind: 'error',
        message: err instanceof Error ? err.message : `Failed to record ${method} payment`,
      })
    }
  }

  const handleCardNow = async () => {
    setState({ kind: 'loading', method: 'card' })
    try {
      const invoice = await createInvoice.mutateAsync({
        customer_id: job.customer_id,
        job_id: job.id,
        subtotal: amount,
        notes,
      })
      flashSuccessThenClose(() => {
        onCardNow?.(invoice)
        onComplete()
        onClose()
      })
    } catch (err) {
      setState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Failed to create invoice',
      })
    }
  }

  const loadingText = state.kind === 'loading' && state.method === 'text'
  const loadingCash = state.kind === 'loading' && state.method === 'cash'
  const loadingCheck = state.kind === 'loading' && state.method === 'check'
  const loadingCard = state.kind === 'loading' && state.method === 'card'

  if (state.kind === 'text_ready') {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Invoice ready to text
            </h3>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            Invoice created for <span className="font-medium">{customerName}</span>.
            Tap <span className="font-medium">Open Messages</span> to launch your texting app with the link pre-filled.
          </p>

          <button
            type="button"
            onClick={handleOpenMessages}
            className="w-full bg-brand-green text-white py-4 rounded-md font-semibold text-base hover:bg-brand-accent transition-colors mb-3"
          >
            📱 Open Messages
          </button>

          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 border-2 border-gray-200 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {state.copied ? '✓ Copied' : 'Copy Link'}
            </button>
            <a
              href={state.hostedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 border-2 border-gray-200 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors text-center"
            >
              Preview
            </a>
          </div>

          <p className="text-xs text-gray-500 break-all mb-4 select-all">{state.hostedUrl}</p>

          <button
            type="button"
            onClick={handleFinishText}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors"
          >
            Done — mark job completed
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            How is {customerName} paying?
          </h3>
          <button
            onClick={() => {
              if (disabled) return
              onClose()
            }}
            disabled={disabled}
            className="text-gray-400 hover:text-gray-600 text-xl disabled:opacity-50"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {amount > 0 && (
          <p className="text-sm text-gray-500 mb-3">
            Total: <span className="font-semibold text-gray-800">${amount.toFixed(2)}</span>
          </p>
        )}

        {state.kind === 'success' && (
          <div className="mb-3 flex items-center justify-center py-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl">
              &#10003;
            </div>
          </div>
        )}

        {state.kind === 'error' && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
            {state.message}
          </div>
        )}

        {/* Text Invoice — PRIMARY */}
        <button
          type="button"
          onClick={handleTextInvoice}
          disabled={disabled || !hasPhone}
          title={!hasPhone ? 'No phone number on file' : undefined}
          className="w-full bg-brand-green text-white py-4 rounded-md font-semibold text-base hover:bg-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          {loadingText ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating invoice…
            </span>
          ) : (
            <span>📱 Text Invoice</span>
          )}
        </button>
        {!hasPhone && (
          <p className="text-xs text-gray-500 mb-3 -mt-2">No phone number on file</p>
        )}

        {/* Cash / Check — SECONDARY row */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={() => handleCashOrCheck('cash')}
            disabled={disabled}
            className="border-2 border-gray-200 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loadingCash ? (
              <span className="inline-block w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>💵 Cash</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleCashOrCheck('check')}
            disabled={disabled}
            className="border-2 border-gray-200 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loadingCheck ? (
              <span className="inline-block w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>🧾 Check</span>
            )}
          </button>
        </div>

        {/* Card Now — TERTIARY */}
        <button
          type="button"
          onClick={handleCardNow}
          disabled={disabled}
          className="w-full border border-gray-300 text-gray-600 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {loadingCard ? (
            <span className="inline-block w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>💳 Card Now (on-site)</span>
          )}
        </button>
      </div>
    </div>
  )
}
