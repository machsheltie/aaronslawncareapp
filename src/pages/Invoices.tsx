import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useInvoices, useUpdateInvoiceStatus, useDeleteInvoice, PAYMENT_STATUS_OPTIONS } from '@/hooks/useInvoices'

export default function Invoices() {
  const [statusFilter, setStatusFilter] = useState('')
  const { data: invoices, isLoading, error } = useInvoices({
    status: statusFilter || undefined,
  })
  const updateStatus = useUpdateInvoiceStatus()
  const deleteInvoice = useDeleteInvoice()

  const handleMarkPaid = (id: string) => {
    const method = prompt('Payment method: cash, check, ach, or credit_card')
    if (method && ['cash', 'check', 'ach', 'credit_card'].includes(method)) {
      updateStatus.mutate({ id, status: 'paid', paymentMethod: method })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this invoice?')) deleteInvoice.mutate(id)
  }

  // Summary stats
  const unpaidTotal = invoices?.filter(i => i.payment_status === 'unpaid').reduce((sum, i) => sum + Number(i.total), 0) ?? 0
  const paidTotal = invoices?.filter(i => i.payment_status === 'paid').reduce((sum, i) => sum + Number(i.total), 0) ?? 0

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Invoices</h2>
        <Link
          to="/invoices/new"
          className="inline-flex items-center justify-center bg-brand-green text-white px-4 py-2 rounded-md font-medium hover:bg-brand-accent transition-colors"
        >
          + New Invoice
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
          <p className="text-xs text-red-500 font-medium">Outstanding</p>
          <p className="text-xl font-bold text-red-700">${unpaidTotal.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
          <p className="text-xs text-green-500 font-medium">Collected</p>
          <p className="text-xl font-bold text-green-700">${paidTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        >
          <option value="">All Statuses</option>
          {PAYMENT_STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {statusFilter && (
          <button onClick={() => setStatusFilter('')} className="text-sm text-red-500 hover:text-red-700">
            Clear
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Failed to load invoices: {error.message}
        </div>
      )}

      {invoices && invoices.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No invoices yet. Create one from a completed job!
        </div>
      )}

      {invoices && invoices.length > 0 && (
        <div className="space-y-3">
          {invoices.map((invoice) => {
            const statusInfo = PAYMENT_STATUS_OPTIONS.find(s => s.value === invoice.payment_status)
            const isOverdue = invoice.payment_status === 'unpaid' && new Date(invoice.due_date + 'T00:00:00') < new Date()

            return (
              <div key={invoice.id} className="rounded-lg shadow-sm border border-green-200 p-4 hover:shadow-md transition-shadow" style={{ backgroundColor: '#c0efbf' }}>
                <div className="flex items-start justify-between">
                  <Link to={`/invoices/${invoice.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{invoice.invoice_number}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo?.color ?? ''}`}>
                        {statusInfo?.label}
                      </span>
                      {isOverdue && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white font-medium">
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{invoice.customers?.name}</p>
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      <span>{new Date(invoice.invoice_date + 'T00:00:00').toLocaleDateString()}</span>
                      <span>Due: {new Date(invoice.due_date + 'T00:00:00').toLocaleDateString()}</span>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-lg font-bold text-gray-800">${Number(invoice.total).toFixed(2)}</span>
                    {invoice.payment_status === 'unpaid' && (
                      <button
                        onClick={() => handleMarkPaid(invoice.id)}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                      >
                        Mark Paid
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(invoice.id)}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
