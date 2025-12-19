// Buffer polyfill must be first - before any other imports
import { Buffer } from "buffer";
(window as any).Buffer = Buffer;
(globalThis as any).Buffer = Buffer;

import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";
import { SolanaWalletProvider } from "./contexts/SolanaWalletContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AccessibilityProvider>
        <AuthProvider>
          <SolanaWalletProvider>
            <App />
          </SolanaWalletProvider>
        </AuthProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  </HelmetProvider>
);
