import React, { createContext, useContext, ReactNode } from 'react';

// Minimal notification context to prevent import errors
// This is a placeholder implementation since the notification system has been removed

interface NotificationContextType {
  notifications: never[];
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value: NotificationContextType = {
    notifications: [],
    addNotification: () => {},
    removeNotification: () => {},
    markAsRead: () => {},
    markAllAsRead: () => {},
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};