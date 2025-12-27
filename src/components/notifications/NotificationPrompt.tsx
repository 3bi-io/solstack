import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  notificationService, 
  requestNotificationPermission 
} from '@/lib/notifications';
import { toast } from '@/hooks/use-toast';

const PROMPT_DISMISSED_KEY = 'solstack_notification_prompt_dismissed';

export const NotificationPrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Don't show if not supported
    if (!notificationService.isSupported()) return;
    
    // Don't show if already granted or denied
    const permission = notificationService.getPermission();
    if (permission !== 'default') return;
    
    // Don't show if dismissed
    const dismissed = localStorage.getItem(PROMPT_DISMISSED_KEY);
    if (dismissed) return;

    // Show after a delay
    const timer = setTimeout(() => setIsVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      const permission = await requestNotificationPermission();
      
      if (permission === 'granted') {
        toast({
          title: 'Notifications Enabled',
          description: 'You\'ll now receive alerts for price changes and transactions.',
        });
        await notificationService.registerServiceWorker();
      } else if (permission === 'denied') {
        toast({
          title: 'Notifications Blocked',
          description: 'You can enable notifications in your browser settings.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setIsLoading(false);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm shadow-lg border-primary/20 animate-in slide-in-from-bottom-4">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Enable Notifications</p>
            <p className="text-xs text-muted-foreground mt-1">
              Get instant alerts for price changes, transactions, and portfolio updates.
            </p>
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                onClick={handleEnable}
                disabled={isLoading}
              >
                {isLoading ? 'Enabling...' : 'Enable'}
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={handleDismiss}
              >
                Not Now
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
