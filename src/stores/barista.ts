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
  isWorking: boolean
  sendCurrentFilters?: boolean
}

export const useBaristaStore = defineStore('barista', {
  state: (): BaristaState => ({
    messages: [],
    isWorking: false,
    sendCurrentFilters: true
  }),

  getters: {
    latestMessage: (state): BaristaStoreMessage | undefined => {
      return state.messages.length > 0 ? state.messages[state.messages.length - 1] : undefined
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
    },
    parseBaristaStream(payload: { type: string; data: BaristaMessageItem[] }) {
      const isLast = payload?.type === 'done'
      const messages = payload?.data ?? []
      console.debug('Parsing Barista stream payload:', payload, isLast && messages.length === 0)
      // if isLast there are no messages. Add an empty message to mark end of response
      if (isLast && messages.length === 0) {
        this.addMessage(
          {
            content: 'Done.',
            type: 'ai'
          } as BaristaMessageItem,
          true
        )
      }
      messages.forEach((msg: BaristaMessageItem) => this.addMessage(msg, isLast))
    }
  }
})
