# 12-Week Implementation Checklist
## Aaron's Lawn Care Business Management PWA

**Timeline:** February 10 - May 5, 2026
**Method:** BMad Method with 2-week sprints
**Target:** Production-ready MVP for Aaron + Heirr (2 business users) + customer portal

---

## ✅ WEEKS 1-2: FOUNDATION (COMPLETE!)

**Status:** ✅ **COMPLETE** (February 10, 2026)

### Completed:
- [x] Initialize React 18.3 + Vite 5.1 + TypeScript 5.3
- [x] Configure strict TypeScript mode
- [x] Set up path aliases (@/, @/components, etc.)
- [x] Install all core dependencies (React Query, Zustand, Zod, React Hook Form)
- [x] Configure PWA with vite-plugin-pwa
- [x] Set up Workbox service worker
- [x] Create project structure (components/, pages/, hooks/, lib/, utils/, types/)
- [x] Initialize Supabase client
- [x] Create useOnlineStatus hook
- [x] Generate comprehensive project-context.md (800+ lines)
- [x] Complete technical research document
- [x] Set up dev server (http://localhost:5173)

### Deliverables:
- ✅ Running dev server
- ✅ Project-context.md with all implementation rules
- ✅ SUPABASE_SETUP_GUIDE.md
- ✅ TypeScript compiling with no errors

---

## 🚧 WEEKS 3-4: DATABASE & AUTHENTICATION (SPRINT 1-2)

**Dates:** February 10-24, 2026
**Focus:** Supabase setup, authentication, foundational features

### Sprint 1 (Week 3): Supabase & Database
- [ ] Create Supabase project
- [ ] Enable PostGIS extension
- [ ] Run database schema SQL (customers, jobs, invoices, photos, offline_queue)
- [ ] Configure RLS policies
- [ ] Set up Storage bucket for photos
- [ ] Generate TypeScript types from schema
- [ ] Add Supabase credentials to .env
- [ ] Test database connection
- [ ] Create seed data (2-3 test customers, 5 test jobs)

### Sprint 2 (Week 4): Authentication
- [ ] Create AuthProvider context
- [ ] Implement Supabase Auth hooks (useAuth, useSession)
- [ ] Build login page (email + password)
- [ ] Build logout functionality
- [ ] Create protected route wrapper
- [ ] Add Aaron and Heirr as users in Supabase
- [ ] Test authentication flow
- [ ] Add "remember me" functionality
- [ ] Handle auth errors gracefully

### Deliverables:
- [ ] Database schema deployed
- [ ] Authentication working for 2 business users
- [ ] Types generated and imported

---

## 🚧 WEEKS 5-6: CUSTOMER MANAGEMENT (SPRINT 3-4)

**Dates:** February 24 - March 10, 2026
**Focus:** CRUD operations for customers with offline support

### Sprint 3 (Week 5): Customer List & View
- [ ] Create customers table UI (CustomerList.tsx)
- [ ] Implement React Query for customer fetching
- [ ] Add search functionality (by name, phone, address)
- [ ] Add filter by property size
- [ ] Create CustomerCard component
- [ ] Add pagination (20 customers per page)
- [ ] Create customer detail view
- [ ] Test with 100 customer records

### Sprint 4 (Week 6): Customer Create & Edit
- [ ] Create CustomerForm component
- [ ] Integrate React Hook Form + Zod validation
- [ ] Implement customer creation (INSERT)
- [ ] Implement customer editing (UPDATE)
- [ ] Add GPS location input (Google Maps Autocomplete)
- [ ] Implement optimistic updates
- [ ] Add offline queue for customer operations
- [ ] Test offline customer creation
- [ ] Add customer deletion (soft delete)

### Deliverables:
- [ ] Full customer CRUD working
- [ ] Search and filtering functional
- [ ] Offline support for customer operations
- [ ] GPS coordinates captured for routing

---

## 🚧 WEEKS 7-8: JOB SCHEDULING (SPRINT 5-6)

**Dates:** March 10-24, 2026
**Focus:** Job creation, scheduling, and status management

### Sprint 5 (Week 7): Job Creation & List
- [ ] Create JobForm component
- [ ] Implement service type selection (10 services)
- [ ] Add date picker for scheduled_date
- [ ] Link jobs to customers (dropdown/search)
- [ ] Create JobList component
- [ ] Add status filtering (scheduled, in_progress, completed)
- [ ] Implement React Query for job fetching
- [ ] Add job detail view
- [ ] Test job creation flow

### Sprint 6 (Week 8): Job Status Workflow
- [ ] Implement status transitions (scheduled → in_progress → completed)
- [ ] Add "Start Job" button (updates status + actual_start_time)
- [ ] Add "Complete Job" button (updates status + actual_end_time)
- [ ] Add completion notes field
- [ ] Implement offline queue for job operations
- [ ] Test offline job creation and status updates
- [ ] Add job cancellation
- [ ] Calendar view (optional enhancement)

### Deliverables:
- [ ] Job CRUD operations working
- [ ] Status workflow functional
- [ ] Offline support for jobs
- [ ] Jobs linked to customers correctly

---

## 🚧 WEEKS 9-10: PAYMENTS & INVOICING (SPRINT 7-8)

**Dates:** March 24 - April 7, 2026
**Focus:** Stripe ACH integration, invoice generation, payment processing

### Sprint 7 (Week 9): Invoice Generation
- [ ] Create InvoiceForm component
- [ ] Auto-generate invoice numbers (INV-2026-001)
- [ ] Link invoices to jobs
- [ ] Calculate subtotal, tax, total
- [ ] Create Invoice detail view
- [ ] Add invoice PDF generation (optional - or use Stripe)
- [ ] List invoices (filter by unpaid/paid)
- [ ] Test invoice creation

### Sprint 8 (Week 10): Stripe ACH Integration
- [ ] Set up Stripe account
- [ ] Create Supabase Edge Function for Stripe webhooks
- [ ] Implement Stripe Payment Element (ACH + Card)
- [ ] Add "Pay Invoice" flow
- [ ] Handle payment_intent.processing event
- [ ] Handle payment_intent.succeeded event
- [ ] Handle payment_intent.payment_failed event
- [ ] Update invoice payment_status based on webhooks
- [ ] Test ACH payment flow (use Stripe test mode)
- [ ] Add payment receipt email (SendGrid)

### Deliverables:
- [ ] Invoice generation working
- [ ] Stripe ACH payments functional
- [ ] Webhook handlers processing events correctly
- [ ] Payment status updates in real-time

---

## 🚧 WEEKS 11-12: NOTIFICATIONS & CUSTOMER PORTAL (SPRINT 9-10)

**Dates:** April 7-21, 2026
**Focus:** SMS/email notifications, customer portal with read-only access

### Sprint 9 (Week 11): Notifications
- [ ] Set up Twilio account
- [ ] Set up SendGrid account
- [ ] Create notification utility functions
- [ ] Implement SMS notification for:
  - [ ] Job scheduled (day before)
  - [ ] Job started
  - [ ] Job completed
- [ ] Implement email notification for:
  - [ ] Invoice created
  - [ ] Payment received
  - [ ] Photos uploaded
- [ ] Add customer notification preferences
- [ ] Test SMS and email delivery
- [ ] Add rate limiting for notifications

### Sprint 10 (Week 12): Customer Portal
- [ ] Create customer portal subdomain/route (/portal)
- [ ] Implement customer authentication (magic link)
- [ ] Create customer dashboard (view jobs, invoices, photos)
- [ ] Add job history view (read-only)
- [ ] Add invoice list with payment links
- [ ] Add before/after photo gallery
- [ ] Implement Supabase Realtime for live updates
- [ ] Test customer portal authentication
- [ ] Test RLS policies (customers see only their data)
- [ ] Add "Pay Invoice" button linking to Stripe

### Deliverables:
- [ ] SMS and email notifications working
- [ ] Customer portal fully functional
- [ ] Customers can view jobs, invoices, and photos
- [ ] Real-time updates working

---

## 🚀 WEEK 13: TESTING & DEPLOYMENT (FINAL SPRINT)

**Dates:** April 21-28, 2026
**Focus:** E2E testing, bug fixes, production deployment

### Testing
- [ ] Write Playwright E2E tests:
  - [ ] Customer CRUD flow
  - [ ] Job creation and status workflow
  - [ ] Invoice generation and payment
  - [ ] Offline queue sync
- [ ] Test offline functionality in field (Aaron's phone)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile responsiveness testing
- [ ] Lighthouse audit (target: 90+ PWA score)
- [ ] Load testing with 100 customers + 500 jobs
- [ ] Test all notification types
- [ ] Security audit (input validation, XSS, SQL injection)

### Bug Fixes & Polish
- [ ] Fix all critical bugs
- [ ] Improve loading states
- [ ] Add error boundaries
- [ ] Optimize images
- [ ] Add skeleton loaders
- [ ] Improve form validation messages
- [ ] Add confirmation dialogs for destructive actions

### Deployment
- [ ] Connect GitHub repo to Netlify
- [ ] Configure Netlify build settings
- [ ] Set environment variables in Netlify
- [ ] Deploy to production
- [ ] Test production deployment
- [ ] Set up custom domain (if ready)
- [ ] Configure SSL (automatic with Netlify)
- [ ] Set up error tracking (Sentry - optional)
- [ ] Create backup of Supabase database

### Deliverables:
- [ ] All E2E tests passing
- [ ] Production deployment live
- [ ] Lighthouse score 90+
- [ ] Aaron and Heirr trained on the app

---

## POST-LAUNCH (WEEK 14+)

### Immediate Post-Launch (Week 14)
- [ ] Monitor for bugs and errors
- [ ] Collect feedback from Aaron
- [ ] Fix any critical issues
- [ ] Optimize performance based on usage
- [ ] Monitor IndexedDB storage usage
- [ ] Check offline queue sync success rate

### Future Enhancements (Phase 2 - Optional)
- [ ] Route optimization with Google Maps API (25 waypoints)
- [ ] Recurring service scheduling
- [ ] Batch invoicing
- [ ] Customer review/rating system
- [ ] Analytics dashboard (revenue, jobs completed, customer growth)
- [ ] Equipment tracking
- [ ] Crew management (if Aaron hires more people)
- [ ] Expense tracking
- [ ] Profit/loss reporting

---

## KEY MILESTONES

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| **Foundation Complete** | Feb 10, 2026 | ✅ DONE |
| **Database & Auth Ready** | Feb 24, 2026 | 🚧 In Progress |
| **Customer Management Live** | Mar 10, 2026 | ⏳ Pending |
| **Job Scheduling Working** | Mar 24, 2026 | ⏳ Pending |
| **Payments Functional** | Apr 7, 2026 | ⏳ Pending |
| **Customer Portal Live** | Apr 21, 2026 | ⏳ Pending |
| **Production Deployment** | Apr 28, 2026 | ⏳ Pending |
| **Go-Live with Aaron** | May 1, 2026 | ⏳ Pending |

---

## DAILY WORKFLOW

### During Each Sprint:
1. **Morning**: Review yesterday's progress, plan today's tasks
2. **Development**: Code 4-6 hours (use project-context.md rules!)
3. **Testing**: Test new features, fix bugs
4. **Commit**: Commit with clear messages (`feat(customers): add search`)
5. **Evening**: Update checklist, plan tomorrow

### Every 2 Weeks (Sprint Review):
- Review completed tasks
- Demo working features
- Identify blockers
- Plan next sprint
- Update this checklist

---

## CRITICAL REMINDERS

### 🚨 NEVER FORGET:
- [ ] Run `npx supabase gen types typescript` after EVERY schema change
- [ ] Validate ALL user input with Zod before database operations
- [ ] Test offline functionality for every data-modifying operation
- [ ] Check IndexedDB quota on iOS Safari (50MB limit)
- [ ] Verify Stripe webhook signatures (security!)
- [ ] Use optimistic updates for better offline UX
- [ ] Update RLS policies when adding new tables
- [ ] Fix TypeScript errors before committing (no `any`!)
- [ ] Test on Aaron's actual phone in the field
- [ ] Keep PRD and Technical Spec updated if requirements change

### 💰 Monthly Cost Check:
- **Target**: $5-10/month
- **Monitor**: Supabase usage, Twilio SMS count, SendGrid emails
- **Alert**: Set billing alerts in each service

### 📚 Resources:
- Project Context: `_bmad-output/project-context.md`
- Supabase Setup: `SUPABASE_SETUP_GUIDE.md`
- Technical Research: `_bmad-output/planning-artifacts/research/technical-business-mgmt-pwa-research-2026-02-09.md`
- PRD: `PRD.md`
- Technical Spec: `Technical_Spec.md`

---

## SUCCESS METRICS

By May 1, 2026, the app should:
- ✅ Handle 100 customers
- ✅ Manage 500+ jobs
- ✅ Process payments via Stripe ACH
- ✅ Work offline with reliable sync
- ✅ Customer portal accessible to all customers
- ✅ SMS/email notifications automated
- ✅ Lighthouse PWA score 90+
- ✅ Aaron and Heirr using it daily

**You've got this! 🚀**
