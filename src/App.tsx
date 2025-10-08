import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FeedbackProvider, useFeedback } from "@/contexts/FeedbackContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { FeedbackDialog } from "@/components/FeedbackDialog";
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
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isOpen, closeFeedback } = useFeedback();

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
        
        {/* Protected Routes */}
        <Route path="/launch" element={<ProtectedRoute><LaunchCoin /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/airdrop" element={<ProtectedRoute><Airdrop /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/swap" element={<ProtectedRoute><Swap /></ProtectedRoute>} />
        <Route path="/merkle-airdrop" element={<ProtectedRoute><MerkleAirdrop /></ProtectedRoute>} />
        <Route path="/multisig" element={<ProtectedRoute><MultiSig /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
        <Route path="/api-keys" element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
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
