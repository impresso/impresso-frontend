import { defineStore } from 'pinia'
import { v4 } from 'uuid'
import { FeathersError } from '@feathersjs/errors'
import { errorCollector } from '@/services'

interface HookErrorMixin {
  hook: { path: string; method: string }
}

const ERRORS_DO_NOT_DISPLAY = ['NavigationDuplicated'] // error names not to display to the user
const ERRORS_DO_NOT_FORWARD = ['BadGateway', 'TransportError', 'NotAuthenticated', 'BadRequest'] // error to avoid loopholes


interface Notification {
  title: string;
  message: string;
  type: 'success' | 'error';
}

export interface StoredNotification extends Notification {
  id: string;
}

interface ErrorMessage {
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

interface State {
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
}


export const useNotificationsStore = defineStore('notifications', {
  state: (): State => ({
    notifications: [],
    errorMessages: [],
    errorMessagesIndex: [],
    connectivityStatus: true,
    processingLocked: false,
    processingActivities: [],
    processingActivitiesIndex: [],
    processingStatus: false,
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
    },
    async displayError({ error, origin = '' }: { error: FeathersError; origin?: string }) {
      const errorRoute: string[] = []
      // get error route if possible
      if ((error as any as HookErrorMixin).hook) {
        const hookError = error as any as HookErrorMixin
        try {
          errorRoute.push(hookError.hook.path)
          errorRoute.push(hookError.hook.method)
        } catch (e) {
          console.warn(e)
        }
      }
      console.error(
        `[Unexpected error ${error.name}]: ${errorRoute.join('.')} (origin:${origin})`,
        error.code,
        error.name,
        error.message,
        error,
      )
      if (errorRoute.length && errorRoute[0] === 'errors-collector') {
        console.info(
          'Error',
          error.name,
          'at',
          errorRoute,
          'has not been dispatched. Source: errors-collector. Risk of loopholes',
        )
      } else {
        if (!ERRORS_DO_NOT_DISPLAY.includes(error.name)) {
          const hash = JSON.stringify([...errorRoute, error.code, error.name])
          if (!this.errorMessagesIndex.includes(hash)) {
            this.errorMessagesIndex.push(hash)
            this.errorMessages.push({ route: errorRoute, message: error.message, code: error.code, name: error.name })
          }
        }

        // do not force if BadGateway or polling error (risk of having endless and useless loops)
        if (ERRORS_DO_NOT_FORWARD.filter(d => d === error.name || d === (error as any).type).length) {
          console.info(
            'Error',
            error.name,
            'at',
            errorRoute,
            'has not been dispatched, risk of loopholes',
          )
        } else {
          await errorCollector
            .create({
              uri: errorRoute.length ? errorRoute.join('.') : 'N/A',
              ...error,
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
    lockScreen(status: boolean) {
      this.processingLocked = status
    },
    updateProcessingActivity({ route, status }: { route: string, status: 'LOADING' | 'LONG' | 'DONE' }) {
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
    },
  },
  persist: {
    paths: [],
  },
})
