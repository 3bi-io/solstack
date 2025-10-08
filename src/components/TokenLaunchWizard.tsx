import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Upload, ArrowLeft, ArrowRight, Rocket, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TokenFormData {
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  description: string;
  logoFile: File | null;
  logoUrl: string;
  website: string;
  twitter: string;
  telegram: string;
  discord: string;
  revokeMintAuthority: boolean;
  revokeFreezeAuthority: boolean;
}

interface TokenLaunchWizardProps {
  onComplete: (data: TokenFormData) => void;
  onCancel: () => void;
}

export const TokenLaunchWizard = ({ onComplete, onCancel }: TokenLaunchWizardProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<TokenFormData>({
    name: "",
    symbol: "",
    decimals: 9,
    supply: 1000000,
    description: "",
    logoFile: null,
    logoUrl: "",
    website: "",
    twitter: "",
    telegram: "",
    discord: "",
    revokeMintAuthority: false,
    revokeFreezeAuthority: false,
  });
  const { toast } = useToast();

  const updateField = (field: keyof TokenFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, SVG)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Logo must be under 5MB",
        variant: "destructive",
      });
      return;
    }

    updateField("logoFile", file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    updateField("logoUrl", previewUrl);
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!formData.logoFile) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = formData.logoFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('token-logos')
        .upload(fileName, formData.logoFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('token-logos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload logo",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.symbol) {
        toast({
          title: "Required fields",
          description: "Please fill in token name and symbol",
          variant: "destructive",
        });
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = async () => {
    // Upload logo if provided
    if (formData.logoFile) {
      const logoUrl = await uploadLogo();
      if (logoUrl) {
        updateField("logoUrl", logoUrl);
      }
    }
    
    onComplete(formData);
  };

  const estimatedCost = 0.01; // SOL

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Launch Token
            </CardTitle>
            <CardDescription>
              Step {step} of 4: {
                step === 1 ? "Basic Information" :
                step === 2 ? "Metadata & Branding" :
                step === 3 ? "Authority Settings" :
                "Review & Launch"
              }
            </CardDescription>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 w-8 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Token Name *</Label>
              <Input
                id="name"
                placeholder="e.g., My Awesome Token"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol">Token Symbol *</Label>
              <Input
                id="symbol"
                placeholder="e.g., MAT"
                value={formData.symbol}
                onChange={(e) => updateField("symbol", e.target.value.toUpperCase())}
                maxLength={10}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="decimals">Decimals</Label>
                <Input
                  id="decimals"
                  type="number"
                  min={0}
                  max={9}
                  value={formData.decimals}
                  onChange={(e) => updateField("decimals", parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supply">Initial Supply</Label>
                <Input
                  id="supply"
                  type="number"
                  min={1}
                  value={formData.supply}
                  onChange={(e) => updateField("supply", parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your token..."
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 2: Metadata & Branding */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Token Logo</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="relative"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {formData.logoFile ? "Change Logo" : "Upload Logo"}
                </Button>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                {formData.logoUrl && (
                  <img src={formData.logoUrl} alt="Logo preview" className="h-16 w-16 rounded-lg object-cover" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, SVG up to 5MB. Recommended: 512x512px
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourproject.com"
                value={formData.website}
                onChange={(e) => updateField("website", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input
                id="twitter"
                placeholder="@yourproject"
                value={formData.twitter}
                onChange={(e) => updateField("twitter", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram</Label>
              <Input
                id="telegram"
                placeholder="https://t.me/yourproject"
                value={formData.telegram}
                onChange={(e) => updateField("telegram", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discord">Discord</Label>
              <Input
                id="discord"
                placeholder="https://discord.gg/yourproject"
                value={formData.discord}
                onChange={(e) => updateField("discord", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Authority Settings */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="p-4 bg-muted rounded-lg space-y-4">
              <h3 className="font-semibold text-sm">Token Authority Controls</h3>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="revokeMint"
                  checked={formData.revokeMintAuthority}
                  onCheckedChange={(checked) => updateField("revokeMintAuthority", checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="revokeMint" className="font-medium cursor-pointer">
                    Revoke Mint Authority
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Permanently prevent creating new tokens. Supply will be fixed forever.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="revokeFreeze"
                  checked={formData.revokeFreezeAuthority}
                  onCheckedChange={(checked) => updateField("revokeFreezeAuthority", checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="revokeFreeze" className="font-medium cursor-pointer">
                    Revoke Freeze Authority
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Permanently prevent freezing token accounts. Tokens will always be transferable.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                ℹ️ <strong>Recommendation:</strong> Revoking authorities increases trust. 
                Most legitimate projects revoke both authorities after launch.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Review & Launch */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Token Name</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Symbol</span>
                <span className="font-medium">{formData.symbol}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Supply</span>
                <span className="font-medium">{formData.supply.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Decimals</span>
                <span className="font-medium">{formData.decimals}</span>
              </div>
              {formData.logoUrl && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Logo</span>
                  <img src={formData.logoUrl} alt="Logo" className="h-10 w-10 rounded" />
                </div>
              )}
              {formData.revokeMintAuthority && (
                <div className="py-2">
                  <Badge variant="secondary">Mint Authority Revoked</Badge>
                </div>
              )}
              {formData.revokeFreezeAuthority && (
                <div className="py-2">
                  <Badge variant="secondary">Freeze Authority Revoked</Badge>
                </div>
              )}
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Estimated Cost:</span>
                <span className="font-bold">{estimatedCost} SOL</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Includes token creation, metadata upload, and transaction fees
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}

          {step < 4 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Launch Token
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
