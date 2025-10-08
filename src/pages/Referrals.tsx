import { useEffect, useState } from "react";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Gift, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ReferralCode {
  id: string;
  code: string;
  uses_count: number;
  max_uses: number | null;
  reward_type: string;
  reward_value: number;
  is_active: boolean;
  created_at: string;
}

interface Referral {
  id: string;
  referred_id: string;
  status: string;
  reward_amount: number;
  created_at: string;
  completed_at: string | null;
}

export default function Referrals() {
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      // Fetch user's referral code
      const { data: codeData } = await supabase
        .from("referral_codes" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      setReferralCode(codeData as any);

      // Fetch referrals
      const { data: referralsData } = await supabase
        .from("referrals" as any)
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      setReferrals((referralsData as any) || []);
    } catch (error) {
      console.error("Error fetching referral data:", error);
      toast({
        title: "Error",
        description: "Failed to load referral data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createReferralCode = async () => {
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate unique code
      const code = `${user.id.substring(0, 8).toUpperCase()}`;

      const { data, error } = await supabase
        .from("referral_codes" as any)
        .insert({
          user_id: user.id,
          code,
          reward_type: "percentage",
          reward_value: 10,
          max_uses: null,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setReferralCode(data as any);
      toast({
        title: "Referral Code Created",
        description: "Your referral code has been created successfully!",
      });
    } catch (error) {
      console.error("Error creating referral code:", error);
      toast({
        title: "Error",
        description: "Failed to create referral code",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const copyReferralLink = () => {
    if (!referralCode) return;
    const link = `${window.location.origin}/?ref=${referralCode.code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Referral link copied to clipboard!",
    });
  };

  const copyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode.code);
    toast({
      title: "Code Copied",
      description: "Referral code copied to clipboard!",
    });
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

  const totalEarnings = referrals.reduce((sum, r) => sum + (r.reward_amount || 0), 0);
  const completedReferrals = referrals.filter(r => r.status === 'completed').length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader />
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Referral Program</h1>
          <p className="text-muted-foreground">
            Earn rewards by inviting others to join SOL Stack
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Total Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referrals.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedReferrals} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                In rewards
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Code Uses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referralCode?.uses_count || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {referralCode?.max_uses ? `of ${referralCode.max_uses}` : 'Unlimited'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Code */}
        {referralCode ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Code</CardTitle>
              <CardDescription>
                Share this code or link to earn 10% commission on referrals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={referralCode.code}
                  readOnly
                  className="font-mono text-lg"
                />
                <Button onClick={copyCode} variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Referral Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/?ref=${referralCode.code}`}
                    readOnly
                    className="text-sm"
                  />
                  <Button onClick={copyReferralLink} variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">How it works:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>1. Share your referral link or code</li>
                  <li>2. New users sign up using your code</li>
                  <li>3. You earn {referralCode.reward_value}% commission on their first transaction</li>
                  <li>4. Rewards are automatically credited to your account</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Create Your Referral Code</CardTitle>
              <CardDescription>
                Start earning rewards by referring new users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={createReferralCode} disabled={creating}>
                {creating ? "Creating..." : "Create Referral Code"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Referral History */}
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
            <CardDescription>Track your successful referrals</CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length > 0 ? (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">
                        User ID: {referral.referred_id.substring(0, 8)}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                        {referral.status}
                      </Badge>
                      {referral.reward_amount > 0 && (
                        <p className="text-sm font-medium text-green-600 mt-1">
                          +${referral.reward_amount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No referrals yet. Start sharing your code!
              </p>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
      <TelegramNavigation />
    </div>
  );
}
