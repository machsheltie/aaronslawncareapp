# Phase 3: Job Rescheduling & Rain Day

**Goal:** Let Aaron reschedule individual jobs without changing their recurring pattern, and provide a "Rain Day" button to bump an entire day's schedule.

---

## Individual Job Reschedule

### Where it appears
- Job Detail page — new "Reschedule" button next to Edit
- My Day — long-press or menu option on each job card

### Behavior
1. Tap "Reschedule" → date picker appears (default: tomorrow)
2. On confirm:
   - `jobs.scheduled_date` → new date
   - `jobs.original_date` → old date (so we know it was moved)
   - `jobs.is_rescheduled` → true
3. The **recurring schedule is NOT modified** — next week's job still generates on the original day
4. Rescheduled jobs show a small badge/indicator ("Rescheduled from Mon 3/17")

### Hook
```ts
useRescheduleJob() → mutate({ jobId, newDate })
```
- Updates job record
- Invalidates jobs query cache

---

## Rain Day (Bulk Reschedule)

### Where it appears
- **Dashboard** — "Rain Day" button in the Today's Jobs section header
- **My Day** — "Rain Day" button at top of page

### Behavior
1. Tap "Rain Day" → confirmation: "Push all of today's scheduled jobs to tomorrow?"
   - Option to pick a different date (default tomorrow)
2. On confirm:
   - All jobs for today with status `scheduled` get rescheduled to the selected date
   - Each job gets `is_rescheduled = true` and `original_date` set
   - Jobs already `in_progress`, `completed`, or `cancelled` are NOT moved
3. Toast: "8 jobs moved to Tuesday, March 18"

### Hook
```ts
useRainDay() → mutate({ fromDate, toDate })
```
- Bulk updates all scheduled jobs for fromDate → toDate
- Invalidates jobs query cache

---

## Visual Indicators

On My Day and Jobs list, rescheduled jobs show:
- Small yellow "Rescheduled" badge
- Tooltip/subtitle: "Originally scheduled for {original_date}"

---

## Files to Create/Modify

1. `src/hooks/useJobs.ts` — add `useRescheduleJob()` and `useRainDay()` hooks
2. `src/pages/MyDay.tsx` — add Rain Day button at top, reschedule option per job
3. `src/pages/Dashboard.tsx` — add Rain Day button in Today's Jobs section
4. `src/pages/JobDetail.tsx` — add Reschedule button

---

## Acceptance Criteria
- [ ] Can reschedule individual job to a new date
- [ ] Original date preserved, recurring pattern unaffected
- [ ] Rain Day button moves all today's scheduled jobs to selected date
- [ ] Rescheduled jobs show visual indicator
- [ ] Completed/in-progress jobs are not moved by Rain Day
