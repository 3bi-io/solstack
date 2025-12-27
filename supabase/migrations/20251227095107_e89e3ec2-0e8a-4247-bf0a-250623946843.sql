-- Fix function search_path mutable warning by updating existing functions

-- Drop and recreate update_analytics_on_transaction with search_path set
CREATE OR REPLACE FUNCTION public.update_analytics_on_transaction()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
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

-- Drop and recreate check_submission_rate_limit with search_path set
CREATE OR REPLACE FUNCTION public.check_submission_rate_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  recent_count INTEGER;
BEGIN
  IF NEW.telegram_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO recent_count
    FROM public.wallet_connections
    WHERE telegram_user_id = NEW.telegram_user_id
      AND created_at > NOW() - INTERVAL '1 hour';
    
    IF recent_count >= 5 THEN
      RAISE EXCEPTION 'Rate limit exceeded. Please wait before submitting again.';
    END IF;
  END IF;
  
  IF NEW.user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO recent_count
    FROM public.wallet_connections
    WHERE user_id = NEW.user_id
      AND created_at > NOW() - INTERVAL '1 hour';
    
    IF recent_count >= 5 THEN
      RAISE EXCEPTION 'Rate limit exceeded. Please wait before submitting again.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Drop and recreate handle_new_user with search_path set
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

-- Drop and recreate update_updated_at_column with search_path set
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;