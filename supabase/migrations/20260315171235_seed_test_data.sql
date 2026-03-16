-- Seed test customers
INSERT INTO customers (name, email, phone, property_address, property_city, property_state, property_zip, property_size, notes)
VALUES
  ('John Doe', 'john@example.com', '502-555-0100', '123 Main St', 'Louisville', 'KY', '40202', 'medium', 'Regular weekly mowing customer'),
  ('Jane Smith', 'jane@example.com', '502-555-0101', '456 Oak Ave', 'Louisville', 'KY', '40203', 'large', 'Prefers service before 10am'),
  ('Bob Johnson', 'bob@example.com', '502-555-0102', '789 Elm Dr', 'Louisville', 'KY', '40204', 'small', 'New customer - referred by Jane');

-- Seed test jobs
INSERT INTO jobs (customer_id, service_type, scheduled_date, scheduled_time_start, estimated_price, status, notes)
VALUES
  ((SELECT id FROM customers WHERE name = 'John Doe'), 'mowing', CURRENT_DATE + INTERVAL '1 day', '09:00', 50.00, 'scheduled', 'Weekly mowing'),
  ((SELECT id FROM customers WHERE name = 'John Doe'), 'edging', CURRENT_DATE + INTERVAL '1 day', '09:30', 25.00, 'scheduled', 'Add edging to mowing visit'),
  ((SELECT id FROM customers WHERE name = 'Jane Smith'), 'landscaping', CURRENT_DATE + INTERVAL '2 days', '08:00', 350.00, 'scheduled', 'Front yard redesign - phase 1'),
  ((SELECT id FROM customers WHERE name = 'Jane Smith'), 'hedge_trimming', CURRENT_DATE + INTERVAL '3 days', '10:00', 75.00, 'scheduled', 'Trim hedges along driveway'),
  ((SELECT id FROM customers WHERE name = 'Bob Johnson'), 'mowing', CURRENT_DATE + INTERVAL '2 days', '11:00', 40.00, 'scheduled', 'First mow - assess property');
