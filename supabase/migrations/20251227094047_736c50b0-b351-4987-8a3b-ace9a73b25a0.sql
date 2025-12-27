-- Create portfolio target allocations table
CREATE TABLE public.portfolio_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  wallet_address text NOT NULL,
  token_symbol text NOT NULL,
  token_mint text,
  target_percentage numeric NOT NULL DEFAULT 0,
  current_percentage numeric NOT NULL DEFAULT 0,
  deviation_threshold numeric NOT NULL DEFAULT 5.0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, token_symbol)
);

-- Create rebalancing history table
CREATE TABLE public.rebalancing_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  wallet_address text NOT NULL,
  rebalance_type text NOT NULL DEFAULT 'manual',
  trades_executed integer NOT NULL DEFAULT 0,
  total_value_usd numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rebalancing_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for portfolio_allocations
CREATE POLICY "Users can view their own allocations"
ON public.portfolio_allocations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own allocations"
ON public.portfolio_allocations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own allocations"
ON public.portfolio_allocations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own allocations"
ON public.portfolio_allocations FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for rebalancing_history
CREATE POLICY "Users can view their own rebalancing history"
ON public.rebalancing_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rebalancing history"
ON public.rebalancing_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_portfolio_allocations_user ON public.portfolio_allocations(user_id);
CREATE INDEX idx_rebalancing_history_user ON public.rebalancing_history(user_id, created_at DESC);