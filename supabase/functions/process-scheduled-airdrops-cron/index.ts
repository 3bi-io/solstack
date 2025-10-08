import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting scheduled airdrop processing...');

    // Get all pending scheduled airdrops that are due
    const { data: scheduledAirdrops, error: fetchError } = await supabase
      .from('scheduled_airdrops')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(10); // Process in batches

    if (fetchError) {
      console.error('Error fetching scheduled airdrops:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${scheduledAirdrops?.length || 0} scheduled airdrops to process`);

    const results = [];

    for (const scheduledAirdrop of scheduledAirdrops || []) {
      try {
        console.log(`Processing scheduled airdrop ${scheduledAirdrop.id}`);

        // Mark as processing
        await supabase
          .from('scheduled_airdrops')
          .update({ status: 'processing' })
          .eq('id', scheduledAirdrop.id);

        // Call the process-airdrop edge function
        const { data: airdropResult, error: airdropError } = await supabase.functions.invoke(
          'process-airdrop',
          {
            body: {
              tokenAddress: scheduledAirdrop.token_address,
              recipients: scheduledAirdrop.recipient_addresses.map((address: string, index: number) => ({
                address,
                amount: scheduledAirdrop.amount_per_address
              })),
              userId: scheduledAirdrop.user_id,
              isScheduled: true
            }
          }
        );

        if (airdropError) {
          console.error(`Error processing airdrop ${scheduledAirdrop.id}:`, airdropError);
          
          // Mark as failed
          await supabase
            .from('scheduled_airdrops')
            .update({
              status: 'failed',
              error_message: airdropError.message,
              processed_at: new Date().toISOString()
            })
            .eq('id', scheduledAirdrop.id);

          results.push({
            id: scheduledAirdrop.id,
            status: 'failed',
            error: airdropError.message
          });
        } else {
          // Mark as completed
          await supabase
            .from('scheduled_airdrops')
            .update({
              status: 'completed',
              airdrop_id: airdropResult?.airdropId,
              processed_at: new Date().toISOString()
            })
            .eq('id', scheduledAirdrop.id);

          // Send Telegram notification if enabled
          const { data: notificationSettings } = await supabase
            .from('telegram_notifications')
            .select('*')
            .eq('user_id', scheduledAirdrop.user_id)
            .eq('airdrop_complete', true)
            .single();

          if (notificationSettings) {
            // TODO: Send Telegram notification via telegram-bot function
            console.log(`Would send notification to telegram user ${notificationSettings.telegram_user_id}`);
          }

          results.push({
            id: scheduledAirdrop.id,
            status: 'completed',
            airdropId: airdropResult?.airdropId
          });
        }

        // Log the event
        await supabase
          .from('activity_logs')
          .insert({
            user_id: scheduledAirdrop.user_id,
            category: 'airdrop',
            level: airdropError ? 'error' : 'info',
            message: airdropError 
              ? `Scheduled airdrop failed: ${airdropError.message}`
              : 'Scheduled airdrop completed successfully',
            details: JSON.stringify({ scheduled_airdrop_id: scheduledAirdrop.id }),
            metadata: { scheduled_airdrop_id: scheduledAirdrop.id }
          });

      } catch (error) {
        console.error(`Failed to process scheduled airdrop ${scheduledAirdrop.id}:`, error);
        results.push({
          id: scheduledAirdrop.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-scheduled-airdrops-cron:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
