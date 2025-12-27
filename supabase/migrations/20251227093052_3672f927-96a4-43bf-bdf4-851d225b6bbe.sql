-- Create portfolio_snapshots table for historical tracking
CREATE TABLE public.portfolio_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  total_value_usd NUMERIC NOT NULL DEFAULT 0,
  sol_balance NUMERIC NOT NULL DEFAULT 0,
  sol_price_usd NUMERIC NOT NULL DEFAULT 0,
  token_count INTEGER NOT NULL DEFAULT 0,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_wallet_date UNIQUE (user_id, wallet_address, snapshot_date)
);

-- Enable RLS
ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- Users can view their own snapshots
CREATE POLICY "Users can view their own snapshots"
ON public.portfolio_snapshots
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own snapshots
CREATE POLICY "Users can insert their own snapshots"
ON public.portfolio_snapshots
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own snapshots (for upsert)
CREATE POLICY "Users can update their own snapshots"
ON public.portfolio_snapshots
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_portfolio_snapshots_user_date 
ON public.portfolio_snapshots(user_id, snapshot_date DESC);

CREATE INDEX idx_portfolio_snapshots_wallet_date 
ON public.portfolio_snapshots(wallet_address, snapshot_date DESC);