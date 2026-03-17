import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type SeasonalMessage = Database['public']['Tables']['seasonal_messages']['Row']
type SeasonalInsert = Database['public']['Tables']['seasonal_messages']['Insert']
type SeasonalUpdate = Database['public']['Tables']['seasonal_messages']['Update']

export const SEASONAL_CATEGORIES = [
  { value: 'aeration', label: 'Aeration' },
  { value: 'leaf_removal', label: 'Leaf Removal' },
  { value: 'snow_removal', label: 'Snow Removal' },
  { value: 'spring_cleanup', label: 'Spring Cleanup' },
  { value: 'general', label: 'General' },
] as const

export function useSeasonalMessages() {
  return useQuery({
    queryKey: ['seasonal_messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seasonal_messages')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as SeasonalMessage[]
    },
  })
}

export function useCreateSeasonalMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: SeasonalInsert) => {
      const { data, error } = await supabase.from('seasonal_messages').insert(input).select().single()
      if (error) throw error
      return data as SeasonalMessage
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seasonal_messages'] }),
  })
}

export function useUpdateSeasonalMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: SeasonalUpdate & { id: string }) => {
      const { data, error } = await supabase.from('seasonal_messages').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data as SeasonalMessage
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seasonal_messages'] }),
  })
}

export function useSendSeasonalMessage() {
  return useMutation({
    mutationFn: async ({ messageId }: { messageId: string }) => {
      // Get the message
      const { data: msg, error: msgError } = await supabase
        .from('seasonal_messages')
        .select('*')
        .eq('id', messageId)
        .single()
      if (msgError) throw msgError

      // Get all active customers with email
      const { data: customers, error: custError } = await supabase
        .from('customers')
        .select('email, name')
        .eq('is_active', true)
        .not('email', 'is', null)
      if (custError) throw custError

      const emailCount = customers?.filter(c => c.email).length ?? 0

      // Edge function integration for actual email sending comes later
      return { sentCount: emailCount, message: msg as SeasonalMessage }
    },
  })
}
