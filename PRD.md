# Aaron's Lawn Care Service
## Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** October 16, 2025  
**Status:** Draft for Development  
**Product Owner:** Aaron  
**Document Type:** Product Requirements

---

## 1. EXECUTIVE SUMMARY

### 1.1 Product Vision
Aaron's Lawn Care Service application is a comprehensive business management platform designed specifically for small to medium-sized lawn care and tree removal operations. The platform addresses the critical operational challenges faced by field service businesses: inefficient scheduling, manual invoicing, poor route planning, lack of real-time communication, and disconnected business systems.

### 1.2 Business Objectives
- **Primary Goal:** Increase operational efficiency by 30% through automated scheduling and route optimization
- **Revenue Goal:** Reduce invoice payment time from 30+ days to under 7 days through automated billing
- **Customer Satisfaction:** Improve customer communication with automated notifications, reducing no-show rates by 40%
- **Growth Enabler:** Support business scaling from solo operation to 5+ crew teams without administrative overhead increase

### 1.3 Success Metrics
- **Adoption:** 90%+ daily active usage by field crews within 2 weeks of launch
- **Efficiency:** Average 1.5 additional jobs per crew per day through route optimization
- **Financial:** 50% reduction in invoicing time, 25% improvement in cash flow timing
- **Satisfaction:** Net Promoter Score (NPS) of 50+ from customers, 8+ employee satisfaction rating

### 1.4 Target Users
- **Primary:** Aaron (business owner/operator) managing 2-3 crew teams
- **Secondary:** Field crew members (lawn care technicians and tree removal specialists)
- **Tertiary:** Office staff (scheduling, customer service) as business grows
- **End Users:** Residential and commercial customers receiving services

### 1.5 Product Strategy
- **Phase 1 (MVP):** 12 weeks - Core scheduling, invoicing, and mobile experience
- **Phase 2 (Enhanced):** 8 weeks - Route optimization, advanced tree service features
- **Phase 3 (Advanced):** 12 weeks - Automation, analytics, integrations
- **Ongoing:** Continuous improvement based on user feedback

### 1.6 Platform & Distribution
- **Tenancy:** Single-tenant application for Aaron's Lawn Care only (not a multi-business SaaS)
- **Distribution:** Private installable PWA accessed via browser; no App Store/Play Store release
- **Devices:** Android phone for crews is primary; iPhone and laptop/tablet supported for admin/scheduling
- **Connectivity:** Optimized for intermittent/spotty signal with queued sync on reconnect

---

## 2. USER PERSONAS

### Persona 1: Aaron - The Business Owner/Operator

**Demographics:**
- Age: 30-40
- Role: Owner, Lead Technician
- Experience: 8+ years in lawn care and tree removal
- Tech Comfort: Moderate (uses phone daily, not a power user)
- Work Environment: Split between field work and office/truck-based administration

**Goals:**
- Grow business from $200K to $500K annual revenue
- Manage 2-3 crews efficiently without being overwhelmed
- Get paid faster and reduce accounting headaches
- Spend more time on valuable work, less on paperwork
- Maintain high customer satisfaction and reputation
- Scale operations without sacrificing quality

**Pain Points:**
- Spending 10+ hours weekly on invoicing and scheduling
- Forgetting which customers need service when
- Difficulty tracking which jobs are profitable vs. money-losers
- Customers calling asking "when are you coming?" constantly
- Missing revenue from forgotten follow-ups
- Paper-based quotes getting lost or damaged in truck
- No visibility into crew location or job progress during the day
- QuickBooks data entry taking hours each week

**Behaviors:**
- Checks phone between jobs (10-20 times daily)
- Prefers voice/text communication over email
- Works 6 AM - 7 PM during peak season
- Does admin work in truck, evenings, or early morning
- Values tools that "just work" without configuration
- Will abandon software that's buggy or slow

**Success Criteria:**
- Can schedule an entire week in under 30 minutes
- Creates professional invoices on-site in under 2 minutes
- Gets paid within 5-7 days instead of 30+
- Knows exactly where each crew is at any moment
- Reduces administrative time by 50%

---

### Persona 2: Mike - The Field Crew Lead

**Demographics:**
- Age: 25-35
- Role: Crew Lead/Senior Technician
- Experience: 5 years in lawn care, basic tree work
- Tech Comfort: High (millennial/Gen Z, smartphone native)
- Work Environment: Constantly moving between job sites, outdoors in all conditions

**Goals:**
- Complete assigned jobs efficiently and correctly
- Get home by 5 PM instead of working till dark
- Maximize daily earnings (paid partially on completed jobs)
- Avoid customer complaints and rework
- Know exactly where to go and what to do without constant phone calls
- Document work quality to protect against customer disputes

**Pain Points:**
- Unclear job instructions leading to mistakes
- Getting lost or stuck in traffic wasting time between jobs
- Customers not home when arrived (no notification sent)
- Boss calling constantly asking "where are you?"
- Forgetting to document completed work with photos
- Not knowing if customer paid (affects collection of payment on-site)
- Having to return to previous jobs for missed work
- Paper work orders getting wet, dirty, or lost

**Behaviors:**
- Checks schedule first thing in morning
- Uses GPS constantly for navigation
- Takes 10-20 photos daily of work
- Texts with boss throughout day
- Charges phone in truck between jobs
- Works outdoors in direct sunlight, often wearing gloves
- Needs one-handed operation while carrying equipment

**Success Criteria:**
- Knows exactly where to go and what to do without confusion
- Completes 6-8 jobs per day (up from 4-5 without app)
- Finishes work by 5 PM consistently
- Zero customer complaints about missed work
- No time wasted looking for addresses or calling boss

---

### Persona 3: Jennifer - The Residential Customer

**Demographics:**
- Age: 35-55
- Role: Homeowner
- Property: 0.5 acre suburban home
- Tech Comfort: Moderate to High (uses apps for banking, shopping)
- Services Needed: Weekly lawn mowing, seasonal tree trimming, occasional tree removal

**Goals:**
- Maintain attractive, healthy lawn and trees without personal effort
- Know when service will happen (especially before hosting guests)
- Quick communication when changes needed
- Transparent pricing with no surprise charges
- Easy payment without writing checks or remembering to pay
- Track service history for warranty/records

**Pain Points:**
- Not knowing which day Aaron will show up
- Home when not needed, away when payment required
- Forgetting to pay invoices leading to awkward conversations
- Unclear what was done during last visit
- Difficulty reaching Aaron by phone during work hours
- Paper invoices getting lost or forgotten
- No record of tree work performed for property value/insurance

**Behaviors:**
- Checks phone throughout day for notifications
- Prefers text/app notifications over phone calls
- Pays bills online exclusively
- Values businesses that "remember" preferences
- Shares positive experiences on social media/reviews
- Expects service provider responsiveness within a few hours

**Success Criteria:**
- Always knows when Aaron is coming (day/time window)
- Pays invoices instantly without manual effort
- Can see photo proof of completed work
- Gets responses to requests within same day
- Never experiences billing surprises or confusion
- Feels like a valued, remembered customer

---

## 3. FEATURE SPECIFICATIONS

### 3.1 MVP Features (Phase 1 - 12 Weeks)

#### F1: Customer Management
**Priority:** P0 (Critical)  
**Effort:** 2 weeks

**Description:**  
Comprehensive customer database with property information, service history, and communication tracking.

