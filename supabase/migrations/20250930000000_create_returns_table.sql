-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create returns table
CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  return_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  reason TEXT NOT NULL,
  notes TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  refund_amount_cents INTEGER NOT NULL CHECK (refund_amount_cents >= 0),
  refund_status TEXT DEFAULT 'pending' CHECK (refund_status IN ('pending', 'processed', 'completed', 'failed')),
  refund_method TEXT CHECK (refund_method IN ('original', 'store_credit', 'other')),
  tracking_number TEXT,
  shipping_carrier TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_user_id ON returns(user_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);
CREATE INDEX IF NOT EXISTS idx_returns_return_number ON returns(return_number);
CREATE INDEX IF NOT EXISTS idx_returns_created_at ON returns(created_at);
CREATE INDEX IF NOT EXISTS idx_returns_refund_status ON returns(refund_status);

-- Create return_reasons table for standardized return reasons
CREATE TABLE IF NOT EXISTS return_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for return_reasons
CREATE INDEX IF NOT EXISTS idx_return_reasons_code ON return_reasons(code);
CREATE INDEX IF NOT EXISTS idx_return_reasons_is_active ON return_reasons(is_active);

-- Create return_statuses table for return status definitions
CREATE TABLE IF NOT EXISTS return_statuses (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- Create return_refund_statuses table for refund status definitions
CREATE TABLE IF NOT EXISTS return_refund_statuses (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- Create function to generate return numbers
CREATE OR REPLACE FUNCTION generate_return_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  done BOOLEAN := FALSE;
BEGIN
  WHILE NOT done LOOP
    new_number := 'RET-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    IF NOT EXISTS (SELECT 1 FROM returns WHERE return_number = new_number) THEN
      done := TRUE;
    END IF;
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at column
CREATE TRIGGER update_returns_updated_at
  BEFORE UPDATE ON returns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_refund_statuses ENABLE ROW LEVEL SECURITY;

-- Create policies for returns
-- Users can read their own returns
CREATE POLICY "Users can read own returns"
  ON returns FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create returns for their own orders
CREATE POLICY "Users can create returns for own orders"
  ON returns FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = returns.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Users can update their own returns when in pending status
CREATE POLICY "Users can update own pending returns"
  ON returns FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() 
    AND status = 'pending'
  );

-- Admin users can manage all returns
CREATE POLICY "Admin users can manage all returns"
  ON returns FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Return reasons are publicly readable
CREATE POLICY "Return reasons are publicly readable"
  ON return_reasons FOR SELECT
  TO PUBLIC
  USING (is_active = TRUE);

-- Return statuses are publicly readable
CREATE POLICY "Return statuses are publicly readable"
  ON return_statuses FOR SELECT
  TO PUBLIC
  USING (is_active = TRUE);

-- Return refund statuses are publicly readable
CREATE POLICY "Return refund statuses are publicly readable"
  ON return_refund_statuses FOR SELECT
  TO PUBLIC
  USING (is_active = TRUE);

-- Create a view to get detailed return information
CREATE OR REPLACE VIEW return_details AS
SELECT 
  r.*,
  o.order_number,
  p.name AS product_name,
  p.sku AS product_sku,
  u.email AS user_email,
  CONCAT(
    COALESCE(o.shipping_address->>'first_name', ''), 
    ' ', 
    COALESCE(o.shipping_address->>'last_name', '')
  ) AS customer_name
FROM returns r
LEFT JOIN orders o ON r.order_id = o.id
LEFT JOIN products p ON r.product_id = p.id
LEFT JOIN auth.users u ON r.user_id = u.id;

-- Insert standard return reasons
INSERT INTO return_reasons (code, name, description, sort_order) VALUES
  ('defective', 'Defective Product', 'The product is damaged or not working properly', 1),
  ('not_as_described', 'Not as Described', 'The product does not match its description', 2),
  ('wrong_item', 'Wrong Item Received', 'You received a different item than ordered', 3),
  ('changed_mind', 'Changed Mind', 'You changed your mind about the purchase', 4),
  ('duplicate', 'Duplicate Order', 'You accidentally ordered the same item twice', 5),
  (' arrived_late', 'Arrived Late', 'The product arrived after the promised delivery date', 6)
ON CONFLICT (code) DO NOTHING;

-- Insert standard return statuses
INSERT INTO return_statuses (code, name, description, color, sort_order) VALUES
  ('pending', 'Pending', 'Return request is awaiting approval', 'yellow', 1),
  ('approved', 'Approved', 'Return request has been approved', 'blue', 2),
  ('rejected', 'Rejected', 'Return request has been rejected', 'red', 3),
  ('completed', 'Completed', 'Return process is completed', 'green', 4)
ON CONFLICT (code) DO NOTHING;

-- Insert standard refund statuses
INSERT INTO return_refund_statuses (code, name, description, color, sort_order) VALUES
  ('pending', 'Pending', 'Refund is awaiting processing', 'yellow', 1),
  ('processed', 'Processed', 'Refund has been processed', 'blue', 2),
  ('completed', 'Completed', 'Refund has been completed', 'green', 3),
  ('failed', 'Failed', 'Refund processing failed', 'red', 4)
ON CONFLICT (code) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON returns TO authenticated;
GRANT ALL ON return_reasons TO authenticated;
GRANT ALL ON return_statuses TO authenticated;
GRANT ALL ON return_refund_statuses TO authenticated;
GRANT ALL ON return_details TO authenticated;

-- Create function to automatically approve returns after a certain period
-- This is just an example and would need to be scheduled to run periodically
CREATE OR REPLACE FUNCTION auto_approve_returns()
RETURNS VOID AS $$
BEGIN
  UPDATE returns
  SET 
    status = 'approved',
    approved_at = NOW(),
    updated_at = NOW()
  WHERE 
    status = 'pending' 
    AND requested_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;