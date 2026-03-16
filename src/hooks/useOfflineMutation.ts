import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queueOfflineAction } from '@/lib/offlineDb'

/**
 * A mutation hook that falls back to offline queue when there's no network.
 * Use this for critical field operations (job status updates, etc.) that
 * must succeed even with intermittent connectivity.
 */
export function useOfflineAwareMutation<T extends Record<string, unknown>>(
  table: string,
  action: 'insert' | 'update' | 'delete',
  invalidateKeys: string[][]
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: T) => {
      if (!navigator.onLine) {
        await queueOfflineAction(action, table, payload)
        return { queued: true }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const from = (supabase as any).from(table)

      try {
        let result
        switch (action) {
          case 'insert': {
            const { data, error } = await from.insert(payload).select().single()
            if (error) throw error
            result = data
            break
          }
          case 'update': {
            const { id, ...rest } = payload
            const { data, error } = await from.update(rest).eq('id', id as string).select().single()
            if (error) throw error
            result = data
            break
          }
          case 'delete': {
            const { error } = await from
              .update({ deleted_at: new Date().toISOString() })
              .eq('id', payload.id as string)
            if (error) throw error
            result = { deleted: true }
            break
          }
        }
        return result
      } catch (err) {
        // Network error — queue it
        if (err instanceof TypeError && err.message.includes('fetch')) {
          await queueOfflineAction(action, table, payload)
          return { queued: true }
        }
        throw err
      }
    },
    onSuccess: () => {
      for (const key of invalidateKeys) {
        queryClient.invalidateQueries({ queryKey: key })
      }
    },
  })
}
