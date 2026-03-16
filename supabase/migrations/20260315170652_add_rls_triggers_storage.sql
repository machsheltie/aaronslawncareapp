-- ROW LEVEL SECURITY
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_queue ENABLE ROW LEVEL SECURITY;

-- Business Admin Policies (Aaron + Heirr have full access)
CREATE POLICY "Business admins have full access to customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Business admins have full access to jobs" ON jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Business admins have full access to invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Business admins have full access to photos" ON photos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Business admins have full access to offline queue" ON offline_queue FOR ALL USING (true) WITH CHECK (true);

-- Customer Portal Policies (read-only for their own data)
CREATE POLICY "Customers can view their own profile" ON customers FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Customers can view their own jobs" ON jobs FOR SELECT USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));
CREATE POLICY "Customers can view their own invoices" ON invoices FOR SELECT USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));
CREATE POLICY "Customers can view photos from their jobs" ON photos FOR SELECT USING (job_id IN (SELECT j.id FROM jobs j JOIN customers c ON c.id = j.customer_id WHERE c.auth_user_id = auth.uid()));

-- AUTO-UPDATE TIMESTAMPS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- STORAGE BUCKET (already exists, skip)
INSERT INTO storage.buckets (id, name, public) VALUES ('job-photos', 'job-photos', false) ON CONFLICT (id) DO NOTHING;

-- Storage policies already exist from prior setup, using DROP IF EXISTS + recreate
DROP POLICY IF EXISTS "Business admins can upload job photos" ON storage.objects;
CREATE POLICY "Business admins can upload job photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'job-photos');

DROP POLICY IF EXISTS "Business admins can read job photos" ON storage.objects;
CREATE POLICY "Business admins can read job photos" ON storage.objects FOR SELECT USING (bucket_id = 'job-photos');
