import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { NetworkStatus } from "@/components/NetworkStatus";
import { useNavigate, useLocation } from "react-router-dom";

export const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-3 sm:px-4">
        {/* Left: Home Button (hidden on home page) */}
        <div className="flex items-center gap-2">
          {!isHome && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          )}
          {isHome && <div className="w-14" />} {/* Spacer for alignment */}
        </div>

        {/* Center: Network Status */}
        <div className="flex-1 flex justify-center">
          <NetworkStatus />
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center">
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
