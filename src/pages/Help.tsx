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
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
              <Button onClick={() => navigate("/admin")} className="w-full" variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card/50 backdrop-blur-sm mb-4">
          <CardContent className="pt-6">
            <Button onClick={() => navigate("/terms")} className="w-full" variant="outline">
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
                <CardDescription className="text-xs sm:text-sm">Get answers to common questions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm">What is ProTools Bundler?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  ProTools Bundler is a comprehensive platform for managing Solana blockchain operations. Launch your
                  own tokens, distribute airdrops to multiple wallets, track all your transactions, and manage your
                  crypto wallet - all in one place. Accessible via web and Telegram bot for maximum convenience.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-sm">How do I launch a token?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  Navigate to the Launch tab, fill in your token details (name, symbol, supply, decimals), and
                  optionally add a description and logo. Click "Launch Token" to create your SPL token on Solana. The
                  process takes just a few moments and you'll receive your token's mint address upon completion.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-sm">How do airdrops work?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  In the Airdrop tab, enter your token address, amount per recipient, and a list of wallet addresses
                  (one per line). The platform will distribute tokens to all addresses automatically. You can track the
                  progress and see which transfers succeeded or failed in real-time.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-sm">Is ProTools free?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  ProTools Bundler is free to all users. Network gas fees (paid in SOL) are additional and go to the
                  Solana network validators. See our Terms of Service for full details.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-sm">How do I connect my wallet?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  Go to the Wallet tab and click "Connect Wallet". You'll need to enter your 12-word recovery phrase
                  (seed phrase) to link your Solana wallet. Your recovery phrase is encrypted using industry-standard
                  encryption before storage. Never share your recovery phrase with anyone else.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-sm">Is my wallet secure?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  Yes. We use bank-grade encryption for all sensitive data, including your recovery phrase. Our database
                  implements Row Level Security (RLS) policies ensuring only you can access your wallet information. All
                  connections are encrypted with TLS. However, always practice good security hygiene and never share
                  your recovery phrase.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-sm">Do I need SOL in my wallet?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  Yes, you need SOL (Solana's native cryptocurrency) to pay for network transaction fees. These gas fees
                  are required for all blockchain operations including token launches, transfers, and airdrops. The
                  amount varies based on network congestion but is typically very low. For testing, you can get free
                  devnet SOL from the Solana faucet.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger className="text-sm">Where can I view my transaction history?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  All your transactions are available in the Transactions tab. You can see the type, amount, status, and
                  timestamp of each transaction. Click on any transaction to view more details including the blockchain
                  signature and recipient information.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9">
                <AccordionTrigger className="text-sm">What should I do if a transaction fails?</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-muted-foreground">
                  First, check your wallet balance to ensure you have enough SOL for gas fees. Check the error message
                  in the Logs or Transactions tab for specific details. Common issues include insufficient balance,
                  incorrect addresses, or network congestion. If problems persist, contact support through our Terms of
                  Service page.
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
