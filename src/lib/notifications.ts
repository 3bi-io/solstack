/**
 * Push Notification Service
 * Handles browser push notifications for price alerts and events
 */

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 
           'Notification' in window && 
           'serviceWorker' in navigator;
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    return this.permission;
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Register service worker for push notifications
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    try {
      // Register a minimal service worker for notifications
      const swCode = `
        self.addEventListener('push', function(event) {
          const data = event.data?.json() || {};
          const options = {
            body: data.body || 'You have a new notification',
            icon: '/favicon.png',
            badge: '/favicon.png',
            tag: data.tag || 'default',
            data: data.data || {},
            requireInteraction: data.requireInteraction || false
          };
          event.waitUntil(
            self.registration.showNotification(data.title || 'Solstack', options)
          );
        });

        self.addEventListener('notificationclick', function(event) {
          event.notification.close();
          event.waitUntil(
            clients.matchAll({ type: 'window' }).then(function(clientList) {
              if (clientList.length > 0) {
                return clientList[0].focus();
              }
              return clients.openWindow('/');
            })
          );
        });
      `;

      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(blob);
      
      this.serviceWorkerRegistration = await navigator.serviceWorker.register(swUrl);
      return this.serviceWorkerRegistration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  }

  /**
   * Show a notification
   */
  async show(options: NotificationOptions): Promise<Notification | null> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported');
      return null;
    }

    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return null;
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.png',
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  /**
   * Show a price alert notification
   */
  async showPriceAlert(
    symbol: string,
    condition: 'above' | 'below',
    targetPrice: number,
    currentPrice: number
  ): Promise<Notification | null> {
    return this.show({
      title: `🔔 ${symbol} Price Alert`,
      body: `${symbol} is now ${condition} $${targetPrice.toFixed(2)} (Current: $${currentPrice.toFixed(2)})`,
      tag: `price-alert-${symbol}-${targetPrice}`,
      requireInteraction: true,
      data: { type: 'price-alert', symbol, targetPrice, currentPrice },
    });
  }

  /**
   * Show a transaction notification
   */
  async showTransactionNotification(
    type: 'success' | 'failed',
    txType: string,
    amount: number,
    token: string
  ): Promise<Notification | null> {
    const emoji = type === 'success' ? '✅' : '❌';
    const status = type === 'success' ? 'Successful' : 'Failed';
    
    return this.show({
      title: `${emoji} ${txType} ${status}`,
      body: `${amount} ${token} ${txType.toLowerCase()} ${status.toLowerCase()}`,
      tag: `tx-${Date.now()}`,
      data: { type: 'transaction', txType, amount, token },
    });
  }

  /**
   * Show rebalancing notification
   */
  async showRebalanceNotification(
    completed: number,
    failed: number,
    totalValue: number
  ): Promise<Notification | null> {
    const emoji = failed === 0 ? '✅' : '⚠️';
    
    return this.show({
      title: `${emoji} Portfolio Rebalanced`,
      body: `${completed} trades completed${failed > 0 ? `, ${failed} failed` : ''}. Total value: $${totalValue.toFixed(2)}`,
      tag: 'rebalance',
      requireInteraction: true,
      data: { type: 'rebalance', completed, failed, totalValue },
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export hook-friendly functions
export const requestNotificationPermission = () => notificationService.requestPermission();
export const showNotification = (options: NotificationOptions) => notificationService.show(options);
export const getNotificationPermission = () => notificationService.getPermission();
export const isNotificationsSupported = () => notificationService.isSupported();
