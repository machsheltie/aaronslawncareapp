import { useState, useEffect, useRef, useCallback } from 'react'
import { useJobs, useUpdateJob, useCreateJob, useRescheduleJob, useRainDay, SERVICE_TYPES, SERVICE_EQUIPMENT, parseServiceTypes, getServiceLabels, getFullAddress } from '@/hooks/useJobs'
import { useCreateCustomer } from '@/hooks/useCustomers'
import { useTodayReminders, useCompleteReminder } from '@/hooks/useReminders'
import FollowUpForm from '@/components/FollowUpForm'
import { useUploadPhoto } from '@/hooks/usePhotos'
import { useCreateInvoice, useSendInvoiceSms } from '@/hooks/useInvoices'
import { useGenerateUpcomingJobs } from '@/hooks/useRecurringSchedules'
import { useSkipWeek } from '@/hooks/useRecurringSchedules'
import { geocodeAddress, optimizeRoute, openInMapsApp } from '@/lib/routeOptimizer'
import type { Stop } from '@/lib/routeOptimizer'
import type { JobWithCustomer } from '@/hooks/useJobs'
import type { PhotoType } from '@/hooks/usePhotos'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

type WorkflowState =
  | { step: 'idle' }
  | { step: 'in_progress'; jobId: string }
  | { step: 'photo_prompt'; jobId: string }
  | { step: 'completing'; jobId: string }

