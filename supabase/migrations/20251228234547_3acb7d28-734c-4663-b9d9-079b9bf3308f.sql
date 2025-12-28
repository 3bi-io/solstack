-- =====================================================
-- PHASE 3: CREATE MISSING DATABASE TABLES
-- =====================================================

-- 3.1 Create bundles table
CREATE TABLE IF NOT EXISTS public.bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bundle_name TEXT NOT NULL,
  total_wallets INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  distribution_strategy TEXT NOT NULL DEFAULT 'equal',
  token_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bundles"
ON public.bundles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bundles"
ON public.bundles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bundles"
ON public.bundles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bundles"
ON public.bundles FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bundles"
ON public.bundles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 3.2 Create bundle_wallets table
CREATE TABLE IF NOT EXISTS public.bundle_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  tx_signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bundle_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view wallets in their bundles"
ON public.bundle_wallets FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.bundles b
  WHERE b.id = bundle_wallets.bundle_id AND b.user_id = auth.uid()
));

CREATE POLICY "Users can create wallets in their bundles"
ON public.bundle_wallets FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.bundles b
  WHERE b.id = bundle_wallets.bundle_id AND b.user_id = auth.uid()
));

CREATE POLICY "Users can update wallets in their bundles"
ON public.bundle_wallets FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.bundles b
  WHERE b.id = bundle_wallets.bundle_id AND b.user_id = auth.uid()
));

CREATE POLICY "Users can delete wallets in their bundles"
ON public.bundle_wallets FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.bundles b
  WHERE b.id = bundle_wallets.bundle_id AND b.user_id = auth.uid()
));

CREATE POLICY "Admins can view all bundle wallets"
ON public.bundle_wallets FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 3.3 Create airdrops table
CREATE TABLE IF NOT EXISTS public.airdrops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  token_address TEXT NOT NULL,
  token_symbol TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.airdrops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own airdrops"
ON public.airdrops FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own airdrops"
ON public.airdrops FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own airdrops"
ON public.airdrops FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own airdrops"
ON public.airdrops FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all airdrops"
ON public.airdrops FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 3.4 Create airdrop_recipients table
CREATE TABLE IF NOT EXISTS public.airdrop_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airdrop_id UUID NOT NULL REFERENCES public.airdrops(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  tx_signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.airdrop_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recipients in their airdrops"
ON public.airdrop_recipients FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.airdrops a
  WHERE a.id = airdrop_recipients.airdrop_id AND a.user_id = auth.uid()
));

CREATE POLICY "Users can create recipients in their airdrops"
ON public.airdrop_recipients FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.airdrops a
  WHERE a.id = airdrop_recipients.airdrop_id AND a.user_id = auth.uid()
));

CREATE POLICY "Users can update recipients in their airdrops"
ON public.airdrop_recipients FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.airdrops a
  WHERE a.id = airdrop_recipients.airdrop_id AND a.user_id = auth.uid()
));

CREATE POLICY "Users can delete recipients in their airdrops"
ON public.airdrop_recipients FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.airdrops a
  WHERE a.id = airdrop_recipients.airdrop_id AND a.user_id = auth.uid()
));

CREATE POLICY "Admins can view all airdrop recipients"
ON public.airdrop_recipients FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 3.5 Create bridge_transactions table
CREATE TABLE IF NOT EXISTS public.bridge_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_token TEXT NOT NULL,
  to_token TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  output_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  tx_signature TEXT,
  from_chain TEXT NOT NULL DEFAULT 'solana',
  to_chain TEXT NOT NULL DEFAULT 'solana',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bridge_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bridge transactions"
ON public.bridge_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bridge transactions"
ON public.bridge_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bridge transactions"
ON public.bridge_transactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bridge transactions"
ON public.bridge_transactions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 3.6 Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity logs"
ON public.activity_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity logs"
ON public.activity_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity logs"
ON public.activity_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));