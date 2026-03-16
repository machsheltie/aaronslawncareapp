# Aaron's Lawn Care Service
## Technical Specification Document

**Version:** 1.0  
**Date:** October 16, 2025  
**Status:** Draft for Development  
**Technical Lead:** [Name]  
**Document Type:** Technical Specification

---

## 1. TECHNICAL OVERVIEW

### 1.1 Architecture Summary

**Type:** Progressive Web Application (PWA) with offline-first design  
**Frontend:** React 18 + Vite + Tailwind CSS  
**Backend:** Supabase (PostgreSQL + Auth + Realtime + Storage)  
**Deployment:** Vercel (frontend), Supabase Cloud (backend)  
**Mobile Strategy:** Installable PWA (no app stores) optimized for Android crews; supports iOS and desktop browsers for admin/scheduling  
**Tenancy:** Single-tenant for Aaron's Lawn Care; all staff share data; customer portal access limited to the customer's records

### 1.2 Technology Stack

**Frontend Technologies:**
- **Framework:** React 18.2+
- **Build Tool:** Vite 5.0+
- **Styling:** Tailwind CSS 3.4+
- **State Management:** Zustand (lightweight, simple)
- **Data Fetching:** TanStack Query (React Query v5) for server state
- **Routing:** React Router v6
- **Form Handling:** React Hook Form + Zod validation
- **Maps:** Google Maps JavaScript API
- **Charts:** Recharts
- **Date/Time:** date-fns
- **Icons:** Lucide React

**Backend Technologies:**
- **Database:** PostgreSQL 15+ with PostGIS extension
- **Authentication:** Supabase Auth (JWT-based)
- **Realtime:** Supabase Realtime (WebSocket)
- **Storage:** Supabase Storage for photos
- **Edge Functions:** Supabase Edge Functions (Deno)
- **Payments:** Stripe integration via Edge Functions (card + ACH via Financial Connections)

**Development Tools:**
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Testing:** Vitest (unit), Playwright (E2E)
- **Code Quality:** ESLint, Prettier
- **API Testing:** Postman/Insomnia

---

## 2. FRONTEND ARCHITECTURE

### 2.1 Project Structure

```
/src
  /components
    /ui (reusable components)
      Button.jsx
      Input.jsx
      Card.jsx
      Modal.jsx
      Select.jsx
      DatePicker.jsx
    /features (feature-specific components)
      /customers
        CustomerList.jsx
        CustomerCard.jsx
        CustomerForm.jsx
        CustomerDetail.jsx
      /scheduling
        Calendar.jsx
        JobCard.jsx
        JobForm.jsx
        RecurringJobForm.jsx
      /jobs
        JobDetail.jsx
        JobList.jsx
        JobTimer.jsx
      /invoicing
        InvoiceList.jsx
        InvoiceForm.jsx
        InvoiceDetail.jsx
        PaymentPortal.jsx
      /photos
        PhotoCapture.jsx
        PhotoGallery.jsx
        PhotoUpload.jsx
      /reports
        RevenueReport.jsx
        JobReport.jsx
        CustomerReport.jsx
  /pages
    Dashboard.jsx
    Customers.jsx
    Schedule.jsx
    FieldApp.jsx
    Invoices.jsx
    Reports.jsx
    Settings.jsx
  /hooks (custom React hooks)
    useAuth.js
    useCustomers.js
    useJobs.js
    useInvoices.js
    useOfflineSync.js
    useGeolocation.js
  /lib
    supabase.js (Supabase client)
    stripe.js (Stripe client)
    utils.js
    api.js
  /stores (Zustand stores)
    authStore.js
    offlineStore.js
    uiStore.js
  /services
    customerService.js
    jobService.js
    invoiceService.js
    photoService.js
  App.jsx
  main.jsx
```

### 2.2 State Management Strategy

**Server State (React Query):**
- Customer data
- Job schedules
- Invoice data
- Reports data
- Automatic caching and refetching
- Optimistic updates for mutations

**Client State (Zustand):**
- Authentication state
- UI state (modals, sidebars)
- Offline queue
- User preferences

