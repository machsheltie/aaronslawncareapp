import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useJob, useCreateJob, useUpdateJob, SERVICE_TYPES } from '@/hooks/useJobs'
import { useCreateRecurringSchedule, FREQUENCY_OPTIONS } from '@/hooks/useRecurringSchedules'
import { useCustomers } from '@/hooks/useCustomers'

const jobSchema = z.object({
  customer_id: z.string().min(1, 'Select a customer'),
  service_type: z.string().min(1, 'Select a service'),
  frequency: z.string().min(1, 'Select a frequency'),
  scheduled_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  scheduled_time_start: z.string().min(1, 'Start time is required'),
  scheduled_time_end: z.string().optional(),
  estimated_price: z.string().min(1, 'Price is required'),
  notes: z.string().optional(),
  customer_instructions: z.string().optional(),
})

type JobFormData = z.infer<typeof jobSchema>

export default function JobForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const { data: job, isLoading: loadingJob } = useJob(id)
  const { data: customers } = useCustomers()
  const createJob = useCreateJob()
  const updateJob = useUpdateJob()
  const createSchedule = useCreateRecurringSchedule()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: { frequency: 'one_time' },
  })

  const frequency = watch('frequency')

  useEffect(() => {
    if (job) {
      reset({
        customer_id: job.customer_id,
        service_type: job.service_type,
        frequency: 'one_time',
        scheduled_date: job.scheduled_date,
        scheduled_time_start: job.scheduled_time_start ?? '',
        scheduled_time_end: job.scheduled_time_end ?? '',
        estimated_price: job.estimated_price ? String(job.estimated_price) : '',
        notes: job.notes ?? '',
        customer_instructions: job.customer_instructions ?? '',
      })
    }
  }, [job, reset])

  const onSubmit = async (data: JobFormData) => {
    if (isEditing && id) {
      // Editing always updates the single job
      await updateJob.mutateAsync({
        id,
        customer_id: data.customer_id,
        service_type: data.service_type,
        scheduled_date: data.scheduled_date,
        scheduled_time_start: data.scheduled_time_start || null,
        scheduled_time_end: data.scheduled_time_end || null,
        estimated_price: data.estimated_price ? parseFloat(data.estimated_price) : null,
        notes: data.notes || null,
        customer_instructions: data.customer_instructions || null,
      })
      navigate('/jobs')
      return
    }

    if (data.frequency === 'one_time') {
      // Create a single job
      await createJob.mutateAsync({
        customer_id: data.customer_id,
        service_type: data.service_type,
        scheduled_date: data.scheduled_date,
        scheduled_time_start: data.scheduled_time_start || null,
        scheduled_time_end: data.scheduled_time_end || null,
        estimated_price: data.estimated_price ? parseFloat(data.estimated_price) : null,
        notes: data.notes || null,
        customer_instructions: data.customer_instructions || null,
      })
    } else {
      // Create a recurring schedule (which auto-generates jobs)
      await createSchedule.mutateAsync({
        customer_id: data.customer_id,
        service_type: data.service_type,
        frequency: data.frequency,
        start_date: data.scheduled_date,
        end_date: data.end_date || null,
        preferred_time: data.scheduled_time_start || null,
        estimated_price: data.estimated_price ? parseFloat(data.estimated_price) : null,
        notes: data.notes || null,
        customer_instructions: data.customer_instructions || null,
      })
    }
    navigate('/jobs')
  }

  if (isEditing && loadingJob) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Edit Job' : 'New Job'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Customer */}
        <Field label="Customer" error={errors.customer_id?.message}>
          <select {...register('customer_id')} className={inputClass}>
            <option value="">Select customer...</option>
            {customers?.map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.property_address}</option>
            ))}
          </select>
        </Field>

        {/* Service Type */}
        <Field label="Service" error={errors.service_type?.message}>
          <select {...register('service_type')} className={inputClass}>
            <option value="">Select service...</option>
            {SERVICE_TYPES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>

        {/* Frequency — only show when creating */}
        {!isEditing && (
          <Field label="Frequency" error={errors.frequency?.message}>
            <select {...register('frequency')} className={inputClass}>
              {FREQUENCY_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </Field>
        )}

        {/* Date */}
        <Field label={frequency !== 'one_time' && !isEditing ? 'Start Date' : 'Date'} error={errors.scheduled_date?.message}>
          <input {...register('scheduled_date')} type="date" className={inputClass} />
        </Field>

        {/* End Date — only for recurring new jobs */}
        {!isEditing && frequency && frequency !== 'one_time' && (
          <Field label="End Date" optional>
            <input {...register('end_date')} type="date" className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">Leave blank for ongoing service</p>
          </Field>
        )}

        {/* Time */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Time" error={errors.scheduled_time_start?.message}>
            <input {...register('scheduled_time_start')} type="time" className={inputClass} />
          </Field>
          {(isEditing || frequency === 'one_time') && (
            <Field label="End Time" optional>
              <input {...register('scheduled_time_end')} type="time" className={inputClass} />
            </Field>
          )}
        </div>

        {/* Price */}
        <Field label={frequency !== 'one_time' && !isEditing ? 'Price per Visit' : 'Estimated Price'} error={errors.estimated_price?.message}>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400">$</span>
            <input
              {...register('estimated_price')}
              type="number"
              step="0.01"
              min="0"
              className={`${inputClass} pl-7`}
              placeholder="0.00"
            />
          </div>
        </Field>

        {/* Notes */}
        <Field label="Job Notes" optional>
          <textarea {...register('notes')} rows={2} className={inputClass} placeholder="Internal notes..." />
        </Field>

        {/* Customer Instructions */}
        <Field label="Customer Instructions" optional>
          <textarea {...register('customer_instructions')} rows={2} className={inputClass} placeholder="Gate code, dog in yard, etc." />
        </Field>

        {/* Recurring info message */}
        {!isEditing && frequency && frequency !== 'one_time' && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-sm">
            This will create a recurring schedule and auto-generate jobs 4 weeks ahead.
            You can pause, skip, or cancel anytime from the Schedules tab.
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-brand-green text-white py-2 px-4 rounded-md font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Job' : frequency === 'one_time' ? 'Schedule Job' : 'Create Recurring Job'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent'

function Field({
  label,
  error,
  optional,
  children,
}: {
  label: string
  error?: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {optional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
