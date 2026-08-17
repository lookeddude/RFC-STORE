-- RFC Store — Create invoices table
-- Invoice number auto-incremented via sequence (RFC-INV-YYYYMMDD-NNNNNN format)
-- invoice_data is an immutable JSONB snapshot frozen at first generation

-- Sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       uuid NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number text NOT NULL UNIQUE DEFAULT (
    'RFC-INV-' ||
    TO_CHAR(NOW() AT TIME ZONE 'Asia/Kolkata', 'YYYYMMDD') ||
    '-' ||
    LPAD(NEXTVAL('invoice_number_seq')::text, 6, '0')
  ),
  invoice_data   jsonb NOT NULL,
  issued_at      timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup by order_id
CREATE INDEX IF NOT EXISTS invoices_order_id_idx ON invoices(order_id);

-- RLS: admins can read all; customers can only read their own via order ownership
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "admins_all_invoices" ON invoices
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Customer can read their own invoice (via order ownership)
CREATE POLICY "customer_read_own_invoice" ON invoices
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = invoices.order_id
        AND orders.user_id = auth.uid()
    )
  );
