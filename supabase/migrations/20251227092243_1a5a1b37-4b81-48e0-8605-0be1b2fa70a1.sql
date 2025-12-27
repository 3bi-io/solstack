-- Create farm_positions table for tracking user staking positions
CREATE TABLE public.farm_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  wallet_address text NOT NULL,
  farm_id text NOT NULL,
  farm_name text NOT NULL,
  token text NOT NULL,
  staked_amount numeric NOT NULL DEFAULT 0,
  pending_rewards numeric NOT NULL DEFAULT 0,
  last_harvest_at timestamp with time zone,
  staked_at timestamp with time zone NOT NULL DEFAULT now(),
  lock_end_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, farm_id)
);

-- Create farm_transactions table for tracking all farm activities
CREATE TABLE public.farm_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  wallet_address text NOT NULL,
  farm_id text NOT NULL,
  farm_name text NOT NULL,
  transaction_type text NOT NULL, -- 'stake', 'withdraw', 'claim'
  amount numeric NOT NULL,
  token text NOT NULL,
  transaction_signature text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.farm_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_transactions ENABLE ROW LEVEL SECURITY;

-- Farm positions policies
CREATE POLICY "Users can view their own farm positions"
ON public.farm_positions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own farm positions"
ON public.farm_positions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farm positions"
ON public.farm_positions FOR UPDATE
USING (auth.uid() = user_id);

-- Anyone can view positions by wallet (for non-authenticated viewing)
CREATE POLICY "Anyone can view positions by wallet"
ON public.farm_positions FOR SELECT
USING (true);

-- Farm transactions policies
CREATE POLICY "Users can view their own farm transactions"
ON public.farm_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own farm transactions"
ON public.farm_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Anyone can view transactions by wallet
CREATE POLICY "Anyone can view transactions by wallet"
ON public.farm_transactions FOR SELECT
USING (true);

-- Create indexes
CREATE INDEX idx_farm_positions_user_id ON public.farm_positions(user_id);
CREATE INDEX idx_farm_positions_wallet ON public.farm_positions(wallet_address);
CREATE INDEX idx_farm_positions_farm_id ON public.farm_positions(farm_id);
CREATE INDEX idx_farm_transactions_user_id ON public.farm_transactions(user_id);
CREATE INDEX idx_farm_transactions_wallet ON public.farm_transactions(wallet_address);
CREATE INDEX idx_farm_transactions_created_at ON public.farm_transactions(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_farm_positions_updated_at
BEFORE UPDATE ON public.farm_positions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();