-- Add auto-compound settings to farm_positions
ALTER TABLE public.farm_positions
ADD COLUMN auto_compound_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN auto_compound_threshold NUMERIC NOT NULL DEFAULT 0.01,
ADD COLUMN last_compound_at TIMESTAMP WITH TIME ZONE;

-- Create index for auto-compound queries
CREATE INDEX idx_farm_positions_auto_compound 
ON public.farm_positions(auto_compound_enabled, pending_rewards)
WHERE auto_compound_enabled = true;