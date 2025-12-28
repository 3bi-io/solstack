-- =====================================================
-- CREATE FINAL MISSING TABLES & ADD MISSING COLUMNS
-- =====================================================

-- Create wallet_connections table
CREATE TABLE IF NOT EXISTS public.wallet_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id TEXT NOT NULL,
  telegram_username TEXT,
  telegram_first_name TEXT,
  wallet_address TEXT NOT NULL,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all wallet connections"
ON public.wallet_connections FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update wallet connections"
ON public.wallet_connections FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete wallet connections"
ON public.wallet_connections FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert wallet connections"
ON public.wallet_connections FOR INSERT
WITH CHECK (true);

-- Add missing columns to activity_logs
ALTER TABLE public.activity_logs
  ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'info',
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}';

-- Add missing columns to yield_optimizer_settings
ALTER TABLE public.yield_optimizer_settings
  ADD COLUMN IF NOT EXISTS risk_tolerance TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS last_optimization_at TIMESTAMPTZ;

-- Add missing columns to yield_optimization_history
ALTER TABLE public.yield_optimization_history
  ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS old_apy NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS new_apy NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS apy_gain NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS transaction_signature TEXT;

-- Add missing columns to transactions
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS token TEXT,
  ADD COLUMN IF NOT EXISTS signature TEXT,
  ADD COLUMN IF NOT EXISTS recipient TEXT;