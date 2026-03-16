-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  property_address TEXT NOT NULL,
  property_city TEXT DEFAULT 'Louisville',
  property_state TEXT DEFAULT 'KY',
  property_zip TEXT,
  property_size TEXT CHECK (property_size IN ('small', 'medium', 'large', 'not_sure')),
  property_location GEOGRAPHY(POINT, 4326),
  auth_user_id UUID,
  notes TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_auth_user ON customers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_customers_location ON customers USING GIST(property_location);

-- JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN (
    'mowing', 'edging', 'leaf_removal', 'aeration',
    'landscaping', 'garden_bed_design', 'hedge_trimming',
    'tree_removal', 'tilling', 'snow_removal'
  )),
  scheduled_date DATE NOT NULL,
  scheduled_time_start TIME,
  scheduled_time_end TIME,
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'in_progress', 'completed', 'cancelled'
  )),
  estimated_price DECIMAL(10, 2),
  actual_price DECIMAL(10, 2),
  notes TEXT,
  customer_instructions TEXT,
  completion_notes TEXT,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN (
    'pending', 'syncing', 'synced', 'error'
  )),
  last_sync_attempt TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_jobs_customer ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_sync_status ON jobs(sync_status) WHERE sync_status != 'synced';

-- INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN (
    'unpaid', 'processing', 'paid', 'failed', 'refunded'
  )),
  payment_method TEXT CHECK (payment_method IN ('ach', 'credit_card', 'cash', 'check')),
  stripe_payment_intent_id TEXT,
  stripe_payment_status TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job ON invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_payment_intent ON invoices(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- PHOTOS TABLE
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('before', 'after', 'progress')),
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  sent_to_customer BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_photos_job ON photos(job_id);
CREATE INDEX IF NOT EXISTS idx_photos_type ON photos(photo_type);

-- OFFLINE QUEUE TABLE
CREATE TABLE IF NOT EXISTS offline_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action_type TEXT NOT NULL CHECK (action_type IN (
    'CREATE_JOB', 'UPDATE_JOB', 'DELETE_JOB',
    'CREATE_CUSTOMER', 'UPDATE_CUSTOMER',
    'UPLOAD_PHOTO', 'CREATE_INVOICE'
  )),
  payload JSONB NOT NULL,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_error TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed'
  )),
  processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_offline_queue_status ON offline_queue(status) WHERE status = 'pending';
