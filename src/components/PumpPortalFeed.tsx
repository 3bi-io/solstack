import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { usePumpPortal } from "@/hooks/usePumpPortal";
import { Rocket, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const PumpPortalFeed = () => {
  const { tokens, isConnected, error } = usePumpPortal();

  return (
    <Card className="border-primary/20">
      <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Live Token Launches</h3>
          </div>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Live" : "Disconnected"}
          </Badge>
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <ScrollArea className="h-[400px]">
        <div className="p-4 space-y-3">
          {tokens.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Waiting for new token launches...</p>
            </div>
          ) : (
            tokens.map((token) => (
              <Card key={token.signature} className="p-3 hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm truncate">{token.name}</h4>
                      <Badge variant="secondary" className="text-xs">{token.symbol}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate mb-1">
                      {token.mint}
                    </p>
                    {token.initialBuy && (
                      <p className="text-xs text-primary">
                        Initial: {(token.initialBuy / 1e9).toFixed(4)} SOL
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(token.timestamp, { addSuffix: true })}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