**Example Zustand Store:**
```javascript
// authStore.js
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,
  
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
```

### 2.3 Routing Configuration

```javascript
// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/payment/:invoiceId" element={<PaymentPortal />} />
        <Route path="/portal/*" element={<CustomerPortal />} />
        
        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/field-app" element={<FieldApp />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 2.4 Progressive Web App Configuration

**Web App Manifest (manifest.json):**
```json
{
  "name": "Aaron's Lawn Care Service",
  "short_name": "Aaron's Care",
  "description": "Business management for lawn care and tree removal",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Service Worker Strategy:**
- Cache-first for static assets (app shell, icons, fonts)
- Network-first with fallback for dynamic data
- Background sync for offline actions
- IndexedDB for offline data storage

**Vite PWA Plugin Configuration:**
```javascript
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        // ... manifest config
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300, // 5 minutes
              },
            },
          },
        ],
      },
    }),
  ],
};
```

### 2.5 Offline Storage Implementation

Offline support targets intermittent connectivity (spotty signal). Core workflows queue changes locally and sync on reconnect; full multi-day offline operation is not required.

**IndexedDB Schema (using Dexie.js):**
```javascript
// lib/db.js
import Dexie from 'dexie';

export const db = new Dexie('AaronsLawnCare');

db.version(1).stores({
  jobs: 'id, customer_id, scheduled_start_at, status, assigned_to',
  customers: 'id, phone, email',
  photos: '++id, job_id, uploaded',
  offlineQueue: '++id, action, timestamp',
});

// Queue offline actions
export async function queueAction(action) {
  await db.offlineQueue.add({
    action: action.type,
    payload: action.payload,
    timestamp: Date.now(),
  });
}

// Sync offline queue when online
export async function syncOfflineQueue() {
  const queue = await db.offlineQueue.toArray();
  
  for (const item of queue) {
    try {
      await processAction(item);
      await db.offlineQueue.delete(item.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
```

---

## 3. BACKEND ARCHITECTURE

### 3.1 Supabase Configuration

**Why Supabase:**
- Built on PostgreSQL (proven, scalable, open source)
- Row-level security for multi-tenant isolation
- Realtime subscriptions out of the box
- Automatic REST API generation
- Integrated authentication
- File storage with CDN
- Generous free tier for MVP
- Easy scaling path

**Supabase Project Setup:**
```
Project Name: aarons-lawn-care
Region: US East (closest to Louisville, KY)
Database Password: [strong password]
```

**Database Extensions:**
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
```

**Supabase Features Configuration:**
- Row-Level Security (RLS): Enabled on all tables
- Realtime: Enabled for jobs, customers tables
- Storage bucket: `job-photos` (private with signed URLs)
- Storage bucket: `customer-documents` (private)

### 3.2 Database Schema

**Naming Conventions:**
- Tables: plural snake_case (users, customers, jobs)
- Columns: snake_case (created_at, customer_id)
- Primary keys: id (UUID v4)
- Foreign keys: {table_name}_id (customer_id, user_id)
- Timestamps: created_at, updated_at (automatic)

**Single-Tenant Note:** `user_id` columns represent the business owner account for ownership/auditing. Access control is handled via RLS roles, not per-user tenant isolation.

#### Core Tables

**Note:** The `users` table mirrors Supabase `auth.users` for staff accounts; `users.id` must equal `auth.users.id`.

**users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'crew_lead', 'crew_member', 'office_staff')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

Staff profiles are created at signup (or via an admin invite flow) and must use the same UUID as `auth.users.id`.

**customers**
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL, -- owner account (single-tenant; set to Aaron's user id)
  portal_user_id UUID UNIQUE REFERENCES auth.users(id), -- optional customer portal login
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  billing_address TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_zip TEXT,
  customer_type TEXT CHECK (customer_type IN ('residential', 'commercial', 'hoa')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  tags TEXT[], -- Array of custom tags
  notes TEXT,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);

-- Full-text search
CREATE INDEX idx_customers_search ON customers USING gin(
  to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(email, '') || ' ' || phone)
);
```

**properties**
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  timezone TEXT DEFAULT 'America/New_York',
  location GEOGRAPHY(POINT, 4326), -- PostGIS for geolocation
  lot_size DECIMAL, -- In acres
  gate_code TEXT,
  access_notes TEXT,
  pet_warnings TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_properties_customer_id ON properties(customer_id);
CREATE INDEX idx_properties_location ON properties USING GIST(location);
```

**jobs**
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES users(id), -- Crew member assigned
  job_type TEXT NOT NULL CHECK (job_type IN ('mowing', 'trimming', 'edging', 'mulching', 'tree_trimming', 'tree_removal', 'stump_grinding', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'en_route', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
  scheduled_start_at TIMESTAMPTZ NOT NULL, -- stored in UTC; UI renders in property timezone
  scheduled_end_at TIMESTAMPTZ,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  estimated_duration INTEGER, -- Minutes
  actual_duration INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN actual_end_time IS NOT NULL AND actual_start_time IS NOT NULL
      THEN EXTRACT(EPOCH FROM (actual_end_time - actual_start_time)) / 60
      ELSE NULL
    END
  ) STORED,
  priority INTEGER DEFAULT 2 CHECK (priority BETWEEN 1 AND 5), -- 1=highest
  requires_equipment TEXT[], -- Array of equipment needed
  weather_dependent BOOLEAN DEFAULT TRUE,
  recurring_job_id UUID REFERENCES recurring_jobs(id) ON DELETE SET NULL,
  start_location GEOGRAPHY(POINT, 4326), -- GPS where job started
  end_location GEOGRAPHY(POINT, 4326), -- GPS where job ended
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_assigned_to ON jobs(assigned_to);
CREATE INDEX idx_jobs_scheduled_start_at ON jobs(scheduled_start_at);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_recurring_job_id ON jobs(recurring_job_id);
```

**recurring_jobs**
```sql
CREATE TABLE recurring_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  job_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  recurrence_pattern JSONB NOT NULL, -- {type: 'weekly', day: 3, time: '09:00'}
  start_date DATE NOT NULL,
  end_date DATE, -- NULL = ongoing
  is_active BOOLEAN DEFAULT TRUE,
  is_paused BOOLEAN DEFAULT FALSE,
  pause_start_date DATE,
  pause_end_date DATE,
  assigned_to UUID REFERENCES users(id),
  estimated_duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_recurring_jobs_user_id ON recurring_jobs(user_id);
CREATE INDEX idx_recurring_jobs_customer_id ON recurring_jobs(customer_id);
CREATE INDEX idx_recurring_jobs_active ON recurring_jobs(is_active) WHERE is_active = TRUE;
```

**job_photos**
```sql
CREATE TABLE job_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL, -- Supabase Storage path
  photo_type TEXT CHECK (photo_type IN ('before', 'during', 'after')),
  caption TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_at TIMESTAMPTZ,
  uploaded_by UUID REFERENCES users(id),
  file_size INTEGER, -- Bytes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_job_photos_job_id ON job_photos(job_id);
CREATE INDEX idx_job_photos_type ON job_photos(photo_type);
```

**invoices**
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'processing', 'paid', 'overdue', 'cancelled')),
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_rate DECIMAL(5, 4) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  amount_due DECIMAL(10, 2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  notes TEXT,
  stripe_invoice_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT check_dates CHECK (due_date >= issue_date),
  CONSTRAINT check_amounts CHECK (amount_paid <= total_amount)
);

