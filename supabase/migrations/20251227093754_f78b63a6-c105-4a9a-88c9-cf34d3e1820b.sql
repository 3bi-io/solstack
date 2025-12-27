-- Create yield optimizer settings table
CREATE TABLE public.yield_optimizer_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  wallet_address text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT false,
  min_apy_difference numeric NOT NULL DEFAULT 5.0,
  max_gas_cost numeric NOT NULL DEFAULT 0.01,
  check_interval_hours integer NOT NULL DEFAULT 24,
  risk_tolerance text NOT NULL DEFAULT 'medium',
  last_optimization_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create optimization history table
CREATE TABLE public.yield_optimization_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  wallet_address text NOT NULL,
  from_farm_id text NOT NULL,
  from_farm_name text NOT NULL,
  to_farm_id text NOT NULL,
  to_farm_name text NOT NULL,
  amount numeric NOT NULL,
  token text NOT NULL,
  old_apy numeric NOT NULL,
  new_apy numeric NOT NULL,
  apy_gain numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  transaction_signature text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.yield_optimizer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yield_optimization_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for yield_optimizer_settings
CREATE POLICY "Users can view their own optimizer settings"
ON public.yield_optimizer_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own optimizer settings"
ON public.yield_optimizer_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own optimizer settings"
ON public.yield_optimizer_settings FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for yield_optimization_history
CREATE POLICY "Users can view their own optimization history"
ON public.yield_optimization_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own optimization history"
ON public.yield_optimization_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_optimizer_settings_user ON public.yield_optimizer_settings(user_id);
CREATE INDEX idx_optimization_history_user ON public.yield_optimization_history(user_id, created_at DESC);