import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BundleWallet {
  address: string;
  name?: string;
  amount: number;
}

export interface BundleConfig {
  bundleName: string;
  wallets: BundleWallet[];
  distributionStrategy: 'equal' | 'weighted' | 'custom';
  recipient?: string;
  token: string;
}

export const useBundleManager = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const createBundle = useCallback(async (config: BundleConfig) => {
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const totalAmount = config.wallets.reduce((sum, w) => sum + w.amount, 0);

      // Create bundle record
      const { data: bundle, error: bundleError } = await supabase
        .from('bundles')
        .insert({
          user_id: user.id,
          bundle_name: config.bundleName,
          total_wallets: config.wallets.length,
          total_amount: totalAmount,
          distribution_strategy: config.distributionStrategy,
          bundle_config: {
            recipient: config.recipient,
            token: config.token,
          },
        })
        .select()
        .single();

      if (bundleError) throw bundleError;

      // Create wallet records
      const walletRecords = config.wallets.map(w => ({
        bundle_id: bundle.id,
        wallet_address: w.address,
        wallet_name: w.name,
        allocated_amount: w.amount,
      }));

      const { error: walletsError } = await supabase
        .from('bundle_wallets')
        .insert(walletRecords);

      if (walletsError) throw walletsError;

      toast.success(`Bundle "${config.bundleName}" created with ${config.wallets.length} wallets`);
      return bundle;

    } catch (error) {
      console.error('Bundle creation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create bundle');
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const executeBundle = useCallback(async (bundleId: string, wallets: BundleWallet[], config: Partial<BundleConfig>) => {
    setIsExecuting(true);
    try {
      const { data, error } = await supabase.functions.invoke('execute-bundle', {
        body: {
          bundleId,
          wallets,
          distributionStrategy: config.distributionStrategy || 'equal',
          recipient: config.recipient,
          token: config.token || 'SOL',
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Bundle executed successfully! ${data.signatures.length} transactions completed`);
      } else {
        toast.error('Bundle execution completed with errors');
      }

      return data;

    } catch (error) {
      console.error('Bundle execution error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to execute bundle');
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const getBundles = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bundles')
        .select(`
          *,
          bundle_wallets (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error fetching bundles:', error);
      return [];
    }
  }, []);

  return {
    createBundle,
    executeBundle,
    getBundles,
    isCreating,
    isExecuting,
  };
};