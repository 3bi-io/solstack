import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    from?: { id: number; username?: string; first_name?: string };
    text?: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const update: TelegramUpdate = await req.json();

    console.log('Telegram webhook received:', JSON.stringify(update));

    if (!update.message?.text || !update.message?.from) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const chatId = update.message.chat.id;
    const userId = update.message.from.id;
    const username = update.message.from.username;
    const firstName = update.message.from.first_name;
    const text = update.message.text;

    // Parse commands
    if (text.startsWith('/')) {
      const command = text.split(' ')[0].toLowerCase();
      
      switch (command) {
        case '/start':
          await sendTelegramMessage(
            chatId,
            `🤖 Welcome to ProTools Bundler Bot!\n\n` +
            `Available commands:\n` +
            `/status - Check your account status\n` +
            `/airdrops - View your recent airdrops\n` +
            `/tokens - View your launched tokens\n` +
            `/scheduled - View scheduled airdrops\n` +
            `/notifications - Manage notification settings\n` +
            `/help - Show this help message`
          );
          break;

        case '/status':
          // Get user subscription and stats
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId.toString())
            .single();

          const { count: tokenCount } = await supabase
            .from('tokens')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId.toString());

          const { count: airdropCount } = await supabase
            .from('airdrops')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId.toString());

          await sendTelegramMessage(
            chatId,
            `📊 Your Account Status\n\n` +
            `Subscription: ${subscription?.tier || 'Free'}\n` +
            `Tokens Launched: ${tokenCount || 0}\n` +
            `Airdrops Completed: ${airdropCount || 0}\n` +
            `Account Status: ${subscription?.status || 'Active'}`
          );
          break;

        case '/airdrops':
          const { data: airdrops } = await supabase
            .from('airdrops')
            .select('*')
            .eq('user_id', userId.toString())
            .order('created_at', { ascending: false })
            .limit(5);

          let airdropMessage = '📦 Your Recent Airdrops\n\n';
          if (airdrops && airdrops.length > 0) {
            airdrops.forEach((airdrop: any, index: number) => {
              airdropMessage += `${index + 1}. ${airdrop.status.toUpperCase()}\n`;
              airdropMessage += `   Recipients: ${airdrop.total_recipients}\n`;
              airdropMessage += `   Completed: ${airdrop.completed_count}\n\n`;
            });
          } else {
            airdropMessage += 'No airdrops yet.';
          }
          
          await sendTelegramMessage(chatId, airdropMessage);
          break;

        case '/tokens':
          const { data: tokens } = await supabase
            .from('tokens')
            .select('name, symbol, status, created_at')
            .eq('user_id', userId.toString())
            .order('created_at', { ascending: false })
            .limit(5);

          let tokenMessage = '🪙 Your Recent Tokens\n\n';
          if (tokens && tokens.length > 0) {
            tokens.forEach((token: any, index: number) => {
              tokenMessage += `${index + 1}. ${token.name} (${token.symbol})\n`;
              tokenMessage += `   Status: ${token.status}\n\n`;
            });
          } else {
            tokenMessage += 'No tokens launched yet.';
          }
          
          await sendTelegramMessage(chatId, tokenMessage);
          break;

        case '/scheduled':
          const { data: scheduled } = await supabase
            .from('scheduled_airdrops')
            .select('*')
            .eq('user_id', userId.toString())
            .eq('status', 'pending')
            .order('scheduled_for', { ascending: true });

          let scheduledMessage = '⏰ Your Scheduled Airdrops\n\n';
          if (scheduled && scheduled.length > 0) {
            scheduled.forEach((item: any, index: number) => {
              const scheduledDate = new Date(item.scheduled_for).toLocaleString();
              scheduledMessage += `${index + 1}. Scheduled for ${scheduledDate}\n`;
              scheduledMessage += `   Recipients: ${item.recipient_addresses.length}\n\n`;
            });
          } else {
            scheduledMessage += 'No scheduled airdrops.';
          }
          
          await sendTelegramMessage(chatId, scheduledMessage);
          break;

        case '/notifications':
          const { data: notifSettings } = await supabase
            .from('telegram_notifications')
            .select('*')
            .eq('telegram_user_id', userId)
            .single();

          const settings = notifSettings || {
            airdrop_complete: true,
            token_launch_complete: true,
            transaction_failed: true,
            scheduled_airdrop_reminder: true
          };

          await sendTelegramMessage(
            chatId,
            `🔔 Notification Settings\n\n` +
            `Airdrop Complete: ${settings.airdrop_complete ? '✅' : '❌'}\n` +
            `Token Launch Complete: ${settings.token_launch_complete ? '✅' : '❌'}\n` +
            `Transaction Failed: ${settings.transaction_failed ? '✅' : '❌'}\n` +
            `Scheduled Airdrop Reminder: ${settings.scheduled_airdrop_reminder ? '✅' : '❌'}\n\n` +
            `To change settings, visit the app settings page.`
          );
          break;

        case '/help':
        default:
          await sendTelegramMessage(
            chatId,
            `ℹ️ Help - Available Commands\n\n` +
            `/start - Welcome message\n` +
            `/status - Check your account status\n` +
            `/airdrops - View your recent airdrops\n` +
            `/tokens - View your launched tokens\n` +
            `/scheduled - View scheduled airdrops\n` +
            `/notifications - Manage notification settings\n` +
            `/help - Show this help message\n\n` +
            `Need more help? Visit our support channel.`
          );
          break;
      }

      // Log the command
      await supabase.from('security_audit_logs').insert({
        user_id: userId.toString(),
        event_type: 'telegram_command',
        event_data: { command, username, firstName },
        severity: 'info'
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in telegram-bot:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendTelegramMessage(chatId: number, text: string) {
  if (!telegramBotToken) {
    console.log('Telegram bot token not configured, skipping message send');
    return;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML'
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send Telegram message:', error);
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}
