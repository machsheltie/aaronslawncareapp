# Phase 1: Database Migrations

**Goal:** Add all new tables and columns needed by Phases 2-8 in a single migration batch.

---

## New Tables

### `follow_up_reminders`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | default gen_random_uuid() |
| customer_id | uuid FK → customers | nullable (for new prospects) |
| prospect_name | text | nullable — used when no customer_id |
| prospect_phone | text | nullable |
| reminder_date | date | the day it shows on My Day |
| note | text | what the follow-up is about |
| is_completed | boolean | default false |
| completed_at | timestamptz | null until checked off |
| created_at | timestamptz | default now() |

### `customer_communications`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| customer_id | uuid FK → customers | |
| note | text | free-form note |
| created_at | timestamptz | default now() |

### `expenses`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| date | date | when the expense occurred |
| vendor | text | nullable (store name) |
| amount | numeric(10,2) | |
| category | text | gas, food, equipment, equipment_maintenance, vehicle_maintenance, cell_phone, office_supplies, advertising, job_supplies, rental_equipment |
| notes | text | nullable |
| receipt_path | text | nullable — Supabase Storage path |
| created_at | timestamptz | default now() |

### `equipment`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name | text | e.g. "John Deere Z530M" |
| type | text | mower, trimmer, blower, edger, truck, trailer, other |
| purchase_date | date | nullable |
| warranty_expiry | date | nullable |
| hours | numeric(8,1) | nullable — engine hours |
| notes | text | nullable |
| created_at | timestamptz | default now() |

### `maintenance_log`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| equipment_id | uuid FK → equipment | |
| date | date | |
| type | text | oil_change, blade_sharpening, belt_replacement, filter, tire, general |
| cost | numeric(10,2) | nullable |
| notes | text | nullable |
| next_due_date | date | nullable |
| next_due_hours | numeric(8,1) | nullable |
| created_at | timestamptz | default now() |

### `seasonal_messages`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name | text | e.g. "Spring Aeration Reminder" |
| subject | text | email subject line |
| body | text | email body (plain text or simple HTML) |
| category | text | aeration, leaf_removal, snow_removal, spring_cleanup, general |
| created_at | timestamptz | default now() |

### `contracts`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| customer_id | uuid FK → customers | nullable (new prospect) |
| contract_number | text | e.g. CON-20260317-001 |
| contract_date | date | |
| services | text | description of services |
| total | numeric(10,2) | |
| terms | text | nullable — special terms |
| storage_path | text | nullable — saved PDF path |
| status | text | draft, signed, completed, cancelled |
| created_at | timestamptz | default now() |

---

## Altered Tables

### `customers` — add columns
| Column | Type | Notes |
|--------|------|-------|
| service_day | text | nullable — monday, tuesday, ... saturday |
| service_frequency | text | nullable — weekly, biweekly (display helper, actual scheduling stays on recurring_schedules) |

### `jobs` — add columns
| Column | Type | Notes |
|--------|------|-------|
| is_rescheduled | boolean | default false |
| original_date | date | nullable — the date before rescheduling |
| job_type | text | default 'service' — values: service, quote_visit |

---

## RLS Policies

All new tables get the same pattern as existing tables:
- `auth.uid() = auth.uid()` for the single-tenant setup (no multi-tenant filtering needed)
- Or just enable RLS with a permissive policy since this is a single-user app

---

## Migration Order

Run as a single Supabase migration. This phase has no frontend changes.

## Acceptance Criteria
- [ ] All tables created with correct types and constraints
- [ ] Foreign keys reference correct parent tables
- [ ] RLS enabled on all new tables
- [ ] Existing app still works (no breaking changes)
