import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense, EXPENSE_CATEGORIES } from '@/hooks/useExpenses'
import { supabase } from '@/lib/supabase'
import { compressImage } from '@/lib/compressImage'

const expenseSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  amount: z.string().min(1, 'Amount is required'),
  category: z.string().min(1, 'Select a category'),
  vendor: z.string().optional(),
  notes: z.string().optional(),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

export default function ExpenseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const { data: allExpenses } = useExpenses()
  const existing = isEdit ? allExpenses?.find(e => e.id === id) : undefined
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()
  const deleteExpense = useDeleteExpense()

  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      category: 'gas',
    },
  })

  useEffect(() => {
    if (existing) {
      reset({
        date: existing.date,
        amount: String(existing.amount),
        category: existing.category,
        vendor: existing.vendor ?? '',
        notes: existing.notes ?? '',
      })
    }
  }, [existing, reset])

  const uploadReceipt = async (): Promise<string | undefined> => {
    if (!receiptFile) return undefined
    setUploading(true)
    try {
      const compressed = await compressImage(receiptFile)
      const ext = compressed.name.split('.').pop() ?? 'jpg'
      const path = `receipts/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('receipts').upload(path, compressed)
      if (error) throw error
      return path
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: ExpenseFormData) => {
    const receiptPath = await uploadReceipt()
    const payload = {
      date: data.date,
      amount: parseFloat(data.amount),
      category: data.category,
      vendor: data.vendor || undefined,
      notes: data.notes || undefined,
      receipt_path: receiptPath,
    }

    if (isEdit && id) {
      await updateExpense.mutateAsync({ id, ...payload })
    } else {
      await createExpense.mutateAsync(payload)
    }
    navigate('/expenses')
  }

  const handleDelete = () => {
    if (id && confirm('Delete this expense?')) {
      deleteExpense.mutate(id, { onSuccess: () => navigate('/expenses') })
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Edit Expense' : 'Add Expense'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" error={errors.date?.message}>
            <input {...register('date')} type="date" className={inputClass} />
          </Field>
          <Field label="Amount" error={errors.amount?.message}>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400">$</span>
              <input
                {...register('amount')}
                type="number"
                step="0.01"
                min="0"
                className={`${inputClass} pl-7`}
                placeholder="0.00"
              />
            </div>
          </Field>
        </div>

        <Field label="Category" error={errors.category?.message}>
          <select {...register('category')} className={inputClass}>
            {EXPENSE_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Vendor / Store" optional>
          <input {...register('vendor')} className={inputClass} placeholder="e.g. Shell, Home Depot" />
        </Field>

        <Field label="Notes" optional>
          <textarea {...register('notes')} rows={2} className={inputClass} placeholder="Any details..." />
        </Field>

        {/* Receipt Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Receipt Photo <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-brand-green hover:file:bg-green-100"
          />
          {receiptFile && (
            <p className="text-xs text-gray-500 mt-1">{receiptFile.name} ({(receiptFile.size / 1024).toFixed(0)} KB)</p>
          )}
        </div>

        {/* Existing receipt */}
        {existing?.receipt_path && !receiptFile && (
          <div className="text-xs text-gray-500">
            Receipt on file: {existing.receipt_path.split('/').pop()}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="flex-1 bg-brand-green text-white py-2 px-4 rounded-md font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
          >
            {isSubmitting || uploading ? 'Saving...' : isEdit ? 'Update Expense' : 'Add Expense'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/expenses')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="w-full text-sm text-red-500 hover:text-red-700 py-2"
          >
            Delete Expense
          </button>
        )}
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
