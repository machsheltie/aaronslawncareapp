import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useJob, useUpdateJob, useDeleteJob, useRescheduleJob, SERVICE_TYPES, STATUS_OPTIONS } from '@/hooks/useJobs'
import JobPhotos from '@/components/photos/JobPhotos'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: job, isLoading, error } = useJob(id)
  const updateJob = useUpdateJob()
  const deleteJob = useDeleteJob()
  const rescheduleJob = useRescheduleJob()
  const [editingNotes, setEditingNotes] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [showReschedule, setShowReschedule] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState('')

  const handleStatusChange = (newStatus: string) => {
    if (!job) return
    const updates: Record<string, unknown> = { id: job.id, status: newStatus }
    if (newStatus === 'in_progress') updates.actual_start_time = new Date().toISOString()
    if (newStatus === 'completed') updates.actual_end_time = new Date().toISOString()
    updateJob.mutate(updates as Parameters<typeof updateJob.mutate>[0])
  }

  const handleDelete = () => {
    if (job && confirm('Delete this job?')) {
      deleteJob.mutate(job.id, { onSuccess: () => navigate('/jobs') })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Job not found.</p>
        <Link to="/jobs" className="text-brand-green hover:underline">Back to jobs</Link>
      </div>
    )
  }

  const serviceLabel = SERVICE_TYPES.find(s => s.value === job.service_type)?.label ?? job.service_type
  const statusInfo = STATUS_OPTIONS.find(s => s.value === job.status)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/jobs" className="text-sm text-brand-green hover:underline mb-1 inline-block">
            &larr; All Jobs
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">{serviceLabel}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo?.color ?? ''}`}>
              {statusInfo?.label ?? job.status}
            </span>
            {job.is_rescheduled && job.original_date && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                Rescheduled from {new Date(job.original_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {(job.status === 'scheduled' || job.status === 'in_progress') && (
            <button
              onClick={() => {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                setRescheduleDate(tomorrow.toISOString().split('T')[0])
                setShowReschedule(true)
              }}
              className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-200 transition-colors"
            >
              Reschedule
            </button>
          )}
          <Link
            to={`/jobs/${job.id}/edit`}
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

      {/* Status Actions */}
      {(job.status === 'scheduled' || job.status === 'in_progress') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4 flex gap-3">
          {job.status === 'scheduled' && (
            <button
              onClick={() => handleStatusChange('in_progress')}
              className="flex-1 bg-yellow-100 text-yellow-800 py-2 rounded-md font-medium hover:bg-yellow-200 transition-colors"
            >
              Start Job
            </button>
          )}
          {job.status === 'in_progress' && (
            <button
              onClick={() => handleStatusChange('completed')}
              className="flex-1 bg-green-100 text-green-800 py-2 rounded-md font-medium hover:bg-green-200 transition-colors"
            >
              Complete Job
            </button>
          )}
          <button
            onClick={() => handleStatusChange('cancelled')}
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Create Invoice for completed jobs */}
      {job.status === 'completed' && (
        <Link
          to={`/documents/invoices/new?customer=${job.customer_id}&job=${job.id}`}
          className="block bg-brand-green text-white text-center py-3 rounded-lg font-medium hover:bg-brand-accent transition-colors mb-4"
        >
          Create Invoice for This Job
        </Link>
      )}

      {/* Reschedule Panel */}
      {showReschedule && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Reschedule Job</h3>
          <input
            type="date"
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!rescheduleDate) return
                rescheduleJob.mutate(
                  { jobId: job.id, newDate: rescheduleDate },
                  { onSuccess: () => setShowReschedule(false) }
                )
              }}
              disabled={rescheduleJob.isPending}
              className="flex-1 bg-yellow-500 text-white py-2 rounded-md font-medium text-sm hover:bg-yellow-600 transition-colors"
            >
              {rescheduleJob.isPending ? 'Moving...' : 'Move to This Date'}
            </button>
            <button
              onClick={() => setShowReschedule(false)}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
        <Section title="Customer">
          <InfoRow label="Name" value={job.customers?.name ?? '—'} />
          <InfoRow label="Address" value={job.customers?.property_address ?? '—'} />
          {(job.customers as unknown as { phone?: string })?.phone && (
            <InfoRow label="Phone" value={(job.customers as unknown as { phone: string }).phone} />
          )}
        </Section>

        <Section title="Schedule">
          <InfoRow
            label="Date"
            value={new Date(job.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          />
          {job.scheduled_time_start && (
            <InfoRow label="Time" value={`${job.scheduled_time_start.slice(0, 5)}${job.scheduled_time_end ? ' – ' + job.scheduled_time_end.slice(0, 5) : ''}`} />
          )}
        </Section>

        <Section title="Pricing">
          <InfoRow label="Estimated" value={job.estimated_price ? `$${Number(job.estimated_price).toFixed(2)}` : '—'} />
          <InfoRow label="Actual" value={job.actual_price ? `$${Number(job.actual_price).toFixed(2)}` : '—'} />
        </Section>

        {job.actual_start_time && (
          <Section title="Time Tracking">
            <InfoRow label="Started" value={new Date(job.actual_start_time).toLocaleString()} />
            {job.actual_end_time && (
              <InfoRow label="Completed" value={new Date(job.actual_end_time).toLocaleString()} />
            )}
          </Section>
        )}

        <Section title="Notes">
          {job.notes && <NoteBlock label="Job Notes" text={job.notes} />}
          {job.customer_instructions && <NoteBlock label="Customer Instructions" text={job.customer_instructions} />}
          {job.completion_notes && <NoteBlock label="Completion Notes" text={job.completion_notes} />}

          {editingNotes ? (
            <div className="mt-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Add a note..."
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    updateJob.mutate(
                      { id: job.id, notes: noteText || null },
                      { onSuccess: () => setEditingNotes(false) }
                    )
                  }}
                  className="px-3 py-1.5 bg-brand-green text-white text-sm rounded-md font-medium hover:bg-brand-accent transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingNotes(false)}
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setNoteText(job.notes ?? ''); setEditingNotes(true) }}
              className="text-sm text-brand-green hover:underline mt-2"
            >
              {job.notes ? 'Edit note' : '+ Add note'}
            </button>
          )}
        </Section>

        <JobPhotos jobId={job.id} />
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

function NoteBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="mb-2">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  )
}
