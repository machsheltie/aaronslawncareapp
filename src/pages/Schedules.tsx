import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useRecurringSchedules,
  usePauseSchedule,
  useSkipWeek,
  useDeleteRecurringSchedule,
  FREQUENCY_OPTIONS,
} from '@/hooks/useRecurringSchedules'
import { SERVICE_TYPES } from '@/hooks/useJobs'

export default function Schedules() {
  const { data: schedules, isLoading } = useRecurringSchedules()
  const pauseSchedule = usePauseSchedule()
  const skipWeek = useSkipWeek()
  const deleteSchedule = useDeleteRecurringSchedule()
  const [skipModal, setSkipModal] = useState<{ id: string; name: string } | null>(null)
  const [skipDate, setSkipDate] = useState('')
  const [skipReason, setSkipReason] = useState('')

  const handlePause = (id: string, isPaused: boolean) => {
    if (isPaused) {
      pauseSchedule.mutate({ id, pause: false })
    } else {
      const reason = prompt('Pause reason (optional):')
      pauseSchedule.mutate({ id, pause: true, reason: reason || undefined })
    }
  }

  const handleSkip = () => {
    if (!skipModal || !skipDate) return
    skipWeek.mutate(
      { scheduleId: skipModal.id, skipDate, reason: skipReason },
      { onSuccess: () => { setSkipModal(null); setSkipDate(''); setSkipReason('') } }
    )
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete recurring schedule for "${name}"? This will also cancel all future scheduled jobs.`)) {
      deleteSchedule.mutate({ id, cancelFutureJobs: true })
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Recurring Schedules</h2>
          <p className="text-sm text-gray-500 mt-1">Jobs are auto-generated 4 weeks ahead</p>
        </div>
        <Link
          to="/jobs/new"
          className="inline-flex items-center justify-center bg-brand-green text-white px-4 py-2 rounded-md font-medium hover:bg-brand-accent transition-colors"
        >
          + New Job
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
        </div>
      )}

      {schedules && schedules.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No recurring schedules yet. Set one up to auto-populate the calendar!
        </div>
      )}

      {schedules && schedules.length > 0 && (
        <div className="space-y-3">
          {schedules.map((schedule) => {
            const serviceLabel = SERVICE_TYPES.find(s => s.value === schedule.service_type)?.label ?? schedule.service_type
            const freqLabel = FREQUENCY_OPTIONS.find(f => f.value === schedule.frequency)?.label ?? schedule.frequency
            const isPaused = !!schedule.paused_at

            return (
              <div
                key={schedule.id}
                className={`bg-white rounded-lg shadow-sm border p-4 ${isPaused ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{schedule.customers?.name}</h3>
                      {isPaused && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
                          Paused
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{serviceLabel} — {freqLabel}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {schedule.customers?.property_address}
                      {schedule.preferred_time && ` | ${schedule.preferred_time.slice(0, 5)}`}
                      {schedule.estimated_price && ` | $${Number(schedule.estimated_price).toFixed(2)}`}
                    </p>
                    {isPaused && schedule.pause_reason && (
                      <p className="text-xs text-orange-600 mt-1">Paused: {schedule.pause_reason}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1 ml-4">
                    <button
                      onClick={() => handlePause(schedule.id, isPaused)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        isPaused
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                    >
                      {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    {!isPaused && schedule.frequency !== 'one_time' && (
                      <button
                        onClick={() => setSkipModal({ id: schedule.id, name: schedule.customers?.name ?? '' })}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                      >
                        Skip Week
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(schedule.id, schedule.customers?.name ?? '')}
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

      {/* Skip Modal */}
      {skipModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Skip a Date — {skipModal.name}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date to Skip</label>
                <input
                  type="date"
                  value={skipDate}
                  onChange={(e) => setSkipDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value)}
                  placeholder="e.g., Customer on vacation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSkip}
                disabled={!skipDate}
                className="flex-1 bg-brand-green text-white py-2 rounded-md font-medium hover:bg-brand-accent disabled:opacity-50"
              >
                Skip This Date
              </button>
              <button
                onClick={() => { setSkipModal(null); setSkipDate(''); setSkipReason('') }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