**Requirements:**
- Create, read, update, delete customer records
- Store contact information (name, phone, email, billing address)
- Multiple service addresses per customer (residential + rental properties)
- Property details: lot size, gate codes, access notes, pet warnings
- Custom tags/categories (residential, commercial, HOA, premium)
- Upload and store property photos
- View complete service history timeline
- Notes section for preferences and special instructions
- Search customers by name, phone, address, or tags
- Customer status (active, inactive, archived)

**Acceptance Criteria:**
- Can create new customer in under 60 seconds on mobile
- Search returns results in under 500ms
- Customer detail view loads complete history in under 2 seconds
- Property photos display in responsive grid
- All fields validate appropriately (phone format, email format)

---

#### F2: Job Scheduling & Calendar
**Priority:** P0 (Critical)  
**Effort:** 3 weeks

**Description:**  
Visual calendar system for scheduling one-time and recurring jobs with drag-and-drop crew assignment.

**Requirements:**
- Week and day calendar views optimized for mobile
- Create one-time jobs with date, time window, crew assignment
- Recurring job templates (weekly, bi-weekly, monthly, custom)
- Drag-and-drop to reschedule jobs
- Color-coding by job type (mowing, trimming, tree removal, etc.)
- Job status workflow (scheduled → en route → in progress → completed)
- Assign jobs to specific crew members
- Set estimated duration for each job
- View crew capacity and conflicts
- Mark jobs as "weather dependent" with reschedule rules
- Filter calendar by crew, customer, job type, status
- Bulk actions (reschedule multiple jobs, cancel series)

**Recurring Service Rules:**
- Generate jobs 2 weeks in advance automatically
- Skip weeks based on weather or customer request (pause service)
- Automatically adjust schedule when holiday falls on service day
- End recurring services after specific date or job count

**Acceptance Criteria:**
- Schedule new job in under 2 minutes on mobile
- Calendar loads week view in under 1.5 seconds
- Drag-and-drop reschedule updates database and notifies crew in under 3 seconds
- Recurring jobs generate correctly 100% of time
- Can view and edit 200+ scheduled jobs without performance degradation

---

#### F3: Mobile Work Orders (Field App)
**Priority:** P0 (Critical)  
**Effort:** 3 weeks

**Description:**  
Mobile-optimized interface for crew members to view daily schedule, navigate between jobs, and update job status with intermittent connectivity support.

**Requirements:**
- Today's schedule view with jobs in order
- Large, thumb-friendly buttons for primary actions
- Job detail card showing:
  - Customer name and address
  - Property notes (gate codes, pets, preferences)
  - Service type and description
  - Estimated duration
  - Any special instructions
  - Previous visit photos
- One-tap navigation to job (launches Google Maps)
- Status updates (Start Job, Finish Job) with GPS verification
- Required actions checklist (varies by job type)
- Timer tracking actual time on job
- Work offline with automatic sync when reconnected

**Offline Capabilities:**
- Cache today's + tomorrow's schedule when online
- All job data accessible with spotty signal
- Status updates queue and sync when online
- Photos store locally until uploaded

**GPS Features:**
- Geofence verification (crew within 100m of property)
- Auto-suggest "Start Job" when crew arrives
- GPS-stamped timestamps for accountability

**Acceptance Criteria:**
- Schedule loads in under 2 seconds on 3G connection
- Queued offline actions sync within 5 minutes of reconnection
- GPS location accuracy within 30 meters
- Battery impact monitored; target <20% drain over 8-hour workday on a reference Android device
- One-handed operation for all critical functions
- Readable in direct sunlight (high contrast design)

---

#### F4: Photo Documentation
**Priority:** P0 (Critical)  
**Effort:** 1 week

**Description:**  
Simple before/after photo capture system for documenting completed work and preventing disputes.

**Requirements:**
- Camera access from job detail screen
- Capture multiple photos per job
- Automatic categorization (before, during, after)
- Timestamp and GPS coordinates embedded in metadata
- Automatic compression to 500KB per photo
- Preview before saving
- Delete photos before submitting
- Upload photos automatically when online
- Queue photos for upload when offline
- View all photos from previous visits in customer history

**Acceptance Criteria:**
- Photo capture works in native camera app
- Photos upload successfully 99.9% of time
- Compressed photos maintain professional quality
- Can capture and save photo in under 10 seconds
- Photo gallery loads thumbnails in under 2 seconds

---

#### F5: Invoicing & Payments
**Priority:** P0 (Critical)  
**Effort:** 2 weeks

**Description:**  
Professional invoice generation from completed jobs with integrated Stripe payment processing.

**Requirements:**
- Auto-generate invoice from completed job
- Customizable invoice template with logo
- Line item breakdown (service description, quantity, price)
- Add additional charges or discounts
- Tax calculation (configurable tax rate)
- Professional PDF generation
- Email invoice to customer automatically
- SMS invoice link as alternative
- Customer views invoice on branded payment page
- Accept credit/debit cards via Stripe
- Accept ACH (US bank account) via Stripe; customers can add bank accounts in checkout
- Store payment methods for future charges
- Mark invoice as paid/processing/unpaid/overdue
- Partial payment support
- Invoice history and search

**Payment Page Features:**
- Mobile-optimized checkout
- Save payment method checkbox
- Bank account option via Stripe Financial Connections
- Instant confirmation for cards; ACH shows "processing" until settled
- Receipt via email automatically
- Works without customer login

**Acceptance Criteria:**
- Generate invoice from job in under 60 seconds
- Invoice PDF is professional quality and prints correctly
- Card payments complete in under 10 seconds
- ACH payments enter "processing" state within 10 seconds and auto-complete on settlement (1-5 business days)
- 99.9% card payment success rate (when card valid)
- Email delivery within 2 minutes
- Customer can pay on any device without issues

---

#### F6: Basic Reporting
**Priority:** P1 (High)  
**Effort:** 1 week

**Description:**  
Essential business reports for revenue tracking and operational visibility.

**Reports Required:**
1. **Revenue Report**
   - Daily, weekly, monthly, yearly views
   - Paid vs. unpaid invoices
   - Revenue by service type
   - Revenue by customer

2. **Job Completion Report**
   - Jobs completed per day/week/month
   - Jobs completed per crew member
   - Average time per job type
   - Job completion rate (% of scheduled jobs completed)

3. **Customer Report**
   - Total customers (active/inactive)
   - Customer lifetime value (total revenue per customer)
   - Customers needing next service (based on recurring schedule)
   - Customers with overdue invoices

4. **Crew Performance**
   - Jobs completed per crew member
   - Average time per job
   - Revenue generated per crew member

**Acceptance Criteria:**
- Reports generate in under 3 seconds
- Data accuracy 100% (matches database)
- Export CSV downloads successfully
- Visualizations render correctly on mobile
- Can filter by date range up to 1 year

---

### 3.2 V2 Features (Phase 2 - 8 Weeks)

#### F7: Route Optimization
**Priority:** P1 (High)  
**Effort:** 2 weeks

**Description:**  
Intelligent route planning to minimize drive time and maximize jobs completed per day.

**Requirements:**
- Automatic route optimization for daily schedule
- Consider job priority, time windows, and estimated duration
- Traffic-aware routing using Google Maps API
- Manual override and drag-to-reorder
- Multi-crew route optimization
- Visual map view of optimized route
- Estimated drive time between jobs
- Total daily mileage calculation
- "Start Navigation" launches Google Maps with full route
- Recalculate route when jobs added/removed during day

