-- Remove overly permissive public access policies that expose user financial data

-- Drop public access policy on bridge_transactions
DROP POLICY IF EXISTS "Anyone can view transactions by wallet" ON bridge_transactions;

-- Drop public access policy on farm_transactions
DROP POLICY IF EXISTS "Anyone can view transactions by wallet" ON farm_transactions;

-- Drop public access policy on farm_positions
DROP POLICY IF EXISTS "Anyone can view positions by wallet" ON farm_positions;