import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type Expense = Database['public']['Tables']['expenses']['Row']
type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']

export const EXPENSE_CATEGORIES = [
  { value: 'gas', label: 'Gas' },
  { value: 'food', label: 'Food' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'equipment_maintenance', label: 'Equipment Maintenance' },
  { value: 'vehicle_maintenance', label: 'Vehicle Maintenance' },
  { value: 'cell_phone', label: 'Cell Phone Service' },
  { value: 'office_supplies', label: 'Office Supplies' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'job_supplies', label: 'Job Supplies' },
  { value: 'rental_equipment', label: 'Rental Equipment' },
  { value: 'other', label: 'Other' },
] as const

export function useExpenses(filters?: { category?: string; month?: string }) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })

      if (filters?.category) query = query.eq('category', filters.category)
      if (filters?.month) {
        // month is YYYY-MM
        const start = `${filters.month}-01`
        const end = `${filters.month}-31`
        query = query.gte('date', start).lte('date', end)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Expense[]
    },
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: ExpenseInsert) => {
      const { data, error } = await supabase.from('expenses').insert(input).select().single()
      if (error) throw error
      return data as Expense
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: ExpenseUpdate & { id: string }) => {
      const { data, error } = await supabase.from('expenses').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data as Expense
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  })
}
