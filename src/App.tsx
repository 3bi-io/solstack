import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LaunchCoin from "./pages/LaunchCoin";
import Transactions from "./pages/Transactions";
import Airdrop from "./pages/Airdrop";
import Wallet from "./pages/Wallet";
import Logs from "./pages/Logs";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/launch" element={<LaunchCoin />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/airdrop" element={<Airdrop />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/help" element={<Help />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
