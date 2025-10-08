import { useState, useEffect } from "react";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Info, AlertCircle, CheckCircle2, AlertTriangle, Activity } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

interface LogEntry {
  id: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: Date;
  category: string;
  details?: string;
}

const Logs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const { isConnected } = useWallet();

  // Mock log data
  useEffect(() => {
    if (isConnected) {
      const mockLogs: LogEntry[] = [
        {
          id: '1',
          level: 'success',
          message: 'Token MTK launched successfully',
          timestamp: new Date(Date.now() - 3600000),
          category: 'token',
          details: 'Initial supply: 1,000,000 MTK',
        },
        {
          id: '2',
          level: 'info',
          message: 'Wallet connected',
          timestamp: new Date(Date.now() - 7200000),
          category: 'wallet',
        },
        {
          id: '3',
          level: 'success',
          message: 'Airdrop completed to 25 addresses',
          timestamp: new Date(Date.now() - 9000000),
          category: 'airdrop',
          details: 'Total distributed: 125,000 MTK',
        },
        {
          id: '4',
          level: 'warning',
          message: 'Network congestion detected',
          timestamp: new Date(Date.now() - 10800000),
          category: 'network',
          details: 'Transaction may take longer than usual',
        },
        {
          id: '5',
          level: 'error',
          message: 'Transaction failed: Insufficient balance',
          timestamp: new Date(Date.now() - 14400000),
          category: 'transaction',
          details: 'Required: 0.05 SOL, Available: 0.02 SOL',
        },
        {
          id: '6',
          level: 'info',
          message: 'Bundle optimization applied',
          timestamp: new Date(Date.now() - 18000000),
          category: 'bundler',
          details: 'Saved 15% on transaction fees',
        },
      ];
      setLogs(mockLogs);
    }
  }, [isConnected]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || log.level === activeTab;
    return matchesSearch && matchesTab;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      success: 'default',
      info: 'secondary',
      warning: 'outline',
      error: 'destructive',
    };
    return <Badge variant={variants[level] || 'secondary'}>{level}</Badge>;
  };

  const logCounts = {
    all: logs.length,
    success: logs.filter(l => l.level === 'success').length,
    info: logs.filter(l => l.level === 'info').length,
    warning: logs.filter(l => l.level === 'warning').length,
    error: logs.filter(l => l.level === 'error').length,
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl">Activity Logs</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Monitor all system activities and events
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <Alert>
                <AlertDescription>
                  Please connect your wallet to view activity logs.
                </AlertDescription>
              </Alert>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All ({logCounts.all})</TabsTrigger>
                  <TabsTrigger value="success">Success ({logCounts.success})</TabsTrigger>
                  <TabsTrigger value="info">Info ({logCounts.info})</TabsTrigger>
                  <TabsTrigger value="warning">Warning ({logCounts.warning})</TabsTrigger>
                  <TabsTrigger value="error">Error ({logCounts.error})</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab} className="mt-4">
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-sm">No logs found</p>
                      <p className="text-xs mt-1">
                        {searchTerm ? "Try a different search term" : "Your activity will be logged here"}
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-3">
                        {filteredLogs.map((log) => (
                          <div 
                            key={log.id}
                            className="p-4 bg-background/50 border rounded-lg space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-3 flex-1">
                                {getLevelIcon(log.level)}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    {getLevelBadge(log.level)}
                                    <Badge variant="outline" className="text-xs">
                                      {log.category}
                                    </Badge>
                                  </div>
                                  <p className="text-sm font-medium">{log.message}</p>
                                  {log.details && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {log.details}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {format(log.timestamp, "MMM d, HH:mm:ss")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
      <TelegramNavigation />
    </div>
  );
};

export default Logs;
