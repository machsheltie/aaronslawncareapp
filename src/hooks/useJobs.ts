import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type Job = Database['public']['Tables']['jobs']['Row']
type JobInsert = Database['public']['Tables']['jobs']['Insert']
type JobUpdate = Database['public']['Tables']['jobs']['Update']

// Job with customer name joined
export type JobWithCustomer = Job & {
  customers: {
    name: string
    property_address: string
    property_city: string | null
    property_state: string | null
    property_zip: string | null
    phone?: string
    email?: string | null
  } | null
}

/** Build full address string from customer fields */
export function getFullAddress(customer: JobWithCustomer['customers']): string {
  if (!customer) return ''
  const parts = [customer.property_address]
  if (customer.property_city) parts.push(customer.property_city)
  if (customer.property_state) parts.push(customer.property_state)
  if (customer.property_zip) parts.push(customer.property_zip)
  return parts.join(', ')
}

export function useJobs(filters?: { date?: string; status?: string; customerId?: string }) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select('*, customers(name, property_address, property_city, property_state, property_zip, phone, email)')
        .is('deleted_at', null)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time_start', { ascending: true })

      if (filters?.date) {
        query = query.eq('scheduled_date', filters.date)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId)
      }

      const { data, error } = await query
      if (error) throw error
      return data as JobWithCustomer[]
    },
  })
}

export function useJob(id: string | undefined) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('jobs')
        .select('*, customers(name, property_address, phone)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as JobWithCustomer
    },
    enabled: !!id,
  })
}

export function useCreateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (job: JobInsert) => {
      const { data, error } = await supabase
        .from('jobs')
        .insert(job)
        .select('*, customers(name, property_address, property_city, property_state, property_zip, phone, email)')
        .single()
      if (error) throw error
      return data as JobWithCustomer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function useUpdateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: JobUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select('*, customers(name, property_address, property_city, property_state, property_zip, phone, email)')
        .single()
      if (error) throw error
      return data as JobWithCustomer
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.setQueryData(['jobs', data.id], data)
    },
  })
}

export function useDeleteJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('jobs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function useRescheduleJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ jobId, newDate }: { jobId: string; newDate: string }) => {
      // First get the current job to save original_date
      const { data: job, error: fetchError } = await supabase
        .from('jobs')
        .select('scheduled_date, original_date')
        .eq('id', jobId)
        .single()
      if (fetchError) throw fetchError

      const { error } = await supabase
        .from('jobs')
        .update({
          scheduled_date: newDate,
          original_date: job.original_date ?? job.scheduled_date,
          is_rescheduled: true,
        })
        .eq('id', jobId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function useRainDay() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ fromDate, toDate }: { fromDate: string; toDate: string }) => {
      // Get all scheduled jobs for the given date
      const { data: jobs, error: fetchError } = await supabase
        .from('jobs')
        .select('id, scheduled_date, original_date')
        .eq('scheduled_date', fromDate)
        .eq('status', 'scheduled')
        .is('deleted_at', null)
      if (fetchError) throw fetchError
      if (!jobs || jobs.length === 0) return { count: 0 }

      // Bulk update each job
      const updates = jobs.map((job) =>
        supabase
          .from('jobs')
          .update({
            scheduled_date: toDate,
            original_date: job.original_date ?? job.scheduled_date,
            is_rescheduled: true,
          })
          .eq('id', job.id)
      )
      await Promise.all(updates)
      return { count: jobs.length }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export const SERVICE_TYPES = [
  { value: 'mowing', label: 'Mowing' },
  { value: 'edging', label: 'Edging' },
  { value: 'leaf_removal', label: 'Leaf Removal' },
  { value: 'aeration', label: 'Aeration' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'garden_bed_design', label: 'Garden Bed Design' },
  { value: 'hedge_trimming', label: 'Hedge Trimming' },
  { value: 'tree_removal', label: 'Tree Removal' },
  { value: 'tilling', label: 'Tilling' },
  { value: 'snow_removal', label: 'Snow Removal' },
] as const

/** Equipment needed per service type — Aaron's checklist */
export const SERVICE_EQUIPMENT: Record<string, string[]> = {
  mowing: ['Push mower', 'Riding mower', 'Gas can', 'Ear protection', 'Trimmer line'],
  edging: ['Edger', 'Gas can', 'Safety glasses', 'Ear protection'],
  leaf_removal: ['Leaf blower', 'Rakes', 'Tarps', 'Trash bags', 'Ear protection'],
  aeration: ['Aerator', 'Flags/markers'],
  landscaping: ['Shovels', 'Wheelbarrow', 'Gloves', 'Landscape fabric', 'Stakes'],
  garden_bed_design: ['Shovels', 'Rake', 'Wheelbarrow', 'Edging material', 'Mulch', 'Gloves'],
  hedge_trimming: ['Hedge trimmer', 'Ladder', 'Tarps', 'Safety glasses', 'Ear protection'],
  tree_removal: ['Chainsaw', 'Pole saw', 'Ropes', 'Ladder', 'Safety glasses', 'Ear protection', 'Chaps', 'Hard hat'],
  tilling: ['Tiller', 'Rake', 'Gas can', 'Gloves'],
  snow_removal: ['Snow blower', 'Snow shovel', 'Ice melt/salt', 'Gloves'],
}

/** Parse comma-separated service_type string into array */
export function parseServiceTypes(serviceType: string): string[] {
  return serviceType.split(',').map(s => s.trim()).filter(Boolean)
}

/** Get label(s) for a potentially multi-value service_type */
export function getServiceLabels(serviceType: string): string {
  const types = parseServiceTypes(serviceType)
  return types.map(t => SERVICE_TYPES.find(s => s.value === t)?.label ?? t).join(', ')
}

export const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-500' },
] as const
