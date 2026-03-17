import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type CustomerService = Database['public']['Tables']['customer_services']['Row']
type CustomerServiceInsert = Database['public']['Tables']['customer_services']['Insert']

export function useCustomerServices(customerId: string | undefined) {
  return useQuery({
    queryKey: ['customer_services', customerId],
    queryFn: async () => {
      if (!customerId) return []
      const { data, error } = await supabase
        .from('customer_services')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as CustomerService[]
    },
    enabled: !!customerId,
  })
}

export function useAddCustomerService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CustomerServiceInsert) => {
      const { data, error } = await supabase.from('customer_services').insert(input).select().single()
      if (error) throw error
      return data as CustomerService
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customer_services', data.customer_id] })
    },
  })
}

export function useDeleteCustomerService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, customerId }: { id: string; customerId: string }) => {
      const { error } = await supabase.from('customer_services').delete().eq('id', id)
      if (error) throw error
      return customerId
    },
    onSuccess: (customerId) => {
      queryClient.invalidateQueries({ queryKey: ['customer_services', customerId] })
    },
  })
}
