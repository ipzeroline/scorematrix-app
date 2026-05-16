import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'points' | 'credits';
  title: string;
  message?: string;
  amount?: number;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  toastQueue: ToastItem[];
}

interface NotificationActions {
  addNotification: (notif: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  unreadCount: () => number;
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

let toastId = 0;
let notifId = 0;

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  persist(
    (set, get) => ({
      notifications: [],
      toastQueue: [],

      addNotification: (notif) => {
        const id = `notif-${++notifId}`;
        set((s) => ({
          notifications: [
            {
              ...notif,
              id,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...s.notifications,
          ].slice(0, 100),
        }));
      },

      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      clearAll: () => set({ notifications: [] }),

      unreadCount: () => get().notifications.filter((n) => !n.read).length,

      addToast: (toast) => {
        const id = `toast-${++toastId}`;
        set((s) => ({
          toastQueue: [...s.toastQueue, { ...toast, id }],
        }));
        setTimeout(() => {
          get().removeToast(id);
        }, 4000);
      },

      removeToast: (id) =>
        set((s) => ({
          toastQueue: s.toastQueue.filter((t) => t.id !== id),
        })),
    }),
    { name: 'scorematrix-notifications' }
  )
);