export default function MyDay() {
  const { data: todayJobs, isLoading, refetch } = useJobs({ date: getToday() })
  const updateJob = useUpdateJob()
  const uploadPhoto = useUploadPhoto()
  const createInvoice = useCreateInvoice()
  const sendSms = useSendInvoiceSms()
  const generateJobs = useGenerateUpcomingJobs()
  const skipWeek = useSkipWeek()
  const rescheduleJob = useRescheduleJob()
  const rainDay = useRainDay()

  const [workflow, setWorkflow] = useState<WorkflowState>({ step: 'idle' })
  const [showRainDay, setShowRainDay] = useState(false)
  const [rainDayDate, setRainDayDate] = useState('')
  const [rescheduleJobId, setRescheduleJobId] = useState<string | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [convertJobId, setConvertJobId] = useState<string | null>(null)
  const createCustomer = useCreateCustomer()
  const createNewJob = useCreateJob()

  const { data: reminders } = useTodayReminders()
  const completeReminder = useCompleteReminder()
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [checklistExpanded, setChecklistExpanded] = useState(false)
  const [routeOrder, setRouteOrder] = useState<string[]>([])
  const [totalMiles, setTotalMiles] = useState<number | null>(null)
  const [optimizing, setOptimizing] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasGenerated = useRef(false)

  // Auto-generate upcoming jobs on load
  useEffect(() => {
    if (!hasGenerated.current) {
      hasGenerated.current = true
      generateJobs.mutate(undefined, { onSuccess: () => refetch() })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Optimize route when jobs load
  const optimizeJobRoute = useCallback(async (jobs: JobWithCustomer[]) => {
    const pendingJobs = jobs.filter(j => j.status === 'scheduled' || j.status === 'in_progress')
    if (pendingJobs.length === 0) {
      setRouteOrder([])
      return
    }

    setOptimizing(true)

    // Get current location
    let startLat = 38.2527 // Louisville default
    let startLng = -85.7585
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      )
      startLat = pos.coords.latitude
      startLng = pos.coords.longitude
    } catch {
      // use Louisville default
    }

    // Geocode all addresses
    const stops: Stop[] = await Promise.all(
      pendingJobs.map(async (job) => {
        const addr = getFullAddress(job.customers)
        const geo = await geocodeAddress(addr)
        return {
          id: job.id,
          address: addr,
          lat: geo?.lat,
          lng: geo?.lng,
        }
      })
    )

    // Check if we got any geocoded results
    const hasGeoData = stops.some(s => s.lat != null)

    if (hasGeoData) {
      const { ordered, totalMiles: miles } = optimizeRoute(stops, startLat, startLng)
      setRouteOrder(ordered.map(s => s.id))
      setTotalMiles(miles)
    } else {
      // No geocoding — keep original order (by scheduled time)
      setRouteOrder(pendingJobs.map(j => j.id))
      setTotalMiles(null)
    }

    setOptimizing(false)
  }, [])

  useEffect(() => {
    if (todayJobs && todayJobs.length > 0 && routeOrder.length === 0) {
      optimizeJobRoute(todayJobs)
    }
  }, [todayJobs, routeOrder.length, optimizeJobRoute])

  // Sort jobs by route order, completed jobs at bottom
  const sortedJobs = todayJobs ? [...todayJobs].sort((a, b) => {
    // Completed/cancelled at the bottom
    const aDone = a.status === 'completed' || a.status === 'cancelled'
    const bDone = b.status === 'completed' || b.status === 'cancelled'
    if (aDone && !bDone) return 1
    if (!aDone && bDone) return -1
    if (aDone && bDone) return 0

    const aIdx = routeOrder.indexOf(a.id)
    const bIdx = routeOrder.indexOf(b.id)
    if (aIdx === -1 && bIdx === -1) return 0
    if (aIdx === -1) return 1
    if (bIdx === -1) return -1
    return aIdx - bIdx
  }) : []

  // --- Actions ---

  const handleStart = (job: JobWithCustomer) => {
    updateJob.mutate(
      { id: job.id, status: 'in_progress', actual_start_time: new Date().toISOString() },
      {
        onSuccess: () => {
          setWorkflow({ step: 'in_progress', jobId: job.id })
          // Open maps to the address
          if (job.customers) {
            openInMapsApp(getFullAddress(job.customers))
          }
        }
      }
    )
  }

  const handleFinished = (jobId: string) => {
    setWorkflow({ step: 'photo_prompt', jobId })
  }

  const handlePhotoTaken = async () => {
    if (!photoFile || workflow.step !== 'photo_prompt') return

    setWorkflow({ step: 'completing', jobId: workflow.jobId })

    try {
      // Upload the after photo
      const uploadedPhoto = await uploadPhoto.mutateAsync({
        jobId: workflow.jobId,
        file: photoFile,
        photoType: 'after' as PhotoType,
      })

      // Mark job completed
      await updateJob.mutateAsync({
        id: workflow.jobId,
        status: 'completed',
        actual_end_time: new Date().toISOString(),
      })

      // Auto-create invoice and send SMS to customer with photo
      const job = todayJobs?.find(j => j.id === workflow.jobId)
      if (job) {
        const invoice = await createInvoice.mutateAsync({
          customer_id: job.customer_id,
          job_id: job.id,
          subtotal: Number(job.actual_price || job.estimated_price || 0),
          due_days: 30,
          notes: `${getServiceLabels(job.service_type)} — ${getToday()}`,
        })
        // Send invoice via MMS with photo attached (fire and forget)
        sendSms.mutate({ invoiceId: invoice.id, photoPath: uploadedPhoto.storage_path })
      }

      setPhotoFile(null)
      setWorkflow({ step: 'idle' })
      refetch()
    } catch (err) {
      alert('Error completing job: ' + (err instanceof Error ? err.message : 'Unknown'))
      setWorkflow({ step: 'photo_prompt', jobId: workflow.jobId })
    }
  }

  const handleSkip = (job: JobWithCustomer) => {
    if (!confirm(`Skip ${job.customers?.name ?? 'this customer'} today? They'll be moved to their next scheduled date.`)) return

    // Cancel today's job
    updateJob.mutate(
      { id: job.id, status: 'cancelled' },
      {
        onSuccess: () => {
          // If it's a recurring job, skip this week
          if (job.recurring_schedule_id) {
            skipWeek.mutate({
              scheduleId: job.recurring_schedule_id,
              skipDate: job.scheduled_date,
              reason: 'Skipped from field app',
            })
          }
          refetch()
        }
      }
    )
  }

  const handleSkipPhoto = async () => {
    if (workflow.step !== 'photo_prompt') return

    setWorkflow({ step: 'completing', jobId: workflow.jobId })

    try {
      await updateJob.mutateAsync({
        id: workflow.jobId,
        status: 'completed',
        actual_end_time: new Date().toISOString(),
      })

      const job = todayJobs?.find(j => j.id === workflow.jobId)
      if (job) {
        const invoice = await createInvoice.mutateAsync({
          customer_id: job.customer_id,
          job_id: job.id,
          subtotal: Number(job.actual_price || job.estimated_price || 0),
          due_days: 30,
          notes: `${getServiceLabels(job.service_type)} — ${getToday()}`,
        })
        // Send invoice via SMS — no photo attached
        sendSms.mutate({ invoiceId: invoice.id })
      }

      setWorkflow({ step: 'idle' })
      refetch()
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown'))
      setWorkflow({ step: 'photo_prompt', jobId: workflow.jobId })
    }
  }

  // --- Render ---

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
      </div>
    )
  }

  const activeJob = todayJobs?.find(j => j.status === 'in_progress')
  const completedCount = todayJobs?.filter(j => j.status === 'completed').length ?? 0
  const totalCount = todayJobs?.length ?? 0

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Day</h2>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFollowUp(true)}
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ backgroundColor: '#f0e6d9', color: '#8B7355' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5d6c4'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0e6d9'}
            >
              + Follow-Up
            </button>
            {totalCount > 0 && sortedJobs.some(j => j.status === 'scheduled') && (
              <button
                onClick={() => {
                  const tomorrow = new Date()
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  setRainDayDate(tomorrow.toISOString().split('T')[0])
                  setShowRainDay(true)
                }}
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{ backgroundColor: '#dff7df', color: '#2D5016' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c0efbf'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dff7df'}
              >
                Rain Day
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-sm font-medium text-gray-600">
            {completedCount}/{totalCount} jobs done
          </span>
          {totalMiles !== null && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#dff7df', color: '#2D5016' }}>
              ~{totalMiles} mi route
            </span>
          )}
          {optimizing && (
            <span className="text-xs text-gray-400">Optimizing route...</span>
          )}
        </div>
        {totalCount > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-brand-green rounded-full h-2 transition-all"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        )}
      </div>

      {/* Before You Get Started — Equipment Checklist */}
      {totalCount > 0 && sortedJobs.some(j => j.status === 'scheduled' || j.status === 'in_progress') && (() => {
        // Collect all service types from today's pending jobs
        const allTypes = new Set<string>()
        sortedJobs.forEach(j => {
          if (j.status === 'scheduled' || j.status === 'in_progress') {
            parseServiceTypes(j.service_type).forEach(t => allTypes.add(t))
          }
        })

        // Aggregate equipment — deduplicated
        const equipmentSet = new Set<string>()
        allTypes.forEach(t => {
          const items = SERVICE_EQUIPMENT[t]
          if (items) items.forEach(item => equipmentSet.add(item))
        })

        const equipmentList = [...equipmentSet].sort()

        if (equipmentList.length === 0) return null

        // Service labels for the header
        const typeLabels = [...allTypes].map(t => SERVICE_TYPES.find(s => s.value === t)?.label ?? t)

        const allChecked = equipmentList.every(item => checkedItems.has(item))
        const COLLAPSED_COUNT = 4 // items per column when collapsed
        const maxVisible = COLLAPSED_COUNT * 2 // 2 columns
        const needsExpand = equipmentList.length > maxVisible
        const visibleItems = checklistExpanded || !needsExpand ? equipmentList : equipmentList.slice(0, maxVisible)

        return (
          <div className="mb-4 rounded-lg border-2 border-green-300 p-4" style={{ backgroundColor: '#dff7df' }}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm" style={{ color: '#2D5016' }}>
                Before You Get Started
              </h3>
              <button
                type="button"
                onClick={() => {
                  if (allChecked) {
                    setCheckedItems(new Set())
                  } else {
                    setCheckedItems(new Set(equipmentList))
                  }
                }}
                className={`text-xs font-medium px-2.5 py-1 rounded-md transition-colors ${
                  allChecked
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'text-white hover:opacity-90'
                }`}
                style={allChecked ? undefined : { backgroundColor: '#2D5016' }}
              >
                {allChecked ? 'Uncheck All' : 'Check All'}
              </button>
            </div>
            <p className="text-xs mb-3" style={{ color: '#2D5016' }}>
              Today's jobs: {typeLabels.join(', ')}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {visibleItems.map(item => (
                <label key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={checkedItems.has(item)}
                    onChange={() => {
                      setCheckedItems(prev => {
                        const next = new Set(prev)
                        if (next.has(item)) next.delete(item)
                        else next.add(item)
                        return next
                      })
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                  />
                  <span className={checkedItems.has(item) ? 'line-through text-gray-400' : ''}>{item}</span>
                </label>
              ))}
            </div>
            {needsExpand && (
              <button
                type="button"
                onClick={() => setChecklistExpanded(prev => !prev)}
                className="mt-2 text-xs font-medium hover:opacity-80"
                style={{ color: '#2D5016' }}
              >
                {checklistExpanded ? `Show less` : `Show all ${equipmentList.length} items`}
              </button>
            )}
            {allChecked && (
              <p className="mt-2 text-xs font-semibold text-green-700">All loaded up — go get it!</p>
            )}
          </div>
        )
      })()}

      {/* Rain Day Modal */}
      {showRainDay && (
        <div className="border-2 border-green-300 rounded-lg p-4 mb-4" style={{ backgroundColor: '#dff7df' }}>
          <h3 className="font-semibold mb-2" style={{ color: '#2D5016' }}>Rain Day — Move All Scheduled Jobs</h3>
          <p className="text-sm mb-3" style={{ color: '#4A7D26' }}>Jobs already in progress or completed won't be moved.</p>
          <input
            type="date"
            value={rainDayDate}
            onChange={(e) => setRainDayDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-brand-green"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!rainDayDate) return
                rainDay.mutate(
                  { fromDate: getToday(), toDate: rainDayDate },
                  {
                    onSuccess: (result) => {
                      setShowRainDay(false)
                      const dateLabel = new Date(rainDayDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                      alert(`${result.count} job${result.count !== 1 ? 's' : ''} moved to ${dateLabel}`)
                      refetch()
                    },
                  }
                )
              }}
              disabled={rainDay.isPending}
              className="flex-1 bg-brand-green text-white py-2 rounded-md font-medium text-sm hover:bg-brand-accent transition-colors"
            >
              {rainDay.isPending ? 'Moving...' : 'Move All Jobs'}
            </button>
            <button
              onClick={() => setShowRainDay(false)}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reschedule Single Job Modal */}
      {rescheduleJobId && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            Reschedule — {todayJobs?.find(j => j.id === rescheduleJobId)?.customers?.name ?? 'Job'}
          </h3>
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
                  { jobId: rescheduleJobId, newDate: rescheduleDate },
                  {
                    onSuccess: () => {
                      setRescheduleJobId(null)
                      refetch()
                    },
                  }
                )
              }}
              disabled={rescheduleJob.isPending}
              className="flex-1 bg-yellow-500 text-white py-2 rounded-md font-medium text-sm hover:bg-yellow-600 transition-colors"
            >
              {rescheduleJob.isPending ? 'Moving...' : 'Move to This Date'}
            </button>
            <button
              onClick={() => setRescheduleJobId(null)}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Follow-Up Reminders */}
      {reminders && reminders.filter(r => !r.is_completed).length > 0 && (
        <div className="mb-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Follow-Ups</h3>
          {reminders.filter(r => !r.is_completed).map((rem) => {
            const isOverdue = rem.reminder_date < getToday()
            const name = rem.customers?.name ?? rem.prospect_name ?? 'Unknown'
            return (
              <div
                key={rem.id}
                className="flex items-start gap-3 rounded-lg border-l-4 p-3"
                style={{ borderColor: '#8B7355', backgroundColor: '#f8f3ed' }}
              >
                <button
                  onClick={() => completeReminder.mutate(rem.id)}
                  className="mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 transition-colors"
                  style={{ borderColor: '#8B7355' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5d6c4'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">{name}</p>
                    {isOverdue && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500 text-white font-medium">
                        Overdue
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{rem.note}</p>
                  {rem.customers?.phone && (
                    <a href={`tel:${rem.customers.phone}`} className="text-xs text-blue-600 hover:underline">
                      {rem.customers.phone}
                    </a>
                  )}
                  {rem.prospect_phone && !rem.customers && (
                    <a href={`tel:${rem.prospect_phone}`} className="text-xs text-blue-600 hover:underline">
                      {rem.prospect_phone}
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Follow-Up Form Modal */}
      {showFollowUp && <FollowUpForm onClose={() => setShowFollowUp(false)} />}

      {/* Convert Quote Modal */}
      {convertJobId && <ConvertQuoteModal
        job={todayJobs?.find(j => j.id === convertJobId) ?? null}
        onClose={() => setConvertJobId(null)}
        onConvert={async (customerData, jobData) => {
          // Create customer
          const newCustomer = await createCustomer.mutateAsync(customerData)
          // Create the service job
          await createNewJob.mutateAsync({
            customer_id: newCustomer.id,
            ...jobData,
          })
          // Mark original quote visit as completed
          await updateJob.mutateAsync({
            id: convertJobId!,
            status: 'completed',
            actual_end_time: new Date().toISOString(),
          })
          setConvertJobId(null)
          refetch()
        }}
      />}

      {/* No jobs */}
      {totalCount === 0 && (
        <div className="bg-white rounded-lg border border-gray-100 p-8 text-center">
          <p className="text-gray-400 text-lg mb-1">No jobs today</p>
          <p className="text-gray-300 text-sm">Enjoy your day off!</p>
        </div>
      )}

      {/* Photo prompt overlay */}
      {workflow.step === 'photo_prompt' && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Job Complete — Take a Photo</h3>
          <p className="text-sm text-yellow-700 mb-3">
            Snap a photo of the completed work. An invoice will be sent to the customer automatically.
          </p>

          {photoFile && (
            <div className="mb-3">
              <img
                src={URL.createObjectURL(photoFile)}
                alt="Preview"
                className="w-full aspect-[4/3] object-cover rounded-lg"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-brand-green text-white py-3 rounded-md font-medium hover:bg-brand-accent transition-colors"
            >
              {photoFile ? 'Retake Photo' : 'Take Photo'}
            </button>
            {photoFile && (
              <button
                onClick={handlePhotoTaken}
                className="flex-1 bg-green-600 text-white py-3 rounded-md font-medium hover:bg-green-700 transition-colors"
              >
                Complete & Invoice
              </button>
            )}
          </div>
          <button
            onClick={handleSkipPhoto}
            className="w-full mt-2 bg-gray-200 text-gray-700 py-3 rounded-md font-medium text-sm hover:bg-gray-300 transition-colors"
          >
            Skip Photo — Just Complete &amp; Invoice
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </div>
      )}

      {/* Completing spinner */}
      {workflow.step === 'completing' && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2" />
          <p className="text-green-700 font-medium">Completing job & sending invoice...</p>
        </div>
      )}

      {/* Job list */}
      <div className="space-y-3">
        {sortedJobs.map((job, index) => {
          const isQuoteVisit = job.job_type === 'quote_visit'
          const service = isQuoteVisit ? 'Quote Visit' : getServiceLabels(job.service_type)
          const isActive = job.status === 'in_progress'
          const isDone = job.status === 'completed' || job.status === 'cancelled'
          const isNext = !isDone && !isActive && !activeJob && sortedJobs.filter(j => j.status === 'scheduled').indexOf(job) === 0

          return (
            <div
              key={job.id}
              className={`rounded-lg border-2 p-4 transition-all ${
                isActive
                  ? 'border-yellow-400 shadow-md'
                  : isDone
                  ? 'border-gray-200 opacity-60'
                  : isNext
                  ? 'border-brand-green shadow-sm'
                  : 'border-green-200'
              }`}
              style={{ backgroundColor: isDone ? '#e8f5e8' : '#c0efbf' }}
            >
              {/* Stop number + service */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {!isDone && (
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                  )}
                  {isDone && (
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs bg-green-100 text-green-600">
                      &#10003;
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-gray-800 text-sm">{service}</p>
                      {isQuoteVisit && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                          Quote
                        </span>
                      )}
                      {job.is_rescheduled && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                          Rescheduled
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{job.customers?.name}</p>
                    {job.is_rescheduled && job.original_date && (
                      <p className="text-[10px] text-yellow-600">
                        Originally {new Date(job.original_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
                {job.estimated_price && (
                  <span className="text-sm font-medium text-gray-600">
                    ${Number(job.estimated_price).toFixed(0)}
                  </span>
                )}
              </div>

              {/* Address */}
              <p className="text-xs font-medium mb-3 pl-9" style={{ color: '#132b13' }}>
                {getFullAddress(job.customers)}
              </p>

              {/* Action buttons */}
              {!isDone && (workflow.step === 'idle' || (workflow.step === 'in_progress' && isActive)) && (
                <div className="flex gap-2 pl-9">
                  {job.status === 'scheduled' && !activeJob && (
                    <button
                      onClick={() => handleStart(job)}
                      disabled={updateJob.isPending}
                      className={`flex-1 py-2.5 rounded-md font-medium text-sm transition-colors ${
                        isNext
                          ? 'bg-brand-green text-white hover:bg-brand-accent'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Start &rarr; Navigate
                    </button>
                  )}
                  {job.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => {
                          const tomorrow = new Date()
                          tomorrow.setDate(tomorrow.getDate() + 1)
                          setRescheduleDate(tomorrow.toISOString().split('T')[0])
                          setRescheduleJobId(job.id)
                        }}
                        className="px-3 py-2.5 border border-yellow-300 text-yellow-700 rounded-md text-sm font-medium hover:bg-yellow-100 transition-colors"
                      >
                        Move
                      </button>
                      <button
                        onClick={() => handleSkip(job)}
                        className="px-4 py-2.5 border rounded-md text-sm font-medium transition-colors"
                        style={{ backgroundColor: '#fff25c', color: '#132b13', borderColor: '#e6d94f' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff8a9')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff25c')}
                      >
                        Skip
                      </button>
                    </>
                  )}
                  {isActive && job.job_type === 'quote_visit' && (
                    <>
                      <button
                        onClick={() => setConvertJobId(job.id)}
                        className="flex-1 bg-purple-600 text-white py-2.5 rounded-md font-medium text-sm hover:bg-purple-700 transition-colors"
                      >
                        Won — Add to Schedule
                      </button>
                      <button
                        onClick={() => {
                          updateJob.mutate(
                            { id: job.id, status: 'completed', actual_end_time: new Date().toISOString() },
                            { onSuccess: () => { setWorkflow({ step: 'idle' }); refetch() } }
                          )
                        }}
                        className="px-3 py-2.5 border border-gray-300 text-gray-600 rounded-md text-sm hover:bg-gray-50 transition-colors"
                      >
                        Done
                      </button>
                    </>
                  )}
                  {isActive && job.job_type !== 'quote_visit' && (
                    <>
                      <button
                        onClick={() => handleFinished(job.id)}
                        className="flex-1 bg-green-600 text-white py-2.5 rounded-md font-medium text-sm hover:bg-green-700 transition-colors"
                      >
                        Finished
                      </button>
                      <button
                        onClick={() => {
                          if (job.customers) openInMapsApp(getFullAddress(job.customers))
                        }}
                        className="px-3 py-2.5 border border-blue-300 text-blue-600 rounded-md text-sm hover:bg-blue-50 transition-colors"
                      >
                        Navigate
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Status for completed */}
              {job.status === 'completed' && (
                <p className="text-xs text-green-600 font-medium pl-9">
                  {isQuoteVisit ? 'Quote completed' : 'Completed & invoiced'}
                </p>
              )}
              {job.status === 'cancelled' && (
                <p className="text-xs text-gray-400 font-medium pl-9">Skipped</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Completed Reminders */}
      {reminders && reminders.filter(r => r.is_completed).length > 0 && (
        <div className="mt-4 space-y-2 opacity-50">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Completed Follow-Ups</h3>
          {reminders.filter(r => r.is_completed).map((rem) => (
            <div key={rem.id} className="flex items-start gap-3 rounded-lg border-l-4 border-green-300 bg-green-50 p-3">
              <span className="mt-0.5 w-5 h-5 rounded border-2 border-green-400 bg-green-400 flex-shrink-0 flex items-center justify-center text-white text-xs">
                &#10003;
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-600 line-through">
                  {rem.customers?.name ?? rem.prospect_name ?? 'Unknown'}
                </p>
                <p className="text-sm text-gray-400">{rem.note}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All done message */}
      {totalCount > 0 && completedCount === totalCount && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-4 text-center">
          <p className="text-green-800 font-bold text-lg">All done for today!</p>
          <p className="text-green-600 text-sm mt-1">{completedCount} jobs completed</p>
        </div>
      )}
    </div>
  )
}

/** Modal to convert a quote visit into a customer + scheduled job */
function ConvertQuoteModal({
  job,
  onClose,
  onConvert,
}: {
  job: JobWithCustomer | null
  onClose: () => void
  onConvert: (
    customer: { name: string; phone: string; property_address: string; property_city: string; property_state: string; property_zip: string; email: string | null; property_size: string },
    job: { service_type: string; scheduled_date: string; estimated_price: number | null; notes: string | null }
  ) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [schedDate, setSchedDate] = useState('')
  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)

  // Pre-fill from quote visit notes
  useEffect(() => {
    if (!job) return
    const notes = job.notes ?? ''
    const prospectMatch = notes.match(/Prospect: (.+?) \| (.+)/)
    const addressMatch = notes.match(/Address: (.+)/)
    if (prospectMatch) {
      setName(prospectMatch[1])
      setPhone(prospectMatch[2])
    }
    if (addressMatch) setAddress(addressMatch[1])
    if (job.service_type) setServiceType(job.service_type)
    // Default to next week
    const next = new Date()
    next.setDate(next.getDate() + 7)
    setSchedDate(next.toISOString().split('T')[0])
  }, [job])

  if (!job) return null

  const handleSubmit = async () => {
    if (!name || !phone || !address || !serviceType || !schedDate) return
    setSaving(true)
    try {
      await onConvert(
        {
          name,
          phone,
          property_address: address,
          property_city: 'Louisville',
          property_state: 'KY',
          property_zip: '',
          email: null,
          property_size: 'medium',
        },
        {
          service_type: serviceType,
          scheduled_date: schedDate,
          estimated_price: price ? parseFloat(price) : null,
          notes: null,
        }
      )
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Add to Schedule</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select value={serviceType} onChange={e => setServiceType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="">Select service...</option>
              {SERVICE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Service Date</label>
            <input value={schedDate} onChange={e => setSchedDate(e.target.value)} type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price <span className="text-gray-400 font-normal">(optional)</span></label>
            <input value={price} onChange={e => setPrice(e.target.value)} type="number" step="0.01" placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSubmit}
            disabled={saving || !name || !phone || !address || !serviceType || !schedDate}
            className="flex-1 bg-purple-600 text-white py-2 rounded-md font-medium text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Customer & Job'}
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
      </div>
    </div>
  )
}
