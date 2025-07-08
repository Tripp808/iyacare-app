'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { getAlerts, markAlertAsRead, Alert } from '@/lib/firebase/alerts';

interface NotificationContextType {
  notifications: Alert[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (alertId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Get only unread alerts
      const result = await getAlerts(false);
      
      if (result.success) {
        setNotifications(result.alerts || []);
      } else {
        console.error('Failed to fetch notifications:', result.error);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const result = await markAlertAsRead(alertId);
      
      if (result.success) {
        // Remove the alert from unread notifications
        setNotifications(prev => prev.filter(notification => notification.id !== alertId));
      } else {
        console.error('Failed to mark notification as read:', result.error);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    refreshNotifications: fetchNotifications,
    markAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 