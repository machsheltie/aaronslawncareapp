import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateInvoice } from '@/hooks/useInvoices'
import { useCustomers } from '@/hooks/useCustomers'
import { useJobs, SERVICE_TYPES } from '@/hooks/useJobs'

const invoiceSchema = z.object({
  customer_id: z.string().min(1, 'Select a customer'),
  job_id: z.string().optional(),
  subtotal: z.string().min(1, 'Amount is required'),
  tax: z.string().optional(),
  due_days: z.string().default('30'),
  notes: z.string().optional(),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

export default function InvoiceForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const prefillCustomer = searchParams.get('customer') ?? ''
  const prefillJob = searchParams.get('job') ?? ''

  const { data: customers } = useCustomers()
  const createInvoice = useCreateInvoice()
  const [selectedCustomer, setSelectedCustomer] = useState(prefillCustomer)

  // Show completed jobs for selected customer
  const { data: jobs } = useJobs({ customerId: selectedCustomer || undefined, status: 'completed' })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customer_id: prefillCustomer,
      job_id: prefillJob,
      due_days: '30',
    },
  })

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCustomer(e.target.value)
    setValue('customer_id', e.target.value)
    setValue('job_id', '')
  }

  const handleJobSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const jobId = e.target.value
    setValue('job_id', jobId)
    // Auto-fill price from job
    const job = jobs?.find(j => j.id === jobId)
    if (job?.actual_price) {
      setValue('subtotal', String(job.actual_price))
    } else if (job?.estimated_price) {
      setValue('subtotal', String(job.estimated_price))
    }
  }

  const onSubmit = async (data: InvoiceFormData) => {
    await createInvoice.mutateAsync({
      customer_id: data.customer_id,
      job_id: data.job_id || undefined,
      subtotal: parseFloat(data.subtotal),
      tax: data.tax ? parseFloat(data.tax) : 0,
      due_days: parseInt(data.due_days || '30', 10),
      notes: data.notes || undefined,
    })
    navigate('/invoices')
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">New Invoice</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Customer */}
        <Field label="Customer" error={errors.customer_id?.message}>
          <select
            {...register('customer_id')}
            onChange={handleCustomerChange}
            className={inputClass}
          >
            <option value="">Select customer...</option>
            {customers?.map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.property_address}</option>
            ))}
          </select>
        </Field>

        {/* Link to Job (optional) */}
        {selectedCustomer && jobs && jobs.length > 0 && (
          <Field label="Link to Completed Job" optional>
            <select {...register('job_id')} onChange={handleJobSelect} className={inputClass}>
              <option value="">None — standalone invoice</option>
              {jobs.map((j) => {
                const serviceLabel = SERVICE_TYPES.find(s => s.value === j.service_type)?.label ?? j.service_type
                return (
                  <option key={j.id} value={j.id}>
                    {serviceLabel} — {new Date(j.scheduled_date + 'T00:00:00').toLocaleDateString()}
                    {j.actual_price ? ` ($${Number(j.actual_price).toFixed(2)})` : j.estimated_price ? ` (~$${Number(j.estimated_price).toFixed(2)})` : ''}
                  </option>
                )
              })}
            </select>
          </Field>
        )}

        {/* Amount */}
        <Field label="Subtotal" error={errors.subtotal?.message}>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400">$</span>
            <input
              {...register('subtotal')}
              type="number"
              step="0.01"
              min="0"
              className={`${inputClass} pl-7`}
              placeholder="0.00"
            />
          </div>
        </Field>

        {/* Tax */}
        <Field label="Tax" optional>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400">$</span>
            <input
              {...register('tax')}
              type="number"
              step="0.01"
              min="0"
              className={`${inputClass} pl-7`}
              placeholder="0.00"
            />
          </div>
        </Field>

        {/* Due Days */}
        <Field label="Payment Due">
          <select {...register('due_days')} className={inputClass}>
            <option value="7">Due in 7 days</option>
            <option value="14">Due in 14 days</option>
            <option value="30">Due in 30 days (Net 30)</option>
            <option value="0">Due on receipt</option>
          </select>
        </Field>

        {/* Notes */}
        <Field label="Notes" optional>
          <textarea {...register('notes')} rows={2} className={inputClass} placeholder="Thank you for your business!" />
        </Field>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-brand-green text-white py-2 px-4 rounded-md font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Invoice'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/invoices')}
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
