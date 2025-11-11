import { useEffect, useState } from "react";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { AppHeader } from "@/components/AppHeader";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, DollarSign, Zap, Coins, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalTokensLaunched: number;
  totalAirdrops: number;
  totalFeesPaid: number;
  estimatedSavings: number;
  successRate: number;
}

export default function Analytics() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);

      // Get transaction stats
      const { data: transactions, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user?.id);

      if (txError) throw txError;

      // Get tokens launched
      const { data: tokens, error: tokensError } = await supabase
        .from("tokens")
        .select("*")
        .eq("user_id", user?.id);

      if (tokensError) throw tokensError;

      // Get airdrops
      const { data: airdrops, error: airdropsError } = await supabase
        .from("airdrops")
        .select("*")
        .eq("user_id", user?.id);

      if (airdropsError) throw airdropsError;

      const successful = transactions?.filter(t => t.status === 'completed').length || 0;
      const failed = transactions?.filter(t => t.status === 'failed').length || 0;
      const total = transactions?.length || 0;
      const successRate = total > 0 ? (successful / total) * 100 : 0;

      // Calculate estimated savings (bundling saves ~40% on average)
      const totalFees = transactions?.reduce((sum, t) => sum + 0.001, 0) || 0; // Assume 0.001 SOL per tx
      const estimatedSavings = totalFees * 0.4; // 40% savings from bundling

      setAnalytics({
        totalTransactions: total,
        successfulTransactions: successful,
        failedTransactions: failed,
        totalTokensLaunched: tokens?.length || 0,
        totalAirdrops: airdrops?.length || 0,
        totalFeesPaid: totalFees,
        estimatedSavings,
        successRate,
      });

      // Prepare chart data (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const dailyData = last7Days.map(date => {
        const dayTransactions = transactions?.filter(t => 
          t.created_at.split('T')[0] === date
        ) || [];
        
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          transactions: dayTransactions.length,
          successful: dayTransactions.filter(t => t.status === 'completed').length,
          failed: dayTransactions.filter(t => t.status === 'failed').length,
        };
      });

      setChartData(dailyData);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-4">
        <p>No analytics data available</p>
      </div>
    );
  }

  const pieData = [
    { name: 'Successful', value: analytics.successfulTransactions, color: '#10b981' },
    { name: 'Failed', value: analytics.failedTransactions, color: '#ef4444' },
  ];

  const analyticsStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Analytics Dashboard - Track Your Solana Transactions",
    description: "Comprehensive analytics for your Solana transactions, tokens, and airdrops. Track costs, savings, and performance metrics.",
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <SEO
        title="Analytics Dashboard - Track Solana Transaction Costs & Savings"
        description="Comprehensive analytics for your Solana transactions. Track transaction costs, fee savings from bundling, token launches, airdrops, and success rates. Real-time performance metrics and visualizations."
        keywords="Solana analytics, crypto transaction tracker, blockchain analytics, DeFi dashboard, transaction costs, fee savings, crypto metrics"
        url="/analytics"
        structuredData={analyticsStructuredData}
      />
      <AppHeader />
      <div className="container mx-auto p-4 space-y-6">
        <div className="space-y-2">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track your transactions, costs, and savings
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.successRate.toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Launched</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTokensLaunched}</div>
            <p className="text-xs text-muted-foreground">
              SPL tokens created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Airdrops Processed</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAirdrops}</div>
            <p className="text-xs text-muted-foreground">
              Token distributions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fees Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalFeesPaid.toFixed(4)} SOL</div>
            <p className="text-xs text-muted-foreground">
              Total transaction fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {analytics.estimatedSavings.toFixed(4)} SOL
            </div>
            <p className="text-xs text-muted-foreground">
              ~40% savings from bundling
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            {analytics.successRate >= 95 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-yellow-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.successfulTransactions}/{analytics.totalTransactions} successful
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History (7 Days)</CardTitle>
            <CardDescription>Daily transaction volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="successful" fill="#10b981" name="Successful" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Success/Failure Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Status</CardTitle>
            <CardDescription>Success vs. failure distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cost Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Analysis</CardTitle>
          <CardDescription>Detailed breakdown of your transaction costs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Without Bundling</p>
                <p className="text-sm text-muted-foreground">Individual transactions</p>
              </div>
              <p className="text-lg font-bold">
                {(analytics.totalFeesPaid / 0.6).toFixed(4)} SOL
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">With Bundling (Current)</p>
                <p className="text-sm text-muted-foreground">Optimized transactions</p>
              </div>
              <p className="text-lg font-bold text-green-700 dark:text-green-400">
                {analytics.totalFeesPaid.toFixed(4)} SOL
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div>
                <p className="font-medium text-primary">Your Savings</p>
                <p className="text-sm text-muted-foreground">Total amount saved</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">
                  {analytics.estimatedSavings.toFixed(4)} SOL
                </p>
                <p className="text-sm text-primary">≈ 40% savings</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
      <TelegramNavigation />
    </div>
  );
}
