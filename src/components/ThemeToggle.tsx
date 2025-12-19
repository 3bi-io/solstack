import { Moon, Sun, Monitor, Contrast, Eye } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { highContrast, toggleHighContrast, reducedMotion, toggleReducedMotion } = useAccessibility();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-9 w-9 hover:bg-primary/10",
            highContrast && "ring-2 ring-primary"
          )}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme and accessibility</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-primary/20">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="gap-2 cursor-pointer"
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
          {theme === 'light' && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="gap-2 cursor-pointer"
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
          {theme === 'dark' && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="gap-2 cursor-pointer"
        >
          <Monitor className="h-4 w-4" />
          <span>System</span>
          {theme === 'system' && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Accessibility</DropdownMenuLabel>
        
        <div className="px-2 py-2">
          <div 
            className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 cursor-pointer"
            onClick={toggleHighContrast}
          >
            <div className="flex items-center gap-2">
              <Contrast className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="text-sm">High Contrast</span>
                <span className="text-xs text-muted-foreground">Enhanced visibility</span>
              </div>
            </div>
            <Switch 
              checked={highContrast} 
              onCheckedChange={toggleHighContrast}
              aria-label="Toggle high contrast mode"
            />
          </div>

          <div 
            className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 cursor-pointer mt-1"
            onClick={toggleReducedMotion}
          >
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="text-sm">Reduce Motion</span>
                <span className="text-xs text-muted-foreground">Minimize animations</span>
              </div>
            </div>
            <Switch 
              checked={reducedMotion} 
              onCheckedChange={toggleReducedMotion}
              aria-label="Toggle reduced motion"
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
