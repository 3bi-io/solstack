import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Zap,
  TrendingUp,
  ArrowRight,
  Settings2,
  ChevronDown,
  ChevronUp,
  History,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { formatDistanceToNow } from "date-fns";

interface OptimizerSettings {
  id: string;
  is_enabled: boolean;
  min_apy_difference: number;
  max_gas_cost: number;
  check_interval_hours: number;
  risk_tolerance: 'low' | 'medium' | 'high';
  last_optimization_at: string | null;
}

interface OptimizationHistory {
  id: string;
  from_farm_name: string;
  to_farm_name: string;
  amount: number;
  token: string;
  old_apy: number;
  new_apy: number;
  apy_gain: number;
  status: string;
  created_at: string;
}

interface Farm {
  id: string;
  name: string;
  token: string;
  apy: number;
  riskLevel: 'low' | 'medium' | 'high';
  lockPeriod: number;
}

interface FarmPosition {
  farm_id: string;
  farm_name: string;
  token: string;
  staked_amount: number;
  lock_end_at: string | null;
}

interface OptimizationSuggestion {
  fromFarm: Farm;
  toFarm: Farm;
  position: FarmPosition;
  apyGain: number;
  estimatedYearlyGain: number;
}

interface YieldOptimizerProps {
  settings: OptimizerSettings | null;
  history: OptimizationHistory[];
  suggestions: OptimizationSuggestion[];
  isLoading: boolean;
  onUpdateSettings: (settings: Partial<OptimizerSettings>) => Promise<boolean>;
  onExecuteOptimization: (suggestion: OptimizationSuggestion) => Promise<boolean>;
}

export const YieldOptimizer = ({
  settings,
  history,
  suggestions,
  isLoading,
  onUpdateSettings,
  onExecuteOptimization,
}: YieldOptimizerProps) => {
  const { connected } = useWallet();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState({
    min_apy_difference: settings?.min_apy_difference || 5,
    risk_tolerance: settings?.risk_tolerance || 'medium',
  });

  const handleToggleOptimizer = async () => {
    await onUpdateSettings({ is_enabled: !settings?.is_enabled });
  };

  const handleSaveSettings = async () => {
    await onUpdateSettings(localSettings);
    setSettingsOpen(false);
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Badge variant="outline" className="border-green-500/50 text-green-500 bg-green-500/10">Low Risk</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 bg-yellow-500/10">Medium Risk</Badge>;
      case 'high':
        return <Badge variant="outline" className="border-red-500/50 text-red-500 bg-red-500/10">High Risk</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="gap-1 border-green-500/50 text-green-500"><CheckCircle2 className="w-3 h-3" />Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="gap-1 border-red-500/50 text-red-500"><AlertCircle className="w-3 h-3" />Failed</Badge>;
      case 'partial':
        return <Badge variant="outline" className="gap-1 border-yellow-500/50 text-yellow-500"><AlertCircle className="w-3 h-3" />Partial</Badge>;
      default:
        return <Badge variant="outline" className="gap-1 border-muted-foreground/50"><Clock className="w-3 h-3" />Pending</Badge>;
    }
  };

  if (!connected) {
    return (
      <Card className="border-accent/20 bg-gradient-to-br from-card via-card to-accent/5">
        <CardContent className="p-6 text-center">
          <Zap className="w-12 h-12 mx-auto mb-4 text-accent opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Yield Optimizer</h3>
          <p className="text-muted-foreground mb-4">Connect your wallet to enable automatic yield optimization</p>
          <WalletMultiButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-card via-card to-accent/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/30">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">Yield Optimizer</CardTitle>
              <p className="text-sm text-muted-foreground">Auto-move funds to higher APY farms</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Switch
              checked={settings?.is_enabled || false}
              onCheckedChange={handleToggleOptimizer}
              disabled={isLoading}
            />
            <span className="text-sm text-muted-foreground">
              {settings?.is_enabled ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Settings Collapsible */}
        <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Optimizer Settings
              </span>
              {settingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label>Minimum APY Difference: {localSettings.min_apy_difference}%</Label>
              <Slider
                value={[localSettings.min_apy_difference]}
                onValueChange={([value]) => setLocalSettings(s => ({ ...s, min_apy_difference: value }))}
                min={1}
                max={20}
                step={0.5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Only suggest moves with at least this much APY improvement</p>
            </div>

            <div className="space-y-2">
              <Label>Risk Tolerance</Label>
              <Select
                value={localSettings.risk_tolerance}
                onValueChange={(value: 'low' | 'medium' | 'high') => setLocalSettings(s => ({ ...s, risk_tolerance: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      Low - Only safe farms
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-yellow-500" />
                      Medium - Balanced approach
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-500" />
                      High - Maximum yields
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSaveSettings} disabled={isLoading} className="w-full">
              Save Settings
            </Button>
          </CollapsibleContent>
        </Collapsible>

        {/* Suggestions */}
        {suggestions.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Optimization Opportunities ({suggestions.length})
            </h4>
            
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-border/50 bg-muted/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{suggestion.fromFarm.name}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-green-500">{suggestion.toFarm.name}</span>
                  </div>
                  {getRiskBadge(suggestion.toFarm.riskLevel)}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-mono">{Number(suggestion.position.staked_amount).toFixed(4)} {suggestion.position.token}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">APY Change</p>
                    <p className="font-mono">
                      {suggestion.fromFarm.apy.toFixed(1)}% → <span className="text-green-500">{suggestion.toFarm.apy.toFixed(1)}%</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Est. Yearly Gain</p>
                    <p className="font-mono text-green-500">+{suggestion.estimatedYearlyGain.toFixed(4)} {suggestion.position.token}</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => onExecuteOptimization(suggestion)}
                  disabled={isLoading}
                  className="w-full gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Optimize (+{suggestion.apyGain.toFixed(1)}% APY)
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center rounded-lg border border-border/50 bg-muted/20">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-500 opacity-50" />
            <p className="text-muted-foreground">Your positions are optimally allocated!</p>
            <p className="text-xs text-muted-foreground mt-1">No better opportunities found with current settings</p>
          </div>
        )}

        {/* History Collapsible */}
        {history.length > 0 && (
          <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Optimization History
                </span>
                {historyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {history.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-border/30 bg-muted/10 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span>{item.from_farm_name}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span>{item.to_farm_name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.amount} {item.token} • +{item.apy_gain.toFixed(1)}% APY • {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};
