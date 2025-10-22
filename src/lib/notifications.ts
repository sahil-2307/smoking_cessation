/**
 * Push Notifications Service
 * Handles web push notifications for milestones, reminders, and achievements
 */

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Notifications not supported');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Show a local notification
   */
  async showNotification(payload: NotificationPayload): Promise<void> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/icon-96x96.png',
        tag: payload.tag || 'default',
        data: payload.data,
        actions: payload.actions,
        requireInteraction: payload.requireInteraction || false,
        vibrate: [200, 100, 200],
      });
    } catch (error) {
      console.error('Error showing notification:', error);
      // Fallback to basic notification
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
      });
    }
  }

  /**
   * Schedule a notification (stores in localStorage for now)
   */
  scheduleNotification(
    id: string,
    payload: NotificationPayload,
    triggerAt: Date
  ): void {
    const scheduledNotifications = this.getScheduledNotifications();
    scheduledNotifications[id] = {
      payload,
      triggerAt: triggerAt.getTime(),
    };
    localStorage.setItem(
      'scheduled_notifications',
      JSON.stringify(scheduledNotifications)
    );
  }

  /**
   * Get scheduled notifications
   */
  private getScheduledNotifications(): Record<string, any> {
    const stored = localStorage.getItem('scheduled_notifications');
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Check and trigger scheduled notifications
   */
  async checkScheduledNotifications(): Promise<void> {
    const scheduled = this.getScheduledNotifications();
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [id, notification] of Object.entries(scheduled)) {
      if (notification.triggerAt <= now) {
        await this.showNotification(notification.payload);
        toDelete.push(id);
      }
    }

    // Clean up triggered notifications
    if (toDelete.length > 0) {
      toDelete.forEach((id) => delete scheduled[id]);
      localStorage.setItem('scheduled_notifications', JSON.stringify(scheduled));
    }
  }

  /**
   * Cancel a scheduled notification
   */
  cancelScheduledNotification(id: string): void {
    const scheduled = this.getScheduledNotifications();
    delete scheduled[id];
    localStorage.setItem('scheduled_notifications', JSON.stringify(scheduled));
  }
}

// Notification Templates

export const NotificationTemplates = {
  /**
   * Milestone achievement notification
   */
  milestone: (days: number): NotificationPayload => ({
    title: `🎉 ${days} Day${days > 1 ? 's' : ''} Smoke-Free!`,
    body: `Amazing progress! You've been smoke-free for ${days} day${days > 1 ? 's' : ''}. Keep it up!`,
    tag: `milestone-${days}`,
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'View Progress' },
      { action: 'share', title: 'Share Achievement' },
    ],
    data: { type: 'milestone', days },
  }),

  /**
   * Daily check-in reminder
   */
  dailyCheckIn: (): NotificationPayload => ({
    title: '✅ Daily Check-In',
    body: "How are you doing today? Log your progress and stay on track!",
    tag: 'daily-checkin',
    actions: [
      { action: 'checkin', title: 'Check In Now' },
      { action: 'dismiss', title: 'Later' },
    ],
    data: { type: 'daily-checkin' },
  }),

  /**
   * Craving support notification
   */
  cravingSupport: (): NotificationPayload => ({
    title: '💪 Stay Strong!',
    body: 'Remember why you quit. You can overcome this craving!',
    tag: 'craving-support',
    requireInteraction: true,
    actions: [
      { action: 'sos', title: 'SOS Help' },
      { action: 'distraction', title: 'Distraction Activity' },
    ],
    data: { type: 'craving-support' },
  }),

  /**
   * Achievement unlocked
   */
  achievement: (achievementName: string): NotificationPayload => ({
    title: '🏆 Achievement Unlocked!',
    body: `You've earned: ${achievementName}`,
    tag: `achievement-${achievementName}`,
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'View Badge' },
      { action: 'share', title: 'Share' },
    ],
    data: { type: 'achievement', name: achievementName },
  }),

  /**
   * Money saved milestone
   */
  moneySaved: (amount: number, currency: string): NotificationPayload => ({
    title: '💰 Money Saved!',
    body: `You've saved ${currency === 'INR' ? '₹' : '$'}${amount.toFixed(2)} by not smoking!`,
    tag: 'money-saved',
    actions: [
      { action: 'view', title: 'See Savings' },
    ],
    data: { type: 'money-saved', amount, currency },
  }),

  /**
   * Health benefit notification
   */
  healthBenefit: (benefit: string): NotificationPayload => ({
    title: '❤️ Health Improvement',
    body: benefit,
    tag: 'health-benefit',
    actions: [
      { action: 'view', title: 'Learn More' },
    ],
    data: { type: 'health-benefit' },
  }),

  /**
   * Buddy message notification
   */
  buddyMessage: (buddyName: string): NotificationPayload => ({
    title: `💬 Message from ${buddyName}`,
    body: 'You have a new message from your quit buddy!',
    tag: 'buddy-message',
    actions: [
      { action: 'reply', title: 'Reply' },
      { action: 'view', title: 'View' },
    ],
    data: { type: 'buddy-message', buddyName },
  }),

  /**
   * Community post interaction
   */
  communityInteraction: (type: 'like' | 'comment', userName: string): NotificationPayload => ({
    title: type === 'like' ? '❤️ New Like' : '💬 New Comment',
    body: `${userName} ${type === 'like' ? 'liked' : 'commented on'} your post`,
    tag: 'community-interaction',
    actions: [
      { action: 'view', title: 'View Post' },
    ],
    data: { type: 'community-interaction', interactionType: type, userName },
  }),
};

// Export singleton instance
export const notificationService = NotificationService.getInstance();
