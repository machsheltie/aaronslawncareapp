import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type Reminder = Database['public']['Tables']['follow_up_reminders']['Row']
type ReminderInsert = Database['public']['Tables']['follow_up_reminders']['Insert']

export type ReminderWithCustomer = Reminder & {
  customers: { name: string; phone: string } | null
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

/** Fetch reminders due today or overdue (incomplete) + completed today */
export function useTodayReminders() {
  const today = getToday()

  return useQuery({
    queryKey: ['reminders', 'today', today],
    queryFn: async () => {
      // Get incomplete reminders due today or earlier (overdue)
      const { data: pending, error: e1 } = await supabase
        .from('follow_up_reminders')
        .select('*, customers(name, phone)')
        .eq('is_completed', false)
        .lte('reminder_date', today)
        .order('reminder_date', { ascending: true })
      if (e1) throw e1

      // Get reminders completed today
      const { data: completed, error: e2 } = await supabase
        .from('follow_up_reminders')
        .select('*, customers(name, phone)')
        .eq('is_completed', true)
        .gte('completed_at', today + 'T00:00:00')
        .order('completed_at', { ascending: false })
      if (e2) throw e2

      return [...(pending ?? []), ...(completed ?? [])] as ReminderWithCustomer[]
    },
  })
}

export function useCreateReminder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ReminderInsert) => {
      const { data, error } = await supabase
        .from('follow_up_reminders')
        .insert(input)
        .select('*, customers(name, phone)')
        .single()
      if (error) throw error
      return data as ReminderWithCustomer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
    },
  })
}

export function useCompleteReminder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('follow_up_reminders')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
    },
  })
}
