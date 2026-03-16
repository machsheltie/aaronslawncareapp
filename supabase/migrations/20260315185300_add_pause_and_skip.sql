-- Add pause fields to recurring_schedules
ALTER TABLE recurring_schedules ADD COLUMN paused_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE recurring_schedules ADD COLUMN pause_reason TEXT;

-- Skip dates table - stores specific dates to skip
CREATE TABLE schedule_skips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recurring_schedule_id UUID NOT NULL REFERENCES recurring_schedules(id) ON DELETE CASCADE,
  skip_date DATE NOT NULL,
  reason TEXT,
  UNIQUE(recurring_schedule_id, skip_date)
);

CREATE INDEX idx_schedule_skips_schedule ON schedule_skips(recurring_schedule_id);
CREATE INDEX idx_schedule_skips_date ON schedule_skips(skip_date);

-- RLS
ALTER TABLE schedule_skips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business admins have full access to schedule skips"
  ON schedule_skips FOR ALL USING (true) WITH CHECK (true);
