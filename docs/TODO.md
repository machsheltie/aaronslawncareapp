# TODO Tracker — Feature Expansion

**Last Updated:** 2026-03-17

Mark tasks `[x]` as they are completed. After completing a task, check the next uncompleted task and begin work.

---

## Phase 1: Database Migrations
- [x] 1.1 Write SQL migration for all new tables (follow_up_reminders, customer_communications, expenses, equipment, maintenance_log, seasonal_messages, contracts)
- [x] 1.2 Write SQL migration for altered tables (customers: service_day + service_frequency, jobs: is_rescheduled + original_date + job_type)
- [x] 1.3 Apply migration via Supabase MCP
- [x] 1.4 Regenerate TypeScript types
- [x] 1.5 Verify existing app still works (build check)

## Phase 2: Documents Hub
- [x] 2.1 Create Documents.tsx hub page with 3 cards
- [x] 2.2 Update AppLayout.tsx nav (replace Invoices + Quotes with Documents)
- [x] 2.3 Update App.tsx routes (nest quotes/invoices under /documents)
- [x] 2.4 Update all internal Link references across the app
- [x] 2.5 Build check + visual verify on mobile

## Phase 3: Job Rescheduling & Rain Day
- [x] 3.1 Add useRescheduleJob hook to useJobs.ts
- [x] 3.2 Add useRainDay hook to useJobs.ts
- [x] 3.3 Add Reschedule button to JobDetail.tsx (with date picker)
- [x] 3.4 Add Rain Day button to MyDay.tsx
- [x] 3.5 Add Rain Day button to Dashboard.tsx (Today's Jobs section)
- [x] 3.6 Show rescheduled badge on job cards in MyDay and Jobs list
- [x] 3.7 Build check

## Phase 4: Customer Enhancements
- [x] 4.1 Add service_day + service_frequency to CustomerForm.tsx
- [x] 4.2 Show service day in CustomerDetail Info tab
- [x] 4.3 Create useCustomerComms.ts hook
- [x] 4.4 Add Comms tab to CustomerDetail.tsx
- [x] 4.5 Add Docs tab to CustomerDetail.tsx (invoices for now)
- [x] 4.6 Build check

## Phase 5: Follow-Up Reminders
- [x] 5.1 Create useReminders.ts hook
- [x] 5.2 Create FollowUpForm.tsx component (modal with customer selector)
- [x] 5.3 Add reminders section to top of MyDay.tsx
- [x] 5.4 Add "Schedule Follow-Up" section to Dashboard.tsx
- [x] 5.5 Integrate follow-up button on Customer Detail Comms tab
- [x] 5.6 Handle overdue reminders (carry forward)
- [x] 5.7 Build check

## Phase 6: Quote Scheduling
- [x] 6.1 Add job_type toggle to JobForm.tsx (service vs quote_visit)
- [x] 6.2 Relax required fields for quote_visit in JobForm
- [x] 6.3 Different completion flow in MyDay for quote_visit jobs
- [x] 6.4 "Finish Quote & Add to Schedule" flow (create customer + job)
- [ ] 6.5 Add customer selector to Quote Generator (Quotes.jsx) — deferred (standalone file)
- [x] 6.6 Build check

## Phase 7: Dashboard Expansion
- [ ] 7.1 Create useEquipment.ts hook
- [ ] 7.2 Create Equipment.tsx, EquipmentDetail.tsx, EquipmentForm.tsx pages
- [ ] 7.3 Create useExpenses.ts hook
- [ ] 7.4 Create Expenses.tsx and ExpenseForm.tsx pages (with receipt upload)
- [ ] 7.5 Create useSeasonalMessages.ts hook
- [ ] 7.6 Create SeasonalReminders.tsx and SeasonalReminderForm.tsx pages
- [ ] 7.7 Create send-seasonal-email edge function
- [ ] 7.8 Add Equipment, Expenses, Seasonal Reminders section cards to Dashboard
- [ ] 7.9 Add all new routes to App.tsx
- [ ] 7.10 Build check

## Phase 8: Contracts (BLOCKED)
- [ ] 8.1 Receive contract template from Stacey
- [ ] 8.2 Create useContracts.ts hook
- [ ] 8.3 Create Contracts.tsx and ContractForm.tsx pages
- [ ] 8.4 Create generateContractPdf.ts
- [ ] 8.5 Update Documents hub to link to Contracts (remove "Coming Soon")
- [ ] 8.6 Build check
