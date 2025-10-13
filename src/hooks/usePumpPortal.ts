import { useEffect, useRef, useState, useCallback } from 'react';

interface PumpPortalToken {
  signature: string;
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  initialBuy?: number;
  timestamp: number;
}

interface PumpPortalMessage {
  txType: string;
  signature: string;
  mint: string;
  initialBuy?: number;
  name?: string;
  symbol?: string;
  uri?: string;
  timestamp?: number;
}

export const usePumpPortal = () => {
  const [tokens, setTokens] = useState<PumpPortalToken[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket('wss://pumpportal.fun/api/data');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('PumpPortal WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;

        // Subscribe to new token events
        ws.send(JSON.stringify({
          method: "subscribeNewToken"
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data: PumpPortalMessage = JSON.parse(event.data);
          
          if (data.txType === 'create' && data.mint) {
            const newToken: PumpPortalToken = {
              signature: data.signature,
              mint: data.mint,
              name: data.name || 'Unknown',
              symbol: data.symbol || 'UNKNOWN',
              uri: data.uri || '',
              initialBuy: data.initialBuy,
              timestamp: data.timestamp || Date.now()
            };

            setTokens(prev => [newToken, ...prev].slice(0, 50)); // Keep last 50 tokens
          }
        } catch (err) {
          console.error('Failed to parse PumpPortal message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('PumpPortal WebSocket error:', event);
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        console.log('PumpPortal WebSocket closed');
        setIsConnected(false);
        
        // Attempt reconnection with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting to PumpPortal (attempt ${reconnectAttempts.current})...`);
            connect();
          }, delay);
        } else {
          setError('Failed to connect after multiple attempts');
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to establish connection');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    tokens,
    isConnected,
    error,
    reconnect: connect,
    disconnect
  };
};
