'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, X } from 'lucide-react';
import { notificationService } from '@/lib/notifications';

export function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (!notificationService.isSupported()) {
      return;
    }

    const currentPermission = notificationService.getPermissionStatus();
    setPermission(currentPermission);

    // Don't show if already granted or denied
    if (currentPermission !== 'default') {
      return;
    }

    // Check if user has dismissed before
    const dismissedAt = localStorage.getItem('notification-prompt-dismissed');
    if (dismissedAt) {
      const daysSinceDismissal = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissal < 3) {
        return; // Don't show again for 3 days
      }
    }

    // Show prompt after 5 seconds
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    try {
      const result = await notificationService.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        // Show a test notification
        await notificationService.showNotification({
          title: '🎉 Notifications Enabled!',
          body: "You'll now receive updates about your progress and milestones.",
          tag: 'notifications-enabled',
        });
      }

      setShowPrompt(false);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('notification-prompt-dismissed', Date.now().toString());
  };

  if (!showPrompt || permission !== 'default') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 shadow-lg border-blue-200 bg-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Enable Notifications</h3>
              <p className="text-xs text-gray-500">Stay motivated with updates</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            Get notified about:
          </p>
          <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
            <li>Milestone achievements (1 day, 7 days, 30 days...)</li>
            <li>Daily check-in reminders</li>
            <li>Health improvements timeline</li>
            <li>Craving support when you need it</li>
          </ul>

          <Button
            onClick={handleEnable}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Bell className="mr-2 h-4 w-4" />
            Enable Notifications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
