import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type Equipment = Database['public']['Tables']['equipment']['Row']
type EquipmentInsert = Database['public']['Tables']['equipment']['Insert']
type EquipmentUpdate = Database['public']['Tables']['equipment']['Update']
type MaintenanceLog = Database['public']['Tables']['maintenance_log']['Row']
type MaintenanceInsert = Database['public']['Tables']['maintenance_log']['Insert']

export type EquipmentWithMaintenance = Equipment & {
  maintenance_log: MaintenanceLog[]
}

export const EQUIPMENT_TYPES = [
  { value: 'mower', label: 'Mower' },
  { value: 'trimmer', label: 'Trimmer' },
  { value: 'blower', label: 'Blower' },
  { value: 'edger', label: 'Edger' },
  { value: 'chainsaw', label: 'Chainsaw' },
  { value: 'trailer', label: 'Trailer' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'other', label: 'Other' },
] as const

export const MAINTENANCE_TYPES = [
  { value: 'oil_change', label: 'Oil Change' },
  { value: 'blade_sharpening', label: 'Blade Sharpening' },
  { value: 'belt', label: 'Belt Replacement' },
  { value: 'filter', label: 'Filter' },
  { value: 'tire', label: 'Tire' },
  { value: 'general', label: 'General' },
] as const

// DB columns: equipment.type, equipment.hours (no next_maintenance_date)
// maintenance_log.date, maintenance_log.type

export function useEquipment() {
  return useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name', { ascending: true })
      if (error) throw error
      return data as Equipment[]
    },
  })
}

export function useEquipmentDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('equipment')
        .select('*, maintenance_log(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as EquipmentWithMaintenance
    },
    enabled: !!id,
  })
}

export function useCreateEquipment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: EquipmentInsert) => {
      const { data, error } = await supabase.from('equipment').insert(input).select().single()
      if (error) throw error
      return data as Equipment
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipment'] }),
  })
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: EquipmentUpdate & { id: string }) => {
      const { data, error } = await supabase.from('equipment').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data as Equipment
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipment'] }),
  })
}

export function useLogMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: MaintenanceInsert) => {
      const { data, error } = await supabase.from('maintenance_log').insert(input).select().single()
      if (error) throw error
      return data as MaintenanceLog
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['equipment', data.equipment_id] })
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
    },
  })
}
