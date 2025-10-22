import { useEffect, useCallback } from 'react';
import { notificationService, NotificationTemplates } from '@/lib/notifications';

interface UseNotificationsOptions {
  enabled?: boolean;
  checkInterval?: number; // in milliseconds
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { enabled = true, checkInterval = 60000 } = options; // Check every minute

  /**
   * Send a milestone notification
   */
  const sendMilestoneNotification = useCallback(async (days: number) => {
    if (!enabled || notificationService.getPermissionStatus() !== 'granted') {
      return;
    }

    await notificationService.showNotification(
      NotificationTemplates.milestone(days)
    );
  }, [enabled]);

  /**
   * Send daily check-in reminder
   */
  const sendDailyCheckInReminder = useCallback(async () => {
    if (!enabled || notificationService.getPermissionStatus() !== 'granted') {
      return;
    }

    await notificationService.showNotification(
      NotificationTemplates.dailyCheckIn()
    );
  }, [enabled]);

  /**
   * Send craving support notification
   */
  const sendCravingSupport = useCallback(async () => {
    if (!enabled || notificationService.getPermissionStatus() !== 'granted') {
      return;
    }

    await notificationService.showNotification(
      NotificationTemplates.cravingSupport()
    );
  }, [enabled]);

  /**
   * Send achievement notification
   */
  const sendAchievementNotification = useCallback(async (achievementName: string) => {
    if (!enabled || notificationService.getPermissionStatus() !== 'granted') {
      return;
    }

    await notificationService.showNotification(
      NotificationTemplates.achievement(achievementName)
    );
  }, [enabled]);

  /**
   * Send money saved notification
   */
  const sendMoneySavedNotification = useCallback(async (amount: number, currency: string) => {
    if (!enabled || notificationService.getPermissionStatus() !== 'granted') {
      return;
    }

    await notificationService.showNotification(
      NotificationTemplates.moneySaved(amount, currency)
    );
  }, [enabled]);

  /**
   * Send health benefit notification
   */
  const sendHealthBenefitNotification = useCallback(async (benefit: string) => {
    if (!enabled || notificationService.getPermissionStatus() !== 'granted') {
      return;
    }

    await notificationService.showNotification(
      NotificationTemplates.healthBenefit(benefit)
    );
  }, [enabled]);

  /**
   * Schedule daily reminder
   */
  const scheduleDailyReminder = useCallback((hour: number = 20) => {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, 0, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    notificationService.scheduleNotification(
      'daily-reminder',
      NotificationTemplates.dailyCheckIn(),
      scheduledTime
    );
  }, []);

  /**
   * Check for milestone achievements and send notifications
   */
  const checkMilestones = useCallback((daysSmokeFree: number) => {
    const milestones = [1, 3, 7, 14, 21, 30, 60, 90, 180, 365];

    // Check if this is a milestone day
    if (milestones.includes(daysSmokeFree)) {
      // Check if we've already sent notification for this milestone
      const notifiedMilestones = JSON.parse(
        localStorage.getItem('notified_milestones') || '[]'
      );

      if (!notifiedMilestones.includes(daysSmokeFree)) {
        sendMilestoneNotification(daysSmokeFree);
        notifiedMilestones.push(daysSmokeFree);
        localStorage.setItem('notified_milestones', JSON.stringify(notifiedMilestones));
      }
    }
  }, [sendMilestoneNotification]);

  /**
   * Check for health benefits based on time smoke-free
   */
  const checkHealthBenefits = useCallback((hours: number) => {
    const benefits = [
      { hours: 12, message: '12 Hours: Carbon monoxide levels normalize! Your blood oxygen is improving.' },
      { hours: 24, message: '24 Hours: Heart attack risk decreases! Your circulation is getting better.' },
      { hours: 72, message: '3 Days: Breathing improves! Nicotine is out of your system.' },
      { hours: 168, message: '1 Week: Taste and smell return! Food tastes better than ever.' },
      { hours: 336, message: '2 Weeks: Circulation improves! Walking and exercise become easier.' },
      { hours: 720, message: '1 Month: Lung function increases! Coughing and shortness of breath decrease.' },
    ];

    const notifiedBenefits = JSON.parse(
      localStorage.getItem('notified_health_benefits') || '[]'
    );

    for (const benefit of benefits) {
      if (hours >= benefit.hours && !notifiedBenefits.includes(benefit.hours)) {
        sendHealthBenefitNotification(benefit.message);
        notifiedBenefits.push(benefit.hours);
        localStorage.setItem('notified_health_benefits', JSON.stringify(notifiedBenefits));
      }
    }
  }, [sendHealthBenefitNotification]);

  /**
   * Check scheduled notifications
   */
  useEffect(() => {
    if (!enabled) return;

    // Initial check
    notificationService.checkScheduledNotifications();

    // Set up interval to check scheduled notifications
    const interval = setInterval(() => {
      notificationService.checkScheduledNotifications();
    }, checkInterval);

    return () => clearInterval(interval);
  }, [enabled, checkInterval]);

  /**
   * Request permission
   */
  const requestPermission = useCallback(async () => {
    return await notificationService.requestPermission();
  }, []);

  /**
   * Get permission status
   */
  const getPermissionStatus = useCallback(() => {
    return notificationService.getPermissionStatus();
  }, []);

  /**
   * Check if notifications are supported
   */
  const isSupported = useCallback(() => {
    return notificationService.isSupported();
  }, []);

  return {
    // Notification senders
    sendMilestoneNotification,
    sendDailyCheckInReminder,
    sendCravingSupport,
    sendAchievementNotification,
    sendMoneySavedNotification,
    sendHealthBenefitNotification,

    // Schedulers
    scheduleDailyReminder,

    // Checkers
    checkMilestones,
    checkHealthBenefits,

    // Permission management
    requestPermission,
    getPermissionStatus,
    isSupported,
  };
}
