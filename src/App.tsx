import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FeedbackProvider, useFeedback } from "@/contexts/FeedbackContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import LaunchCoin from "./pages/LaunchCoin";
import Transactions from "./pages/Transactions";
import Airdrop from "./pages/Airdrop";
import Wallet from "./pages/Wallet";
import Logs from "./pages/Logs";
import Help from "./pages/Help";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

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
        <Route path="/launch" element={<ProtectedRoute><LaunchCoin /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/airdrop" element={<ProtectedRoute><Airdrop /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
        <Route path="/help" element={<Help />} />
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
        <AuthProvider>
          <WalletProvider>
            <FeedbackProvider>
              <AppContent />
            </FeedbackProvider>
          </WalletProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
