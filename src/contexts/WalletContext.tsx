import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface WalletContextType {
  isConnected: boolean;
  walletData: string[] | null;
  seedPhrase: string | null;
  connectWallet: (fields: string[]) => void;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WALLET_STORAGE_KEY = "solstack_wallet_connected";
const WALLET_DATA_KEY = "solstack_wallet_data";

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletData, setWalletData] = useState<string[] | null>(null);
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);

  useEffect(() => {
    // Check if wallet is already connected on mount
    const connected = localStorage.getItem(WALLET_STORAGE_KEY) === "true";
    const data = localStorage.getItem(WALLET_DATA_KEY);
    
    if (connected && data) {
      const parsedData = JSON.parse(data);
      setIsConnected(true);
      setWalletData(parsedData);
      setSeedPhrase(parsedData.join(" "));
    }
  }, []);

  const connectWallet = (fields: string[]) => {
    localStorage.setItem(WALLET_STORAGE_KEY, "true");
    localStorage.setItem(WALLET_DATA_KEY, JSON.stringify(fields));
    setIsConnected(true);
    setWalletData(fields);
    setSeedPhrase(fields.join(" "));
  };

  const disconnectWallet = () => {
    localStorage.removeItem(WALLET_STORAGE_KEY);
    localStorage.removeItem(WALLET_DATA_KEY);
    setIsConnected(false);
    setWalletData(null);
    setSeedPhrase(null);
  };

  return (
    <WalletContext.Provider value={{ isConnected, walletData, seedPhrase, connectWallet, disconnectWallet }}>
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
