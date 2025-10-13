-- Create bundles table for tracking multi-wallet bundled transactions
CREATE TABLE public.bundles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bundle_name TEXT NOT NULL,
  total_wallets INTEGER NOT NULL,
  total_amount NUMERIC NOT NULL,
  distribution_strategy TEXT NOT NULL DEFAULT 'equal', -- equal, weighted, custom
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  transaction_signatures JSONB DEFAULT '[]'::jsonb,
  bundle_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bundle_wallets table for managing sub-wallets in a bundle
CREATE TABLE public.bundle_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  wallet_name TEXT,
  allocated_amount NUMERIC NOT NULL,
  transaction_signature TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_wallets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bundles
CREATE POLICY "Users can create their own bundles"
  ON public.bundles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own bundles"
  ON public.bundles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own bundles"
  ON public.bundles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bundles"
  ON public.bundles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for bundle_wallets
CREATE POLICY "Users can create wallets for their bundles"
  ON public.bundle_wallets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bundles
      WHERE bundles.id = bundle_wallets.bundle_id
      AND bundles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view wallets for their bundles"
  ON public.bundle_wallets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bundles
      WHERE bundles.id = bundle_wallets.bundle_id
      AND bundles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update wallets for their bundles"
  ON public.bundle_wallets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.bundles
      WHERE bundles.id = bundle_wallets.bundle_id
      AND bundles.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_bundles_user_id ON public.bundles(user_id);
CREATE INDEX idx_bundles_status ON public.bundles(status);
CREATE INDEX idx_bundle_wallets_bundle_id ON public.bundle_wallets(bundle_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_bundles_updated_at
  BEFORE UPDATE ON public.bundles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bundle_wallets_updated_at
  BEFORE UPDATE ON public.bundle_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();