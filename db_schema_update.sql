-- Create loan_requests table
CREATE TABLE loan_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  loan_type TEXT CHECK (loan_type IN ('ST', 'LT')),
  requested_amount NUMERIC NOT NULL,
  approved_amount NUMERIC DEFAULT 0,
  approved_rate NUMERIC, -- Interest rate (e.g., 10.0 for 10%)
  approved_term INTEGER, -- Term in years
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'partial', 'denied')),
  UNIQUE (game_id, firm_id, round, loan_type)
);

-- Note: Run this in the Supabase Dashboard SQL Editor

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) FOR ALL TABLES
-- Required for Supabase projects to function correctly when "Published"
-- ============================================================================

-- 1. games table
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select games" ON games FOR SELECT USING (true);
CREATE POLICY "Allow public insert games" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update games" ON games FOR UPDATE USING (true);
CREATE POLICY "Allow public delete games" ON games FOR DELETE USING (true);

-- 2. firms table
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE firms ADD COLUMN IF NOT EXISTS students TEXT;
CREATE POLICY "Allow public select firms" ON firms FOR SELECT USING (true);
CREATE POLICY "Allow public insert firms" ON firms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update firms" ON firms FOR UPDATE USING (true);
CREATE POLICY "Allow public delete firms" ON firms FOR DELETE USING (true);

-- 3. decisions table
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select decisions" ON decisions FOR SELECT USING (true);
CREATE POLICY "Allow public insert decisions" ON decisions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update decisions" ON decisions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete decisions" ON decisions FOR DELETE USING (true);

-- 4. firm_state table
ALTER TABLE firm_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select firm_state" ON firm_state FOR SELECT USING (true);
CREATE POLICY "Allow public insert firm_state" ON firm_state FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update firm_state" ON firm_state FOR UPDATE USING (true);
CREATE POLICY "Allow public delete firm_state" ON firm_state FOR DELETE USING (true);

-- 5. market_data table
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select market_data" ON market_data FOR SELECT USING (true);
CREATE POLICY "Allow public insert market_data" ON market_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update market_data" ON market_data FOR UPDATE USING (true);
CREATE POLICY "Allow public delete market_data" ON market_data FOR DELETE USING (true);

-- 6. loan_requests table
ALTER TABLE loan_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select loan_requests" ON loan_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert loan_requests" ON loan_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update loan_requests" ON loan_requests FOR UPDATE USING (true);
CREATE POLICY "Allow public delete loan_requests" ON loan_requests FOR DELETE USING (true);