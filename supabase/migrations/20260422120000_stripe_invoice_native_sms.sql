-- Stripe Invoice + native SMS auto-flow (replaces Twilio + Checkout Session flow)
-- IF EXISTS / IF NOT EXISTS guards handle schema drift between committed migrations and live DB.

ALTER TABLE invoices DROP COLUMN IF EXISTS stripe_checkout_url;
ALTER TABLE invoices DROP COLUMN IF EXISTS stripe_checkout_session_id;
ALTER TABLE invoices DROP COLUMN IF EXISTS sms_sent_at;

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stripe_invoice_url TEXT;

ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- UNIQUE constraint guards the Stripe Customer dedupe race (Decision 14).
-- NULLs are allowed multiple times; only non-null values must be unique.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customers_stripe_customer_id_key'
  ) THEN
    ALTER TABLE customers ADD CONSTRAINT customers_stripe_customer_id_key UNIQUE (stripe_customer_id);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
