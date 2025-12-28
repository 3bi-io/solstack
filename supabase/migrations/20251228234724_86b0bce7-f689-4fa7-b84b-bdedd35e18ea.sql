-- =====================================================
-- CREATE REMAINING MISSING TABLES
-- =====================================================

-- Create price_alerts table
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_symbol TEXT NOT NULL,
  target_price NUMERIC NOT NULL,
  condition TEXT NOT NULL, -- 'above' or 'below'
  is_active BOOLEAN NOT NULL DEFAULT true,
  triggered_at TIMESTAMPTZ,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own price alerts"
ON public.price_alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own price alerts"
ON public.price_alerts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own price alerts"
ON public.price_alerts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price alerts"
ON public.price_alerts FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all price alerts"
ON public.price_alerts FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  type TEXT NOT NULL, -- 'swap', 'transfer', 'stake', etc.
  from_token TEXT,
  to_token TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  amount_usd NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending',
  tx_signature TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create tokens table
CREATE TABLE IF NOT EXISTS public.tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  mint_address TEXT UNIQUE,
  decimals INTEGER NOT NULL DEFAULT 9,
  total_supply NUMERIC,
  description TEXT,
  image_url TEXT,
  twitter TEXT,
  telegram TEXT,
  website TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tokens"
ON public.tokens FOR SELECT
USING (true);

CREATE POLICY "Users can create tokens"
ON public.tokens FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own tokens"
ON public.tokens FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all tokens"
ON public.tokens FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tokens"
ON public.tokens FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create yield_optimizer_settings table
CREATE TABLE IF NOT EXISTS public.yield_optimizer_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  min_apy_difference NUMERIC NOT NULL DEFAULT 2,
  max_gas_cost NUMERIC NOT NULL DEFAULT 0.01,
  check_interval_hours INTEGER NOT NULL DEFAULT 24,
  auto_compound_enabled BOOLEAN NOT NULL DEFAULT false,
  notification_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.yield_optimizer_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own yield optimizer settings"
ON public.yield_optimizer_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own yield optimizer settings"
ON public.yield_optimizer_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own yield optimizer settings"
ON public.yield_optimizer_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all yield optimizer settings"
ON public.yield_optimizer_settings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create yield_optimization_history table
CREATE TABLE IF NOT EXISTS public.yield_optimization_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_farm_id TEXT NOT NULL,
  from_farm_name TEXT NOT NULL,
  to_farm_id TEXT NOT NULL,
  to_farm_name TEXT NOT NULL,
  from_apy NUMERIC NOT NULL,
  to_apy NUMERIC NOT NULL,
  amount_moved NUMERIC NOT NULL,
  token TEXT NOT NULL,
  gas_cost NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  tx_signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.yield_optimization_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own yield optimization history"
ON public.yield_optimization_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own yield optimization history"
ON public.yield_optimization_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all yield optimization history"
ON public.yield_optimization_history FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));