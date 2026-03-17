# Phase 6: Quote Scheduling for Prospects

**Goal:** Let Aaron schedule quote visits for potential new customers. If the quote converts, the prospect becomes a real customer with a job on the schedule.

---

## Scheduling a Quote Visit

### Entry Point
- Jobs page — "New Job" form gets a toggle: **Service** vs **Quote Visit**
- Or: separate "Schedule Quote" button on Jobs page

### Quote Visit Form (minimal — Aaron is on the phone with them)
**Required fields:**
- First name
- Phone number
- Address

**Optional fields:**
- Last name
- Email
- Service type being quoted (mowing, landscaping, etc.)
- Date of quote visit
- Notes

This does NOT create a customer record yet — just a job with `job_type = 'quote_visit'`.

### How it shows on the schedule
- Appears on My Day like a regular job but with a **"Quote"** badge instead of a service type badge
- Route optimizer includes it in the day's route
- Google Maps navigation works the same

---

## Quote Visit Workflow on My Day

### Instead of the normal "Finish → Photo → Invoice" flow:

When job_type is `quote_visit`, the completion buttons change:

1. **"Finish Quote & Add to Schedule"** — the prospect wants the work done
   - Prompts for full customer details (pre-filled from what we have)
   - Creates customer record
   - Creates a new job (service type, date, price)
   - Links the new customer to the new job
   - Updates original quote_visit job as `completed`

2. **"Finish Quote"** — didn't convert (or needs to think about it)
   - Marks the quote_visit job as `completed`
   - No customer record created
   - Optionally: offer to schedule a follow-up reminder (Phase 5 integration)

### No photo prompt, no invoice for quote visits.

---

## Quote Generator Integration

When Aaron selects an **existing customer** in the Quote Generator:
- Auto-fill their info (name, address, phone, email)
- When saving/printing the PDF, also log it to the customer's Docs tab (Phase 4)

When Aaron selects **new contact**:
- Manual entry as today
- No auto-logging (customer doesn't exist yet)

This requires the Quote Generator to have a customer selector dropdown at the top. The existing Quotes.jsx is a standalone tool — it needs a thin integration layer:
1. Pass customer list as a prop or use the existing `useCustomers` hook
2. Add "Select Existing Customer" dropdown above the form fields
3. On select, pre-fill name/address/phone/email

---

## Files to Create/Modify

1. `src/pages/JobForm.tsx` — add job_type toggle (service vs quote_visit), relax required fields for quote visits
2. `src/pages/MyDay.tsx` — different completion flow for quote_visit jobs
3. `src/pages/Quotes.jsx` — add customer selector dropdown, auto-fill integration
4. `src/hooks/useJobs.ts` — handle job_type in queries, add prospect→customer conversion hook

---

## Acceptance Criteria
- [ ] Can schedule a quote visit with minimal info (name, phone, address)
- [ ] Quote visits appear on My Day with distinct "Quote" badge
- [ ] "Finish Quote & Add to Schedule" converts prospect to customer + creates job
- [ ] "Finish Quote" completes without creating customer
- [ ] No photo/invoice prompt for quote visits
- [ ] Quote Generator can select existing customer and auto-fill
- [ ] Saved quotes for existing customers appear in their Docs tab
