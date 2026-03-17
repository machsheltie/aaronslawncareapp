# Phase 7: Dashboard Expansion

**Goal:** Add Equipment & Maintenance, Expenses & Profitability, and Seasonal Reminders sections to the Dashboard.

---

## Dashboard Layout (after expansion)

```
Stats Grid (existing)
Reports & Analytics link (existing)
Today's Jobs (existing)
─────────────────────
Equipment & Maintenance    ← NEW section card
Expenses & Receipts        ← NEW section card
Seasonal Reminders         ← NEW section card
```

Each new section is a link card (same style as Reports & Analytics) that goes to a dedicated page.

---

## 1. Equipment & Maintenance (`/equipment`)

### Equipment List Page
- List of all equipment with name, type, hours, next maintenance due
- "+ Add Equipment" button
- Tap equipment → detail page

### Equipment Detail
- Name, type, purchase date, warranty expiry, current hours
- Maintenance log below (chronological)
- "+ Log Maintenance" button

### Maintenance Entry Form
- Date, type (oil change, blade sharpening, belt, filter, tire, general)
- Cost (optional)
- Notes
- Next due date or next due hours (optional)

### Hooks
```ts
useEquipment()              // list all
useEquipmentDetail(id)      // single with maintenance_log joined
useCreateEquipment()
useUpdateEquipment()
useLogMaintenance()
```

---

## 2. Expenses & Receipts (`/expenses`)

### Expenses List Page
- Filterable by: category, month/date range
- Running total at top for filtered view
- Each row: date, vendor, amount, category badge
- "+ Add Expense" button
- Tap to edit

### Add Expense Form
- Date (default today)
- Vendor/store name (optional)
- Amount (required)
- Category dropdown: Gas, Food, Equipment, Equipment Maintenance, Vehicle Maintenance, Cell Phone Service, Office Supplies, Advertising, Job Supplies, Rental Equipment
- Notes (optional)
- Receipt photo upload (optional — uses Supabase Storage `receipts` bucket)

### Receipt Upload
- Camera capture or file picker
- Compressed before upload (reuse existing compressImage utility)
- Stored in Supabase Storage `receipts/` bucket
- Displayed as thumbnail on expense detail

### Hooks
```ts
useExpenses(filters?)       // list with optional category/date filters
useCreateExpense()
useUpdateExpense()
useDeleteExpense()
```

### Dashboard Card
Shows: "Expenses this month: $X,XXX" with category breakdown mini-chart (optional) or just the total.

---

## 3. Seasonal Reminders (`/seasonal-reminders`)

### What this is
Pre-made email templates Aaron can send to all customers who have an email on file. Examples:
- "Spring is here — time for aeration!"
- "Leaf removal season is starting — book your spot"
- "Snow removal contracts available for winter 2026-27"

### Seasonal Messages Page
- List of saved message templates
- "+ Create Template" button
- Each template: name, category, subject line
- "Send" button on each → sends to all customers with email

### Create/Edit Template
- Name (internal label)
- Category: aeration, leaf_removal, snow_removal, spring_cleanup, general
- Subject line
- Body (plain text, maybe simple formatting)
- Preview before sending

### Sending Flow
1. Tap "Send" on a template
2. Confirmation: "Send to X customers with email on file?"
3. Uses Supabase Edge Function to send emails (or a service like Resend/SendGrid)
4. Toast: "Sent to 34 customers"

### Hooks
```ts
useSeasonalMessages()
useCreateSeasonalMessage()
useUpdateSeasonalMessage()
useSendSeasonalMessage()    // calls edge function
```

### Edge Function: `send-seasonal-email`
- Fetches all customers where email is not null and is_active = true
- Sends email to each using configured email service
- Returns count of emails sent

---

## Files to Create

1. `src/pages/Equipment.tsx` — list page
2. `src/pages/EquipmentDetail.tsx` — detail + maintenance log
3. `src/pages/EquipmentForm.tsx` — add/edit equipment
4. `src/pages/Expenses.tsx` — list page with filters
5. `src/pages/ExpenseForm.tsx` — add/edit expense
6. `src/pages/SeasonalReminders.tsx` — template list + send
7. `src/pages/SeasonalReminderForm.tsx` — create/edit template
8. `src/hooks/useEquipment.ts` — NEW
9. `src/hooks/useExpenses.ts` — NEW
10. `src/hooks/useSeasonalMessages.ts` — NEW
11. `src/pages/Dashboard.tsx` — add 3 section cards
12. `src/App.tsx` — add routes
13. `supabase/functions/send-seasonal-email/index.ts` — NEW edge function

---

## Acceptance Criteria
- [ ] Dashboard shows Equipment, Expenses, and Seasonal Reminders section cards
- [ ] Equipment page: CRUD equipment + log maintenance entries
- [ ] Expenses page: add expenses with receipt upload, filter by category/month
- [ ] Seasonal Reminders: create templates, send to all customers with email
- [ ] All new pages styled consistently (#c0efbf cards, brand green buttons)
