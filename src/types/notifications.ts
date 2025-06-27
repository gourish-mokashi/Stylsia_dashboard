// This file is intentionally left empty as part of the notification system removal.
// The file is kept to prevent import errors, but all functionality has been removed.

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

export interface NotificationPreferences {
  product_approval: boolean;
  weekly_report: boolean;
  system_updates: boolean;
  marketing_emails: boolean;
  push_notifications: boolean;
  email_notifications: boolean;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  fetchNotifications: () => Promise<void>;
}