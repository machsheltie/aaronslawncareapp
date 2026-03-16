import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCustomer, useCreateCustomer, useUpdateCustomer } from '@/hooks/useCustomers'

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  property_address: z.string().min(1, 'Address is required'),
  property_city: z.string().min(1, 'City is required'),
  property_state: z.string().min(1, 'State is required'),
  property_zip: z.string().min(1, 'Zip is required'),
  property_size: z.string().min(1, 'Property size is required'),
  notes: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

export default function CustomerForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const { data: customer, isLoading: loadingCustomer } = useCustomer(id)
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      property_city: 'Louisville',
      property_state: 'KY',
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        phone: customer.phone,
        email: customer.email ?? '',
        property_address: customer.property_address,
        property_city: customer.property_city ?? 'Louisville',
        property_state: customer.property_state ?? 'KY',
        property_zip: customer.property_zip ?? '',
        property_size: (customer.property_size as CustomerFormData['property_size']) ?? undefined,
        notes: customer.notes ?? '',
      })
    }
  }, [customer, reset])

  const onSubmit = async (data: CustomerFormData) => {
    const payload = {
      ...data,
      email: data.email || null,
      notes: data.notes || null,
    }

    if (isEditing && id) {
      await updateCustomer.mutateAsync({ id, ...payload })
    } else {
      await createCustomer.mutateAsync(payload)
    }
    navigate('/customers')
  }

  if (isEditing && loadingCustomer) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Edit Customer' : 'New Customer'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <Field label="Name" error={errors.name?.message}>
          <input {...register('name')} className={inputClass} placeholder="John Doe" />
        </Field>

        {/* Phone */}
        <Field label="Phone" error={errors.phone?.message}>
          <input {...register('phone')} type="tel" className={inputClass} placeholder="502-555-0100" />
        </Field>

        {/* Email */}
        <Field label="Email" error={errors.email?.message} optional>
          <input {...register('email')} type="email" className={inputClass} placeholder="john@example.com" />
        </Field>

        {/* Address */}
        <Field label="Property Address" error={errors.property_address?.message}>
          <input {...register('property_address')} className={inputClass} placeholder="123 Main St" />
        </Field>

        {/* City / State / Zip row */}
        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-3">
            <Field label="City" error={errors.property_city?.message}>
              <input {...register('property_city')} className={inputClass} />
            </Field>
          </div>
          <div className="col-span-1">
            <Field label="State" error={errors.property_state?.message}>
              <input {...register('property_state')} className={inputClass} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Zip" error={errors.property_zip?.message}>
              <input {...register('property_zip')} className={inputClass} placeholder="40202" />
            </Field>
          </div>
        </div>

        {/* Property Size */}
        <Field label="Property Size" error={errors.property_size?.message}>
          <select {...register('property_size')} className={inputClass}>
            <option value="">Select size...</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="not_sure">Not Sure</option>
          </select>
        </Field>

        {/* Notes */}
        <Field label="Notes" optional>
          <textarea {...register('notes')} rows={3} className={inputClass} placeholder="Any special instructions..." />
        </Field>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-brand-green text-white py-2 px-4 rounded-md font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Customer' : 'Add Customer'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/customers')}
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