**Acceptance Criteria:**
- Optimize route of 10 jobs in under 5 seconds
- Route reduces drive time by 20%+ vs. manual
- Handles changes mid-day gracefully
- Respects all customer time window constraints
- Clear visualization on mobile

---

#### F8: Automated Customer Communications
**Priority:** P1 (High)  
**Effort:** 2 weeks

**Description:**  
Automated SMS and email notifications to reduce no-shows and improve customer satisfaction.

**Notification Types:**
1. **Appointment Reminder** (Day before at 5 PM)
2. **On the Way** (30 min before arrival)
3. **Service Completed** (Immediately after)
4. **Payment Reminder** (3 days after invoice if unpaid)
5. **Payment Confirmation** (Immediately after payment)

**Requirements:**
- Twilio integration for SMS
- SendGrid integration for email
- Template customization with variable replacement
- Customer preferences (SMS, email, both, none)
- Delivery status tracking
- Two-way SMS (customer can reply CONFIRM/RESCHEDULE)
- Automatic retry for failed deliveries
- Opt-out support

**Acceptance Criteria:**
- 98%+ message delivery rate
- Messages send within 2 minutes of trigger
- Two-way SMS processes replies in under 30 seconds
- Cost per message under $0.01
- Customers can opt-out successfully

---

#### F9: Tree Service Enhancements
**Priority:** P1 (High)  
**Effort:** 2 weeks

**Description:**  
Specialized features for tree removal and arborist work including inventory, complex pricing, and safety tracking.

**Requirements:**

**Tree Inventory:**
- Database of trees on customer properties
- Tree species (common and scientific name)
- GPS coordinates on property
- Measurements (DBH, height, canopy spread)
- Health status (healthy, declining, diseased, hazardous)
- Photos linked to specific trees
- Service history per tree
- Risk assessment rating (low/medium/high)

**Complex Pricing Calculator:**
- Base price by tree size tiers
- Complexity multipliers (accessibility, power lines, condition, proximity)
- Stump removal add-on
- Crew size calculator
- Equipment requirements selection

**Safety Checklists:**
- Pre-job safety inspection form
- Equipment check
- Site hazard identification
- Emergency contact verification
- Photo documentation of site conditions
- Required signatures from crew lead

**Equipment Tracking:**
- Equipment list with maintenance schedules
- Inspection dates and certifications
- Assign equipment to jobs
- Availability calendar
- Rental vs. owned status

**Acceptance Criteria:**
- Tree inventory stores 100+ trees without performance issues
- Pricing calculator produces accurate estimates in under 30 seconds
- Safety checklist prevents job start until complete
- Equipment scheduling prevents double-booking
- All tree service forms work offline

---

#### F10: Customer Portal
**Priority:** P2 (Medium)  
**Effort:** 2 weeks

**Description:**  
Self-service portal where customers view service history, pay invoices, and request additional services.

**Requirements:**
- No-password login via magic link (email)
- Dashboard showing upcoming services
- Complete service history with dates
- View before/after photos from each visit
- View and pay outstanding invoices
- View payment history and receipts
- Request additional services (form submission)
- Update contact information
- Pause/resume recurring services
- Add service addresses
- Saved payment methods management
- Automatic payment enrollment for recurring services

**Acceptance Criteria:**
- Magic link login works 99%+ of time
- Customer cannot access other customer data
- All features work on mobile
- Payment processing same as main invoice payment
- Load time under 2 seconds on 4G

---

### 3.3 Future Roadmap (Phase 3+)

#### F11: QuickBooks Integration (Month 7-8)
- Two-way sync of customers, invoices, and payments
- Chart of accounts mapping
- Daily automatic sync

#### F12: Advanced Analytics Dashboard (Month 9-10)
- Customer profitability analysis
- Service type profitability
- Seasonal trends and forecasting
- Crew efficiency metrics
- Customer retention rates

#### F13: Marketing Automation (Month 11-12)
- Automated review requests after service
- Email campaign builder
- Seasonal service reminders
- Referral program tracking

#### F14: Estimating & Quoting System (Month 13-14)
- Mobile quote creation with templates
- Good/better/best pricing options
- Photo-based property measurements
- Digital signature capture
- Quote follow-up automation

#### F15: Advanced Crew Management (Month 15-16)
- Crew availability calendar
- Skill-based job assignment
- Commission tracking
- Training and certification tracking

#### F16: Weather Integration (Month 17-18)
- 7-day forecast for job locations
- Automatic weather delay notifications
- Smart rescheduling suggestions

---

## 4. USER STORIES

### Epic 1: Customer Management

**US-1.1:** As Aaron, I want to create a new customer record on my phone in under 60 seconds, so that I can capture customer information immediately when I get new business.

**US-1.2:** As Aaron, I want to store gate codes and pet warnings for each property, so that my crew can access properties safely without calling me.

**US-1.3:** As Aaron, I want to see a customer's complete service history, so that I can quickly understand their needs during conversations.

**US-1.4:** As Aaron, I want to upload photos of customer properties, so that I can remember the layout when planning services.

**US-1.5:** As Mike (crew lead), I want to see customer property notes before arriving, so that I know where to find the gate code and if there's a dog to watch for.

---

### Epic 2: Scheduling & Calendar

**US-2.1:** As Aaron, I want to drag-and-drop jobs on a calendar, so that I can quickly reschedule when weather changes plans.

**US-2.2:** As Aaron, I want to set up recurring services (weekly, bi-weekly), so that jobs automatically appear without manual entry.

**US-2.3:** As Aaron, I want to assign jobs to specific crew members, so that the right people with the right skills get the right jobs.

**US-2.4:** As Aaron, I want to see my crew's capacity at a glance, so that I don't overbook anyone.

**US-2.5:** As Mike, I want to see only my assigned jobs for the day, so that I'm not confused about which properties are mine.

---

### Epic 3: Mobile Field Operations

**US-3.1:** As Mike, I want to view my complete daily schedule on my phone in under 2 seconds, so that I can quickly check what's next.

**US-3.2:** As Mike, I want to tap one button to navigate to the next job, so that I don't waste time manually entering addresses.

**US-3.3:** As Mike, I want to mark a job as "started" with one tap, so that Aaron knows I'm on-site without calling.

**US-3.4:** As Mike, I want the app to work when I'm in rural areas with no cell signal, so that I can still access job details.

**US-3.5:** As Aaron, I want to see crew locations on a map in real-time, so that I can tell customers accurately when they call.

---

### Epic 4: Photo Documentation

**US-4.1:** As Mike, I want to quickly capture before/after photos using my phone camera, so that I can document completed work.

**US-4.2:** As Mike, I want photos to automatically upload when I have wifi, so that I don't use all my mobile data.

**US-4.3:** As Aaron, I want to view before/after photos from previous visits, so that I can show customers the work history.

**US-4.4:** As Jennifer (customer), I want to see photos of work completed at my property, so that I know the work was done professionally.

---

### Epic 5: Invoicing & Payments

**US-5.1:** As Aaron, I want to create an invoice from a completed job in under 60 seconds, so that I can bill immediately on-site.

**US-5.2:** As Aaron, I want invoices automatically emailed to customers, so that I don't have to remember to send them.

