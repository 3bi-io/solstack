-- CRITICAL SECURITY FIXES

-- 1. DROP private_key column from wallet_connections (CRITICAL)
ALTER TABLE public.wallet_connections DROP COLUMN IF EXISTS private_key;

-- 2. Fix wallet_connections RLS policies
-- Drop existing weak policies
DROP POLICY IF EXISTS "Allow rate-limited insertions" ON public.wallet_connections;
DROP POLICY IF EXISTS "Telegram users view own connections" ON public.wallet_connections;

-- Create secure INSERT policy requiring authentication
CREATE POLICY "Authenticated users can insert own connections"
ON public.wallet_connections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create secure SELECT policy for telegram users
CREATE POLICY "Users view own connections by telegram_user_id"
ON public.wallet_connections
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR 
  (telegram_user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid()
  ))
);

-- 3. Fix merkle_claims RLS policy (CRITICAL)
-- Drop the dangerous "Anyone can update" policy
DROP POLICY IF EXISTS "Anyone can update merkle claims" ON public.merkle_claims;

-- Only allow system service role to update claims
CREATE POLICY "System can update merkle claims"
ON public.merkle_claims
FOR UPDATE
TO service_role
USING (true);

-- Allow recipients to mark their own claims as claimed (one-time only)
CREATE POLICY "Recipients can claim once"
ON public.merkle_claims
FOR UPDATE
TO authenticated
USING (
  NOT claimed AND 
  recipient_address = auth.uid()::text
)
WITH CHECK (
  claimed = true AND 
  claimed_at IS NOT NULL AND
  transaction_signature IS NOT NULL
);

-- 4. Fix SECURITY DEFINER functions - add fixed search_path (CRITICAL)
CREATE OR REPLACE FUNCTION public.update_analytics_on_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'display_name'
  );
  RETURN NEW;
END;
$function$;