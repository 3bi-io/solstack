import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface WalletContextType {
  isConnected: boolean;
  walletData: string[] | null;
  connectWallet: (fields: string[]) => void;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WALLET_STORAGE_KEY = "protools_wallet_connected";
const WALLET_DATA_KEY = "protools_wallet_data";

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletData, setWalletData] = useState<string[] | null>(null);

  useEffect(() => {
    // Check if wallet is already connected on mount
    const connected = localStorage.getItem(WALLET_STORAGE_KEY) === "true";
    const data = localStorage.getItem(WALLET_DATA_KEY);
    
    if (connected && data) {
      setIsConnected(true);
      setWalletData(JSON.parse(data));
    }
  }, []);

  const connectWallet = (fields: string[]) => {
    localStorage.setItem(WALLET_STORAGE_KEY, "true");
    localStorage.setItem(WALLET_DATA_KEY, JSON.stringify(fields));
    setIsConnected(true);
    setWalletData(fields);
  };

  const disconnectWallet = () => {
    localStorage.removeItem(WALLET_STORAGE_KEY);
    localStorage.removeItem(WALLET_DATA_KEY);
    setIsConnected(false);
    setWalletData(null);
  };

  return (
    <WalletContext.Provider value={{ isConnected, walletData, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
};
