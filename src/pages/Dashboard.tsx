import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCustomers } from '@/hooks/useCustomers'
import { useJobs, SERVICE_TYPES, STATUS_OPTIONS } from '@/hooks/useJobs'
import { useGenerateUpcomingJobs } from '@/hooks/useRecurringSchedules'
import { useInvoices } from '@/hooks/useInvoices'
import type { JobWithCustomer } from '@/hooks/useJobs'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data: customers } = useCustomers()
  const { data: todayJobs } = useJobs({ date: getToday() })
  const { data: allJobs } = useJobs()

  // Auto-generate upcoming jobs from recurring schedules on load
  const generateJobs = useGenerateUpcomingJobs()
  const hasGenerated = useRef(false)
  useEffect(() => {
    if (!hasGenerated.current) {
      hasGenerated.current = true
      generateJobs.mutate()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { data: unpaidInvoices } = useInvoices({ status: 'unpaid' })
  const { data: paidInvoices } = useInvoices({ status: 'paid' })
  const unpaidTotal = unpaidInvoices?.reduce((sum, i) => sum + Number(i.total), 0) ?? 0
  const paidTotal = paidInvoices?.reduce((sum, i) => sum + Number(i.total), 0) ?? 0

  const scheduledCount = allJobs?.filter(j => j.status === 'scheduled').length ?? 0
  const inProgressCount = allJobs?.filter(j => j.status === 'in_progress').length ?? 0

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Dashboard</h2>
      <p className="text-gray-500 mb-6">
        Welcome back, {user?.email?.split('@')[0]}!
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Today's Jobs" value={String(todayJobs?.length ?? 0)} to="/jobs" />
        <StatCard label="Scheduled" value={String(scheduledCount)} to="/jobs" />
        <StatCard label="In Progress" value={String(inProgressCount)} to="/jobs" />
        <StatCard label="Customers" value={String(customers?.length ?? 0)} to="/customers" />
        <StatCard label="Collected" value={`$${paidTotal.toFixed(0)}`} to="/documents/invoices" />
        <StatCard label="Unpaid" value={`$${unpaidTotal.toFixed(0)}`} to="/documents/invoices" />
      </div>

      {/* Reports Link */}
      <Link
        to="/reports"
        className="block rounded-lg shadow-sm border border-green-200 p-4 mb-8 hover:shadow-md transition-shadow"
        style={{ backgroundColor: '#c0efbf' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">Reports & Analytics</p>
            <p className="text-sm text-gray-600 mt-0.5">Revenue, jobs, and performance breakdowns</p>
          </div>
          <span className="text-gray-400 text-xl">&rsaquo;</span>
        </div>
      </Link>

      {/* Today's Jobs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Today's Jobs</h3>
          <Link to="/jobs/new" className="text-sm text-brand-green hover:text-brand-accent font-medium">
            + New Job
          </Link>
        </div>

        {todayJobs && todayJobs.length === 0 && (
          <div className="rounded-lg border border-green-200 p-6 text-center text-gray-500 text-sm" style={{ backgroundColor: '#c0efbf' }}>
            No jobs scheduled for today.
          </div>
        )}

        {todayJobs && todayJobs.length > 0 && (
          <div className="space-y-2">
            {todayJobs.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, to }: { label: string; value: string; to: string }) {
  return (
    <Link to={to} className="rounded-lg shadow-sm border border-green-200 p-4 hover:shadow-md transition-shadow" style={{ backgroundColor: '#c0efbf' }}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </Link>
  )
}

function JobRow({ job }: { job: JobWithCustomer }) {
  const serviceLabel = SERVICE_TYPES.find(s => s.value === job.service_type)?.label ?? job.service_type
  const statusInfo = STATUS_OPTIONS.find(s => s.value === job.status)

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="flex items-center justify-between rounded-lg border border-green-200 p-3 hover:shadow-sm transition-shadow"
      style={{ backgroundColor: '#c0efbf' }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800 text-sm">{serviceLabel}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo?.color ?? ''}`}>
            {statusInfo?.label}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate">{job.customers?.name} — {job.customers?.property_address}</p>
      </div>
      <div className="text-right ml-4">
        {job.scheduled_time_start && (
          <span className="text-sm text-gray-600">{job.scheduled_time_start.slice(0, 5)}</span>
        )}
        {job.estimated_price && (
          <p className="text-xs text-gray-400">${Number(job.estimated_price).toFixed(2)}</p>
        )}
      </div>
    </Link>
  )
}
