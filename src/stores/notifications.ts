import { defineStore } from 'pinia'
import { v4 } from 'uuid'

interface Notification {
  title: string;
  message: string;
  type: 'success' | 'error';
}

export interface StoredNotification extends Notification {
  id: string;
}

interface State {
  notifications: StoredNotification[]
}

export const useNotificationsStore = defineStore('notifications', {
  state: (): State => ({
    notifications: [],
  }),
  getters: {},
  actions: {
    addNotification(notification: Notification) {
      const id = v4();
      this.notifications = [...this.notifications, { ...notification, id }]
      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n.id !== id);
      }, 5000)
      console.log('notification', this.notifications);
    },
    removeNotification(id: string) {
      this.notifications = this.notifications.filter(n => n.id !== id);
    }
  },
  persist: {
    paths: [],
  },
})
