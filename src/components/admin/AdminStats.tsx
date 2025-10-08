import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, TrendingUp, Clock } from "lucide-react";

interface AdminStatsProps {
  totalSubmissions: number;
  verifiedSubmissions: number;
  recentSubmissions: number;
}

export const AdminStats = ({ totalSubmissions, verifiedSubmissions, recentSubmissions }: AdminStatsProps) => {
  const verificationRate = totalSubmissions > 0 
    ? ((verifiedSubmissions / totalSubmissions) * 100).toFixed(1)
    : "0";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSubmissions}</div>
          <p className="text-xs text-muted-foreground mt-1">All-time connections</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Verified</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{verifiedSubmissions}</div>
          <p className="text-xs text-muted-foreground mt-1">{verificationRate}% verified rate</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Last 24h</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentSubmissions}</div>
          <p className="text-xs text-muted-foreground mt-1">Recent activity</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Growth</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {recentSubmissions > 0 ? '+' : ''}{recentSubmissions}
          </div>
          <p className="text-xs text-muted-foreground mt-1">vs previous day</p>
        </CardContent>
      </Card>
    </div>
  );
};
