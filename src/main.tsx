import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SolanaWalletProvider } from "./contexts/SolanaWalletContext";
import { Buffer } from "buffer";

// Polyfill Buffer for browser
window.Buffer = Buffer;

createRoot(document.getElementById("root")!).render(
  <SolanaWalletProvider>
    <App />
  </SolanaWalletProvider>
);
