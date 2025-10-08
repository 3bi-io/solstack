import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FeedbackProvider, useFeedback } from "@/contexts/FeedbackContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { SecurityNoticeDialog } from "@/components/SecurityNoticeDialog";
import Index from "./pages/Index";
import LaunchCoin from "./pages/LaunchCoin";
import Transactions from "./pages/Transactions";
import Airdrop from "./pages/Airdrop";
import Wallet from "./pages/Wallet";
import Logs from "./pages/Logs";
import Help from "./pages/Help";
import Admin from "./pages/Admin";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isOpen, closeFeedback } = useFeedback();

  return (
    <>
      <SecurityNoticeDialog />
      <FeedbackDialog 
        open={isOpen} 
        onClose={closeFeedback}
      />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/launch" element={<LaunchCoin />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/airdrop" element={<Airdrop />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/help" element={<Help />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/admin" element={<Admin />} />
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
