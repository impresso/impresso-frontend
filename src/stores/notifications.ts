import { defineStore } from 'pinia'
import { v4 } from 'uuid'
import { FeathersError } from '@feathersjs/errors'
import { errorCollector } from '@/services'

interface HookErrorMixin {
  hook: { path: string; method: string }
}

const ERRORS_DO_NOT_DISPLAY = ['NavigationDuplicated'] // error names not to display to the user
const ERRORS_DO_NOT_FORWARD = ['BadGateway', 'TransportError', 'NotAuthenticated'] // error to avoid loopholes

export interface Notification {
  title: string
  message: string
  type: 'success' | 'error'
}

export interface StoredNotification extends Notification {
  id: string
}

export interface ErrorMessage {
  id: string
  route: string[]
  message: string
  code: number
  name: string
}

interface ProcessingActivity {
  route: string
  status: string
  c: number
}

export interface State {
  notifications: StoredNotification[]
  // error message handling,
  errorMessages: ErrorMessage[]
  errorMessagesIndex: string[]
  // status
  connectivityStatus: boolean
  processingLocked: boolean
  // processing queue
  processingActivities: ProcessingActivity[]
  processingActivitiesIndex: string[]
  _processingTimer?: NodeJS.Timeout
  processingStatus: boolean
  // init sequence
  initSequenceDone: boolean
  // lock screen
  _lockTimeoutId?: ReturnType<typeof setTimeout> | null
}

export interface DisplayErrorPayload {
  error: Error
  origin?: string
}

const isHookMixinError = (error: any): error is HookErrorMixin => {
  return (
    (error as HookErrorMixin).hook !== undefined &&
    (error as HookErrorMixin).hook.path !== undefined &&
    (error as HookErrorMixin).hook.method !== undefined
  )
}
const isFeathersError = (error: any): error is FeathersError => {
  return (
    (error as FeathersError).code !== undefined && (error as FeathersError).className !== undefined
  )
}

export const useNotificationsStore = defineStore('notifications', {
  state: (): State => ({
    notifications: [],
    errorMessages: [],
    errorMessagesIndex: [],
    connectivityStatus: false,
    processingLocked: false,
    processingActivities: [],
    processingActivitiesIndex: [],
    processingStatus: false,
    initSequenceDone: false,
    _lockTimeoutId: null
  }),
  getters: {},
  actions: {
    setInitSequenceDone() {
      this.initSequenceDone = true
    },
    addNotification(notification: Notification) {
      const id = v4()
      this.notifications = [...this.notifications, { ...notification, id }]
      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n.id !== id)
      }, 5000)
      console.log('notification', this.notifications)
    },
    removeNotification(id: string) {
      this.notifications = this.notifications.filter(n => n.id !== id)
    },
    async displayError({ error, origin = '' }: DisplayErrorPayload) {
      const errorId = v4()
      const errorRoute: string[] = []

      // get error route if possible
      if (isHookMixinError(error)) {
        errorRoute.push(error.hook.path)
        errorRoute.push(error.hook.method)
      }

      const errorCode = isFeathersError(error) ? error.code : 0
      console.error(error)

      console.error(
        `[Unexpected error ${error.name}]: ${errorRoute.join('.')} (origin:${origin})`,
        errorCode,
        error.name,
        error.message,
        error
      )
      if (errorRoute.length && errorRoute[0] === 'errors-collector') {
        console.info(
          'Error',
          error.name,
          'at',
          errorRoute,
          'has not been dispatched. Source: errors-collector. Risk of loopholes'
        )
      } else {
        if (!ERRORS_DO_NOT_DISPLAY.includes(error.name)) {
          const hash = JSON.stringify([...errorRoute, errorCode, error.name])
          if (!this.errorMessagesIndex.includes(hash)) {
            this.errorMessagesIndex.push(hash)
            this.errorMessages.push({
              id: errorId,
              route: errorRoute,
              message: error.message,
              code: errorCode,
              name: error.name
            })
          }
        }

        // do not force if BadGateway or polling error (risk of having endless and useless loops)
        const errorType = isFeathersError(error) ? error.type : undefined
        const className = isFeathersError(error) ? error.className : undefined

        if (import.meta.env.MODE === 'development') {
          console.warn(
            '[NotificationsStore] displayError',
            error.name,
            error.message,
            error.stack,
            errorRoute
          )
        } else if (ERRORS_DO_NOT_FORWARD.filter(d => d === error.name || d === errorType).length) {
          console.info(
            'Error',
            error.name,
            'at',
            errorRoute,
            'has not been dispatched, risk of loopholes'
          )
        } else {
          await errorCollector
            .create({
              id: errorId,
              url: window.location.href,
              errorMessage: error.message,
              stackTrace: error.stack,
              origin,
              className,
              type: errorType
            })
            .catch(err => {
              console.error('[Unexpected error in sending the error]', err)
            })
        }
      }
    },
    cleanErrorMessage() {
      this.errorMessagesIndex = []
      this.errorMessages = []
    },
    displayConnectivityStatus(status: boolean) {
      this.connectivityStatus = status
    },
    lockScreen(lock: boolean, duration = 10000) {
      if (lock) {
        this.processingLocked = true

        // Clear any previous timeout
        if (this._lockTimeoutId) {
          clearTimeout(this._lockTimeoutId)
        }

        // Set up new timeout to unlock screen
        this._lockTimeoutId = setTimeout(() => {
          this.processingLocked = false
          this._lockTimeoutId = null
        }, duration)
      } else {
        this.processingLocked = false

        // Clear any timeout if manually unlocking
        if (this._lockTimeoutId) {
          clearTimeout(this._lockTimeoutId)
          this._lockTimeoutId = null
        }
      }
    },
    updateProcessingActivity({
      route,
      status
    }: {
      route: string
      status: 'LOADING' | 'LONG' | 'DONE'
    }) {
      if (['LOADING', 'LONG'].includes(status)) {
        // add
        const idx = this.processingActivitiesIndex.indexOf(route)
        if (idx < 0) {
          this.processingActivitiesIndex.push(route)
          this.processingActivities.push({ route, status, c: 1 })
        } else {
          this.processingActivities[idx].c += 1
        }
      } else if (status === 'DONE') {
        // remove
        const idx = this.processingActivitiesIndex.indexOf(route)
        if (idx > -1) {
          this.processingActivities.splice(idx, 1)
          this.processingActivitiesIndex.splice(idx, 1)
        }
      }

      const isProcessing = !!this.processingActivitiesIndex.length

      if (this._processingTimer) {
        clearTimeout(this._processingTimer)
      }
      if (isProcessing) {
        this.processingStatus = isProcessing
      } else {
        this._processingTimer = setTimeout(() => {
          this.processingStatus = false
        }, 500)
      }
    }
  },
  persist: {
    paths: []
  }
})
