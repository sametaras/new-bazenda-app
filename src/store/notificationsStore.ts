/**
 * Notifications Store
 * Bildirim yönetimi - local cache + API sync
 */

import { create } from 'zustand';
import { PushNotification } from '../types/notification.types';
import backendService from '../services/backend/backend.service';

interface NotificationsStore {
  notifications: PushNotification[];
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;
  hasMore: boolean;

  // Actions
  loadNotifications: (refresh?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;

  // Utility
  getUnreadCount: () => number;
  clearNotifications: () => void;
}

const NOTIFICATIONS_PER_PAGE = 20;

export const useNotifications = create<NotificationsStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  totalCount: 0,
  isLoading: false,
  hasMore: true,

  loadNotifications: async (refresh = true) => {
    const { isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true });

    try {
      const response = await backendService.getNotifications(NOTIFICATIONS_PER_PAGE, 0, false);

      if (response.success) {
        set({
          notifications: response.notifications,
          unreadCount: response.unread_count,
          totalCount: response.total_count,
          hasMore: response.notifications.length >= NOTIFICATIONS_PER_PAGE,
        });
      }
    } catch (error) {
      console.error('Load notifications error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadMore: async () => {
    const { isLoading, hasMore, notifications } = get();
    if (isLoading || !hasMore) return;

    set({ isLoading: true });

    try {
      const offset = notifications.length;
      const response = await backendService.getNotifications(NOTIFICATIONS_PER_PAGE, offset, false);

      if (response.success) {
        set({
          notifications: [...notifications, ...response.notifications],
          hasMore: response.notifications.length >= NOTIFICATIONS_PER_PAGE,
        });
      }
    } catch (error) {
      console.error('Load more notifications error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (notificationId: number) => {
    try {
      // Optimistic update
      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === notificationId ? { ...n, is_read: 1 as const, read_at: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));

      // API call
      const success = await backendService.markNotificationAsRead(notificationId);

      if (!success) {
        // Rollback on error
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === notificationId ? { ...n, is_read: 0 as const, read_at: null } : n
          ),
          unreadCount: state.unreadCount + 1,
        }));
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const { unreadCount } = get();
      const oldUnreadCount = unreadCount;

      // Optimistic update
      set(state => ({
        notifications: state.notifications.map(n => ({
          ...n,
          is_read: 1 as const,
          read_at: n.is_read ? n.read_at : new Date().toISOString(),
        })),
        unreadCount: 0,
      }));

      // API call
      const success = await backendService.markAllNotificationsAsRead();

      if (!success) {
        // Rollback on error
        set({ unreadCount: oldUnreadCount });
        get().loadNotifications(true);
      }
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  },

  deleteNotification: async (notificationId: number) => {
    try {
      const { notifications, unreadCount } = get();
      const notification = notifications.find(n => n.id === notificationId);
      const wasUnread = notification?.is_read === 0;

      // Optimistic update
      set({
        notifications: notifications.filter(n => n.id !== notificationId),
        unreadCount: wasUnread ? Math.max(0, unreadCount - 1) : unreadCount,
        totalCount: Math.max(0, get().totalCount - 1),
      });

      // API call
      const success = await backendService.deleteNotification(notificationId);

      if (!success) {
        // Rollback on error
        get().loadNotifications(true);
      }
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  },

  refreshUnreadCount: async () => {
    try {
      const response = await backendService.getNotifications(1, 0, false);
      if (response.success) {
        set({ unreadCount: response.unread_count });
      }
    } catch (error) {
      console.error('Refresh unread count error:', error);
    }
  },

  getUnreadCount: () => {
    return get().unreadCount;
  },

  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
      totalCount: 0,
      hasMore: true,
    });
  },
}));
