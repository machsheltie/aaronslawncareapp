import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateRecurringSchedule, FREQUENCY_OPTIONS } from '@/hooks/useRecurringSchedules'
import { useCustomers } from '@/hooks/useCustomers'
import { SERVICE_TYPES } from '@/hooks/useJobs'

const scheduleSchema = z.object({
  customer_id: z.string().min(1, 'Select a customer'),
  service_type: z.string().min(1, 'Select a service'),
  frequency: z.string().min(1, 'Select a frequency'),
  start_date: z.string().min(1, 'Start date is required'),
  preferred_time: z.string().optional(),
  end_date: z.string().optional(),
  estimated_price: z.string().optional(),
  notes: z.string().optional(),
  customer_instructions: z.string().optional(),
})

type ScheduleFormData = z.infer<typeof scheduleSchema>

export default function ScheduleForm() {
  const navigate = useNavigate()
  const { data: customers } = useCustomers()
  const createSchedule = useCreateRecurringSchedule()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
  })

  const frequency = watch('frequency')

  const onSubmit = async (data: ScheduleFormData) => {
    await createSchedule.mutateAsync({
      customer_id: data.customer_id,
      service_type: data.service_type,
      frequency: data.frequency,
      start_date: data.start_date,
      preferred_time: data.preferred_time || null,
      end_date: data.end_date || null,
      estimated_price: data.estimated_price ? parseFloat(data.estimated_price) : null,
      notes: data.notes || null,
      customer_instructions: data.customer_instructions || null,
    })
    navigate('/schedules')
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">New Recurring Schedule</h2>
      <p className="text-sm text-gray-500 mb-6">
        Jobs will be automatically created on the calendar based on the frequency you set.
      </p>

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

        {/* Service */}
        <Field label="Service" error={errors.service_type?.message}>
          <select {...register('service_type')} className={inputClass}>
            <option value="">Select service...</option>
            {SERVICE_TYPES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>

        {/* Frequency */}
        <Field label="Frequency" error={errors.frequency?.message}>
          <select {...register('frequency')} className={inputClass}>
            <option value="">How often?</option>
            {FREQUENCY_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </Field>

        {/* Start Date */}
        <Field label="Start Date" error={errors.start_date?.message}>
          <input {...register('start_date')} type="date" className={inputClass} />
        </Field>

        {/* End Date - only for recurring */}
        {frequency && frequency !== 'one_time' && (
          <Field label="End Date" optional>
            <input {...register('end_date')} type="date" className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">Leave blank for ongoing service</p>
          </Field>
        )}

        {/* Preferred Time */}
        <Field label="Preferred Time" optional>
          <input {...register('preferred_time')} type="time" className={inputClass} />
        </Field>

        {/* Price */}
        <Field label="Price per Visit" optional>
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
        <Field label="Notes" optional>
          <textarea {...register('notes')} rows={2} className={inputClass} placeholder="Internal notes..." />
        </Field>

        {/* Customer Instructions */}
        <Field label="Customer Instructions" optional>
          <textarea {...register('customer_instructions')} rows={2} className={inputClass} placeholder="Gate code, dog in yard, etc." />
        </Field>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-brand-green text-white py-2 px-4 rounded-md font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Schedule'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/schedules')}
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
