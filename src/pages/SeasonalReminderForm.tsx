import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSeasonalMessages, useCreateSeasonalMessage, useUpdateSeasonalMessage, SEASONAL_CATEGORIES } from '@/hooks/useSeasonalMessages'

const messageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Select a category'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
})

type MessageFormData = z.infer<typeof messageSchema>

export default function SeasonalReminderForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const { data: allMessages } = useSeasonalMessages()
  const existing = isEdit ? allMessages?.find(m => m.id === id) : undefined
  const createMessage = useCreateSeasonalMessage()
  const updateMessage = useUpdateSeasonalMessage()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      category: 'general',
    },
  })

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        category: existing.category,
        subject: existing.subject,
        body: existing.body,
      })
    }
  }, [existing, reset])

  const onSubmit = async (data: MessageFormData) => {
    if (isEdit && id) {
      await updateMessage.mutateAsync({ id, ...data })
    } else {
      await createMessage.mutateAsync(data)
    }
    navigate('/seasonal-reminders')
  }

  const bodyPreview = watch('body')
  const subjectPreview = watch('subject')

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Edit Template' : 'Create Template'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Template Name" error={errors.name?.message}>
          <input {...register('name')} className={inputClass} placeholder="e.g. Spring Aeration Reminder" />
        </Field>

        <Field label="Category" error={errors.category?.message}>
          <select {...register('category')} className={inputClass}>
            {SEASONAL_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Email Subject" error={errors.subject?.message}>
          <input {...register('subject')} className={inputClass} placeholder="e.g. Spring is here — time for aeration!" />
        </Field>

        <Field label="Email Body" error={errors.body?.message}>
          <textarea
            {...register('body')}
            rows={6}
            className={inputClass}
            placeholder="Write the email body here..."
          />
        </Field>

        {/* Preview */}
        {(subjectPreview || bodyPreview) && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Preview</p>
            {subjectPreview && <p className="font-semibold text-gray-800 text-sm mb-2">{subjectPreview}</p>}
            {bodyPreview && <p className="text-sm text-gray-700 whitespace-pre-wrap">{bodyPreview}</p>}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-brand-green text-white py-2 px-4 rounded-md font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Template' : 'Create Template'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/seasonal-reminders')}
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
