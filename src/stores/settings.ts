import { defineStore } from 'pinia'

interface State {
  lastNotificationDate: string
  language_code: string
  cookiesAccepted: boolean
  searchDisplayStyle: string
}

export const useSettingsStore = defineStore('settings', {
  state: (): State => ({
    lastNotificationDate: new Date(0).toISOString(),
    language_code: 'en',
    cookiesAccepted: false,
    searchDisplayStyle: 'list'
  }),
  getters: {
    lastNotificationDateAsDate(state) {
      return new Date(state.lastNotificationDate)
    }
  },
  actions: {
    updateLastNotificationDate(date?: Date) {
      this.lastNotificationDate = date != null ? date.toISOString() : new Date().toISOString()
    },
    setLanguageCode(code: string) {
      this.language_code = code
    },
    setCookiesAccepted(accepted: boolean) {
      this.cookiesAccepted = accepted
    },
    updateSearchDisplayStyle(style: string) {
      this.searchDisplayStyle = style
    }
  },
  persist: {
    paths: [
      'termsAgreed',
      'cookiesAccepted',
      'lastNotificationDate',
      'language_code',
      'searchDisplayStyle'
    ]
  }
})
