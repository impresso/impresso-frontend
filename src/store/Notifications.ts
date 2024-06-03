import { v4 } from 'uuid'
import { Module } from 'vuex'

interface Notification {
  title: string;
  message: string;
  type: 'success' | 'error';
}

export interface StoredNotification extends Notification {
  id: string;
}

export interface NotificationsState {
  notifications: StoredNotification[]
}
export type NoticiationsModule = Module<NotificationsState, any>

export default {
  namespaced: true,
  state: () => ({
    notifications: [],
  }) as NotificationsState,
  actions: {
    addNotification({ state }, notification: Notification) {
      const id = v4();
      state.notifications = [...state.notifications, { ...notification, id }]
      setTimeout(() => {
        state.notifications = state.notifications.filter(n => n.id !== id);
      }, 5000)
      console.log('notification', state.notifications);
    },
    removeNotification({ state }, id: string) {
      state.notifications = state.notifications.filter(n => n.id !== id);
    }
  }
} as NoticiationsModule
