-- =====================================================
-- FIX EXISTING TABLES AND CREATE REMAINING TABLES
-- =====================================================

-- Fix farm_positions - add missing columns
ALTER TABLE public.farm_positions 
  ADD COLUMN IF NOT EXISTS wallet_address TEXT,
  ADD COLUMN IF NOT EXISTS pending_rewards NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS staked_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS lock_end_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS auto_compound_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_compound_threshold NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_compound_at TIMESTAMPTZ;

-- Fix farm_transactions - add missing columns  
ALTER TABLE public.farm_transactions
  ADD COLUMN IF NOT EXISTS wallet_address TEXT,
  ADD COLUMN IF NOT EXISTS token TEXT,
  ADD COLUMN IF NOT EXISTS transaction_signature TEXT;

-- Rename tx_signature to transaction_signature if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farm_transactions' AND column_name = 'tx_signature' AND table_schema = 'public') THEN
    ALTER TABLE public.farm_transactions RENAME COLUMN tx_signature TO transaction_signature_old;
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Fix bridge_transactions - add missing columns
ALTER TABLE public.bridge_transactions
  ADD COLUMN IF NOT EXISTS wallet_address TEXT,
  ADD COLUMN IF NOT EXISTS transaction_signature TEXT;

-- Create portfolio_snapshots table
CREATE TABLE IF NOT EXISTS public.portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  total_value_usd NUMERIC NOT NULL DEFAULT 0,
  sol_balance NUMERIC NOT NULL DEFAULT 0,
  sol_price_usd NUMERIC NOT NULL DEFAULT 0,
  token_count INTEGER NOT NULL DEFAULT 0,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, wallet_address, snapshot_date)
);

ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own portfolio snapshots"
ON public.portfolio_snapshots FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolio snapshots"
ON public.portfolio_snapshots FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio snapshots"
ON public.portfolio_snapshots FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all portfolio snapshots"
ON public.portfolio_snapshots FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create portfolio_allocations table
CREATE TABLE IF NOT EXISTS public.portfolio_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  token_mint TEXT,
  target_percentage NUMERIC NOT NULL DEFAULT 0,
  deviation_threshold NUMERIC NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, wallet_address, token_symbol)
);

ALTER TABLE public.portfolio_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own portfolio allocations"
ON public.portfolio_allocations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolio allocations"
ON public.portfolio_allocations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio allocations"
ON public.portfolio_allocations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio allocations"
ON public.portfolio_allocations FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all portfolio allocations"
ON public.portfolio_allocations FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create rebalancing_history table
CREATE TABLE IF NOT EXISTS public.rebalancing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  rebalance_type TEXT NOT NULL,
  trades_executed INTEGER NOT NULL DEFAULT 0,
  total_value_usd NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rebalancing_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rebalancing history"
ON public.rebalancing_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rebalancing history"
ON public.rebalancing_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all rebalancing history"
ON public.rebalancing_history FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));