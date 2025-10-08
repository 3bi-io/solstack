import { TelegramNavigation } from "@/components/TelegramNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle, Shield, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Help = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!roles);
    };

    checkAdmin();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {isAdmin && (
          <Card className="bg-card/50 backdrop-blur-sm mb-4 border-primary/20">
            <CardContent className="pt-6">
              <Button 
                onClick={() => navigate("/admin")}
                className="w-full"
                variant="outline"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card/50 backdrop-blur-sm mb-4">
          <CardContent className="pt-6">
            <Button 
              onClick={() => navigate("/terms")}
              className="w-full"
              variant="outline"
            >
              <FileText className="w-4 h-4 mr-2" />
              Terms of Service
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Help & FAQ</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Get answers to common questions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm">What is this bundler?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  A Telegram bot that helps you manage crypto transactions, token launches, and airdrops efficiently on the Solana blockchain.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-sm">What are the platform fees?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  ProTools Bundler charges a 7% platform fee on all transactions. For token launches, 7% of the total supply is minted as a platform fee. 
                  For airdrops, 7% of the total tokens being distributed is collected. This fee helps maintain and improve the platform. 
                  See our Terms of Service for complete details.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-sm">How do I connect my wallet?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  Click the "Connect Wallet" button and enter your 12-word recovery phrase to link your Solana wallet. 
                  Your recovery phrase is encrypted and stored securely.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-sm">Is it secure?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  Yes, all connections are encrypted and we use bank-grade security with Row Level Security (RLS) policies. 
                  We never store your private keys in plain text.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-sm">Do I need SOL for transactions?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  Yes, you need SOL (Solana's native token) in your wallet to pay for network transaction fees (gas fees). 
                  These fees are separate from the platform's 7% fee. You can get free devnet SOL from the Solana faucet for testing.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
      <TelegramNavigation />
    </div>
  );
};

export default Help;
