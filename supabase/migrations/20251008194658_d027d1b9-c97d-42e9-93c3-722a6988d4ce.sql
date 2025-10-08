-- Create storage bucket for token logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'token-logos',
  'token-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
);

-- Storage policies for token logos
CREATE POLICY "Anyone can view token logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'token-logos');

CREATE POLICY "Authenticated users can upload token logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'token-logos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own token logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'token-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own token logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'token-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add new columns to tokens table for metadata
ALTER TABLE public.tokens
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS telegram TEXT,
ADD COLUMN IF NOT EXISTS discord TEXT,
ADD COLUMN IF NOT EXISTS metadata_uri TEXT,
ADD COLUMN IF NOT EXISTS revoke_mint_authority BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS revoke_freeze_authority BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS extensions JSONB DEFAULT '{}'::jsonb;

-- Create scheduled_airdrops table
CREATE TABLE IF NOT EXISTS public.scheduled_airdrops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_address TEXT NOT NULL,
  amount_per_address NUMERIC NOT NULL,
  recipient_addresses TEXT[] NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  airdrop_id UUID REFERENCES public.airdrops(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on scheduled_airdrops
ALTER TABLE public.scheduled_airdrops ENABLE ROW LEVEL SECURITY;

-- RLS policies for scheduled_airdrops
CREATE POLICY "Users can view their own scheduled airdrops"
ON public.scheduled_airdrops FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled airdrops"
ON public.scheduled_airdrops FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled airdrops"
ON public.scheduled_airdrops FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled airdrops"
ON public.scheduled_airdrops FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all scheduled airdrops
CREATE POLICY "Admins can view all scheduled airdrops"
ON public.scheduled_airdrops FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for scheduled_airdrops queries
CREATE INDEX IF NOT EXISTS idx_scheduled_airdrops_user_id ON public.scheduled_airdrops(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_airdrops_status ON public.scheduled_airdrops(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_airdrops_scheduled_for ON public.scheduled_airdrops(scheduled_for);

-- Create analytics_snapshots table for historical data
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_transactions INTEGER DEFAULT 0,
  successful_transactions INTEGER DEFAULT 0,
  failed_transactions INTEGER DEFAULT 0,
  total_tokens_launched INTEGER DEFAULT 0,
  total_airdrops INTEGER DEFAULT 0,
  total_fees_paid NUMERIC DEFAULT 0,
  total_volume NUMERIC DEFAULT 0,
  cost_savings NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

-- Enable RLS on analytics_snapshots
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS policies for analytics_snapshots
CREATE POLICY "Users can view their own analytics"
ON public.analytics_snapshots FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics"
ON public.analytics_snapshots FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update analytics"
ON public.analytics_snapshots FOR UPDATE
USING (true);

-- Admins can view all analytics
CREATE POLICY "Admins can view all analytics"
ON public.analytics_snapshots FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_user_id ON public.analytics_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_date ON public.analytics_snapshots(snapshot_date);

-- Add trigger to update analytics when transactions are created
CREATE OR REPLACE FUNCTION update_analytics_on_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update today's analytics snapshot
  INSERT INTO public.analytics_snapshots (
    user_id,
    snapshot_date,
    total_transactions,
    successful_transactions,
    failed_transactions
  )
  VALUES (
    NEW.user_id,
    CURRENT_DATE,
    1,
    CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, snapshot_date)
  DO UPDATE SET
    total_transactions = analytics_snapshots.total_transactions + 1,
    successful_transactions = analytics_snapshots.successful_transactions + 
      CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    failed_transactions = analytics_snapshots.failed_transactions + 
      CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_analytics_on_transaction
AFTER INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION update_analytics_on_transaction();