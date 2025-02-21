import { createContext, useContext, useState } from 'react';

type NotificationContextType = {
  notifications: NotificationType[];
  setNotifications: (notifications: NotificationType[]) => void;
};

export type NotificationType = {
  id: string;
  message: string;
  type: 'error' | 'info' | 'success';
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  setNotifications: () => {}
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
