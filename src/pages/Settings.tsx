import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Shield, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface NotificationSettings {
  airdrop_complete: boolean;
  token_launch_complete: boolean;
  transaction_failed: boolean;
  scheduled_airdrop_reminder: boolean;
}

export default function Settings() {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    airdrop_complete: true,
    token_launch_complete: true,
    transaction_failed: true,
    scheduled_airdrop_reminder: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Use any type to bypass type checking until Supabase types are regenerated
      const { data, error } = await supabase
        .from("telegram_notifications" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching settings:", error);
      }

      if (data) {
        const notifData = data as any; // Type assertion for new table
        setNotifications({
          airdrop_complete: notifData.airdrop_complete ?? true,
          token_launch_complete: notifData.token_launch_complete ?? true,
          transaction_failed: notifData.transaction_failed ?? true,
          scheduled_airdrop_reminder: notifData.scheduled_airdrop_reminder ?? true
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Note: This would need telegram_user_id from Telegram WebApp
      const telegramUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
      
      // Use any type to bypass type checking until Supabase types are regenerated
      const { error } = await supabase
        .from("telegram_notifications" as any)
        .upsert({
          user_id: user.id,
          telegram_user_id: telegramUser?.id || 0,
          ...notifications
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 pb-24">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and notifications
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Telegram Notifications</CardTitle>
            </div>
            <CardDescription>
              Choose which events you want to be notified about via Telegram
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="airdrop-complete">Airdrop Complete</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when your airdrops finish processing
                </p>
              </div>
              <Switch
                id="airdrop-complete"
                checked={notifications.airdrop_complete}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, airdrop_complete: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="token-launch">Token Launch Complete</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when your token launches successfully
                </p>
              </div>
              <Switch
                id="token-launch"
                checked={notifications.token_launch_complete}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, token_launch_complete: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="transaction-failed">Transaction Failed</Label>
                <p className="text-sm text-muted-foreground">
                  Get alerted when transactions fail
                </p>
              </div>
              <Switch
                id="transaction-failed"
                checked={notifications.transaction_failed}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, transaction_failed: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="scheduled-reminder">Scheduled Airdrop Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminders before scheduled airdrops execute
                </p>
              </div>
              <Switch
                id="scheduled-reminder"
                checked={notifications.scheduled_airdrop_reminder}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, scheduled_airdrop_reminder: checked })
                }
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>
              Security and audit settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate("/logs")}>
              View Activity Logs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Subscription</CardTitle>
            </div>
            <CardDescription>
              Manage your subscription and billing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate("/billing")}>
              Manage Subscription
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
