import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useJobs, useUpdateJob, useDeleteJob, SERVICE_TYPES, STATUS_OPTIONS } from '@/hooks/useJobs'
import type { JobWithCustomer } from '@/hooks/useJobs'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

export default function Jobs() {
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { data: jobs, isLoading, error } = useJobs({
    date: dateFilter || undefined,
    status: statusFilter || undefined,
  })
  const updateJob = useUpdateJob()
  const deleteJob = useDeleteJob()

  const handleStatusChange = (job: JobWithCustomer, newStatus: string) => {
    const updates: Record<string, unknown> = { id: job.id, status: newStatus }

    if (newStatus === 'in_progress' && !job.actual_start_time) {
      updates.actual_start_time = new Date().toISOString()
    }
    if (newStatus === 'completed' && !job.actual_end_time) {
      updates.actual_end_time = new Date().toISOString()
    }

    updateJob.mutate(updates as Parameters<typeof updateJob.mutate>[0])
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this job?')) {
      deleteJob.mutate(id)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Jobs</h2>
        <Link
          to="/jobs/new"
          className="inline-flex items-center justify-center bg-brand-green text-white px-4 py-2 rounded-md font-medium hover:bg-brand-accent transition-colors"
        >
          + New Job
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button
          onClick={() => setDateFilter(getToday())}
          className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
        >
          Today
        </button>
        {(dateFilter || statusFilter) && (
          <button
            onClick={() => { setDateFilter(''); setStatusFilter('') }}
            className="px-3 py-2 text-sm text-red-500 hover:text-red-700"
          >
            Clear Filters
          </button>
        )}
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
          Failed to load jobs: {error.message}
        </div>
      )}

      {/* Job List */}
      {jobs && jobs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No jobs found. {dateFilter || statusFilter ? 'Try different filters.' : 'Schedule your first one!'}
        </div>
      )}

      {jobs && jobs.length > 0 && (
        <div className="space-y-3">
          {jobs.map((job) => {
            const serviceLabel = SERVICE_TYPES.find(s => s.value === job.service_type)?.label ?? job.service_type
            const statusInfo = STATUS_OPTIONS.find(s => s.value === job.status)

            return (
              <div
                key={job.id}
                className="rounded-lg shadow-sm border border-green-200 p-4 hover:shadow-md transition-shadow"
                style={{ backgroundColor: '#c0efbf' }}
              >
                <div className="flex items-start justify-between">
                  <Link to={`/jobs/${job.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{serviceLabel}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo?.color ?? ''}`}>
                        {statusInfo?.label ?? job.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{job.customers?.name ?? 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{job.customers?.property_address}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>{new Date(job.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      {job.scheduled_time_start && <span>{job.scheduled_time_start.slice(0, 5)}</span>}
                      {job.estimated_price && <span className="font-medium text-gray-700">${Number(job.estimated_price).toFixed(2)}</span>}
                    </div>
                  </Link>

                  <div className="flex items-center gap-1 ml-4">
                    {/* Quick status buttons */}
                    {job.status === 'scheduled' && (
                      <button
                        onClick={() => handleStatusChange(job, 'in_progress')}
                        className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200 transition-colors"
                      >
                        Start
                      </button>
                    )}
                    {job.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange(job, 'completed')}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    <Link
                      to={`/jobs/${job.id}/edit`}
                      className="text-xs text-brand-green hover:text-brand-accent px-2 py-1"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(job.id)}
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
