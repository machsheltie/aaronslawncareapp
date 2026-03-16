# Supabase Setup Guide - Aaron's Lawn Care

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign in with GitHub (or create account)
3. Click "New Project"
4. Fill in:
   - **Name**: `aarons-lawn-care`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to Louisville, KY (US East recommended)
   - **Pricing Plan**: Free tier (sufficient for your needs!)
5. Wait 2-3 minutes for project creation

## Step 2: Get Environment Variables

Once project is created:

1. Go to Project Settings (gear icon) → API
2. Copy these values to your `.env` file:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **NEVER commit service_role_key to git!** (Only use in Supabase Edge Functions)

## Step 3: Enable PostGIS Extension

For GPS/routing features:

1. Go to Database → Extensions
2. Search for "postgis"
3. Click "Enable" on PostGIS extension

## Step 4: Create Database Schema

Go to SQL Editor and run this schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Basic Info
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,

  -- Property Address
  property_address TEXT NOT NULL,
  property_city TEXT DEFAULT 'Louisville',
  property_state TEXT DEFAULT 'KY',
  property_zip TEXT,
  property_size TEXT CHECK (property_size IN ('small', 'medium', 'large', 'not_sure')),

  -- Property GPS (for route optimization)
  property_location GEOGRAPHY(POINT, 4326),

  -- Customer Portal Access
  auth_user_id UUID, -- Links to auth.users for customer portal login

  -- Metadata
  notes TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Index for performance
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_auth_user ON customers(auth_user_id);
CREATE INDEX idx_customers_active ON customers(is_active) WHERE is_active = true;
CREATE INDEX idx_customers_location ON customers USING GIST(property_location);

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Customer Relationship
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Job Details
  service_type TEXT NOT NULL CHECK (service_type IN (
    'mowing', 'edging', 'leaf_removal', 'aeration',
    'landscaping', 'garden_bed_design', 'hedge_trimming',
    'tree_removal', 'tilling', 'snow_removal'
  )),

  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time_start TIME,
  scheduled_time_end TIME,
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,

  -- Status Workflow
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'in_progress', 'completed', 'cancelled'
  )),

  -- Pricing
  estimated_price DECIMAL(10, 2),
  actual_price DECIMAL(10, 2),

  -- Job Notes
  notes TEXT,
  customer_instructions TEXT,
  completion_notes TEXT,

  -- Offline Sync
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN (
    'pending', 'syncing', 'synced', 'error'
  )),
  last_sync_attempt TIMESTAMP WITH TIME ZONE,

  -- Metadata
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_jobs_customer ON jobs(customer_id);
CREATE INDEX idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_sync_status ON jobs(sync_status) WHERE sync_status != 'synced';

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Relationships
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,

  -- Invoice Details
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,

  -- Amounts
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,

  -- Payment
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN (
    'unpaid', 'processing', 'paid', 'failed', 'refunded'
  )),
  payment_method TEXT CHECK (payment_method IN (
    'ach', 'credit_card', 'cash', 'check'
  )),

  -- Stripe Integration
  stripe_payment_intent_id TEXT,
  stripe_payment_status TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,

  -- Notes
  notes TEXT,

  -- Metadata
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_job ON invoices(job_id);
CREATE INDEX idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX idx_invoices_stripe_payment_intent ON invoices(stripe_payment_intent_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);

-- ============================================
-- PHOTOS TABLE
-- ============================================
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Relationships
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- Photo Details
  photo_type TEXT NOT NULL CHECK (photo_type IN ('before', 'after', 'progress')),
  storage_path TEXT NOT NULL, -- Supabase Storage path
  thumbnail_path TEXT, -- Compressed thumbnail

  -- Metadata
  file_size INTEGER, -- bytes
  mime_type TEXT,
  width INTEGER,
  height INTEGER,

  -- Customer Delivery
  sent_to_customer BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_photos_job ON photos(job_id);
CREATE INDEX idx_photos_type ON photos(photo_type);

-- ============================================
-- OFFLINE QUEUE TABLE (for sync tracking)
-- ============================================
CREATE TABLE offline_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Queue Item
  action_type TEXT NOT NULL CHECK (action_type IN (
    'CREATE_JOB', 'UPDATE_JOB', 'DELETE_JOB',
    'CREATE_CUSTOMER', 'UPDATE_CUSTOMER',
    'UPLOAD_PHOTO', 'CREATE_INVOICE'
  )),
  payload JSONB NOT NULL,

  -- Retry Logic
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_error TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed'
  )),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Index
