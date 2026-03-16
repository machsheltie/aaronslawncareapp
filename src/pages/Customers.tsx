import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCustomers, useDeleteCustomer } from '@/hooks/useCustomers'

export default function Customers() {
  const [search, setSearch] = useState('')
  const { data: customers, isLoading, error } = useCustomers(search)
  const deleteCustomer = useDeleteCustomer()

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete customer "${name}"? This can be undone.`)) {
      deleteCustomer.mutate(id)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
        <Link
          to="/customers/new"
          className="inline-flex items-center justify-center bg-brand-green text-white px-4 py-2 rounded-md font-medium hover:bg-brand-accent transition-colors"
        >
          + Add Customer
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, phone, or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Failed to load customers: {error.message}
        </div>
      )}

      {/* Customer List */}
      {customers && customers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {search ? 'No customers match your search.' : 'No customers yet. Add your first one!'}
        </div>
      )}

      {customers && customers.length > 0 && (
        <div className="space-y-3">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="rounded-lg shadow-sm border border-green-200 p-4 hover:shadow-md transition-shadow"
              style={{ backgroundColor: '#c0efbf' }}
            >
              <div className="flex items-start justify-between">
                <Link to={`/customers/${customer.id}`} className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{customer.name}</h3>
                  <p className="text-sm font-medium mt-1 truncate" style={{ color: '#132b13' }}>{customer.property_address}, {customer.property_city} {customer.property_state} {customer.property_zip}</p>
                  <div className="flex gap-4 mt-2 text-sm font-medium" style={{ color: '#132b13' }}>
                    <span>{customer.phone}</span>
                    {customer.email && <span>{customer.email}</span>}
                  </div>
                </Link>

                <div className="flex items-center gap-2 ml-4">
                  <Link
                    to={`/customers/${customer.id}/edit`}
                    className="text-sm text-brand-green hover:text-brand-accent px-2 py-1"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(customer.id, customer.name)}
                    className="text-sm text-red-500 hover:text-red-700 px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {customer.notes && (
                <p className="text-xs text-gray-400 mt-2 truncate">{customer.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
