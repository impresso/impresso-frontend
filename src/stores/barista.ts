import { defineStore } from 'pinia'
import type { components } from '@/models/generated/barista/schema'

export type AIMessage = components['schemas']['AIMessage']
export type HumanMessage = components['schemas']['HumanMessage']
export type ToolMessage = components['schemas']['ToolMessage']
export type BaristaFormattedResponse = components['schemas']['BaristaFormattedResponse']
export type BaristaMessageItem = AIMessage | HumanMessage | ToolMessage

export interface BaristaStoreMessage {
  id: string
  timestamp: Date
  isLast: boolean
  message: BaristaMessageItem
}

export interface BaristaState {
  messages: BaristaStoreMessage[]
  isWorking: boolean
}

export const useBaristaStore = defineStore('barista', {
  state: (): BaristaState => ({
    messages: [],
    isWorking: false
  }),

  getters: {
    latestMessage: (state): BaristaStoreMessage | undefined => {
      return state.messages.length > 0 ? state.messages[state.messages.length - 1] : undefined
    }
  },
  actions: {
    setIsWorking(value: boolean) {
      this.isWorking = value
    },
    addMessage(payload: BaristaMessageItem, isLast: boolean) {
      const message: BaristaStoreMessage = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        isLast,
        message: payload
      }
      this.messages.push(message)
      if (isLast) {
        this.isWorking = false
      }
    },
    clearMessages() {
      this.messages = []
    }
  }
})
