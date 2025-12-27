import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Gift, 
  Clock, 
  ExternalLink,
  ArrowDownToLine,
  ArrowUpFromLine
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RewardEvent {
  id: string;
  type: 'claim' | 'stake' | 'withdraw';
  farmName: string;
  amount: number;
  token: string;
  timestamp: Date;
  txHash?: string;
}

interface RewardsHistoryProps {
  events: RewardEvent[];
}

export const RewardsHistory = ({ events }: RewardsHistoryProps) => {
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getEventIcon = (type: RewardEvent['type']) => {
    switch (type) {
      case 'claim':
        return <Gift className="w-4 h-4 text-green-500" />;
      case 'stake':
        return <ArrowDownToLine className="w-4 h-4 text-blue-500" />;
      case 'withdraw':
        return <ArrowUpFromLine className="w-4 h-4 text-orange-500" />;
    }
  };

  const getEventBadge = (type: RewardEvent['type']) => {
    switch (type) {
      case 'claim':
        return <Badge variant="outline" className="text-green-500 border-green-500/50 bg-green-500/10">Claimed</Badge>;
      case 'stake':
        return <Badge variant="outline" className="text-blue-500 border-blue-500/50 bg-blue-500/10">Staked</Badge>;
      case 'withdraw':
        return <Badge variant="outline" className="text-orange-500 border-orange-500/50 bg-orange-500/10">Withdrawn</Badge>;
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 font-mono">
          <Gift className="w-5 h-5 text-muted-foreground" />
          Rewards & Activity History
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No activity yet</p>
              <p className="text-sm">Stake in a farm to start earning rewards</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-xl bg-card border border-border/50 hover:border-accent/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted/50">
                        {getEventIcon(event.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{event.farmName}</span>
                          {getEventBadge(event.type)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(event.timestamp)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`font-semibold ${event.type === 'claim' ? 'text-green-500' : event.type === 'stake' ? 'text-blue-500' : 'text-orange-500'}`}>
                        {event.type === 'withdraw' ? '-' : '+'}{event.amount.toFixed(4)} {event.token}
                      </p>
                      {event.txHash && (
                        <a 
                          href={`https://solscan.io/tx/${event.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
                            View <ExternalLink className="w-3 h-3" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};