**US-5.3:** As Aaron, I want customers to be able to pay invoices by credit card online, so that I get paid within days instead of weeks.

**US-5.4:** As Jennifer (customer), I want to receive an invoice immediately after service, so that I can pay it while I'm thinking about it.

**US-5.5:** As Jennifer (customer), I want to pay invoices from my phone in under 30 seconds, so that I don't have to write checks.

**US-5.6:** As Jennifer (customer), I want to save my payment method for future invoices, so that I can enable automatic payments.

---

### Epic 6: Automated Communications

**US-6.1:** As Jennifer (customer), I want to receive a text reminder the day before service, so that I can make sure my gates are unlocked.

**US-6.2:** As Jennifer (customer), I want to receive a notification when the crew is on the way, so that I know approximately when they'll arrive.

**US-6.3:** As Jennifer (customer), I want to receive a notification when service is complete, so that I can see the invoice and photos immediately.

**US-6.4:** As Aaron, I want payment reminders to automatically send to customers with overdue invoices, so that I don't have to awkwardly call.

---

### Epic 7: Tree Service Operations

**US-7.1:** As Aaron, I want to maintain an inventory of trees on customer properties, so that I can track which trees need service.

**US-7.2:** As Aaron, I want to calculate tree removal pricing based on size and complexity factors, so that I can give accurate quotes quickly.

**US-7.3:** As Aaron, I want to complete safety checklists before starting tree work, so that my crew and I stay safe.

**US-7.4:** As Aaron, I want to track which equipment is needed for each tree job, so that I don't arrive on-site unprepared.

---

### Epic 8: Reporting & Analytics

**US-8.1:** As Aaron, I want to see daily/weekly/monthly revenue, so that I know if I'm on track to meet my financial goals.

**US-8.2:** As Aaron, I want to see which service types are most profitable, so that I can focus marketing on high-margin services.

**US-8.3:** As Aaron, I want to see which customers are most valuable, so that I can prioritize their requests.

**US-8.4:** As Aaron, I want to see crew performance metrics, so that I can coach crew members or reward top performers.

---

### Epic 9: Customer Portal

**US-9.1:** As Jennifer (customer), I want to view my upcoming service schedule, so that I can plan around when Aaron's crew will be at my house.

**US-9.2:** As Jennifer (customer), I want to view my complete service history with photos, so that I can see when work was last done.

**US-9.3:** As Jennifer (customer), I want to request additional services through the portal, so that I don't have to call during work hours.

**US-9.4:** As Jennifer (customer), I want to pause my recurring service when I go on vacation, so that Aaron doesn't waste time coming to my house.

---

## 5. SCREEN INVENTORY

### 5.1 Authentication Screens

**SC-01: Login**
- Email input field
- Password input field
- "Log In" button
- "Forgot password?" link
- Error message display area

**SC-02: Forgot Password**
- Email input field
- "Send Reset Link" button
- Back to login link
- Success message display

**SC-03: Reset Password**
- New password input (with strength indicator)
- Confirm password input
- "Reset Password" button
- Password requirements text

---

### 5.2 Dashboard Screens

**SC-04: Dashboard (Owner View)**
- Header with date, weather, user avatar
- Today's Stats Cards:
  - Jobs scheduled today
  - Jobs completed today
  - Revenue today
  - Outstanding invoices
- Quick Actions (Create Job, Create Customer, View Schedule, Create Invoice)
- Today's Schedule Preview (first 5 jobs)
- Recent Activity Feed
- Crew Status indicators

