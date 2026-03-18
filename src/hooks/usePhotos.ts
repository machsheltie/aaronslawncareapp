import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { compressImage } from '@/lib/compressImage'
import type { Database } from '@/types/supabase'

type Photo = Database['public']['Tables']['photos']['Row']

export const PHOTO_TYPES = [
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'progress', label: 'Progress' },
] as const

export type PhotoType = 'before' | 'after' | 'progress'

export function usePhotos(jobId: string | undefined) {
  return useQuery({
    queryKey: ['photos', jobId],
    queryFn: async () => {
      if (!jobId) return []
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('job_id', jobId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Photo[]
    },
    enabled: !!jobId,
  })
}

export function useUploadPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      jobId,
      file,
      photoType,
    }: {
      jobId: string
      file: File
      photoType: PhotoType
    }) => {
      // Compress image before upload
      const compressed = await compressImage(file)

      // Generate unique storage path
      const ext = compressed.name.split('.').pop() || 'jpg'
      const path = `${jobId}/${Date.now()}-${photoType}.${ext}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('job-photos')
        .upload(path, compressed, {
          cacheControl: '3600',
          upsert: false,
        })
      if (uploadError) throw uploadError

      // Insert photo record
      const { data, error: insertError } = await supabase
        .from('photos')
        .insert({
          job_id: jobId,
          photo_type: photoType,
          storage_path: path,
          file_size: compressed.size,
          mime_type: compressed.type,
        })
        .select()
        .single()
      if (insertError) throw insertError
      return data as Photo
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['photos', variables.jobId] })
    },
  })
}

/** Upload a photo directly to a customer (not tied to a job) */
export function useUploadCustomerPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      customerId,
      file,
      photoType,
    }: {
      customerId: string
      file: File
      photoType: PhotoType
    }) => {
      const compressed = await compressImage(file)
      const ext = compressed.name.split('.').pop() || 'jpg'
      const path = `customers/${customerId}/${Date.now()}-${photoType}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('job-photos')
        .upload(path, compressed, {
          cacheControl: '3600',
          upsert: false,
        })
      if (uploadError) throw uploadError

      const { data, error: insertError } = await supabase
        .from('photos')
        .insert({
          customer_id: customerId,
          photo_type: photoType,
          storage_path: path,
          file_size: compressed.size,
          mime_type: compressed.type,
        })
        .select()
        .single()
      if (insertError) throw insertError
      return data as Photo
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-photos', variables.customerId] })
    },
  })
}

/** Update the notes on a photo */
export function useUpdatePhotoNotes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string | null }) => {
      const { error } = await supabase
        .from('photos')
        .update({ notes })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-photos'] })
      queryClient.invalidateQueries({ queryKey: ['photos'] })
    },
  })
}

/** Delete a customer photo (soft delete) */
export function useDeleteCustomerPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, customerId, storagePath }: { id: string; customerId: string; storagePath: string }) => {
      await supabase.storage.from('job-photos').remove([storagePath])
      const { error } = await supabase
        .from('photos')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      return customerId
    },
    onSuccess: (customerId) => {
      queryClient.invalidateQueries({ queryKey: ['customer-photos', customerId] })
    },
  })
}

export function useDeletePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, jobId, storagePath }: { id: string; jobId: string; storagePath: string }) => {
      // Remove from storage
      await supabase.storage.from('job-photos').remove([storagePath])
      // Soft delete record
      const { error } = await supabase
        .from('photos')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      return jobId
    },
    onSuccess: (jobId) => {
      queryClient.invalidateQueries({ queryKey: ['photos', jobId] })
    },
  })
}

/** Get all photos for a customer (both job-linked and direct uploads) */
export function useCustomerPhotos(customerId: string | undefined) {
  return useQuery({
    queryKey: ['customer-photos', customerId],
    queryFn: async () => {
      if (!customerId) return []

      // Get photos directly linked to customer
      const { data: directPhotos, error: e1 } = await supabase
        .from('photos')
        .select('*, jobs(service_type, scheduled_date)')
        .eq('customer_id', customerId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (e1) throw e1

      // Get photos linked via jobs (for backwards compat)
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('customer_id', customerId)
        .is('deleted_at', null)
      if (jobsError) throw jobsError

      if (!jobs || jobs.length === 0) return (directPhotos ?? []) as (Photo & { jobs: { service_type: string; scheduled_date: string } | null })[]

      const jobIds = jobs.map(j => j.id)

      const { data: jobPhotos, error: e2 } = await supabase
        .from('photos')
        .select('*, jobs(service_type, scheduled_date)')
        .in('job_id', jobIds)
        .is('deleted_at', null)
        .is('customer_id', null) // Only get ones NOT already linked to customer
        .order('created_at', { ascending: false })
      if (e2) throw e2

      const all = [...(directPhotos ?? []), ...(jobPhotos ?? [])]
      // Deduplicate by id
      const seen = new Set<string>()
      const unique = all.filter(p => {
        if (seen.has(p.id)) return false
        seen.add(p.id)
        return true
      })

      return unique as (Photo & { jobs: { service_type: string; scheduled_date: string } | null })[]
    },
    enabled: !!customerId,
  })
}

/** Get a signed URL for a photo (valid 1 hour) */
export async function getPhotoUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('job-photos')
    .createSignedUrl(storagePath, 3600)
  if (error) throw error
  return data.signedUrl
}