-- Indexes
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
```

**invoice_line_items**
```sql
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
```

**payments**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('credit_card', 'ach', 'cash', 'check')),
  stripe_payment_intent_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
```

**trees** (for tree service tracking)
```sql
CREATE TABLE trees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  species_common TEXT,
  species_scientific TEXT,
  location GEOGRAPHY(POINT, 4326),
  location_notes TEXT,
  diameter_at_breast_height DECIMAL(5, 2), -- Inches (DBH)
  height_feet DECIMAL(6, 2),
  canopy_spread_feet DECIMAL(6, 2),
  health_status TEXT CHECK (health_status IN ('healthy', 'declining', 'diseased', 'dead', 'hazardous')),
  risk_rating TEXT CHECK (risk_rating IN ('low', 'medium', 'high', 'extreme')),
  notes TEXT,
  last_service_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_trees_property_id ON trees(property_id);
CREATE INDEX idx_trees_health_status ON trees(health_status);
```

**equipment**
```sql
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  name TEXT NOT NULL,
  equipment_type TEXT CHECK (equipment_type IN ('bucket_truck', 'crane', 'chipper', 'stump_grinder', 'mower', 'trimmer', 'blower', 'other')),
  make TEXT,
  model TEXT,
  year INTEGER,
  serial_number TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
  is_owned BOOLEAN DEFAULT TRUE, -- FALSE = rented
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  certification_expires DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_equipment_user_id ON equipment(user_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_next_maintenance ON equipment(next_maintenance_date);
```

