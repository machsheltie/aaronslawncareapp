# Phase 5: Follow-Up Reminders

**Goal:** Let Aaron schedule follow-up reminders that pin to the top of My Day until he marks them done.

---

## Creating a Follow-Up

### Where to trigger
- Dashboard — "Schedule Follow-Up" button (new section)
- Customer Detail — button on Comms tab
- My Day — floating action or menu option

### Creation Form (modal or inline)
1. **Customer** — searchable dropdown of existing customers OR "New contact" toggle
   - If new contact: First Name + Phone fields
2. **Follow-up date** — date picker (required)
3. **Note** — what the follow-up is about (required)
   - e.g. "Call back about landscaping quote — $1,200"

### Data
- Table: `follow_up_reminders`
- `customer_id` set when selecting existing customer
- `prospect_name` + `prospect_phone` set when entering new contact

---

## Showing on My Day

### Position: TOP of the page, above job cards

### Display
```
┌─────────────────────────────────────────────┐
│ ☐  Follow up: Ms. Barnes                   │
│    Call back about landscaping quote — $1,200│
│    Scheduled for today                       │
└─────────────────────────────────────────────┘
```

- Unchecked reminders for today appear at the **top** in a distinct section
- Styled differently from job cards (e.g. left border accent, or different background)
- Checkbox to mark as completed
- Once checked:
  - `is_completed = true`, `completed_at = now()`
  - Moves to **bottom** of page, faded out (opacity-50), same as completed jobs
  - Stays visible for the rest of the day so he can see what he's done

### Overdue Reminders
- If a reminder's date is in the past and `is_completed = false`, it also shows at the top of today's My Day
- Marked with a red "Overdue" badge

---

## Hooks

```ts
useTodayReminders()      // reminders where reminder_date <= today AND is_completed = false
                         // PLUS reminders completed today
useCreateReminder()      // insert new reminder
useCompleteReminder()    // mark as completed
```

---

## ADHD Design Considerations

These are critical for Aaron's workflow:
- Reminders are **persistent** — they don't disappear until checked off
- They're at the **top** of the screen — can't be scrolled past or ignored
- Overdue reminders carry forward automatically — no "oops I forgot to check yesterday"
- Completing is a single tap (checkbox), not a multi-step flow

---

## Files to Create/Modify

1. `src/hooks/useReminders.ts` — NEW — CRUD + today query
2. `src/pages/MyDay.tsx` — add reminders section at top
3. `src/pages/Dashboard.tsx` — add "Schedule Follow-Up" section
4. `src/components/FollowUpForm.tsx` — NEW — reusable creation form (modal)

---

## Acceptance Criteria
- [ ] Can create follow-up with existing customer or new contact
- [ ] Follow-ups appear at top of My Day on their scheduled date
- [ ] Overdue follow-ups carry forward to today
- [ ] Single-tap checkbox to complete
- [ ] Completed reminders move to bottom, faded
- [ ] Follow-up form accessible from Dashboard and Customer Detail
