import { Link, useParams, useNavigate } from 'react-router-dom'
import { useCustomer, useDeleteCustomer } from '@/hooks/useCustomers'

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: customer, isLoading, error } = useCustomer(id)
  const deleteCustomer = useDeleteCustomer()

  const handleDelete = () => {
    if (customer && confirm(`Delete customer "${customer.name}"?`)) {
      deleteCustomer.mutate(customer.id, {
        onSuccess: () => navigate('/customers'),
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Customer not found.</p>
        <Link to="/customers" className="text-brand-green hover:underline">Back to customers</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/customers" className="text-sm text-brand-green hover:underline mb-1 inline-block">
            &larr; All Customers
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">{customer.name}</h2>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/customers/${customer.id}/edit`}
            className="bg-brand-green text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-accent transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="border border-red-300 text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
        <Section title="Contact">
          <InfoRow label="Phone" value={customer.phone} />
          <InfoRow label="Email" value={customer.email ?? '—'} />
        </Section>

        <Section title="Property">
          <InfoRow label="Address" value={`${customer.property_address}, ${customer.property_city} ${customer.property_state} ${customer.property_zip ?? ''}`} />
          <InfoRow label="Size" value={customer.property_size ? customer.property_size.replace('_', ' ') : '—'} />
        </Section>

        {customer.notes && (
          <Section title="Notes">
            <p className="text-gray-700 text-sm">{customer.notes}</p>
          </Section>
        )}

        <Section title="Status">
          <InfoRow label="Active" value={customer.is_active ? 'Yes' : 'No'} />
          <InfoRow label="Added" value={customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '—'} />
        </Section>
      </div>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value}</span>
    </div>
  )
}
