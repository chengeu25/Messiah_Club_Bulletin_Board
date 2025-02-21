import { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

type NotificationContextType = {
  notifications: NotificationType[];
  addNotification: (
    message: string,
    type: 'error' | 'info' | 'success'
  ) => void;
  deleteNotification: (id: string) => void;
};

export type NotificationType = {
  id: string;
  message: string;
  type: 'error' | 'info' | 'success';
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  deleteNotification: () => {}
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const addNotification = (
    message: string,
    type: 'error' | 'info' | 'success'
  ) => {
    const id = uuidv4();
    const newNotification = { id, message, type };
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      newNotification
    ]);

    setTimeout(() => {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== id)
      );
    }, 5000);
  };

  const deleteNotification = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, deleteNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
