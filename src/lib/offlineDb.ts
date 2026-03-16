import Dexie, { type Table } from 'dexie'

export interface OfflineAction {
  id?: number
  action: string
  table: string
  payload: Record<string, unknown>
  timestamp: number
  retries: number
}

class AppDatabase extends Dexie {
  offlineQueue!: Table<OfflineAction>

  constructor() {
    super('AaronsLawnCare')
    this.version(1).stores({
      offlineQueue: '++id, action, table, timestamp',
    })
  }
}

export const db = new AppDatabase()

/** Queue a mutation for when connectivity returns */
export async function queueOfflineAction(
  action: 'insert' | 'update' | 'delete',
  table: string,
  payload: Record<string, unknown>
) {
  await db.offlineQueue.add({
    action,
    table,
    payload,
    timestamp: Date.now(),
    retries: 0,
  })
}

export async function getPendingCount(): Promise<number> {
  return db.offlineQueue.count()
}
