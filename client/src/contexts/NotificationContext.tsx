import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

export type NotificationSeverity = 'success' | 'error' | 'info' | 'warning';

interface NotificationContextType {
  open: boolean;
  message: string;
  severity: NotificationSeverity;
  showNotification: (message: string, severity: NotificationSeverity) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as NotificationSeverity
  });

  const showNotification = useCallback((message: string, severity: NotificationSeverity) => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, []);

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <NotificationContext.Provider 
      value={{
        ...notification,
        showNotification,
        hideNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};