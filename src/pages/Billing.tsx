import { useEffect, useState } from "react";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Subscription {
  id: string;
  tier: string;
  status: string;
  current_period_end: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  current_period_start?: string | null;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

const tiers = [
  {
    name: "Free",
    price: "$0",
    icon: Rocket,
    features: [
      "5 transactions/month",
      "Basic token launch",
      "Simple airdrops (up to 10 addresses)",
      "Community support",
      "Standard transaction fees"
    ],
    limits: "Perfect for trying out the platform"
  },
  {
    name: "Pro",
    price: "$29",
    icon: Zap,
    features: [
      "100 transactions/month",
      "Advanced token features",
      "Bulk airdrops (up to 500 addresses)",
      "CSV import",
      "Priority support",
      "20% fee discount",
      "Telegram notifications"
    ],
    limits: "Best for regular users"
  },
  {
    name: "Enterprise",
    price: "$99",
    icon: Crown,
    features: [
      "Unlimited transactions",
      "All Pro features",
      "Bulk airdrops (unlimited)",
      "API access",
      "Dedicated support",
      "50% fee discount",
      "Custom integrations",
      "Multi-signature support"
    ],
    limits: "For power users and teams"
  }
];

export default function Billing() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Use any type to bypass type checking until Supabase types are regenerated
      const { data, error } = await supabase
        .from("subscriptions" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscription:", error);
      }

      if (data) {
        setSubscription(data as unknown as Subscription);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (tierName: string) => {
    toast({
      title: "Coming Soon",
      description: `${tierName} tier will be available soon with Stripe integration!`,
    });
  };

  const currentTier = subscription?.tier || "free";

  if (loading) {
    return (
      <div className="container mx-auto p-4 pb-24">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading subscription details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader />
      <div className="container mx-auto p-4">
        <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Subscription & Billing</h1>
          <p className="text-muted-foreground">
            Choose the plan that fits your needs
          </p>
        </div>

        {subscription && (
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {subscription.tier.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Status: <span className="font-medium">{subscription.status}</span>
                  </p>
                  {subscription.current_period_end && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Renews on: {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isCurrentTier = currentTier.toLowerCase() === tier.name.toLowerCase();
            
            return (
              <Card 
                key={tier.name}
                className={`relative ${isCurrentTier ? 'border-primary shadow-lg' : ''}`}
              >
                {isCurrentTier && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Current Plan</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className="h-6 w-6 text-primary" />
                    <CardTitle>{tier.name}</CardTitle>
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription className="mt-2">
                    {tier.limits}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={isCurrentTier ? "outline" : "default"}
                    onClick={() => handleUpgrade(tier.name)}
                    disabled={isCurrentTier}
                  >
                    {isCurrentTier ? "Current Plan" : `Upgrade to ${tier.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Need a Custom Plan?</CardTitle>
            <CardDescription>
              Contact us for custom pricing and enterprise solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Contact Sales</Button>
          </CardContent>
        </Card>
        </div>
      </div>
      <TelegramNavigation />
    </div>
  );
}
