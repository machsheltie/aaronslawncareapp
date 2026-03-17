# Phase 2: Documents Hub

**Goal:** Consolidate Quotes, Invoices, and Contracts into a single "Documents" nav item to reduce nav clutter on mobile.

---

## Nav Change

### Before (6 items — too crowded on iPhone 12)
My Day | Jobs | Customers | Invoices | Quotes | Dashboard

### After (5 items)
My Day | Jobs | Customers | Documents | Dashboard

- Use the existing **invoices icon** for "Documents"
- Remove separate Quotes and Invoices nav items

---

## Documents Landing Page (`/documents`)

A simple card-based hub with three cards:

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   📄 Quotes      │  │   💰 Invoices    │  │   📋 Contracts   │
│                  │  │                  │  │                  │
│  Create and      │  │  Billing and     │  │  Service         │
│  manage quotes   │  │  payment         │  │  agreements      │
│                  │  │  tracking        │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

Each card links to:
- `/documents/quotes` → existing Quotes page
- `/documents/invoices` → existing Invoices page
- `/documents/contracts` → Contracts page (Phase 8, show "Coming Soon" until then)

Style: Same #c0efbf card background with green-200 border.

---

## Route Changes in App.tsx

```
/documents           → Documents hub (new)
/documents/quotes    → Quotes (move from /quotes)
/documents/invoices  → Invoices (move from /invoices)
/documents/invoices/new → InvoiceForm
/documents/invoices/:id → InvoiceDetail
/documents/contracts → Contracts (Phase 8)
```

Keep old routes as redirects briefly, or just update all `<Link>` references.

---

## Files to Modify

1. `src/pages/Documents.tsx` — NEW — the hub page with 3 cards
2. `src/components/layout/AppLayout.tsx` — replace Invoices + Quotes nav items with Documents
3. `src/App.tsx` — update routes
4. Any `<Link to="/invoices">` or `<Link to="/quotes">` references across the app (Dashboard, MyDay, JobDetail, etc.)

---

## Acceptance Criteria
- [ ] Nav shows 5 items: My Day, Jobs, Customers, Documents, Dashboard
- [ ] Documents page shows 3 cards (Quotes, Invoices, Contracts)
- [ ] Quotes and Invoices pages work at their new URLs
- [ ] All internal links updated (no dead links)
- [ ] Contracts card shows "Coming Soon" placeholder
- [ ] Mobile nav is not crowded on iPhone 12
