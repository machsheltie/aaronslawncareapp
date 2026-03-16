-- RECURRING SCHEDULES TABLE
CREATE TABLE recurring_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Customer & Service
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN (
    'mowing', 'edging', 'leaf_removal', 'aeration',
    'landscaping', 'garden_bed_design', 'hedge_trimming',
    'tree_removal', 'tilling', 'snow_removal'
  )),

  -- Schedule Pattern
  frequency TEXT NOT NULL CHECK (frequency IN ('one_time', 'weekly', 'biweekly', 'monthly')),
  start_date DATE NOT NULL,
  preferred_time TIME,
  end_date DATE, -- NULL means ongoing

  -- Job Template
  estimated_price DECIMAL(10, 2),
  notes TEXT,
  customer_instructions TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Track how far ahead we've generated
  last_generated_date DATE
);

CREATE INDEX idx_recurring_customer ON recurring_schedules(customer_id);
CREATE INDEX idx_recurring_active ON recurring_schedules(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE recurring_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business admins have full access to recurring schedules"
  ON recurring_schedules FOR ALL USING (true) WITH CHECK (true);

-- Auto-update timestamp trigger
CREATE TRIGGER update_recurring_schedules_updated_at
  BEFORE UPDATE ON recurring_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Link jobs back to recurring schedule
ALTER TABLE jobs ADD COLUMN recurring_schedule_id UUID REFERENCES recurring_schedules(id) ON DELETE SET NULL;
CREATE INDEX idx_jobs_recurring ON jobs(recurring_schedule_id);