**notifications**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  notification_type TEXT CHECK (notification_type IN ('appointment_reminder', 'on_the_way', 'service_complete', 'payment_reminder', 'payment_confirmation')),
  channel TEXT CHECK (channel IN ('sms', 'email')),
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_customer_id ON notifications(customer_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

### 3.3 Database Functions & Triggers

**Auto-update updated_at timestamp:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ... repeat for all tables with updated_at
```

**Generate invoice numbers:**
```sql
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count
  FROM invoices
  WHERE DATE(created_at) = CURRENT_DATE;
  
  new_number := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((count + 1)::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invoice number
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number_trigger BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_invoice_number();
```

**Calculate distance between properties (for route optimization):**
```sql
CREATE OR REPLACE FUNCTION calculate_distance(
  origin_lat DECIMAL,
  origin_lng DECIMAL,
  dest_lat DECIMAL,
  dest_lng DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
  RETURN ST_Distance(
    ST_MakePoint(origin_lng, origin_lat)::geography,
    ST_MakePoint(dest_lng, dest_lat)::geography
  ) / 1609.34; -- Convert meters to miles
END;
$$ LANGUAGE plpgsql;
```

### 3.4 Row-Level Security (RLS) Policies

**Enable RLS on all tables:**
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

**Example RLS Policies:**
```sql
-- Staff access (single-tenant): any authenticated staff in users table
CREATE POLICY "Staff can view customers"
ON customers FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()));

CREATE POLICY "Staff can insert customers"
ON customers FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()));

CREATE POLICY "Staff can update customers"
ON customers FOR UPDATE
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()));

CREATE POLICY "Staff can view jobs"
ON jobs FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()));

CREATE POLICY "Staff can manage jobs"
ON jobs FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()));

CREATE POLICY "Staff can update jobs"
ON jobs FOR UPDATE
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()));

-- Customer portal access: customers can view their own records
CREATE POLICY "Customer portal can view own customer"
ON customers FOR SELECT
USING (portal_user_id = auth.uid());

CREATE POLICY "Customer portal can view own jobs"
ON jobs FOR SELECT
USING (
  customer_id IN (
    SELECT id FROM customers WHERE portal_user_id = auth.uid()
  )
);

CREATE POLICY "Customer portal can view own invoices"
ON invoices FOR SELECT
USING (
  customer_id IN (
    SELECT id FROM customers WHERE portal_user_id = auth.uid()
  )
);

-- Payment page access should be handled via Edge Functions using service role,
-- not broad anon RLS policies.
```

---

## 4. API ENDPOINTS

### 4.1 Auto-Generated REST API (Supabase)

Supabase auto-generates REST API endpoints for all tables:

**Base URL:** `https://[project-id].supabase.co/rest/v1/`

**Authentication Header:**
```
Authorization: Bearer [JWT_TOKEN]
apikey: [ANON_KEY]
```

