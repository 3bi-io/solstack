import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { TelegramNavigation } from "@/components/TelegramNavigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <SEO
        title="404 - Page Not Found | SOL Stack"
        description="The page you're looking for doesn't exist. Return to SOL Stack homepage to access token launch, airdrops, and Solana trading features."
        url={location.pathname}
        noindex={true}
      />
      <AppHeader />
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <Card className="bg-card/50 backdrop-blur-sm text-center">
          <CardHeader className="space-y-4 pt-8">
            <div className="flex justify-center">
              <div className="p-4 bg-destructive/10 rounded-full">
                <AlertCircle className="w-12 h-12 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-4xl sm:text-5xl font-bold">404</CardTitle>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Oops! Page not found
            </p>
          </CardHeader>
          <CardContent className="pb-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <Button 
              onClick={() => navigate("/")}
              size="lg"
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
      <TelegramNavigation />
    </div>
  );
};

export default NotFound;
