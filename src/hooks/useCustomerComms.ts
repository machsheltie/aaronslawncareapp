import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type Comm = Database['public']['Tables']['customer_communications']['Row']

export function useCustomerComms(customerId: string | undefined) {
  return useQuery({
    queryKey: ['customer_comms', customerId],
    queryFn: async () => {
      if (!customerId) return []
      const { data, error } = await supabase
        .from('customer_communications')
        .select('*')
        .eq('customer_id', customerId)
        .order('comm_date', { ascending: false })
      if (error) throw error
      return data as Comm[]
    },
    enabled: !!customerId,
  })
}

export function useAddComm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { customer_id: string; note: string }) => {
      const { data, error } = await supabase
        .from('customer_communications')
        .insert({
          customer_id: input.customer_id,
          comm_type: 'note',
          note: input.note,
          comm_date: new Date().toISOString(),
        })
        .select()
        .single()
      if (error) throw error
      return data as Comm
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customer_comms', data.customer_id] })
    },
  })
}

export function useDeleteComm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, customerId }: { id: string; customerId: string }) => {
      const { error } = await supabase
        .from('customer_communications')
        .delete()
        .eq('id', id)
      if (error) throw error
      return { customerId }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['customer_comms', result.customerId] })
    },
  })
}
