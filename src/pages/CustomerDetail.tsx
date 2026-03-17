import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useCustomer, useDeleteCustomer } from '@/hooks/useCustomers'
import { useCustomerPhotos, getPhotoUrl, PHOTO_TYPES } from '@/hooks/usePhotos'
import { SERVICE_TYPES, useJobs, getServiceLabels } from '@/hooks/useJobs'
import { useCustomerServices } from '@/hooks/useCustomerServices'
import { useCustomerComms, useAddComm, useDeleteComm } from '@/hooks/useCustomerComms'
import { useInvoices, PAYMENT_STATUS_OPTIONS } from '@/hooks/useInvoices'
import FollowUpForm from '@/components/FollowUpForm'

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: customer, isLoading, error } = useCustomer(id)
  const deleteCustomer = useDeleteCustomer()
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'comms' | 'docs' | 'photos'>('info')

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
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {(['info', 'history', 'comms', 'docs', 'photos'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'info' ? 'Info' : tab === 'history' ? 'History' : tab === 'comms' ? 'Comms' : tab === 'docs' ? 'Docs' : 'Photos'}
          </button>
        ))}
      </div>

      {activeTab === 'info' && <InfoTab customer={customer} />}

      {activeTab === 'history' && <ServiceHistory customerId={customer.id} />}

      {activeTab === 'comms' && <CommsLog customerId={customer.id} />}

      {activeTab === 'docs' && <CustomerDocs customerId={customer.id} />}

      {activeTab === 'photos' && <PhotoGallery customerId={customer.id} />}
    </div>
  )
}

const FREQ_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Biweekly',
  monthly: 'Monthly',
  one_time: 'One-time',
}

function InfoTab({ customer }: { customer: { id: string; phone: string; email: string | null; property_address: string; property_city: string | null; property_state: string | null; property_zip: string | null; property_size: string | null; notes: string | null; is_active: boolean | null; created_at: string | null } }) {
  const { data: services } = useCustomerServices(customer.id)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
      <Section title="Contact">
        <InfoRow label="Phone" value={customer.phone} />
        <InfoRow label="Email" value={customer.email ?? '—'} />
      </Section>

      <Section title="Property">
        <InfoRow label="Address" value={`${customer.property_address}, ${customer.property_city} ${customer.property_state} ${customer.property_zip ?? ''}`} />
        <InfoRow label="Size" value={customer.property_size ? customer.property_size.replace('_', ' ') : '—'} />
      </Section>

      {/* Services */}
      <Section title="Services">
        {(!services || services.length === 0) && (
          <p className="text-sm text-gray-400">No services set up yet.</p>
        )}
        {services && services.length > 0 && (
          <div className="space-y-1.5">
            {services.map((svc) => {
              const typeLabel = SERVICE_TYPES.find(s => s.value === svc.service_type)?.label ?? svc.service_type
              return (
                <div key={svc.id} className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-800">{typeLabel}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                    {FREQ_LABELS[svc.frequency] ?? svc.frequency}
                  </span>
                  {svc.service_day && (
                    <span className="text-xs text-gray-500">{svc.service_day}</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
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

  const serviceLabel = (val: string) => getServiceLabels(val)

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

function CommsLog({ customerId }: { customerId: string }) {
  const { data: comms, isLoading } = useCustomerComms(customerId)
  const addComm = useAddComm()
  const deleteComm = useDeleteComm()
  const [noteText, setNoteText] = useState('')
  const [showFollowUp, setShowFollowUp] = useState(false)

  const handleAdd = () => {
    if (!noteText.trim()) return
    addComm.mutate(
      { customer_id: customerId, note: noteText.trim() },
      { onSuccess: () => setNoteText('') }
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
      </div>
    )
  }

  return (
    <div>
      {/* Add note */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a note..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
        <button
          onClick={handleAdd}
          disabled={addComm.isPending || !noteText.trim()}
          className="bg-brand-green text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </div>

      <button
        onClick={() => setShowFollowUp(true)}
        className="text-sm text-orange-600 hover:text-orange-700 font-medium mb-4 inline-block"
      >
        + Schedule Follow-Up
      </button>

      {showFollowUp && (
        <FollowUpForm defaultCustomerId={customerId} onClose={() => setShowFollowUp(false)} />
      )}

      {(!comms || comms.length === 0) && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-1">No notes yet</p>
          <p className="text-sm">Add communication notes for this customer.</p>
        </div>
      )}

      {comms && comms.length > 0 && (
        <div className="space-y-2">
          {comms.map((comm) => (
            <div
              key={comm.id}
              className="bg-white rounded-lg border border-gray-100 p-3 flex items-start justify-between"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{comm.note}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {comm.created_at
                    ? new Date(comm.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : '—'}
                </p>
              </div>
              <button
                onClick={() => deleteComm.mutate({ id: comm.id, customerId })}
                className="text-gray-300 hover:text-red-500 ml-2 text-lg leading-none"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CustomerDocs({ customerId }: { customerId: string }) {
  const { data: invoices, isLoading } = useInvoices({ customerId })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
      </div>
    )
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-1">No documents yet</p>
        <p className="text-sm">Invoices for this customer will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {invoices.map((inv) => {
        const statusInfo = PAYMENT_STATUS_OPTIONS.find(s => s.value === inv.payment_status)
        return (
          <Link
            key={inv.id}
            to={`/documents/invoices/${inv.id}`}
            className="flex items-center justify-between bg-white rounded-lg border border-gray-100 p-3 hover:shadow-sm transition-shadow"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">Invoice</span>
                <span className="text-sm font-semibold text-gray-800">{inv.invoice_number}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo?.color ?? ''}`}>
                  {statusInfo?.label ?? inv.payment_status}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {new Date(inv.invoice_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <span className="text-sm font-bold text-gray-800 ml-4">${Number(inv.total).toFixed(2)}</span>
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