**SC-05: Dashboard (Crew Member View)**
- Header with date, weather
- Today's Jobs List (cards with customer, address, time, status, navigation)
- Daily Stats (jobs completed, hours worked)
- Quick Actions (View Tomorrow's Schedule, Report Issue)

---

### 5.3 Customer Management Screens

**SC-06: Customers List**
- Search bar (name, phone, address)
- Filter dropdown (status, type, tags)
- Sort options
- Customer cards showing name, address, phone, last service, total revenue, status
- "Add Customer" button
- Pagination

**SC-07: Customer Detail**
- Customer Info Section (name, contact, edit button)
- Properties Tab (list with addresses, add button)
- Service History Tab (timeline, filter by property, photos)
- Invoices Tab (list, total revenue, outstanding balance)
- Notes Tab (chronological, add button)
- Actions (Schedule Job, Create Invoice, Send Message, View on Map)

**SC-08: Add/Edit Customer**
- Form sections: Basic Info, Billing Address, Customer Type, Tags, Notes
- "Save" and "Cancel" buttons
- Delete button (edit only)

**SC-09: Add/Edit Property**
- Address autocomplete (Google Places)
- Lot size input
- Access Information (gate code, access notes, pet warnings)
- Mark as primary property toggle
- Map showing property location
- "Save" and "Cancel" buttons

---

### 5.4 Scheduling Screens

**SC-10: Calendar View (Week)**
- Week navigation (prev/next, today)
- Date range display
- Filter by crew member dropdown
- Calendar grid (days as columns, time slots as rows)
- Job cards (customer, address, time, status, color-coded by type)
- Drag-and-drop enabled
- "Add Job" button
- View toggle (Day/Week/Month)

**SC-11: Calendar View (Day)**
- Single day view
- Crew member tabs
- Chronological job list (time, customer, address, job type, status, navigate button)
- Total jobs count and estimated time
- "Add Job" button

**SC-12: Add/Edit Job**
- Customer select (searchable dropdown)
- Property select (based on customer)
- Job type select
- Title and description
- Scheduled date and time picker
- Estimated duration
- Assigned to (crew member select)
- Priority selector (1-5)
- Weather dependent toggle
- Required equipment multi-select
- Recurring job toggle (expands recurring options)
- "Save" and "Cancel" buttons

**SC-13: Recurring Job Setup**
- Recurrence pattern (frequency, day of week, time)
- Start date
- End date (optional)
- Generate preview (shows next 4-6 occurrences)
- "Create Recurring Job" button

**SC-14: Job Detail**
- Customer and property info
- Job details (type, description, status)
- Scheduled vs. actual times
- Assigned crew member
- Photos (before/during/after, lightbox view)
- Location map
- Status update buttons (Start Job, Complete Job)
- Actions (Navigate, Call Customer, Edit Job, Cancel Job, Create Invoice)

---

### 5.5 Field App Screens (Mobile-Optimized)

**SC-15: Field App - Today's Jobs**
- Date header
- Weather indicator
- Job count (completed / total)
- Large job cards (customer name, address, time, job type icon, status, distance)
- Actions per job card (Navigate, View Details, Start Job, Complete Job)
- Filter: Show Only Incomplete

**SC-16: Field App - Job Detail**
- Customer name (large)
- Address (tap to copy)
- Property notes section (gate code, access notes, pet warnings)
- Job instructions
- Previous visit photos
- Equipment required checklist
- Timer (when job started)
- Large action buttons (Navigate, Start Job, Add Photos, Complete Job, Call customer)

**SC-17: Field App - Photo Capture**
- Camera viewfinder (full screen)
- Category buttons (Before/During/After)
- Capture button (large, bottom center)
- Photo preview area (thumbnails)
- Caption input (optional)
- Delete photo button
- "Done" button
- Upload status indicator

**SC-18: Field App - Complete Job**
- Job summary
- Required checklist (photos taken, time tracked, location verified)
- Actual time spent (auto-calculated)
- Add notes (optional)
- Issues to report (optional)
- "Confirm Completion" button (large, primary)
- "Cancel" button

---

### 5.6 Invoice & Payment Screens

**SC-19: Invoices List**
- Filter tabs (All, Unpaid, Overdue, Paid)
- Search bar (customer name, invoice number)
- Date range filter
- Invoice cards (number, customer, issue date, due date, total, status, quick actions)
- Total unpaid amount (prominent)
- "Create Invoice" button

**SC-20: Invoice Detail**
- Invoice number and status
- Customer info
- Issue date and due date
- Line items table (description, quantity, unit price, line total)
- Subtotal, Tax, Total
- Amount paid / Amount due
- Payment history
- Attached photos (from job)
- Actions (Edit, Send via Email, Send via SMS, Record Payment, Download PDF, Delete)

**SC-21: Create/Edit Invoice**
- Customer select (searchable)
- Job select (optional, loads job details)
- Invoice date and due date
- Line items (add, delete, drag to reorder)
- Tax rate input
- Auto-calculated totals
- Notes field
- Preview invoice button
- "Save as Draft" and "Send Invoice" buttons

**SC-22: Payment Portal (Customer View)**
- Clean, branded interface
- Invoice summary (number, issue date, amount due - large and prominent)
- Service details
- Before/after photos
- Payment form (cardholder name, card number, expiration, CVV, billing zip, save card checkbox)
- "Pay Now" button (large, primary)
- Powered by Stripe badge
- Secure payment icons

**SC-23: Payment Confirmation**
- Success checkmark icon
- "Payment Successful" heading
- Payment details (amount paid, payment method, transaction ID, date/time)
- Receipt email confirmation message
- "View Service History" button
- "Back to Dashboard" button

---

### 5.7 Reporting Screens

**SC-24: Reports Dashboard**
- Date range selector (prominent)
- Report cards (Revenue Report with graph, Job Completion Report with graph, Customer Report with stats, Crew Performance with bar chart)
- Export button per report
- Print all button

**SC-25: Revenue Report Detail**
- Date range selector
- Total revenue (large number)
- Paid vs. unpaid breakdown
- Line chart (revenue over time)
- Revenue by service type (pie chart)
- Top 10 customers by revenue (table)
- Average invoice value
- Export CSV button

**SC-26: Job Completion Report**
- Date range selector
- Jobs completed (large number)
- Completion rate percentage
- Jobs per day (bar chart)
- Average time per job type (table)
- Jobs by status (pie chart)
- Crew comparison table
- Export CSV button

---

### 5.8 Tree Service Screens

**SC-27: Tree Inventory**
- Filter by property dropdown
- Filter by health status
- Search by species
- Tree cards (photo, species, property address, health status badge, last service date, risk rating)
- "Add Tree" button
- Map view toggle

**SC-28: Tree Detail**
- Photo carousel
- Species information
- Location on property (map pin)
- Measurements section (DBH, height, canopy spread)
- Health status with visual indicator
- Risk assessment section (risk rating, risk factors, last assessment date)
- Service history (filtered to this tree)
- Actions (Edit Tree, Schedule Service, Update Assessment, Delete Tree)

**SC-29: Add/Edit Tree**
- Property select
- Species input (searchable database)
- Location (GPS coordinates, location notes, tap on map)
- Measurements (DBH, height, canopy spread)
- Health status select
- Risk rating select
- Notes
- Photo upload
- "Save" button

**SC-30: Tree Removal Calculator**
- Tree size input (height, DBH)
- Complexity factors sliders (accessibility, power line proximity, tree condition, structure proximity)
- Stump removal toggle
- Calculated base price
- Applied multipliers
- Total estimated price (prominent)
- Recommended crew size
- Required equipment list
- "Create Estimate" button

**SC-31: Safety Checklist**
- Job information (read-only)
- Equipment inspection section (harnesses, ropes, chainsaw, PPE, photos)
- Site assessment section (power line clearance, utilities marked, weather acceptable, escape routes, landing zone clear)
- Crew verification (crew members present, certifications current, emergency contacts verified)
- Sign-off (crew lead signature - digital, date/time)
- "Start Job" button (only enabled when complete)

---

### 5.9 Equipment Screens

**SC-32: Equipment List**
- Filter by type dropdown
- Filter by status dropdown
- Equipment cards (name, type, status indicator, next maintenance date, current job)
- "Add Equipment" button

**SC-33: Equipment Detail**
- Equipment name and type
- Photo
- Details (make, model, year, serial number, owned/rented status)
- Maintenance section (last maintenance date, next maintenance date, maintenance history, add record button)
- Certification section (certification required, expiration date, upload documents)
- Schedule (calendar showing assigned jobs)
- Actions (Edit Equipment, Schedule Maintenance, Mark In Use/Available, Delete Equipment)

---

### 5.10 Customer Portal Screens

**SC-34: Customer Portal Login**
- Email input
- "Send Magic Link" button
- No password needed
- Information text explaining magic link
- Branded header

**SC-35: Customer Portal Dashboard**
- Welcome message with customer name
- Upcoming services card (next service date, service type, estimated time window)
- Recent services (last 3 with date, service performed, view photos link)
- Outstanding invoices card (amount due, pay now button)
- Quick actions (Request Service, View History, Update Info, Pause Service)

**SC-36: Customer Service History**
- Filter by property (if multiple)
- Filter by date range
- Service cards (date, service type, property address, before/after photos thumbnails, invoice link)
- Expand card to view full details
- Download service report button

**SC-37: Request Service**
- Property select
- Service type select
- Preferred date/time
- Description of needs
- Upload photos (optional)
- Priority (standard/urgent)
- "Submit Request" button
- Confirmation message

---

### 5.11 Settings & Admin Screens

**SC-38: Settings - Profile**
- Profile photo upload
- Name, Email (read-only), Phone
- Role display
- Change password button
- Notification preferences (email notifications toggle, SMS notifications toggle)
- "Save Changes" button

**SC-39: Settings - Business**
- Business name
- Logo upload
- Business address
- Contact phone and email
- Tax rate
- Invoice settings (default payment terms, invoice prefix, notes/terms)
- "Save Changes" button

**SC-40: Settings - Team**
- Team members list (name, email, role, status, edit/delete buttons)
- "Invite Team Member" button
- Role definitions help text

**SC-41: Settings - Integrations**
- Stripe (connection status, connect/disconnect button, test mode toggle)
- Google Maps (API key status, configure button)
- Twilio SMS (connection status, phone number, configure button)
- SendGrid Email (connection status, configure button)
- QuickBooks (future - connection status, connect button)

**SC-42: Settings - Notifications**
- Customer notifications (appointment reminders toggle/timing, on the way toggle/timing, service complete toggle, payment reminders toggle/timing, payment confirmations toggle)
- Default notification methods (SMS toggle, Email toggle)
- Test notification button
- "Save Changes" button

---

## 6. USER FLOWS

### 6.1 Flow: Schedule a New Job

**Primary Actor:** Aaron (Owner)  
**Trigger:** Need to schedule service for customer  
**Preconditions:** Customer and property exist in system

**Steps:**
1. Aaron opens Schedule page
2. Clicks "Add Job" button
3. System displays Add Job form
4. Aaron selects customer from dropdown (searchable)
5. Aaron selects property
6. Aaron selects job type from dropdown
7. Aaron enters title and description (optional)
8. Aaron selects date using date picker
9. Aaron selects time window
10. Aaron enters estimated duration
11. Aaron selects crew member from dropdown
12. Aaron sets priority (1-5, default 2)
13. Aaron toggles "weather dependent" if applicable
14. Aaron selects required equipment
15. If recurring job:
    - Aaron toggles "Make this recurring"
    - System displays recurring options
    - Aaron selects frequency, day of week, time
    - Aaron selects start date and optional end date
    - System shows preview of next 4 occurrences
16. Aaron clicks "Save" button
17. System validates data
18. System creates job record(s) in database
19. System sends notification to assigned crew member
20. System displays success message
21. System returns to calendar view with new job visible

**Alternative Flows:**
- **A1:** Customer doesn't exist → Aaron clicks "Add New Customer" → completes customer form → returns to Add Job
- **A2:** Validation errors → System highlights errors → Aaron corrects → resumes at step 16

---

### 6.2 Flow: Complete a Job (Field Worker)

**Primary Actor:** Mike (Crew Member)  
**Trigger:** Arrives at job site  
**Preconditions:** Job scheduled and assigned to Mike

**Steps:**
1. Mike opens Field App
2. System displays today's jobs list
3. Mike views next job card
4. Mike taps "Navigate" button
5. System opens Google Maps with property address
6. Mike drives to property
7. Mike arrives at property
8. System detects GPS location near property
9. System suggests "Start Job"
10. Mike taps "Start Job" button
11. System displays Job Detail
12. System captures GPS location and timestamp
13. System updates job status to "in_progress"
14. System starts timer
15. Mike reviews property notes (gate code, pets, access)
16. Mike performs service work
17. Mike taps "Add Photos" button
18. System opens Photo Capture
19. Mike selects "Before" category
20. Mike captures 2-3 before photos
21. Mike completes service work
22. Mike selects "After" category
23. Mike captures 2-3 after photos
24. Mike taps "Done"
25. System returns to Job Detail
26. System queues photos for upload (background)
27. Mike taps "Complete Job" button
28. System displays Complete Job screen
29. System shows completion checklist (photos taken, time tracked, location verified)
30. Mike adds notes (optional)
31. Mike taps "Confirm Completion" button
32. System captures end GPS location and timestamp
33. System calculates actual duration
34. System updates job status to "completed"
35. System uploads photos if online
36. System sends "Service Complete" notification to customer
37. System displays success message
38. System returns to Today's Jobs list
39. Mike proceeds to next job

**Alternative Flows:**
- **A1:** No cellular signal → System queues all actions locally → Auto-syncs when signal returns
- **A2:** Forgot to take before photos → Checklist shows incomplete → Mike goes back to capture photos
- **A3:** Issue during service → Mike taps "Report Issue" → describes problem → system flags job and notifies Aaron

---

### 6.3 Flow: Create and Send Invoice

**Primary Actor:** Aaron (Owner)  
**Trigger:** Job completed, customer needs to be billed  
**Preconditions:** Job completed with photos

**Steps:**
1. Aaron views completed job in schedule or job detail
2. Aaron clicks "Create Invoice" button
3. System displays Create Invoice form
4. System auto-populates: customer info, job details as line item, dates, photos from job
5. Aaron reviews line item
6. Aaron adjusts quantity or price if needed
7. Aaron adds additional line items (optional)
8. System auto-calculates subtotal
9. System applies tax rate
10. System calculates tax amount and total
11. Aaron adds notes (optional)
12. Aaron clicks "Preview Invoice" to review
13. System displays PDF preview
14. Aaron clicks "Send Invoice" button
15. System displays confirmation dialog
16. Aaron clicks "Confirm"
17. System generates unique invoice number
18. System creates invoice record in database
19. System generates PDF invoice with logo, details, photos, payment link
20. System sends email via SendGrid with PDF attachment and payment link
21. System sends SMS via Twilio (optional) with short link
22. System updates invoice status to "sent"
23. System displays success message
24. System returns to Invoices list
25. Invoice appears with "Sent" status

**Alternative Flows:**
- **A1:** Save as draft instead of sending → Aaron clicks "Save as Draft" → System saves with "draft" status → Aaron can send later
- **A2:** Customer prefers SMS → System sends SMS with payment link and also emails for records

---

### 6.4 Flow: Customer Pays Invoice Online

**Primary Actor:** Jennifer (Customer)  
**Trigger:** Receives invoice email/SMS  
**Preconditions:** Invoice sent and unpaid

**Steps:**
1. Jennifer receives invoice email
2. Jennifer opens email on phone
3. Jennifer clicks "Pay Online" link
4. Browser opens Payment Portal
5. System displays invoice summary (number, amount due - prominent, service details, before/after photos)
6. Jennifer reviews service photos
7. Jennifer scrolls to payment form
8. Jennifer selects payment method: Card or Bank Account
9. If Card: Jennifer enters cardholder name
10. Jennifer enters card number in Stripe Element (validates format in real-time)
11. Jennifer enters expiration date and CVV
12. Jennifer enters billing zip code
13. If Bank Account: Jennifer clicks "Pay with Bank Account"
14. Stripe Financial Connections modal opens; Jennifer selects bank and authorizes
15. System displays ACH authorization/mandate text
16. Jennifer checks "Save payment method for future" (optional)
17. Jennifer clicks "Pay Now" button (large, green)
18. System disables button and shows loading spinner
19. System creates Stripe Payment Intent with selected payment method
20. If Card: Stripe confirms payment; if Bank Account: Stripe marks payment as "processing"
21. System creates payment record in database
22. System updates invoice status to "paid" (card) or "processing" (ACH)
23. System sends payment confirmation email/SMS (card: receipt; ACH: processing notice)
24. For card, system displays Payment Confirmation (success checkmark, "Payment Successful!", payment details, receipt confirmation message)
25. For ACH, system displays "Payment Processing" message with expected settlement window
26. Jennifer sees confirmation
27. Jennifer closes browser

**In parallel (Aaron's side):**
28. System sends real-time notification to Aaron (paid or processing)
29. Aaron's dashboard updates (invoice marked paid or processing)
30. Aaron receives email: "Payment received" (card) or "Payment processing" (ACH)
31. When ACH settles, system marks invoice as paid and sends final receipt/notification

**Alternative Flows:**
- **A1:** Payment fails (insufficient funds) -> System displays error message -> System re-enables payment button -> Jennifer can retry with different card
- **A2:** Customer saves payment method -> System stores Stripe payment method ID -> Future invoices can use saved method
- **A3:** ACH payment fails or is returned -> System marks invoice as unpaid -> System notifies Aaron and customer to retry

---

### 6.5 Flow: Route Optimization

**Primary Actor:** Aaron (Owner)  
**Trigger:** Planning next day's routes  
**Preconditions:** Multiple jobs scheduled for tomorrow

**Steps:**
1. Aaron opens Schedule page in Day view
2. Aaron selects tomorrow's date
3. System displays list of scheduled jobs (unoptimized)
4. Aaron sees 8 jobs scattered across town
5. Aaron clicks "Optimize Route" button
6. System displays loading indicator
7. System calls Optimize Route function with date, crew member, and job IDs
8. System retrieves job property locations from database
9. System calls Google Maps Distance Matrix API with origins/destinations
10. Google Maps returns distance and duration matrix
11. System implements optimization algorithm (start from business address, find nearest unvisited property, add job duration, add travel time, respect time windows, repeat)
12. System calculates total distance and time
13. System returns optimized job order with IDs, estimated times, total distance, total completion time
14. System receives optimization results
15. System displays comparison dialog (Before: 45 miles, 6.5 hours, complete by 5:30 PM / After: 32 miles, 5.5 hours, complete by 4:30 PM / Savings: 13 miles, 1 hour)
16. Aaron clicks "Apply Optimization"
17. System updates scheduled_start_at for all jobs
18. System reorders jobs in calendar view
19. System displays optimized route on map with numbered pins (1-8) in order
20. System draws route line connecting properties
21. System displays success message: "Route optimized! Saved 13 miles and 1 hour."
22. System sends notification to Mike: "Tomorrow's route has been optimized. Check updated schedule."
23. Mike opens Field App
24. System displays jobs in new optimized order

**Alternative Flows:**
- **A1:** Some jobs have time windows → Algorithm respects constraints (morning-only jobs before 12 PM, afternoon-only after 12 PM)
- **A2:** Aaron wants manual override → Aaron clicks "Manually Adjust" → drag-and-drop interface → Aaron reorders specific jobs → System recalculates times → Aaron clicks "Save Custom Route"

---

### 6.6 Flow: Setup Recurring Service

**Primary Actor:** Aaron (Owner)  
**Trigger:** Customer signs up for weekly lawn mowing  
**Preconditions:** Customer and property exist

**Steps:**
1. Aaron navigates to Schedule
2. Aaron clicks "Add Job"
3. System displays Add Job form
4. Aaron fills out basic job info (Customer: John Smith, Property: 123 Main St, Job type: Mowing, Title: Weekly Lawn Mowing, Estimated duration: 45 minutes, Assigned to: Mike)
5. Aaron toggles "Make this recurring" switch
6. System expands Recurring Options section
7. System displays Recurring Job Setup interface
8. Aaron selects frequency: "Weekly"
9. System displays day of week selector
10. Aaron selects day: "Wednesday"
11. Aaron selects time: "9:00 AM"
12. Aaron selects start date: "October 20, 2025"
13. Aaron leaves end date empty (ongoing)
14. Aaron clicks "Generate Preview"
15. System calculates next 6 occurrences (Oct 20, Oct 27, Nov 3, Nov 10, Nov 17, Nov 24)
16. System displays preview list with dates and times
17. Aaron reviews preview
18. Aaron clicks "Create Recurring Job"
19. System creates recurring_job record with pattern {type: 'weekly', day: 3, time: '09:00'}, start date, active: true
20. System creates first 2 weeks of actual job records
21. System schedules background task to generate future jobs (runs nightly, generates jobs 2 weeks in advance)
22. System displays success message: "Recurring job created. 2 jobs scheduled."
23. System returns to calendar
24. System highlights recurring jobs with special icon

**2 weeks later (automated):**
25. Nightly background job runs at 2:00 AM
26. System queries active recurring jobs
27. System identifies John Smith's weekly mowing
28. System checks if jobs exist for next 2 weeks
29. System generates new job for Nov 10
30. System assigns to Mike (from recurring template)
31. System sends notification to Mike: "New recurring job added to your schedule"

**Alternative Flows:**
- **A1:** Customer wants bi-weekly instead → Aaron selects "Bi-weekly" → System displays "Every ___ weeks on ___" → Aaron enters 2 weeks → Preview shows Oct 20, Nov 3, Nov 17, Dec 1
- **A2:** Customer has end date (seasonal) → Aaron selects end date: "November 30, 2025" → System includes end_date in recurring_job record → Background job stops generating after end date

---

### 6.7 Flow: Pause Recurring Service (Customer Portal)

**Primary Actor:** Jennifer (Customer)  
**Trigger:** Going on vacation, wants to pause service  
**Preconditions:** Has active recurring service, logged into portal

**Steps:**
1. Jennifer opens email link to Customer Portal
2. System displays Customer Portal Dashboard
3. Jennifer sees "Upcoming Services" card showing: Next service: October 20 (Wednesday), Type: Weekly Lawn Mowing
4. Jennifer clicks "Pause Service" button
5. System displays Pause Service modal ("How long would you like to pause service?", start date picker, end date picker)
6. Jennifer selects start date: "October 27"
7. Jennifer selects end date: "November 10"
8. System displays confirmation: "Services will be paused from Oct 27 - Nov 10" / "3 services will be skipped" / List of skipped dates: Oct 27, Nov 3, Nov 10 / "Service will resume on Nov 17"
9. Jennifer clicks "Confirm Pause"
10. System updates recurring_job record (is_paused: true, pause_start_date: Oct 27, pause_end_date: Nov 10)
11. System cancels existing scheduled jobs in pause window (marks Oct 27, Nov 3, Nov 10 jobs as "cancelled")
12. System prevents new jobs from generating during pause
13. System sends confirmation email to Jennifer: "Service paused from Oct 27 - Nov 10" / "You'll be back on schedule Nov 17"
14. System sends notification to Aaron: "Jennifer Smith paused service Oct 27 - Nov 10"
15. System displays success message
16. System updates Customer Portal Dashboard (shows "Service Paused" indicator, next service shows Nov 17)

**On November 10 (automated):**
17. Nightly background job runs
18. System checks for paused services ending
19. System identifies Jennifer's pause ending
20. System updates recurring_job (is_paused: false, clears pause dates)
21. System resumes generating jobs starting Nov 17
22. System sends email to Jennifer: "Your service will resume on Nov 17"

---

### 6.8 Flow: Automated Appointment Reminder

**Primary Actor:** System (automated)  
**Trigger:** Job scheduled for tomorrow at 5:00 PM  
**Preconditions:** Job scheduled, customer has phone/email

**Steps:**
1. Nightly cron job runs at 5:00 PM
2. System queries jobs scheduled for tomorrow
3. System identifies: John Smith, lawn mowing, Oct 20, 9:00 AM
4. System retrieves customer contact info (Phone: (502) 555-1234, Email: john@example.com, Preferences: SMS + Email)
5. System creates notification record (Type: appointment_reminder, Customer: John Smith, Job ID, Channel: SMS, Status: pending)
6. System calls Send Notification function
7. System retrieves job and customer details
8. System generates message from template: "Hi John, Aaron's Lawn Care will service your property tomorrow (Wed, Oct 20) between 9:00-10:00 AM. Reply CONFIRM or call (502) 555-9876 to reschedule."
9. System calls Twilio API (To: (502) 555-1234, From: Aaron's business number, Body: message)
10. Twilio sends SMS
11. Twilio returns delivery confirmation
12. System updates notification record (Status: sent, sent_at: timestamp)
13. System repeats steps 5-12 for email (sends via SendGrid with more details, photos, "View Details" link to portal)
14. System logs successful notifications

**Next morning:**
15. John receives texts and reads reminder
16. John replies: "CONFIRM"
17. Twilio forwards reply to webhook
18. System receives webhook POST
19. System identifies original job from phone number
20. System updates job with confirmation flag
21. System sends notification to Aaron: "John Smith confirmed tomorrow's appointment"

**Alternative Flows:**
- **A1:** Customer requests reschedule → John replies "RESCHEDULE" → System flags job as needing reschedule → System sends notification to Aaron with customer request → Aaron contacts customer to arrange new date
- **A2:** SMS delivery fails → Twilio returns error (invalid number) → System updates notification: status: failed → System retries with email only → System logs failure for review

---

## 7. BUSINESS REQUIREMENTS

### 7.1 Performance Requirements

**Application Performance:**
- First Contentful Paint (FCP): < 1.8 seconds
- Largest Contentful Paint (LCP): < 2.5 seconds
- Time to Interactive (TTI): < 3.8 seconds
- Total Blocking Time (TBT): < 300ms
- Cumulative Layout Shift (CLS): < 0.1

**API Performance:**
- Simple queries (GET customer): < 200ms
- Complex queries (calendar month): < 500ms
- Report generation: < 2 seconds
- Photo upload: < 3 seconds per photo

**Offline Performance:**
- Initial data sync (today's + tomorrow's jobs): < 10 seconds
- Incremental sync (changes only): < 3 seconds
- Photo upload queue: Background, no user blocking

---

### 7.2 Business Performance Metrics

**User Adoption (MVP Phase - Months 1-3):**
- Daily Active Users (DAU): 80%+
- Weekly Active Users (WAU): 100%
- Feature adoption rate: 70%+ for core features
- Time to first job completed: < 1 week after onboarding

**Operational Efficiency:**
- Invoicing time: Reduced from 10 minutes to < 2 minutes per invoice
- Scheduling time: Reduced from 45 minutes to < 15 minutes per week
- Customer communication: Reduced from 20 minutes to < 5 minutes daily
- Administrative overhead: Reduced by 50%

**Productivity Gains:**
- Jobs per crew per day: Increase from 5 → 7 (40% improvement)
- Drive time per day: Reduced from 90 minutes → 60 minutes per crew
- No-show rate: Reduced from 10% → < 2%
- Rework rate: Reduced from 5% → < 1%

**Financial Performance:**
- Invoice payment time: Reduced from 30+ days → 5-7 days
- Cash flow improvement: 75% invoices paid within 7 days
- Late payment rate: < 5% of invoices
- Revenue per crew: Increase by 25%

**Customer Satisfaction:**
- Net Promoter Score (NPS): 50+ (target: 70%+ promoters, < 10% detractors)
- Annual retention rate: 85%+
- Churn rate: < 15% annually
- Upsell rate: 30% (customers buying additional services)

---

### 7.3 Security & Compliance

**Authentication & Authorization:**
- Password requirements: Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
- Session duration: 1 hour access token, 30 day refresh token
- Account lockout: 5 failed attempts = 15-minute lockout
- Role-Based Access Control (RBAC) for Owner, Admin, Crew Lead, Crew Member, Office Staff, Customer

**Data Security:**
- All connections use TLS 1.3 (HTTPS)
- Database encrypted at rest with AES-256
- Passwords hashed with bcrypt
- Payment data never stored (Stripe handles all payment data)
- Sensitive data access logged

**PCI Compliance:**
- PCI DSS Level 4 compliance via Stripe
- SAQ-A compliance questionnaire
- No card data stored = minimal compliance burden

**Data Retention:**
- Active customer data: Retained indefinitely
- Inactive customers: Archived after 1 year of no activity
- Deleted customers: Financial records retained 7 years (IRS requirement)
- Logs: 90 days retention
- Photos: 90 days original quality, then compressed

---

### 7.4 Support & Maintenance

**Support Channels:**
- In-App: Help button (opens contact form)
- Email: support@aaronscare.com
- Phone: (502) 555-9876 (business hours)
- Documentation: https://docs.aaronscare.com

**Support SLA:**
- Critical (app down): 2-hour response, 4-hour resolution
- High (major feature broken): 4-hour response, 24-hour resolution
- Medium (minor issue): 8-hour response, 3-day resolution
- Low (enhancement request): 24-hour response, no resolution SLA

**Maintenance Windows:**
- Planned: First Sunday of month, 2-4 AM EST
- Emergency: As needed, with 1-hour notice if possible
- Updates: Weekly (minor), Monthly (features)

---

## 8. LAUNCH PLAN

### 8.1 MVP Launch Checklist

**Pre-Launch (Week 12):**
- [ ] All MVP features complete and tested
- [ ] Performance metrics meet targets
- [ ] Security audit completed
- [ ] User acceptance testing with Aaron
- [ ] Production environment configured
- [ ] Monitoring and alerting active
- [ ] Backup systems verified
- [ ] Documentation complete
- [ ] Training materials created
- [ ] Support process defined

**Launch Week:**
- [ ] Deploy to production
- [ ] Import existing customer data
- [ ] Configure integrations (Stripe, Twilio, SendGrid)
- [ ] Train Aaron and crew members (2-hour session)
- [ ] Launch to Aaron only (1-2 days testing)
- [ ] Launch to full crew (3-5 days monitoring)
- [ ] Gather initial feedback
- [ ] Fix critical issues immediately

**Post-Launch (Week 13-14):**
- [ ] Daily check-ins with users
- [ ] Monitor metrics closely
- [ ] Address issues within SLA
- [ ] Collect improvement suggestions
- [ ] Plan Phase 2 features based on feedback

---

### 8.2 User Onboarding

**Aaron's Onboarding (2 hours):**
1. System overview and login (15 min)
2. Customer and property management (30 min)
3. Job scheduling and recurring services (30 min)
4. Invoicing and payments (30 min)
5. Reports and analytics (15 min)

**Crew Member Onboarding (1 hour):**
1. Field app overview and login (10 min)
2. Viewing daily schedule (15 min)
3. Navigation and GPS usage (10 min)
4. Starting and completing jobs (15 min)
5. Photo capture (10 min)

**Customer Migration:**
- Import existing customers from spreadsheet/QuickBooks
- Send welcome email with portal invitation
- Gradual rollout to avoid overwhelming customers
- Support available for login issues

---

### 8.3 Success Criteria

**Week 1 Success:**
- Zero critical bugs
- 100% of users can log in and complete basic tasks
- At least 10 jobs scheduled and completed
- At least 5 invoices created and sent
- All crew members using field app daily

**Month 1 Success:**
- 80%+ daily active usage
- 50+ jobs completed through app
- 30+ invoices sent and paid
- < 5 critical bugs reported
- Positive user feedback

**Month 3 Success:**
- 90%+ daily active usage
- 200+ jobs completed per month
- 100+ invoices sent per month
- $10,000+ processed through Stripe
- NPS score of 40+
- Ready for Phase 2 development

---

## 9. APPENDIX

### 9.1 Glossary

**Terms:**
- **DAU:** Daily Active Users
- **DBH:** Diameter at Breast Height (tree measurement at 4.5 feet)
- **GPS:** Global Positioning System
- **ISA:** International Society of Arboriculture
- **LCP:** Largest Contentful Paint (performance metric)
- **NPS:** Net Promoter Score (customer satisfaction metric)
- **PWA:** Progressive Web App
- **TRAQ:** Tree Risk Assessment Qualification
- **TTI:** Time to Interactive (performance metric)

---

### 9.2 Document Approval

**Product Owner:** Aaron  
**Date:** October 16, 2025

**Development Team Lead:** [Name]  
**Date:** ___________

**QA Lead:** [Name]  
**Date:** ___________

---

**End of Product Requirements Document**

*This PRD is a living document and will be updated as requirements evolve during development. Version history maintained in Git repository.*

*For technical implementation details, refer to the companion Technical Specification document.*
