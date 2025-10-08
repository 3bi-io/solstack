import { useState } from "react";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Gift, Upload, TreePine, Link as LinkIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MerkleAirdrop() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [recipients, setRecipients] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [merkleRoot, setMerkleRoot] = useState("");
  const { toast } = useToast();

  const handleCreateMerkleAirdrop = async () => {
    if (!tokenAddress.trim() || !recipients.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide token address and recipients",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const recipientList = recipients
        .split("\n")
        .map(line => {
          const [address, amount] = line.trim().split(/[,\s]+/);
          return { address, amount: parseFloat(amount) };
        })
        .filter(r => r.address && r.amount > 0);

      if (recipientList.length === 0) {
        throw new Error("No valid recipients found. Format: address,amount");
      }

      const { data, error } = await supabase.functions.invoke("create-merkle-airdrop", {
        body: {
          tokenAddress,
          recipients: recipientList,
        },
      });

      if (error) throw error;

      setMerkleRoot(data.merkleRoot);
      
      toast({
        title: "Merkle Tree Created!",
        description: `Airdrop created for ${recipientList.length} recipients`,
      });
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create Merkle airdrop",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader />
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TreePine className="h-8 w-8 text-primary" />
            Merkle Tree Airdrop
          </h1>
          <p className="text-muted-foreground">
            Create gas-efficient airdrops using Merkle tree proofs
          </p>
        </div>

        <Alert>
          <AlertDescription>
            <strong>How it works:</strong> Merkle tree airdrops allow recipients to claim tokens themselves, 
            saving you gas costs. You create the tree, recipients claim using their proof.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Airdrop */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Create Airdrop
              </CardTitle>
              <CardDescription>
                Generate Merkle tree for efficient distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tokenAddress">Token Address</Label>
                <Input
                  id="tokenAddress"
                  placeholder="Token mint address..."
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipients">Recipients (address,amount per line)</Label>
                <Textarea
                  id="recipients"
                  placeholder="DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC7A3VkHjW1F,100&#10;7xKXtg2CW87d97TXJSDpbDFu1sRMC7A3VkHjW1F,250"
                  rows={8}
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Format: one recipient per line with wallet address and amount separated by comma
                </p>
              </div>

              <Button 
                onClick={handleCreateMerkleAirdrop} 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Merkle Tree...
                  </>
                ) : (
                  <>
                    <TreePine className="mr-2 h-4 w-4" />
                    Create Merkle Airdrop
                  </>
                )}
              </Button>

              {merkleRoot && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <p className="text-xs font-semibold mb-1">Merkle Root:</p>
                  <p className="text-xs font-mono break-all">{merkleRoot}</p>
                  <Badge variant="default" className="mt-2">
                    <Gift className="h-3 w-3 mr-1" />
                    Airdrop Ready
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info & Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Why Merkle Airdrops?</CardTitle>
              <CardDescription>
                Save gas and scale efficiently
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TreePine className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Gas Efficient</h4>
                    <p className="text-xs text-muted-foreground">
                      Recipients pay for their own claims, reducing your costs dramatically
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Gift className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Scalable</h4>
                    <p className="text-xs text-muted-foreground">
                      Distribute to thousands of addresses without blockchain bloat
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <LinkIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Verifiable</h4>
                    <p className="text-xs text-muted-foreground">
                      Cryptographic proofs ensure only eligible addresses can claim
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg mt-4">
                <h4 className="font-semibold text-sm mb-2">How It Works:</h4>
                <ol className="text-xs space-y-1 text-muted-foreground">
                  <li>1. Upload your recipient list with amounts</li>
                  <li>2. System generates Merkle tree and root hash</li>
                  <li>3. Share claim link with recipients</li>
                  <li>4. Recipients claim using their proof</li>
                  <li>5. Smart contract verifies and distributes tokens</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
      <TelegramNavigation />
    </div>
  );
}
