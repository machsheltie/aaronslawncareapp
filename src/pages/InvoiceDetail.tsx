import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useInvoice, useUpdateInvoiceStatus, useDeleteInvoice, PAYMENT_STATUS_OPTIONS } from '@/hooks/useInvoices'
import PaymentForm from '@/components/payments/PaymentForm'
import { useQueryClient } from '@tanstack/react-query'
import { downloadInvoicePdf } from '@/lib/generateInvoicePdf'

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: invoice, isLoading, error } = useInvoice(id)
  const updateStatus = useUpdateInvoiceStatus()
  const deleteInvoice = useDeleteInvoice()
  const [showPayment, setShowPayment] = useState(false)

  const handleMarkPaid = () => {
    if (!invoice) return
    const method = prompt('Payment method: cash, check, ach, or credit_card')
    if (method && ['cash', 'check', 'ach', 'credit_card'].includes(method)) {
      updateStatus.mutate({ id: invoice.id, status: 'paid', paymentMethod: method })
    }
  }

  const handleDelete = () => {
    if (invoice && confirm('Delete this invoice?')) {
      deleteInvoice.mutate(invoice.id, { onSuccess: () => navigate('/invoices') })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Invoice not found.</p>
        <Link to="/invoices" className="text-brand-green hover:underline">Back to invoices</Link>
      </div>
    )
  }

  const statusInfo = PAYMENT_STATUS_OPTIONS.find(s => s.value === invoice.payment_status)
  const isOverdue = invoice.payment_status === 'unpaid' && new Date(invoice.due_date + 'T00:00:00') < new Date()

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/invoices" className="text-sm text-brand-green hover:underline mb-1 inline-block">
            &larr; All Invoices
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">{invoice.invoice_number}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo?.color ?? ''}`}>
              {statusInfo?.label ?? invoice.payment_status}
            </span>
            {isOverdue && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white font-medium">
                Overdue
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {invoice.payment_status === 'unpaid' && (
            <button
              onClick={handleMarkPaid}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Mark Paid
            </button>
          )}
          <button
            onClick={() => downloadInvoicePdf(invoice)}
            className="bg-brand-green text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-accent transition-colors"
          >
            Download PDF
          </button>
          <button
            onClick={handleDelete}
            className="border border-red-300 text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
        <Section title="Customer">
          <InfoRow label="Name" value={invoice.customers?.name ?? '—'} />
          {invoice.customers?.email && <InfoRow label="Email" value={invoice.customers.email} />}
          {invoice.customers?.phone && <InfoRow label="Phone" value={invoice.customers.phone} />}
          {(invoice.customers as unknown as { property_address?: string })?.property_address && (
            <InfoRow label="Address" value={(invoice.customers as unknown as { property_address: string }).property_address} />
          )}
        </Section>

        <Section title="Dates">
          <InfoRow
            label="Invoice Date"
            value={new Date(invoice.invoice_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          />
          <InfoRow
            label="Due Date"
            value={new Date(invoice.due_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          />
          {invoice.paid_at && (
            <InfoRow label="Paid On" value={new Date(invoice.paid_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
          )}
        </Section>

        <Section title="Amount">
          <InfoRow label="Subtotal" value={`$${Number(invoice.subtotal).toFixed(2)}`} />
          <InfoRow label="Tax" value={`$${Number(invoice.tax).toFixed(2)}`} />
          <div className="border-t border-gray-200 mt-1 pt-1">
            <InfoRow label="Total" value={`$${Number(invoice.total).toFixed(2)}`} bold />
          </div>
          {invoice.amount_paid !== null && invoice.amount_paid !== undefined && Number(invoice.amount_paid) > 0 && (
            <InfoRow label="Amount Paid" value={`$${Number(invoice.amount_paid).toFixed(2)}`} />
          )}
        </Section>

        {invoice.payment_method && (
          <Section title="Payment">
            <InfoRow label="Method" value={invoice.payment_method.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} />
          </Section>
        )}

        {invoice.notes && (
          <Section title="Notes">
            <p className="text-sm text-gray-700">{invoice.notes}</p>
          </Section>
        )}
      </div>

      {/* Collect Payment via Stripe */}
      {invoice.payment_status === 'unpaid' && (
        <div className="mt-4">
          <button
            onClick={() => setShowPayment(true)}
            className="w-full bg-brand-green text-white py-3 rounded-lg font-medium hover:bg-brand-accent transition-colors"
          >
            Collect Payment (Card / ACH)
          </button>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && invoice.payment_status === 'unpaid' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Payment — {invoice.invoice_number}
              </h3>
              <button
                onClick={() => setShowPayment(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                &times;
              </button>
            </div>
            <PaymentForm
              invoice={invoice}
              onSuccess={() => {
                setShowPayment(false)
                queryClient.invalidateQueries({ queryKey: ['invoices'] })
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h3>
      {children}
    </div>
  )
}

function InfoRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between py-1">
      <span className={`text-sm ${bold ? 'font-semibold text-gray-700' : 'text-gray-500'}`}>{label}</span>
      <span className={`text-sm ${bold ? 'font-bold text-gray-900' : 'text-gray-800 font-medium'}`}>{value}</span>
    </div>
  )
}