**Standard Endpoints:**
```
# Customers
GET    /customers                    # List customers
GET    /customers?id=eq.{id}        # Get specific customer
POST   /customers                    # Create customer
PATCH  /customers?id=eq.{id}        # Update customer
DELETE /customers?id=eq.{id}        # Delete customer

# Jobs
GET    /jobs                         # List jobs
GET    /jobs?id=eq.{id}             # Get specific job
GET    /jobs?scheduled_start_at=gte.2025-10-20T00:00:00-04:00&scheduled_start_at=lt.2025-10-21T00:00:00-04:00  # Filter by date range
GET    /jobs?assigned_to=eq.{user_id}      # Filter by assignee
POST   /jobs                         # Create job
PATCH  /jobs?id=eq.{id}             # Update job

# Invoices
GET    /invoices                     # List invoices
GET    /invoices?status=eq.sent     # Filter by status
POST   /invoices                     # Create invoice
PATCH  /invoices?id=eq.{id}         # Update invoice

# Similar for all other tables
```

**Query Operators:**
- `eq` - equals
- `neq` - not equals
- `gt` - greater than
- `gte` - greater than or equal
- `lt` - less than
- `lte` - less than or equal
- `like` - pattern matching
- `in` - in list
- `is` - checking for null

**Example Queries:**
```javascript
// Get all jobs scheduled for today, assigned to specific user
const { data, error } = await supabase
  .from('jobs')
  .select('*, customer:customers(*), property:properties(*)')
  .gte('scheduled_start_at', '2025-10-20T00:00:00-04:00')
  .lt('scheduled_start_at', '2025-10-21T00:00:00-04:00')
  .eq('assigned_to', userId)
  .order('scheduled_start_at');

// Get customer with properties and recent jobs
const { data, error } = await supabase
  .from('customers')
  .select(`
    *,
    properties(*),
    jobs(*, job_photos(*))
  `)
  .eq('id', customerId)
  .limit(10, { foreignTable: 'jobs' });
```

### 4.2 Custom Edge Functions

Edge Functions handle complex business logic that can't be done through REST API.

**Deploy Location:** Supabase Edge Functions (Deno runtime)

**Function: generate-recurring-jobs**
```typescript
// supabase/functions/generate-recurring-jobs/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { recurringJobId } = await req.json();

  // Get recurring job details
  const { data: recurringJob, error } = await supabase
    .from('recurring_jobs')
    .select('*')
    .eq('id', recurringJobId)
    .single();

  if (error) return new Response(JSON.stringify({ error }), { status: 400 });

  // Calculate next 2 weeks of jobs
  const jobs = calculateJobDates(recurringJob);

  // Insert jobs
  const { data: createdJobs, error: insertError } = await supabase
    .from('jobs')
    .insert(jobs);

  if (insertError) return new Response(JSON.stringify({ error: insertError }), { status: 500 });

  return new Response(JSON.stringify({ success: true, jobsCreated: jobs.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

function calculateJobDates(recurringJob) {
  // Implementation of date calculation logic
  // Returns array of job objects
}
```

