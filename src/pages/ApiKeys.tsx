import { useEffect, useState } from "react";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { AppHeader } from "@/components/AppHeader";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Key, Copy, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ApiKey {
  id: string;
  key_prefix: string;
  name: string;
  permissions: string[];
  rate_limit: number;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
}

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showNewKey, setShowNewKey] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from("api_keys" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApiKeys((data as any) || []);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the API key",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate random API key
      const randomKey = `pk_${Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')}`;

      // Hash for storage (simplified for browser)
      const keyHash = btoa(randomKey).substring(0, 64);

      const { error } = await supabase
        .from("api_keys" as any)
        .insert({
          user_id: user.id,
          key_hash: keyHash,
          key_prefix: randomKey.substring(0, 10) + "...",
          name: newKeyName,
          permissions: ["read"],
          rate_limit: 1000,
          is_active: true
        });

      if (error) throw error;

      setNewKey(randomKey);
      setNewKeyName("");
      setShowNewKey(true);
      await fetchApiKeys();

      toast({
        title: "API Key Created",
        description: "Make sure to copy your API key now. You won't be able to see it again!",
      });
    } catch (error) {
      console.error("Error creating API key:", error);
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from("api_keys" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchApiKeys();
      setDeleteConfirm(null);

      toast({
        title: "API Key Deleted",
        description: "The API key has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive"
      });
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Key Copied",
      description: "API key copied to clipboard!",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 pb-24">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <SEO
        title="API Keys - Manage Programmatic Access | SOL Stack"
        description="Manage API keys for programmatic access"
        url="/api-keys"
        noindex={true}
      />
      <AppHeader />
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for programmatic access to your account
          </p>
        </div>

        {/* Create New Key */}
        <Card>
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
            <CardDescription>
              Generate a new API key for Enterprise tier users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                placeholder="My API Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <Button onClick={createApiKey} disabled={creating}>
              <Plus className="h-4 w-4 mr-2" />
              {creating ? "Creating..." : "Create API Key"}
            </Button>
          </CardContent>
        </Card>

        {/* New Key Display */}
        {newKey && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-primary">Your New API Key</CardTitle>
              <CardDescription>
                ⚠️ Save this key now. You won't be able to see it again!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newKey}
                  type={showNewKey ? "text" : "password"}
                  readOnly
                  className="font-mono"
                />
                <Button onClick={() => setShowNewKey(!showNewKey)} variant="outline" size="icon">
                  {showNewKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button onClick={() => copyKey(newKey)} variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={() => setNewKey(null)} variant="secondary" className="w-full">
                I've Saved My Key
              </Button>
            </CardContent>
          </Card>
        )}

        {/* API Keys List */}
        <Card>
          <CardHeader>
            <CardTitle>Your API Keys</CardTitle>
            <CardDescription>Manage your existing API keys</CardDescription>
          </CardHeader>
          <CardContent>
            {apiKeys.length > 0 ? (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{key.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">{key.key_prefix}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(key.created_at).toLocaleDateString()}
                          {key.last_used_at && ` • Last used: ${new Date(key.last_used_at).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={key.is_active ? "default" : "secondary"}>
                        {key.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        onClick={() => setDeleteConfirm(key.id)}
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No API keys yet. Create one to get started!
              </p>
            )}
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>Learn how to use the SOL Stack API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Authentication</h4>
              <p className="text-sm text-muted-foreground">
                Include your API key in the <code className="bg-muted px-1 rounded">x-api-key</code> header:
              </p>
              <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
{`curl https://pjpickbfzrlhdnggzgcd.supabase.co/functions/v1/api-gateway \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"endpoint": "/tokens", "method": "GET"}'`}
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Available Endpoints</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <code>/tokens</code> - Get your launched tokens</li>
                <li>• <code>/airdrops</code> - View airdrop history</li>
                <li>• <code>/transactions</code> - Access transaction logs</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Rate Limits</h4>
              <p className="text-sm text-muted-foreground">
                API keys have a rate limit of 1,000 requests per hour
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
      <TelegramNavigation />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Any applications using this key will immediately lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && deleteApiKey(deleteConfirm)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
