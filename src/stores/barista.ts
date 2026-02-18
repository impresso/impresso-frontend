import { getFiltersAndSearchDestination } from '@/logic/barista'
import { toSerializedFilters } from '@/logic/filters'
import { BaristaMessageItem } from '@/services/types/barista'
import { defineStore } from 'pinia'

export interface BaristaStoreMessage {
  id: string
  timestamp: Date
  isLast: boolean
  message: BaristaMessageItem
}

export interface BaristaState {
  messages: BaristaStoreMessage[]
  sessionId: string
  isWorking: boolean
  sendCurrentFilters: boolean
  lastFiltersReceived?: string // serialized filters received from Barista most recently
  lastFiltersDestination?: string // destination of the last filters received
}

export const useBaristaStore = defineStore('barista', {
  state: (): BaristaState => ({
    sessionId: crypto.randomUUID(),
    messages: [],
    isWorking: false,
    sendCurrentFilters: true,
    lastFiltersReceived: undefined,
    lastFiltersDestination: undefined
  }),

  getters: {
    latestMessage: (state): BaristaStoreMessage | undefined => {
      return state.messages.length > 0 ? state.messages[state.messages.length - 1] : undefined
    },
    lastFilters: (state): string | undefined => {
      return state.lastFiltersReceived
    }
  },
  actions: {
    setIsWorking(value: boolean) {
      this.isWorking = value
      if (!value) {
      }
    },
    addMessage(message: BaristaMessageItem, isLast: boolean) {
      const storeMessage: BaristaStoreMessage = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        isLast,
        message
      }
      this.messages.push(storeMessage)
      if (isLast) {
        this.isWorking = false
      }
    },
    clearMessages() {
      this.messages = []
      this.sessionId = crypto.randomUUID()
    },
    parseBaristaStream(payload: { type: string; data: BaristaMessageItem[] }) {
      const isLast = payload?.type === 'done'
      const messages = payload?.data ?? []
      console.debug('Parsing Barista stream payload:', payload, isLast && messages.length === 0)
      // if isLast there are no messages. Add an empty message to mark end of response
      if (isLast && messages.length === 0) {
        this.isWorking = false
        // this.addMessage(
        //   {
        //     content: '',
        //     type: 'ai',
        //     additional_kwargs: {}
        //   },
        //   true
        // )
        return
      }
      messages.forEach((msg: BaristaMessageItem) => {
        this.addMessage(msg, isLast)
        const filtersAndDestination = getFiltersAndSearchDestination(msg)
        if (filtersAndDestination) {
          const [filters, destination] = filtersAndDestination
          if (filters) {
            this.lastFiltersReceived = toSerializedFilters(filters)
            this.lastFiltersDestination = destination
          }
        }
      })
    }
  }
})
