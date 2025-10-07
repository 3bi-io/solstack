import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";

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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent/10">
            <Clock className="w-5 h-5 text-accent" />
          </div>
          <div>
            <CardTitle>Recent Bundles</CardTitle>
            <CardDescription>Your latest bundled transactions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {bundles.map((bundle) => (
          <div
            key={bundle.id}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border/30"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-background/50">
                {bundle.status === "completed" ? (
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{bundle.id}</p>
                <p className="text-xs text-muted-foreground">{bundle.time}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm text-foreground">{bundle.amount}</p>
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                {bundle.txCount} txs
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
