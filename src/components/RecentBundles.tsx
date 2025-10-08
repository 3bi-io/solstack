import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle, Inbox } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const bundles = [
  {
    id: "BD-1234",
    time: "2 min ago",
    amount: "0.45 ETH",
    status: "completed",
    txCount: 3,
  },
  {
    id: "BD-1233",
    time: "15 min ago",
    amount: "1.2 ETH",
    status: "completed",
    txCount: 5,
  },
  {
    id: "BD-1232",
    time: "1 hour ago",
    amount: "0.8 ETH",
    status: "pending",
    txCount: 2,
  },
];

export const RecentBundles = () => {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-accent/10 flex-shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg">Recent Bundles</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your latest bundled transactions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {!user ? (
          <div className="text-center py-8">
            <Inbox className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Sign in to view your bundles</p>
          </div>
        ) : bundles.length === 0 ? (
          <div className="text-center py-8">
            <Inbox className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No bundles yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start by launching a token or creating an airdrop</p>
          </div>
        ) : (
          bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border/30"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="p-1.5 sm:p-2 rounded-lg bg-background/50 flex-shrink-0">
                  {bundle.status === "completed" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-sm text-foreground truncate">{bundle.id}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{bundle.time}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="font-semibold text-xs sm:text-sm text-foreground whitespace-nowrap">{bundle.amount}</p>
                <Badge variant="secondary" className="text-[10px] sm:text-xs bg-primary/10 text-primary border-primary/20 mt-1">
                  {bundle.txCount} txs
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
