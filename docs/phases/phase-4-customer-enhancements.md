# Phase 4: Customer Enhancements

**Goal:** Add service day selection, communication log, and past documents tab to each customer.

---

## 1. Service Day on Customer Form

### Customer Form Changes
Add a "Service Day" dropdown after Property Size:

```
Service Day (optional)
[  Monday  ▼ ]
```

Options: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, (blank = not set)

- This is a **display/preference** field — it does NOT auto-schedule jobs
- Aaron sets this when a customer becomes a regular
- The first service might be any day; the permanent day comes later
- Stored as `customers.service_day` (text, nullable)

### Customer Detail — Info Tab
Show service day in the Property section:
```
Service Day    Wednesday
Frequency      Biweekly
```

### Customer Form Schema Update
Add to zod schema:
```ts
service_day: z.string().optional(),
service_frequency: z.string().optional(),
```

---

## 2. Communication Log Tab

### New tab on CustomerDetail: "Comms"

Tab order: **Info | History | Comms | Photos**

### UI
- Text input + "Add Note" button at top
- Chronological list of notes below (newest first)
- Each note shows:
  - The note text
  - Timestamp (date + time)
  - Small delete (×) button

### Data
- Table: `customer_communications`
- Hook: `useCustomerComms(customerId)` — fetch all comms for customer
- Hook: `useAddComm()` — insert new comm
- Hook: `useDeleteComm()` — delete a comm

### Example Use Case
> "Ms. Barnes wants leaf removal, mulch beds, weed spray, and weeding next week. Quoted $450."

This way Aaron can check back instead of texting Stacey "how much did we quote Ms. Barnes?"

---

## 3. Past Documents Tab

### New tab on CustomerDetail: "Docs"

Tab order: **Info | History | Comms | Docs | Photos**

### UI
- Filter bar at top: `All | Quotes | Invoices | Contracts`
- List of documents, each showing:
  - Document type icon/badge
  - Document number (INV-20260317-001 or Quote #Q-001)
  - Date
  - Amount
  - Status (paid/unpaid for invoices, draft/signed for contracts)
- Tap to navigate to the document detail page

### Data Sources
- **Invoices:** Already linked via `invoices.customer_id` — use existing `useInvoices({ customerId })`
- **Quotes:** Need to link quotes to customers (see below)
- **Contracts:** `contracts.customer_id` (Phase 8)

### Quote → Customer Linking
The Quote Generator currently doesn't save to Supabase. Options:
1. When generating a quote for an existing customer, save a record to a `quotes` table (future)
2. For now, show only Invoices and Contracts in the Docs tab; Quotes integration comes with Phase 8

**Decision: Start with Invoices only. Add Quotes and Contracts as those features mature.**

---

## Files to Create/Modify

1. `src/pages/CustomerForm.tsx` — add service_day and service_frequency dropdowns
2. `src/pages/CustomerDetail.tsx` — add Comms and Docs tabs
3. `src/hooks/useCustomerComms.ts` — NEW — CRUD for customer_communications
4. `src/hooks/useCustomers.ts` — update schema to include service_day, service_frequency

---

## Acceptance Criteria
- [ ] Customer form has Service Day and Frequency dropdowns
- [ ] Customer detail shows service day in Info tab
- [ ] Comms tab allows adding/viewing/deleting notes
- [ ] Docs tab shows invoices for that customer with status
- [ ] Docs tab filter works (All / Invoices, with Quotes/Contracts placeholders)
