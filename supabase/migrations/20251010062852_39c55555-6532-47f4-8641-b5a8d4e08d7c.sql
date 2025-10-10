-- Add admin view policy for market_analysis table
CREATE POLICY "Admins can view all market analysis"
ON market_analysis
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin view policy for tokens table  
CREATE POLICY "Public can view active tokens"
ON tokens
FOR SELECT
USING (status = 'completed');

-- Improve wallet_connections policies for better admin access
DROP POLICY IF EXISTS "Admins can view all wallet connections" ON wallet_connections;
CREATE POLICY "Admins can view all wallet connections"
ON wallet_connections
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Add admin update policy for tokens
CREATE POLICY "Admins can update any token"
ON tokens
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin delete policies where needed
CREATE POLICY "Admins can delete tokens"
ON tokens
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));