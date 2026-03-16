import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type RecurringSchedule = Database['public']['Tables']['recurring_schedules']['Row']
type RecurringInsert = Database['public']['Tables']['recurring_schedules']['Insert']

export type RecurringWithCustomer = RecurringSchedule & {
  customers: { name: string; property_address: string } | null
}

export const FREQUENCY_OPTIONS = [
  { value: 'one_time', label: 'One Time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 Weeks' },
  { value: 'monthly', label: 'Monthly' },
] as const

export function useRecurringSchedules() {
  return useQuery({
    queryKey: ['recurring_schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_schedules')
        .select('*, customers(name, property_address)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as RecurringWithCustomer[]
    },
  })
}

export function useCreateRecurringSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (schedule: RecurringInsert) => {
      const { data, error } = await supabase
        .from('recurring_schedules')
        .insert(schedule)
        .select()
        .single()
      if (error) throw error

      // Generate jobs immediately for this schedule
      await generateJobsForSchedule(data as RecurringSchedule)

      return data as RecurringSchedule
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_schedules'] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function usePauseSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, pause, reason }: { id: string; pause: boolean; reason?: string }) => {
      const updates = pause
        ? { paused_at: new Date().toISOString(), pause_reason: reason || null, is_active: false }
        : { paused_at: null, pause_reason: null, is_active: true }

      const { error } = await supabase
        .from('recurring_schedules')
        .update(updates)
        .eq('id', id)
      if (error) throw error

      // If unpausing, regenerate upcoming jobs
      if (!pause) {
        const { data: schedule } = await supabase
          .from('recurring_schedules')
          .select('*')
          .eq('id', id)
          .single()
        if (schedule) await generateJobsForSchedule(schedule as RecurringSchedule)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_schedules'] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function useSkipWeek() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ scheduleId, skipDate, reason }: { scheduleId: string; skipDate: string; reason?: string }) => {
      // Add skip record
      const { error: skipError } = await supabase
        .from('schedule_skips')
        .insert({ recurring_schedule_id: scheduleId, skip_date: skipDate, reason: reason || null })
      if (skipError) throw skipError

      // Cancel the job for that date if it exists
      const { error: jobError } = await supabase
        .from('jobs')
        .update({ status: 'cancelled', notes: `Skipped: ${reason || 'No reason given'}` })
        .eq('recurring_schedule_id', scheduleId)
        .eq('scheduled_date', skipDate)
        .eq('status', 'scheduled')
      if (jobError) throw jobError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_schedules'] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function useDeleteRecurringSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, cancelFutureJobs }: { id: string; cancelFutureJobs: boolean }) => {
      if (cancelFutureJobs) {
        // Cancel all future scheduled jobs for this recurring schedule
        const today = new Date().toISOString().split('T')[0]
        await supabase
          .from('jobs')
          .update({ status: 'cancelled' })
          .eq('recurring_schedule_id', id)
          .eq('status', 'scheduled')
          .gte('scheduled_date', today)
      }

      const { error } = await supabase
        .from('recurring_schedules')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_schedules'] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

// Generate jobs for a schedule, 4 weeks ahead
async function generateJobsForSchedule(schedule: RecurringSchedule) {
  if (schedule.frequency === 'one_time') {
    // Just create a single job
    const { data: existing } = await supabase
      .from('jobs')
      .select('id')
      .eq('recurring_schedule_id', schedule.id)
      .limit(1)

    if (!existing || existing.length === 0) {
      await supabase.from('jobs').insert({
        customer_id: schedule.customer_id,
        service_type: schedule.service_type,
        scheduled_date: schedule.start_date,
        scheduled_time_start: schedule.preferred_time,
        estimated_price: schedule.estimated_price,
        notes: schedule.notes,
        customer_instructions: schedule.customer_instructions,
        recurring_schedule_id: schedule.id,
      })
    }
    return
  }

  // Get skip dates for this schedule
  const { data: skips } = await supabase
    .from('schedule_skips')
    .select('skip_date')
    .eq('recurring_schedule_id', schedule.id)
  const skipDates = new Set((skips ?? []).map(s => s.skip_date))

  // Calculate dates for the next 4 weeks
  const today = new Date()
  const fourWeeksOut = new Date(today)
  fourWeeksOut.setDate(fourWeeksOut.getDate() + 28)

  const startFrom = schedule.last_generated_date
    ? new Date(schedule.last_generated_date + 'T00:00:00')
    : new Date(schedule.start_date + 'T00:00:00')

  // Move startFrom to next occurrence if it's in the past
  const cursor = new Date(startFrom)
  if (cursor < today) {
    // Advance to today or next occurrence
    while (cursor < today) {
      advanceDate(cursor, schedule.frequency)
    }
  }

  const jobsToCreate: Array<{
    customer_id: string
    service_type: string
    scheduled_date: string
    scheduled_time_start: string | null
    estimated_price: number | null
    notes: string | null
    customer_instructions: string | null
    recurring_schedule_id: string
  }> = []

  while (cursor <= fourWeeksOut) {
    // Check end date
    if (schedule.end_date && cursor > new Date(schedule.end_date + 'T00:00:00')) break

    const dateStr = cursor.toISOString().split('T')[0]

    // Skip if in skip list
    if (!skipDates.has(dateStr)) {
      jobsToCreate.push({
        customer_id: schedule.customer_id,
        service_type: schedule.service_type,
        scheduled_date: dateStr,
        scheduled_time_start: schedule.preferred_time,
        estimated_price: schedule.estimated_price,
        notes: schedule.notes,
        customer_instructions: schedule.customer_instructions,
        recurring_schedule_id: schedule.id,
      })
    }

    advanceDate(cursor, schedule.frequency)
  }

  if (jobsToCreate.length === 0) return

  // Check for existing jobs to avoid duplicates
  const dates = jobsToCreate.map(j => j.scheduled_date)
  const { data: existing } = await supabase
    .from('jobs')
    .select('scheduled_date')
    .eq('recurring_schedule_id', schedule.id)
    .in('scheduled_date', dates)
    .neq('status', 'cancelled')

  const existingDates = new Set((existing ?? []).map(j => j.scheduled_date))
  const newJobs = jobsToCreate.filter(j => !existingDates.has(j.scheduled_date))

  if (newJobs.length > 0) {
    await supabase.from('jobs').insert(newJobs)
  }

  // Update last_generated_date
  const lastDate = dates[dates.length - 1]
  await supabase
    .from('recurring_schedules')
    .update({ last_generated_date: lastDate })
    .eq('id', schedule.id)
}

function advanceDate(date: Date, frequency: string) {
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'biweekly':
      date.setDate(date.getDate() + 14)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
  }
}

// Call this on app load to keep schedules populated
export function useGenerateUpcomingJobs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data: schedules } = await supabase
        .from('recurring_schedules')
        .select('*')
        .eq('is_active', true)

      if (!schedules) return

      for (const schedule of schedules) {
        await generateJobsForSchedule(schedule as RecurringSchedule)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}
