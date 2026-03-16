import { useState, useEffect, useRef, useCallback } from 'react'
import { useJobs, useUpdateJob, SERVICE_TYPES, getFullAddress } from '@/hooks/useJobs'
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

  const [workflow, setWorkflow] = useState<WorkflowState>({ step: 'idle' })
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
          notes: `${SERVICE_TYPES.find(s => s.value === job.service_type)?.label ?? job.service_type} — ${getToday()}`,
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
          notes: `${SERVICE_TYPES.find(s => s.value === job.service_type)?.label ?? job.service_type} — ${getToday()}`,
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
        <h2 className="text-2xl font-bold text-gray-800">My Day</h2>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-sm font-medium text-gray-600">
            {completedCount}/{totalCount} jobs done
          </span>
          {totalMiles !== null && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
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
          const service = SERVICE_TYPES.find(s => s.value === job.service_type)?.label ?? job.service_type
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
                    <p className="font-semibold text-gray-800 text-sm">{service}</p>
                    <p className="text-xs text-gray-500">{job.customers?.name}</p>
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
                    <button
                      onClick={() => handleSkip(job)}
                      className="px-4 py-2.5 border rounded-md text-sm font-medium transition-colors"
                      style={{ backgroundColor: '#fff25c', color: '#132b13', borderColor: '#e6d94f' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff8a9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff25c')}
                    >
                      Skip
                    </button>
                  )}
                  {isActive && (
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
                <p className="text-xs text-green-600 font-medium pl-9">Completed &amp; invoiced</p>
              )}
              {job.status === 'cancelled' && (
                <p className="text-xs text-gray-400 font-medium pl-9">Skipped</p>
              )}
            </div>
          )
        })}
      </div>

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
