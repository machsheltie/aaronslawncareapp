# Aaron's Lawn Care App — Feature Expansion Master Plan

**Created:** 2026-03-17
**Status:** In Progress

This is the index for the feature expansion. Each phase has its own detailed spec in `docs/phases/`. Work through phases in order — each builds on the last.

---

## Phase Overview

| Phase | Name | Key Deliverables | Status |
|-------|------|-----------------|--------|
| 1 | Database Migrations | New tables + altered columns for all features | COMPLETE |
| 2 | Documents Hub | Consolidate Quotes/Invoices/Contracts into one nav item | COMPLETE |
| 3 | Job Rescheduling & Rain Day | Reschedule individual jobs + bulk rain day button | COMPLETE |
| 4 | Customer Enhancements | Service day, communication log, past documents tab | COMPLETE |
| 5 | Follow-Up Reminders | Schedule reminders that pin to top of My Day | COMPLETE |
| 6 | Quote Scheduling for Prospects | Quote visits on schedule, convert to customer on win | COMPLETE |
| 7 | Dashboard Expansion | Equipment, Expenses, Seasonal Reminders sections | COMPLETE |
| 8 | Contracts Generator | Contract builder (after template is provided by Stacey) | BLOCKED — waiting on template |

---

## What Already Exists (No Work Needed)

- **Route optimization** — `src/lib/routeOptimizer.ts` orders jobs by nearest-neighbor, calculates miles
- **Google Maps navigation** — MyDay opens native maps for next job
- **Recurring schedules** — `useRecurringSchedules.ts` generates weekly/biweekly/monthly jobs 4 weeks ahead
- **Skip week** — can skip a single occurrence without breaking the pattern

---

## Phase Dependencies

```
Phase 1 (DB) ──┬── Phase 2 (Documents Hub)
               ├── Phase 3 (Rescheduling)
               ├── Phase 4 (Customer Enhancements)
               ├── Phase 5 (Follow-Up Reminders)
               ├── Phase 6 (Quote Scheduling)
               └── Phase 7 (Dashboard Expansion)
                         Phase 8 (Contracts) ← needs template from Stacey
```

Phase 1 must be done first. Phases 2-7 can be done in any order after that, but the listed order is recommended. Phase 8 is blocked until Stacey provides the contract template.

---

## Detailed Specs

- `docs/phases/phase-1-database.md`
- `docs/phases/phase-2-documents-hub.md`
- `docs/phases/phase-3-rescheduling.md`
- `docs/phases/phase-4-customer-enhancements.md`
- `docs/phases/phase-5-follow-up-reminders.md`
- `docs/phases/phase-6-quote-scheduling.md`
- `docs/phases/phase-7-dashboard-expansion.md`
- `docs/phases/phase-8-contracts.md`