**Function: optimize-route**
```typescript
// supabase/functions/optimize-route/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { date, crewMemberId } = await req.json();
  const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');

  // Fetch jobs for the day
  const jobs = await getJobsForDate(date, crewMemberId);

  // Get property locations
  const locations = await getPropertyLocations(jobs);

  // Call Google Maps Distance Matrix API
  const distanceMatrix = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${GOOGLE_MAPS_API_KEY}`
  );

  // Run optimization algorithm
  const optimizedRoute = optimizeRoute(jobs, distanceMatrix);

  return new Response(JSON.stringify(optimizedRoute), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Function: create-payment-intent**
```typescript
// supabase/functions/create-payment-intent/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.0.0';

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  });

  const { invoiceId, amount, paymentMethodType } = await req.json(); // paymentMethodType: 'card' | 'us_bank_account'

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    payment_method_types: [paymentMethodType || 'card'],
    payment_method_options: paymentMethodType === 'us_bank_account'
      ? { us_bank_account: { verification_method: 'financial_connections' } }
      : undefined,
    metadata: { invoiceId },
  });

  return new Response(
    JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

**Function: send-notification**
```typescript
// supabase/functions/send-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Twilio } from 'https://esm.sh/twilio@4.19.0';
import sgMail from 'https://esm.sh/@sendgrid/mail@7.7.0';

serve(async (req) => {
  const { customerId, type, jobId } = await req.json();

  // Get customer and job details
  const customer = await getCustomer(customerId);
  const job = await getJob(jobId);

  // Generate message from template
  const message = generateMessage(type, customer, job);

  // Send via SMS (Twilio)
  if (customer.sms_notifications) {
    const twilio = new Twilio(
      Deno.env.get('TWILIO_ACCOUNT_SID'),
      Deno.env.get('TWILIO_AUTH_TOKEN')
    );
    await twilio.messages.create({
      to: customer.phone,
      from: Deno.env.get('TWILIO_PHONE_NUMBER'),
      body: message.sms,
    });
  }

  // Send via Email (SendGrid)
  if (customer.email_notifications) {
    sgMail.setApiKey(Deno.env.get('SENDGRID_API_KEY')!);
    await sgMail.send({
      to: customer.email,
      from: 'noreply@aaronscare.com',
      subject: message.subject,
      html: message.html,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Function: stripe-webhook**
```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.0.0';

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
  const signature = req.headers.get('stripe-signature')!;
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;
    case 'payment_intent.processing':
      const processingPayment = event.data.object;
      await handlePaymentProcessing(processingPayment);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handlePaymentFailure(failedPayment);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});

async function handlePaymentSuccess(paymentIntent) {
  const invoiceId = paymentIntent.metadata.invoiceId;
  
  // Update invoice status
  await supabase
    .from('invoices')
    .update({ status: 'paid', paid_date: new Date().toISOString() })
    .eq('id', invoiceId);

  // Create payment record
  await supabase
    .from('payments')
    .insert({
      invoice_id: invoiceId,
      amount: paymentIntent.amount / 100,
      payment_method: 'credit_card',
      stripe_payment_intent_id: paymentIntent.id,
      status: 'succeeded',
    });

  // Send payment confirmation notification
  await sendNotification(invoiceId, 'payment_confirmation');
}

async function handlePaymentProcessing(paymentIntent) {
  const invoiceId = paymentIntent.metadata.invoiceId;

  await supabase
    .from('invoices')
    .update({ status: 'processing' })
    .eq('id', invoiceId);
}
```

---

## 5. AUTHENTICATION & AUTHORIZATION

### 5.1 Supabase Auth Configuration

**Authentication Methods:**
- Email + Password (staff accounts)
- Magic Link (customer portal access)

**JWT Token Structure:**
```json
{
  "aud": "authenticated",
  "exp": 1697500000,
  "sub": "user-uuid",
  "email": "aaron@example.com",
  "role": "authenticated",
  "app_metadata": {
    "provider": "email"
  },
  "user_metadata": {
    "full_name": "Aaron Smith",
    "role": "owner"
  }
}
```

**Session Management:**
- Access token expiration: 1 hour
- Refresh token expiration: 30 days
- Auto-refresh enabled

### 5.2 Auth Implementation (Frontend)

```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sign in
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Get current session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Listen for auth changes
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
```

**Protected Route Component:**
```javascript
// components/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function PrivateRoute() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
```

### 5.3 Authorization (RBAC)

**Role Definitions:**
```typescript
type UserRole = 'owner' | 'admin' | 'crew_lead' | 'crew_member' | 'office_staff';

interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

const rolePermissions: Record<UserRole, Permission[]> = {
  owner: [
    { resource: 'customers', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'jobs', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'invoices', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reports', actions: ['read'] },
    { resource: 'settings', actions: ['read', 'update'] },
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
  ],
  crew_lead: [
    { resource: 'customers', actions: ['read'] },
    { resource: 'jobs', actions: ['read', 'update'] },
    { resource: 'photos', actions: ['create', 'read'] },
  ],
  crew_member: [
    { resource: 'jobs', actions: ['read', 'update'] }, // Only own jobs
    { resource: 'photos', actions: ['create', 'read'] },
  ],
  // ... other roles
};
```

Customer portal access is enforced via RLS using `customers.portal_user_id`. Portal users are not granted staff roles.

**Permission Check Hook:**
```javascript
// hooks/usePermissions.js
export function usePermissions() {
  const { user } = useAuthStore();

  function canAccess(resource, action) {
    const permissions = rolePermissions[user.role];
    const permission = permissions.find(p => p.resource === resource);
    return permission?.actions.includes(action) ?? false;
  }

  return { canAccess };
}
```

---

## 6. DEPLOYMENT & DEVOPS

### 6.1 Development Environments

**Local Development:**
```bash
# Frontend
npm run dev              # Vite dev server on http://localhost:5173

# Supabase (Docker)
supabase start          # Local Supabase instance
supabase db reset       # Reset database
supabase db push        # Push migrations

# Environment Variables (.env.local)
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_KEY
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_KEY
```

**Staging Environment:**
```
Frontend: https://staging.aaronscare.com (Vercel)
Backend: Supabase staging project
Database: PostgreSQL (Supabase staging)
```

**Production Environment:**
```
Frontend: https://app.aaronscare.com (Vercel)
Backend: Supabase production project
Database: PostgreSQL (Supabase production)
```

### 6.2 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

### 6.3 Monitoring & Logging

**Application Performance Monitoring:**
- **Tool:** Sentry
- **Configuration:**
```javascript
// main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**Database Monitoring:**
- Supabase Dashboard (built-in)
- Query performance tracking
- Connection pool monitoring

**Uptime Monitoring:**
- **Tool:** UptimeRobot
- Check interval: 5 minutes
- Alert channels: Email, SMS

**Log Aggregation:**
- Supabase Logs (Edge Functions)
- Vercel Logs (Frontend)
- Centralized in Supabase Dashboard

---

## 7. TESTING STRATEGY

### 7.1 Unit Testing

**Framework:** Vitest

```javascript
// services/customerService.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { createCustomer, getCustomers } from './customerService';

describe('Customer Service', () => {
  it('should create a new customer', async () => {
    const customer = {
      first_name: 'John',
      last_name: 'Smith',
      phone: '502-555-1234',
      email: 'john@example.com',
    };

    const result = await createCustomer(customer);
    expect(result.id).toBeDefined();
    expect(result.first_name).toBe('John');
  });

  it('should fetch all customers', async () => {
    const customers = await getCustomers();
    expect(Array.isArray(customers)).toBe(true);
  });
});
```

### 7.2 Integration Testing

**Framework:** Playwright

```javascript
// tests/e2e/schedule-job.spec.js
import { test, expect } from '@playwright/test';

test('schedule a new job', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'aaron@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Navigate to schedule
  await page.goto('/schedule');
  await expect(page).toHaveURL('/schedule');

  // Click "Add Job"
  await page.click('button:has-text("Add Job")');

  // Fill form
  await page.fill('[name="title"]', 'Lawn Mowing');
  await page.selectOption('[name="customer_id"]', { label: 'John Smith' });
  await page.fill('[name="scheduled_start_at"]', '2025-10-20T09:00');

  // Submit
  await page.click('button:has-text("Save")');

  // Verify
  await expect(page.locator('text=Lawn Mowing')).toBeVisible();
});
```

### 7.3 Performance Testing

**Tool:** Lighthouse CI

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:5173/'],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
  },
};
```

---

## 8. SECURITY IMPLEMENTATION

### 8.1 API Security

**Rate Limiting:**
```javascript
// Implement via Supabase Edge Functions
const rateLimits = new Map();

function rateLimit(ip, limit = 100, window = 900000) { // 100 requests per 15 min
  const now = Date.now();
  const requests = rateLimits.get(ip) || [];
  
  // Remove old requests
  const recentRequests = requests.filter(time => now - time < window);
  
  if (recentRequests.length >= limit) {
    throw new Error('Rate limit exceeded');
  }
  
  recentRequests.push(now);
  rateLimits.set(ip, recentRequests);
}
```

**Input Validation:**
```javascript
// Using Zod
import { z } from 'zod';

const customerSchema = z.object({
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/),
});

function validateCustomer(data) {
  return customerSchema.parse(data);
}
```

### 8.2 Photo Upload Security

```javascript
// services/photoService.js
export async function uploadPhoto(file, jobId) {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large');
  }

  // Compress image
  const compressed = await compressImage(file, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
  });

  // Generate unique filename
  const filename = `${jobId}/${Date.now()}-${crypto.randomUUID()}.webp`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('job-photos')
    .upload(filename, compressed);

  if (error) throw error;

  // Create database record
  await supabase.from('job_photos').insert({
    job_id: jobId,
    storage_path: data.path,
    file_size: compressed.size,
  });

  return data;
}
```

---

## 9. PERFORMANCE OPTIMIZATION

### 9.1 Code Splitting

```javascript
// Lazy load routes
import { lazy, Suspense } from 'react';

const Customers = lazy(() => import('./pages/Customers'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Invoices = lazy(() => import('./pages/Invoices'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/customers" element={<Customers />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/invoices" element={<Invoices />} />
      </Routes>
    </Suspense>
  );
}
```

### 9.2 Image Optimization

```javascript
// Automatic WebP conversion and compression
import imageCompression from 'browser-image-compression';

async function compressImage(file, options = {}) {
  const defaultOptions = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp',
  };

  return await imageCompression(file, { ...defaultOptions, ...options });
}
```

### 9.3 Database Query Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_jobs_start_status ON jobs(scheduled_start_at, status);
CREATE INDEX idx_invoices_customer_status ON invoices(customer_id, status);
CREATE INDEX idx_customers_search ON customers USING gin(to_tsvector('english', first_name || ' ' || last_name));

-- Materialized view for dashboard stats
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT
  COUNT(*) FILTER (WHERE (scheduled_start_at AT TIME ZONE 'America/New_York')::date = CURRENT_DATE) as jobs_today,
  COUNT(*) FILTER (WHERE status = 'completed' AND (scheduled_start_at AT TIME ZONE 'America/New_York')::date = CURRENT_DATE) as completed_today,
  SUM(total_amount) FILTER (WHERE status = 'paid' AND paid_date = CURRENT_DATE) as revenue_today,
  COUNT(*) FILTER (WHERE status IN ('sent', 'overdue')) as outstanding_invoices
FROM jobs
LEFT JOIN invoices ON invoices.job_id = jobs.id;

-- Refresh every 5 minutes via cron job
```

---

## 10. APPENDIX

### 10.1 Environment Variables

```bash
# Frontend (.env.production)
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_PUBLISHABLE_KEY
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_KEY
VITE_SENTRY_DSN=YOUR_SENTRY_DSN

# Backend (Supabase Edge Functions Secrets)
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER=YOUR_TWILIO_PHONE_NUMBER
SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY
SENDGRID_FROM_EMAIL=YOUR_SENDGRID_FROM_EMAIL
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_KEY
```

### 10.2 Database Backup Scripts

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
PROJECT_ID="[your-project-id]"

# Backup using Supabase CLI
supabase db dump --project-id $PROJECT_ID > $BACKUP_DIR/backup_$DATE.sql

# Compress
gzip $BACKUP_DIR/backup_$DATE.sql

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://aarons-lawn-care-backups/

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

### 10.3 Migration Scripts

```sql
-- migrations/001_initial_schema.sql
-- Run with: supabase db push

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create tables (see section 3.2 for full schema)
CREATE TABLE users (...);
CREATE TABLE customers (...);
-- ... etc

-- Create functions and triggers
CREATE FUNCTION update_updated_at_column() ...;
-- ... etc

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own customers" ON customers ...;
-- ... etc
```

### 10.4 Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Supabase Edge Functions deployed
- [ ] Stripe webhooks configured
- [ ] DNS records updated
- [ ] SSL certificates valid
- [ ] Monitoring configured
- [ ] Backup systems tested

**Post-Deployment:**
- [ ] Smoke tests passed
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] Payment processing tested
- [ ] Notifications sending
- [ ] Performance metrics acceptable
- [ ] Error tracking active

---

**End of Technical Specification Document**

*This technical specification should be used in conjunction with the Product Requirements Document. Version history maintained in Git repository.*

**Technical Lead Approval:** [Name]  
**Date:** ___________

**DevOps Engineer Approval:** [Name]  
**Date:** ___________
