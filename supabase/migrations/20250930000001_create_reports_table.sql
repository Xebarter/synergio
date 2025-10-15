-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  type TEXT DEFAULT 'manual' CHECK (type IN ('manual', 'automated', 'scheduled')),
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  format TEXT DEFAULT 'pdf' CHECK (format IN ('pdf', 'excel', 'csv', 'json')),
  file_path TEXT,
  file_size_bytes INTEGER,
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  parameters JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_frequency ON reports(frequency);
CREATE INDEX IF NOT EXISTS idx_reports_generated_by ON reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON reports(generated_at);
CREATE INDEX IF NOT EXISTS idx_reports_is_active ON reports(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at column
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policies for reports
-- Admin users can manage all reports
CREATE POLICY "Admin users can manage all reports"
  ON reports FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Authenticated users can view reports
CREATE POLICY "Authenticated users can view reports"
  ON reports FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- Create a view to get detailed report information
CREATE OR REPLACE VIEW report_details AS
SELECT 
  r.*,
  u.email AS generated_by_email,
  u.raw_user_meta_data->>'full_name' AS generated_by_name
FROM reports r
LEFT JOIN auth.users u ON r.generated_by = u.id;

-- Insert sample report templates
INSERT INTO reports (id, name, description, category, type, frequency) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Sales Report', 'Detailed sales performance report', 'Sales', 'automated', 'daily'),
  ('10000000-0000-0000-0000-000000000002', 'Inventory Report', 'Current inventory levels and stock status', 'Inventory', 'automated', 'weekly'),
  ('10000000-0000-0000-0000-000000000003', 'Customer Report', 'Customer demographics and behavior analysis', 'Customers', 'automated', 'monthly'),
  ('10000000-0000-0000-0000-000000000004', 'Financial Report', 'Revenue, expenses, and profit analysis', 'Finance', 'automated', 'monthly'),
  ('10000000-0000-0000-0000-000000000005', 'Product Performance', 'Top selling products and categories', 'Sales', 'automated', 'daily'),
  ('10000000-0000-0000-0000-000000000006', 'Order Status Report', 'Order fulfillment and shipping status', 'Operations', 'automated', 'daily')
ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON reports TO authenticated;
GRANT ALL ON report_details TO authenticated;