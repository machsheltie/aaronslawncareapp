# Aaron's Lawn Care App - Implementation Plan

## Scope Alignment
- Single-tenant app for Aaron's Lawn Care only
- Installable PWA (no app stores)
- Android primary; iPhone and laptop supported for admin/scheduling
- Intermittent connectivity (spotty signal) is supported; full offline weeks not required

## Phase 0: Foundations
- [ ] Confirm product branding, logo, and invoice template assets
- [ ] Provision Supabase project and set env vars for dev/staging/prod
- [ ] Configure Supabase Auth (staff email/password, customer portal magic links)
- [ ] Create storage buckets: `job-photos`, `customer-documents`
- [ ] Migrate schema (including `scheduled_start_at`, `properties.timezone`, `customers.portal_user_id`)
- [ ] Add RLS policies for staff vs customer portal access
- [ ] Add trigger/process to create `users` profile from `auth.users`

## Phase 1: Core Data + Scheduling
- [ ] Staff login/logout, profile bootstrap, and role handling
- [ ] Customer CRUD + property CRUD (with timezone field)
- [ ] Job scheduling UI (day/week view) using `scheduled_start_at` UTC
- [ ] Recurring job templates and job generation (2 weeks ahead)
- [ ] Field app daily list and job detail (start/finish with GPS)
- [ ] Basic offline queue with retry/backoff for spotty signal

## Phase 2: Photos + Documentation
- [ ] Photo capture from job detail
- [ ] Compression to ~500KB WebP
- [ ] Offline photo queue with background upload on reconnect
- [ ] Photo gallery on job and customer history

## Phase 3: Invoicing + Payments (Card + ACH)
- [ ] Invoice generation and PDF rendering
- [ ] Email + SMS delivery with payment link
- [ ] Payment portal with Stripe Elements + Financial Connections (ACH)
- [ ] Payment Intent Edge Function with `us_bank_account` option
- [ ] Webhook handling for `processing` and `succeeded` states
- [ ] Invoice status transitions: draft -> sent -> processing -> paid/overdue

## Phase 4: Reporting
- [ ] Revenue, jobs, customer, and crew reports
- [ ] CSV export
- [ ] Performance checks on 1-year ranges

## QA + Launch
- [ ] Device testing: Android phone (primary), iPhone, and laptop
- [ ] Spotty signal testing (airplane mode on/off, throttled network)
- [ ] RLS checks for staff vs customer portal access
- [ ] Stripe test flows for card + ACH
- [ ] Deployment checklist (env vars, webhooks, storage rules)

## Definition of Done
- [ ] All Phase 1-3 features meet PRD acceptance criteria
- [ ] ACH works end-to-end with `processing` -> `paid` via webhook
- [ ] PWA install works on Android; core screens usable on iPhone/laptop
