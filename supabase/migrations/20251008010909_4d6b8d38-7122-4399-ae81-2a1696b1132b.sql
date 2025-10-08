-- Allow admins to delete wallet connections
CREATE POLICY "Admins can delete wallet connections"
ON public.wallet_connections
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));