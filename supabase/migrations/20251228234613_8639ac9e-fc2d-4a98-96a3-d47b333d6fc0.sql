-- =====================================================
-- CREATE ADDITIONAL MISSING TABLES
-- =====================================================

-- Farm positions table
CREATE TABLE IF NOT EXISTS public.farm_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id TEXT NOT NULL,
  farm_name TEXT NOT NULL,
  token TEXT NOT NULL,
  staked_amount NUMERIC NOT NULL DEFAULT 0,
  rewards_earned NUMERIC NOT NULL DEFAULT 0,
  apy NUMERIC NOT NULL DEFAULT 0,
  lock_period INTEGER NOT NULL DEFAULT 0,
  unlock_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.farm_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own farm positions"
ON public.farm_positions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own farm positions"
ON public.farm_positions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farm positions"
ON public.farm_positions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farm positions"
ON public.farm_positions FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all farm positions"
ON public.farm_positions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Farm transactions table
CREATE TABLE IF NOT EXISTS public.farm_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id TEXT NOT NULL,
  farm_name TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  tx_signature TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.farm_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own farm transactions"
ON public.farm_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own farm transactions"
ON public.farm_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all farm transactions"
ON public.farm_transactions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));