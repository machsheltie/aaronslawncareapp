import { db } from './offlineDb'
import { supabase } from './supabase'

/** Process all queued offline actions. Call this when connectivity is restored. */
export async function syncOfflineQueue(): Promise<{ synced: number; failed: number }> {
  const queue = await db.offlineQueue.orderBy('timestamp').toArray()
  let synced = 0
  let failed = 0

  for (const item of queue) {
    try {
      await processAction(item.action, item.table, item.payload)
      await db.offlineQueue.delete(item.id!)
      synced++
    } catch (err) {
      console.error(`Offline sync failed for ${item.action} on ${item.table}:`, err)
      // Increment retry count; drop after 5 attempts
      if (item.retries >= 4) {
        console.warn(`Dropping offline action after 5 retries:`, item)
        await db.offlineQueue.delete(item.id!)
      } else {
        await db.offlineQueue.update(item.id!, { retries: item.retries + 1 })
      }
      failed++
    }
  }

  return { synced, failed }
}

async function processAction(
  action: string,
  table: string,
  payload: Record<string, unknown>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const from = (supabase as any).from(table)

  switch (action) {
    case 'insert': {
      const { error } = await from.insert(payload)
      if (error) throw error
      break
    }
    case 'update': {
      const { id, ...rest } = payload
      const { error } = await from.update(rest).eq('id', id as string)
      if (error) throw error
      break
    }
    case 'delete': {
      const { error } = await from
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', payload.id as string)
      if (error) throw error
      break
    }
    default:
      throw new Error(`Unknown offline action: ${action}`)
  }
}
