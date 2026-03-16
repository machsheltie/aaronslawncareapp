import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
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
      // Generate unique storage path
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${jobId}/${Date.now()}-${photoType}.${ext}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('job-photos')
        .upload(path, file, {
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
          file_size: file.size,
          mime_type: file.type,
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

/** Get a signed URL for a photo (valid 1 hour) */
export async function getPhotoUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('job-photos')
    .createSignedUrl(storagePath, 3600)
  if (error) throw error
  return data.signedUrl
}
