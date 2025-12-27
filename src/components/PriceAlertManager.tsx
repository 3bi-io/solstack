import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Bell, 
  BellRing, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";
import { toast } from "@/hooks/use-toast";

export const PriceAlertManager = () => {
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const {
    alerts,
    activeAlerts,
    triggeredAlerts,
    isLoading,
    createAlert,
    deleteAlert,
    toggleAlert,
    currentPrice,
  } = usePriceAlerts();

  const handleCreateAlert = async () => {
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      toast({ title: "Please enter a valid price", variant: "destructive" });
      return;
    }

    const success = await createAlert(price, condition);
    if (success) {
      setTargetPrice("");
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 font-mono">
            <BellRing className="w-5 h-5 text-accent" />
            Price Alerts
          </CardTitle>
          {currentPrice && (
            <Badge variant="outline" className="gap-1">
              SOL: ${currentPrice.toFixed(2)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Create Alert Form */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
          <p className="text-sm font-medium">Create New Alert</p>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Alert me when SOL is</span>
              <Select 
                value={condition} 
                onValueChange={(v) => setCondition(v as 'above' | 'below')}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      Above
                    </span>
                  </SelectItem>
                  <SelectItem value="below">
                    <span className="flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-red-500" />
                      Below
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="Target price"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="pl-7"
                />
              </div>
              <Button 
                onClick={handleCreateAlert}
                disabled={isLoading || !targetPrice}
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>

          {currentPrice && targetPrice && !isNaN(parseFloat(targetPrice)) && (
            <p className="text-xs text-muted-foreground">
              {condition === 'above' 
                ? `Will trigger when SOL rises ${((parseFloat(targetPrice) - currentPrice) / currentPrice * 100).toFixed(2)}% from current price`
                : `Will trigger when SOL drops ${((currentPrice - parseFloat(targetPrice)) / currentPrice * 100).toFixed(2)}% from current price`
              }
            </p>
          )}
        </div>

        {/* Active Alerts */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Active Alerts
            </p>
            <Badge variant="secondary">{activeAlerts.length}</Badge>
          </div>

          <ScrollArea className="h-[200px]">
            {activeAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active alerts</p>
                <p className="text-xs">Create an alert to get notified</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg bg-card border border-border/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${alert.condition === 'above' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        {alert.condition === 'above' 
                          ? <TrendingUp className="w-4 h-4 text-green-500" />
                          : <TrendingDown className="w-4 h-4 text-red-500" />
                        }
                      </div>
                      <div>
                        <p className="font-medium">
                          {alert.token_symbol} {alert.condition} ${Number(alert.target_price).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Created {formatTimeAgo(alert.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alert.is_active}
                        onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteAlert(alert.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Triggered Alerts */}
        {triggeredAlerts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Recently Triggered
            </p>

            <div className="space-y-2">
              {triggeredAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm">
                        {alert.token_symbol} went {alert.condition} ${Number(alert.target_price).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {alert.triggered_at && formatTimeAgo(alert.triggered_at)}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAlert(alert.id, true)}
                    className="text-xs"
                  >
                    Reactivate
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};