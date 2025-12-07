import { create } from 'zustand';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
};

type NotificationsStore = {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
};

export const useNotifications = create<NotificationsStore>((set) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, notification.duration || 5000);
    }
  },
  
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
    
  clearNotifications: () => set({ notifications: [] }),
}));
