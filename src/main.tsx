import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SolanaWalletProvider } from "./contexts/SolanaWalletContext";
import { AuthProvider } from "./contexts/AuthContext";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <AuthProvider>
      <SolanaWalletProvider>
        <App />
      </SolanaWalletProvider>
    </AuthProvider>
  </HelmetProvider>
);
