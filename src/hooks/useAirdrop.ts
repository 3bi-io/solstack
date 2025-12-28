import { useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
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

export interface AirdropRecipient {
  address: string;
  status: 'pending' | 'success' | 'failed';
  signature?: string;
  error?: string;
}

export interface AirdropProgress {
  total: number;
  completed: number;
  successful: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
}

interface UseAirdropReturn {
  executeAirdrop: (
    tokenMint: string,
    amountPerRecipient: number,
    recipients: string[]
  ) => Promise<AirdropRecipient[]>;
  isProcessing: boolean;
  progress: AirdropProgress;
  cancelAirdrop: () => void;
}

// Maximum recipients per transaction (to avoid tx size limits)
const BATCH_SIZE = 5;

export function useAirdrop(): UseAirdropReturn {
  const { publicKey, signAllTransactions, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [progress, setProgress] = useState<AirdropProgress>({
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
    currentBatch: 0,
    totalBatches: 0,
  });

  const cancelAirdrop = useCallback(() => {
    setIsCancelled(true);
  }, []);

  const executeAirdrop = useCallback(async (
    tokenMint: string,
    amountPerRecipient: number,
    recipients: string[]
  ): Promise<AirdropRecipient[]> => {
    if (!publicKey || !signAllTransactions) {
      throw new Error('Wallet not connected or does not support signing');
    }

    setIsProcessing(true);
    setIsCancelled(false);
    
    const results: AirdropRecipient[] = recipients.map(addr => ({
      address: addr,
      status: 'pending' as const,
    }));

    const totalBatches = Math.ceil(recipients.length / BATCH_SIZE);
    
    setProgress({
      total: recipients.length,
      completed: 0,
      successful: 0,
      failed: 0,
      currentBatch: 0,
      totalBatches,
    });

    try {
      // Validate token mint
      const mintPubkey = new PublicKey(tokenMint);
      
      // Get token account info to determine decimals
      const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
      if (!mintInfo.value) {
        throw new Error('Token mint not found');
      }
      
      const parsedData = mintInfo.value.data as { parsed?: { info?: { decimals?: number } } };
      const decimals = parsedData?.parsed?.info?.decimals ?? 9;
      
      // Calculate amount in smallest units
      const amountInSmallestUnits = BigInt(Math.floor(amountPerRecipient * Math.pow(10, decimals)));
      
      // Get sender's associated token account
      const senderATA = await getAssociatedTokenAddress(mintPubkey, publicKey);
      
      // Verify sender has the token account and sufficient balance
      try {
        const senderAccount = await getAccount(connection, senderATA);
        const totalNeeded = amountInSmallestUnits * BigInt(recipients.length);
        if (senderAccount.amount < totalNeeded) {
          throw new Error(`Insufficient token balance. Need ${totalNeeded.toString()}, have ${senderAccount.amount.toString()}`);
        }
      } catch (error) {
        if ((error as Error).message.includes('could not find account')) {
          throw new Error('You do not have a token account for this token');
        }
        throw error;
      }

      // Create airdrop record in database
      const { data: { user } } = await supabase.auth.getUser();
      let airdropId: string | null = null;
      
      if (user) {
        const { data: airdrop, error: airdropError } = await supabase
          .from('airdrops')
          .insert({
            user_id: user.id,
            name: `Airdrop ${new Date().toISOString()}`,
            token_address: tokenMint,
            total_recipients: recipients.length,
            total_amount: amountPerRecipient * recipients.length,
            status: 'processing',
          } as any)
          .select()
          .single();

        if (!airdropError && airdrop) {
          airdropId = airdrop.id;
        }
      }

      // Process in batches
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        if (isCancelled) {
          toast({
            title: 'Airdrop Cancelled',
            description: `Stopped after ${progress.completed} transfers`,
          });
          break;
        }

        const batchStart = batchIndex * BATCH_SIZE;
        const batchEnd = Math.min(batchStart + BATCH_SIZE, recipients.length);
        const batchRecipients = recipients.slice(batchStart, batchEnd);

        setProgress(prev => ({
          ...prev,
          currentBatch: batchIndex + 1,
        }));

        try {
          // Build transaction for this batch
          const transaction = new Transaction();
          const validRecipients: { address: string; ata: PublicKey; index: number }[] = [];

          // Get recent blockhash
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = publicKey;

          for (let i = 0; i < batchRecipients.length; i++) {
            const recipientAddress = batchRecipients[i];
            const globalIndex = batchStart + i;

            try {
              const recipientPubkey = new PublicKey(recipientAddress);
              const recipientATA = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);

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

              validRecipients.push({
                address: recipientAddress,
                ata: recipientATA,
                index: globalIndex,
              });
            } catch (error) {
              console.error(`Invalid recipient address: ${recipientAddress}`, error);
              results[globalIndex] = {
                address: recipientAddress,
                status: 'failed',
                error: 'Invalid address',
              };
              
              setProgress(prev => ({
                ...prev,
                completed: prev.completed + 1,
                failed: prev.failed + 1,
              }));
            }
          }

          if (validRecipients.length === 0) {
            continue;
          }

          // Sign the transaction
          const signedTransaction = await signTransaction!(transaction);
          
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

          // Mark all recipients in this batch as successful
          for (const recipient of validRecipients) {
            results[recipient.index] = {
              address: recipient.address,
              status: 'success',
              signature,
            };

            // Update database record
            if (airdropId && user) {
              await supabase.from('airdrop_recipients').insert({
                airdrop_id: airdropId,
                wallet_address: recipient.address,
                amount: amountPerRecipient,
                status: 'completed',
                tx_signature: signature,
              } as any);
            }
          }

          setProgress(prev => ({
            ...prev,
            completed: prev.completed + validRecipients.length,
            successful: prev.successful + validRecipients.length,
          }));

        } catch (error) {
          console.error(`Batch ${batchIndex + 1} failed:`, error);
          
          // Mark all recipients in this batch as failed
          for (let i = 0; i < batchRecipients.length; i++) {
            const globalIndex = batchStart + i;
            if (results[globalIndex].status === 'pending') {
              results[globalIndex] = {
                address: batchRecipients[i],
                status: 'failed',
                error: (error as Error).message,
              };

              // Update database record
              if (airdropId && user) {
                await supabase.from('airdrop_recipients').insert({
                  airdrop_id: airdropId,
                  wallet_address: batchRecipients[i],
                  amount: amountPerRecipient,
                  status: 'failed',
                } as any);
              }
            }
          }

          setProgress(prev => ({
            ...prev,
            completed: prev.completed + batchRecipients.length,
            failed: prev.failed + batchRecipients.length,
          }));

          toast({
            title: `Batch ${batchIndex + 1} Failed`,
            description: (error as Error).message,
            variant: 'destructive',
          });
        }
      }

      // Update airdrop status
      if (airdropId && user) {
        const finalSuccessCount = results.filter(r => r.status === 'success').length;
        const finalFailCount = results.filter(r => r.status === 'failed').length;
        
        await supabase
          .from('airdrops')
          .update({
            status: finalFailCount === 0 ? 'completed' : 'partial',
            completed_count: finalSuccessCount,
            failed_count: finalFailCount,
          })
          .eq('id', airdropId);
      }

      return results;

    } catch (error) {
      console.error('Airdrop failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [publicKey, signAllTransactions, signTransaction, connection, toast, isCancelled]);

  return {
    executeAirdrop,
    isProcessing,
    progress,
    cancelAirdrop,
  };
}
