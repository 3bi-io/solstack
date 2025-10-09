import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FeedbackProvider, useFeedback } from "@/contexts/FeedbackContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { GrokChatWidget } from "@/components/GrokChatWidget";
import { PoweredByBadge } from "@/components/PoweredByBadge";
import { useState } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import LaunchCoin from "./pages/LaunchCoin";
import Transactions from "./pages/Transactions";
import Airdrop from "./pages/Airdrop";
import Wallet from "./pages/Wallet";
import Logs from "./pages/Logs";
import Help from "./pages/Help";
import Admin from "./pages/Admin";
import Terms from "./pages/Terms";
import Analytics from "./pages/Analytics";
import Swap from "./pages/Swap";
import MerkleAirdrop from "./pages/MerkleAirdrop";
import MultiSig from "./pages/MultiSig";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import Referrals from "./pages/Referrals";
import ApiKeys from "./pages/ApiKeys";
import Markets from "./pages/Markets";
import GrokAnalysis from "./pages/GrokAnalysis";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isOpen, closeFeedback } = useFeedback();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(true);

  const handleBadgeTransform = () => {
    setShowBadge(false);
    setIsChatOpen(true);
  };

  return (
    <>
      <FeedbackDialog 
        open={isOpen} 
        onClose={closeFeedback}
      />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/help" element={<Help />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/markets" element={<Markets />} />
        <Route path="/grok-analysis" element={<GrokAnalysis />} />
        <Route path="/launch" element={<LaunchCoin />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/airdrop" element={<Airdrop />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/swap" element={<Swap />} />
        <Route path="/merkle-airdrop" element={<MerkleAirdrop />} />
        <Route path="/multisig" element={<MultiSig />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/api-keys" element={<ApiKeys />} />
        <Route path="/admin" element={<Admin />} />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <GrokChatWidget 
        isOpen={isChatOpen} 
        onOpenChange={setIsChatOpen}
        showDefaultButton={false}
      />
      {showBadge && <PoweredByBadge onTransform={handleBadgeTransform} />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <WalletProvider>
          <FeedbackProvider>
            <AppContent />
          </FeedbackProvider>
        </WalletProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
