# Phase 8: Contracts Generator

**Status: BLOCKED — waiting for Stacey to provide the contract template via Claude Desktop**

**Goal:** Let Aaron generate service contracts he can fill in, preview, and print/save as PDF — similar to the Quote Generator workflow.

---

## How It Will Work (once template is provided)

### Entry Point
- Documents Hub → Contracts card
- Customer Detail → Docs tab → "New Contract" button

### Contract Form
1. **Customer selector** — existing customer dropdown OR new contact fields
   - If existing customer: auto-fill name, address, phone
2. **Contract details:**
   - Services to be performed (multi-select or free text)
   - Total price
   - Special terms/notes
3. **Preview** — shows the filled-in contract template
4. **Actions:**
   - Save as PDF / Print
   - If linked to existing customer, auto-logs to their Docs tab

### Contract Storage
- Generated PDF stored in Supabase Storage `contracts/` bucket
- Record in `contracts` table with customer_id, contract_number, date, total, storage_path

### Contract Number Format
`CON-YYYYMMDD-NNN` (same pattern as invoices)

---

## What Stacey Needs to Provide
- The contract template text/layout from Claude Desktop
- Which fields are variable (customer name, address, services, price, dates, terms)
- Any legal language or specific clauses

---

## Files to Create (when unblocked)

1. `src/pages/Contracts.tsx` — list page
2. `src/pages/ContractForm.tsx` — create/fill contract
3. `src/hooks/useContracts.ts` — CRUD
4. `src/lib/generateContractPdf.ts` — PDF generation (similar to generateInvoicePdf.ts)

---

## Acceptance Criteria
- [ ] Can create contract selecting existing or new customer
- [ ] Auto-fills customer info for existing customers
- [ ] Preview shows complete contract
- [ ] Can save as PDF and print
- [ ] Contract logged to customer's Docs tab
- [ ] Contract number auto-generated
