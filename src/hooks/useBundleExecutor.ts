import { useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
} from '@solana/spl-token';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BundleWallet {
  address: string;
  name?: string;
  amount: number;
}

export interface BundleExecutionResult {
  wallet: string;
  status: 'success' | 'failed' | 'pending';
  signature?: string;
  error?: string;
}

export interface BundleProgress {
  total: number;
  completed: number;
  successful: number;
  failed: number;
}

interface UseBundleExecutorReturn {
  executeSolBundle: (
    bundleId: string,
    wallets: BundleWallet[],
    recipient: string
  ) => Promise<BundleExecutionResult[]>;
  executeTokenBundle: (
    bundleId: string,
    wallets: BundleWallet[],
    recipient: string,
    tokenMint: string
  ) => Promise<BundleExecutionResult[]>;
  isExecuting: boolean;
  progress: BundleProgress;
  cancelExecution: () => void;
}

export function useBundleExecutor(): UseBundleExecutorReturn {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { toast } = useToast();
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [progress, setProgress] = useState<BundleProgress>({
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
  });

  const cancelExecution = useCallback(() => {
    setIsCancelled(true);
  }, []);

  const updateBundleStatus = async (bundleId: string, status: string, signatures: string[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('bundles')
      .update({
        status,
        transaction_signatures: signatures,
        executed_at: new Date().toISOString(),
      })
      .eq('id', bundleId);
  };

  const updateWalletStatus = async (
    bundleId: string, 
    walletAddress: string, 
    status: string, 
    signature?: string, 
    errorMessage?: string
  ) => {
    await supabase
      .from('bundle_wallets')
      .update({ 
        status,
        transaction_signature: signature,
        error_message: errorMessage,
      })
      .eq('bundle_id', bundleId)
      .eq('wallet_address', walletAddress);
  };

  const executeSolBundle = useCallback(async (
    bundleId: string,
    wallets: BundleWallet[],
    recipient: string
  ): Promise<BundleExecutionResult[]> => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected or does not support signing');
    }

    setIsExecuting(true);
    setIsCancelled(false);
    
    const results: BundleExecutionResult[] = wallets.map(w => ({
      wallet: w.address,
      status: 'pending' as const,
    }));

    const signatures: string[] = [];

    setProgress({
      total: wallets.length,
      completed: 0,
      successful: 0,
      failed: 0,
    });

    try {
      // Update bundle status to processing
      await supabase
        .from('bundles')
        .update({ status: 'processing' })
        .eq('id', bundleId);

      const recipientPubkey = new PublicKey(recipient);

      // Check wallet balance
      const balance = await connection.getBalance(publicKey);
      const totalNeeded = wallets.reduce((sum, w) => sum + w.amount, 0) * LAMPORTS_PER_SOL;
      
      // Add some buffer for fees (0.01 SOL per tx)
      const feeBuffer = wallets.length * 0.01 * LAMPORTS_PER_SOL;
      
      if (balance < totalNeeded + feeBuffer) {
        throw new Error(`Insufficient SOL balance. Need ~${((totalNeeded + feeBuffer) / LAMPORTS_PER_SOL).toFixed(4)} SOL, have ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
      }

      // Process each wallet transfer
      for (let i = 0; i < wallets.length; i++) {
        if (isCancelled) {
          toast({
            title: 'Bundle Cancelled',
            description: `Stopped after ${progress.completed} transfers`,
          });
          break;
        }

        const wallet = wallets[i];

        try {
          // Build transaction
          const transaction = new Transaction();
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
          
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = publicKey;

          // Add SOL transfer instruction
          transaction.add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: recipientPubkey,
              lamports: Math.floor(wallet.amount * LAMPORTS_PER_SOL),
            })
          );

          // Sign transaction
          const signedTransaction = await signTransaction(transaction);

          // Send transaction
          const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
          });

          // Wait for confirmation
          const confirmation = await connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight,
          }, 'confirmed');

          if (confirmation.value.err) {
            throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
          }

          results[i] = {
            wallet: wallet.address,
            status: 'success',
            signature,
          };
          
          signatures.push(signature);

          // Update database
          await updateWalletStatus(bundleId, wallet.address, 'completed', signature);

          setProgress(prev => ({
            ...prev,
            completed: prev.completed + 1,
            successful: prev.successful + 1,
          }));

        } catch (error) {
          console.error(`Failed to process wallet ${wallet.address}:`, error);
          const errorMessage = (error as Error).message;
          
          results[i] = {
            wallet: wallet.address,
            status: 'failed',
            error: errorMessage,
          };

          // Update database
          await updateWalletStatus(bundleId, wallet.address, 'failed', undefined, errorMessage);

          setProgress(prev => ({
            ...prev,
            completed: prev.completed + 1,
            failed: prev.failed + 1,
          }));

          toast({
            title: `Transfer ${i + 1} Failed`,
            description: errorMessage,
            variant: 'destructive',
          });
        }
      }

      // Update final bundle status
      const allSuccess = results.every(r => r.status === 'success');
      const anySuccess = results.some(r => r.status === 'success');
      const finalStatus = allSuccess ? 'completed' : anySuccess ? 'partial' : 'failed';
      
      await updateBundleStatus(bundleId, finalStatus, signatures);

      // Log activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          action: 'bundle_execution',
          category: 'bundle',
          level: allSuccess ? 'info' : 'error',
          message: `SOL bundle ${finalStatus}: ${results.filter(r => r.status === 'success').length}/${wallets.length} transfers completed`,
          details: `Recipient: ${recipient}`,
          metadata: { bundleId, signatures },
        } as any);
      }

      return results;

    } catch (error) {
      console.error('Bundle execution failed:', error);
      await updateBundleStatus(bundleId, 'failed', signatures);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, [publicKey, signTransaction, connection, toast, isCancelled]);

  const executeTokenBundle = useCallback(async (
    bundleId: string,
    wallets: BundleWallet[],
    recipient: string,
    tokenMint: string
  ): Promise<BundleExecutionResult[]> => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected or does not support signing');
    }

    setIsExecuting(true);
    setIsCancelled(false);
    
    const results: BundleExecutionResult[] = wallets.map(w => ({
      wallet: w.address,
      status: 'pending' as const,
    }));

    const signatures: string[] = [];

    setProgress({
      total: wallets.length,
      completed: 0,
      successful: 0,
      failed: 0,
    });

    try {
      // Update bundle status to processing
      await supabase
        .from('bundles')
        .update({ status: 'processing' })
        .eq('id', bundleId);

      const mintPubkey = new PublicKey(tokenMint);
      const recipientPubkey = new PublicKey(recipient);

      // Get token decimals
      const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
      if (!mintInfo.value) {
        throw new Error('Token mint not found');
      }
      
      const parsedData = mintInfo.value.data as { parsed?: { info?: { decimals?: number } } };
      const decimals = parsedData?.parsed?.info?.decimals ?? 9;

      // Get sender's token account
      const senderATA = await getAssociatedTokenAddress(mintPubkey, publicKey);
      
      // Verify sender has tokens
      try {
        const senderAccount = await getAccount(connection, senderATA);
        const totalNeeded = wallets.reduce((sum, w) => sum + w.amount, 0) * Math.pow(10, decimals);
        if (Number(senderAccount.amount) < totalNeeded) {
          throw new Error(`Insufficient token balance. Need ${totalNeeded}, have ${senderAccount.amount}`);
        }
      } catch (error) {
        if ((error as Error).message.includes('could not find account')) {
          throw new Error('You do not have a token account for this token');
        }
        throw error;
      }

      // Get or create recipient's token account
      const recipientATA = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);

      // Process each wallet transfer
      for (let i = 0; i < wallets.length; i++) {
        if (isCancelled) {
          toast({
            title: 'Bundle Cancelled',
            description: `Stopped after ${progress.completed} transfers`,
          });
          break;
        }

        const wallet = wallets[i];
        const amountInSmallestUnits = BigInt(Math.floor(wallet.amount * Math.pow(10, decimals)));

        try {
          const transaction = new Transaction();
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
          
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = publicKey;

          // Check if recipient ATA exists
          const recipientAccountInfo = await connection.getAccountInfo(recipientATA);
          
          if (!recipientAccountInfo) {
            // Create ATA instruction
            transaction.add(
              createAssociatedTokenAccountInstruction(
                publicKey,
                recipientATA,
                recipientPubkey,
                mintPubkey,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
              )
            );
          }

          // Add transfer instruction
          transaction.add(
            createTransferInstruction(
              senderATA,
              recipientATA,
              publicKey,
              amountInSmallestUnits,
              [],
              TOKEN_PROGRAM_ID
            )
          );

          // Sign transaction
          const signedTransaction = await signTransaction(transaction);

          // Send transaction
          const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
          });

          // Wait for confirmation
          const confirmation = await connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight,
          }, 'confirmed');

          if (confirmation.value.err) {
            throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
          }

          results[i] = {
            wallet: wallet.address,
            status: 'success',
            signature,
          };
          
          signatures.push(signature);

          // Update database
          await updateWalletStatus(bundleId, wallet.address, 'completed', signature);

          setProgress(prev => ({
            ...prev,
            completed: prev.completed + 1,
            successful: prev.successful + 1,
          }));

        } catch (error) {
          console.error(`Failed to process wallet ${wallet.address}:`, error);
          const errorMessage = (error as Error).message;
          
          results[i] = {
            wallet: wallet.address,
            status: 'failed',
            error: errorMessage,
          };

          // Update database
          await updateWalletStatus(bundleId, wallet.address, 'failed', undefined, errorMessage);

          setProgress(prev => ({
            ...prev,
            completed: prev.completed + 1,
            failed: prev.failed + 1,
          }));

          toast({
            title: `Transfer ${i + 1} Failed`,
            description: errorMessage,
            variant: 'destructive',
          });
        }
      }

      // Update final bundle status
      const allSuccess = results.every(r => r.status === 'success');
      const anySuccess = results.some(r => r.status === 'success');
      const finalStatus = allSuccess ? 'completed' : anySuccess ? 'partial' : 'failed';
      
      await updateBundleStatus(bundleId, finalStatus, signatures);

      // Log activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          action: 'token_bundle_execution',
          category: 'bundle',
          level: allSuccess ? 'info' : 'error',
          message: `Token bundle ${finalStatus}: ${results.filter(r => r.status === 'success').length}/${wallets.length} transfers completed`,
          details: `Token: ${tokenMint}, Recipient: ${recipient}`,
          metadata: { bundleId, tokenMint, signatures },
        } as any);
      }

      return results;

    } catch (error) {
      console.error('Bundle execution failed:', error);
      await updateBundleStatus(bundleId, 'failed', signatures);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, [publicKey, signTransaction, connection, toast, isCancelled]);

  return {
    executeSolBundle,
    executeTokenBundle,
    isExecuting,
    progress,
    cancelExecution,
  };
}