CREATE INDEX idx_offline_queue_status ON offline_queue(status) WHERE status = 'pending';

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_queue ENABLE ROW LEVEL SECURITY;

-- Business Admin Policies (Aaron + Heirr have full access)
-- NOTE: For now, all authenticated users are business admins (only 2 users)
-- Later, you can add role-based checks

CREATE POLICY "Business admins have full access to customers"
  ON customers FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Business admins have full access to jobs"
  ON jobs FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Business admins have full access to invoices"
  ON invoices FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Business admins have full access to photos"
  ON photos FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Business admins have full access to offline queue"
  ON offline_queue FOR ALL
  USING (true)
  WITH CHECK (true);

-- Customer Portal Policies (read-only for their own data)
-- NOTE: Customers can only see their own jobs, invoices, and photos
-- You'll implement this after setting up customer portal authentication

CREATE POLICY "Customers can view their own profile"
  ON customers FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Customers can view their own jobs"
  ON jobs FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can view their own invoices"
  ON invoices FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can view photos from their jobs"
  ON photos FOR SELECT
  USING (
    job_id IN (
      SELECT j.id FROM jobs j
      JOIN customers c ON c.id = j.customer_id
      WHERE c.auth_user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-photos', 'job-photos', false);

-- Storage policies for job photos
CREATE POLICY "Business admins can upload job photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'job-photos');

CREATE POLICY "Business admins can read job photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'job-photos');

CREATE POLICY "Customers can view photos from their jobs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'job-photos'
    AND auth.uid() IN (
      SELECT c.auth_user_id FROM customers c
      JOIN jobs j ON j.customer_id = c.id
      JOIN photos p ON p.job_id = j.id
      WHERE storage.objects.name LIKE '%' || p.id::text || '%'
    )
  );
```

## Step 5: Generate TypeScript Types

After creating the schema, generate types:

```bash
# Install Supabase CLI
npm install -D supabase

# Login to Supabase
npx supabase login

# Generate types (replace PROJECT_REF with your project reference)
npx supabase gen types typescript --project-id <YOUR_PROJECT_REF> > src/types/supabase.ts
```

Get PROJECT_REF from: Settings → General → Reference ID

## Step 6: Test Connection

Create a test file:

```typescript
// src/lib/testSupabase.ts
import { supabase } from './supabase'

export async function testConnection() {
  const { data, error } = await supabase
    .from('customers')
    .select('count')
    .single()

  if (error) {
    console.error('Supabase connection failed:', error)
    return false
  }

  console.log('✅ Supabase connected successfully!')
  return true
}
```

## Step 7: Add Sample Data (Optional)

```sql
-- Insert test customer
INSERT INTO customers (name, email, phone, property_address, property_size)
VALUES
  ('John Doe', 'john@example.com', '502-555-0100', '123 Main St, Louisville, KY 40202', 'medium'),
  ('Jane Smith', 'jane@example.com', '502-555-0101', '456 Oak Ave, Louisville, KY 40203', 'large');

-- Insert test job
INSERT INTO jobs (customer_id, service_type, scheduled_date, estimated_price, status)
VALUES (
  (SELECT id FROM customers WHERE name = 'John Doe'),
  'mowing',
  CURRENT_DATE + INTERVAL '1 day',
  50.00,
  'scheduled'
);
```

## Step 8: Set Up Authentication

1. Go to Authentication → Providers
2. Enable Email provider (for business admins)
3. Add Aaron and your email as users:
   - Authentication → Users → Add User
   - Email: aaron@example.com (use real email)
   - Password: (generate strong password)
   - Auto Confirm: Yes

## Next Steps

- [ ] Create .env file with Supabase credentials
- [ ] Generate TypeScript types
- [ ] Test connection
- [ ] Build authentication UI
- [ ] Implement customer CRUD operations

## Troubleshooting

**Issue: "relation does not exist"**
- Make sure you ran the schema SQL in SQL Editor
- Check you're querying the correct table name

**Issue: "permission denied for table"**
- Check RLS policies are created
- Verify you're authenticated
- For testing, you can temporarily disable RLS (not recommended for production)

**Issue: Types generation fails**
- Make sure Supabase CLI is logged in: `npx supabase login`
- Check project reference ID is correct
- Try running with `--debug` flag

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
