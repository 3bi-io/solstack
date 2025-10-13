import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useBundleManager } from "@/hooks/useBundleManager";
import { Badge } from "@/components/ui/badge";

interface Bundle {
  id: string;
  bundle_name: string;
  total_wallets: number;
  total_amount: number;
  status: string;
  created_at: string;
  distribution_strategy: string;
  bundle_wallets: any[];
}

export const RecentBundles = () => {
  const { getBundles } = useBundleManager();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      const data = await getBundles();
      setBundles(data?.slice(0, 5) || []);
      setLoading(false);
    };
    fetchBundles();
  }, [getBundles]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-warning animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'processing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Recent Bundles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 flex-shrink-0">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg">Recent Bundles</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your latest multi-wallet transactions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {bundles.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            No bundles yet. Create your first bundle to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {bundles.map((bundle) => (
              <div 
                key={bundle.id} 
                className="p-3 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(bundle.status)}
                      <h4 className="font-medium text-sm truncate">{bundle.bundle_name}</h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getStatusVariant(bundle.status)} className="text-xs">
                        {bundle.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {bundle.total_wallets} wallets
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {Number(bundle.total_amount).toFixed(4)} SOL
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(bundle.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};