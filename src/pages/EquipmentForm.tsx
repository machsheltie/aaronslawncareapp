import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEquipmentDetail, useCreateEquipment, useUpdateEquipment, EQUIPMENT_TYPES } from '@/hooks/useEquipment'

const equipmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  equipment_type: z.string().min(1, 'Select a type'),
  purchase_date: z.string().optional(),
  warranty_expiry: z.string().optional(),
  current_hours: z.string().optional(),
  notes: z.string().optional(),
})

type EquipmentFormData = z.infer<typeof equipmentSchema>

export default function EquipmentForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const { data: existing } = useEquipmentDetail(id)
  const createEquipment = useCreateEquipment()
  const updateEquipment = useUpdateEquipment()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      equipment_type: 'mower',
    },
  })

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        equipment_type: existing.type,
        purchase_date: existing.purchase_date ?? '',
        warranty_expiry: existing.warranty_expiry ?? '',
        current_hours: existing.hours != null ? String(existing.hours) : '',
        notes: existing.notes ?? '',
      })
    }
  }, [existing, reset])

  const onSubmit = async (data: EquipmentFormData) => {
    const payload = {
      name: data.name,
      type: data.equipment_type,
      purchase_date: data.purchase_date || undefined,
      warranty_expiry: data.warranty_expiry || undefined,
      hours: data.current_hours ? parseInt(data.current_hours, 10) : undefined,
      notes: data.notes || undefined,
    }

    if (isEdit && id) {
      await updateEquipment.mutateAsync({ id, ...payload })
      navigate(`/equipment/${id}`)
    } else {
      const created = await createEquipment.mutateAsync(payload)
      navigate(`/equipment/${created.id}`)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Edit Equipment' : 'Add Equipment'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Name" error={errors.name?.message}>
          <input {...register('name')} className={inputClass} placeholder="e.g. Husqvarna Z254" />
        </Field>

        <Field label="Type" error={errors.equipment_type?.message}>
          <select {...register('equipment_type')} className={inputClass}>
            {EQUIPMENT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Purchase Date" optional>
            <input {...register('purchase_date')} type="date" className={inputClass} />
          </Field>
          <Field label="Warranty Expiry" optional>
            <input {...register('warranty_expiry')} type="date" className={inputClass} />
          </Field>
        </div>

        <Field label="Current Hours" optional>
          <input {...register('current_hours')} type="number" min="0" className={inputClass} placeholder="0" />
        </Field>

        <Field label="Notes" optional>
          <textarea {...register('notes')} rows={2} className={inputClass} placeholder="Serial number, location, etc." />
        </Field>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-brand-green text-white py-2 px-4 rounded-md font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Equipment' : 'Add Equipment'}
          </button>
          <button
            type="button"
            onClick={() => navigate(isEdit && id ? `/equipment/${id}` : '/equipment')}
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
