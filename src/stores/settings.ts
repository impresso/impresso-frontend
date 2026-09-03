import { defineStore } from 'pinia'

export interface State {
  lastNotificationDate: string
  /** Highest job id the user has already seen in the tasks dropdown. */
  lastSeenJobId: number
  language_code: string
  cookiesAccepted: boolean
  searchDisplayStyle: string
  /**
   * If true or not set - show extended datalab code in the
   * 'try in datalab' modal.
   */
  showExtendedDatalabCode: boolean
  /**
   *
   */
  showGettingStartedInSourcesOverview: boolean
}

export const useSettingsStore = defineStore('settings', {
  state: (): State => ({
    lastNotificationDate: new Date(0).toISOString(),
    lastSeenJobId: 0,
    language_code: 'en',
    cookiesAccepted: false,
    searchDisplayStyle: 'list',
    showExtendedDatalabCode: true,
    showGettingStartedInSourcesOverview: true
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
    updateLastSeenJobId(id: number) {
      if (id > this.lastSeenJobId) this.lastSeenJobId = id
    },
    setLanguageCode(code: string) {
      this.language_code = code
    },
    setCookiesAccepted(accepted: boolean) {
      this.cookiesAccepted = accepted
    },
    updateSearchDisplayStyle(style: string) {
      this.searchDisplayStyle = style
    },
    setShowExtendedDatalabCode(show: boolean) {
      this.showExtendedDatalabCode = show
    },
    setShowGettingStartedInSourcesOverview(show: boolean) {
      this.showGettingStartedInSourcesOverview = show
    }
  },
  persist: {
    paths: [
      'termsAgreed',
      'cookiesAccepted',
      'lastNotificationDate',
      'lastSeenJobId',
      'language_code',
      'searchDisplayStyle',
      'showExtendedDatalabCode',
      'showGettingStartedInSourcesOverview'
    ]
  }
})
