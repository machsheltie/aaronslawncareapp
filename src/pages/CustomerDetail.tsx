import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useCustomer, useDeleteCustomer } from '@/hooks/useCustomers'
import { useCustomerPhotos, getPhotoUrl, PHOTO_TYPES } from '@/hooks/usePhotos'
import { SERVICE_TYPES, useJobs } from '@/hooks/useJobs'

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: customer, isLoading, error } = useCustomer(id)
  const deleteCustomer = useDeleteCustomer()
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'photos'>('info')

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

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'info'
              ? 'border-brand-green text-brand-green'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Info
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-brand-green text-brand-green'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'photos'
              ? 'border-brand-green text-brand-green'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Photos
        </button>
      </div>

      {activeTab === 'info' && (
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
      )}

      {activeTab === 'history' && <ServiceHistory customerId={customer.id} />}

      {activeTab === 'photos' && <PhotoGallery customerId={customer.id} />}
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

function ServiceHistory({ customerId }: { customerId: string }) {
  const { data: jobs, isLoading } = useJobs({ customerId })

  const serviceLabel = (val: string) =>
    SERVICE_TYPES.find((s) => s.value === val)?.label ?? val

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
      </div>
    )
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-1">No service history</p>
        <p className="text-sm">Completed jobs will appear here.</p>
      </div>
    )
  }

  // Sort newest first
  const sorted = [...jobs].sort(
    (a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()
  )

  return (
    <div className="space-y-3">
      {sorted.map((job) => {
        const price = job.actual_price ?? job.estimated_price
        const notes = job.completion_notes || job.notes
        return (
          <Link
            key={job.id}
            to={`/jobs/${job.id}`}
            className="block bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-800">
                {serviceLabel(job.service_type)}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                job.status === 'completed' ? 'bg-green-100 text-green-700'
                  : job.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {job.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {new Date(job.scheduled_date).toLocaleDateString()}
              </span>
              <span className="text-gray-800 font-medium">
                {price != null ? `$${Number(price).toFixed(2)}` : '—'}
              </span>
            </div>
            {notes && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{notes}</p>
            )}
          </Link>
        )
      })}
    </div>
  )
}

function PhotoGallery({ customerId }: { customerId: string }) {
  const { data: photos, isLoading } = useCustomerPhotos(customerId)
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  useEffect(() => {
    if (!photos || photos.length === 0) return
    let cancelled = false

    async function loadUrls() {
      const loaded: Record<string, string> = {}
      await Promise.all(
        photos!.map(async (p) => {
          try {
            loaded[p.id] = await getPhotoUrl(p.storage_path)
          } catch {
            // skip failed URLs
          }
        })
      )
      if (!cancelled) setUrls(loaded)
    }

    loadUrls()
    return () => { cancelled = true }
  }, [photos])

  const serviceLabel = (val: string) =>
    SERVICE_TYPES.find((s) => s.value === val)?.label ?? val

  const typeLabel = (val: string) =>
    PHOTO_TYPES.find((t) => t.value === val)?.label ?? val

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
      </div>
    )
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-1">No photos yet</p>
        <p className="text-sm">Photos taken during jobs will appear here.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedPhoto(photo.id)}
          >
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              {urls[photo.id] ? (
                <img
                  src={urls[photo.id]}
                  alt={`${typeLabel(photo.photo_type)} — ${serviceLabel(photo.jobs?.service_type ?? '')}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="animate-pulse w-full h-full bg-gray-200" />
              )}
            </div>
            <div className="p-2">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                  {typeLabel(photo.photo_type)}
                </span>
                <span className="text-xs text-gray-500">
                  {serviceLabel(photo.jobs?.service_type ?? '')}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {photo.created_at
                  ? `${new Date(photo.created_at).toLocaleDateString()} ${new Date(photo.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : '—'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && urls[selectedPhoto] && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={urls[selectedPhoto]}
            alt="Full size"
            className="max-w-full max-h-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white text-2xl font-bold bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
          >
            ×
          </button>
        </div>
      )}
    </>
  )
}
