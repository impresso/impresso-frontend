import { toSerializedFilters } from '@/logic/filters'
import type { Filter } from '@/models'
import {
  barista as baristaService,
  baristaConversations as baristaConversationsService
} from '@/services'
import {
  supportsStructuredResponse,
  type BaristaMessageItem,
  type BaristaRequest
} from '@/services/types/barista'
import type { BaristaConversation } from '@/services/types/baristaConversations'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export interface BaristaStoreMessage {
  id: string
  timestamp: Date
  message: BaristaMessageItem
}

export interface BaristaStreamPayload {
  type: string
  data: BaristaMessageItem[]
  remainingConversations?: number
}

const newSessionId = () => `iwa-${crypto.randomUUID()}`

const toStoreMessage = (message: BaristaMessageItem): BaristaStoreMessage => ({
  id: crypto.randomUUID(),
  timestamp: new Date(),
  message
})

export const useBaristaStore = defineStore('barista', () => {
  /** Ordered list of all messages in the current session. */
  const messages = ref<BaristaStoreMessage[]>([])
  /** Unique identifier for the current conversation session, sent with every request. */
  const sessionId = ref<string>(newSessionId())
  /** True while a request has been sent and the stream has not yet signalled completion. */
  const isWorking = ref(false)
  /** When true, the current search filters are included in outgoing requests. */
  const sendCurrentFilters = ref(true)
  /** Serialized form of the most recent filter set suggested by Barista, if any. */
  const lastFiltersReceived = ref<string | undefined>(undefined)
  /** The conversation record currently loaded in the panel, if any. Carries the label shown in the UI. */
  const currentConversation = ref<BaristaConversation | undefined>(undefined)
  /** Number of remaining Barista conversations for the current user, as reported by the last 'done' event. */
  const remainingConversations = ref<number | undefined>(undefined)

  /** The most recently appended message, used to drive reactive UI updates. */
  const latestMessage = computed<BaristaStoreMessage | undefined>(() => messages.value.at(-1))

  function addMessage(message: BaristaMessageItem) {
    messages.value.push(toStoreMessage(message))
  }

  /**
   * Send a user message to Barista. Appends the human message to the log,
   * sets `isWorking`, and appends a fallback error message if the request fails.
   * The response arrives asynchronously via `parseBaristaStream`.
   */
  async function sendMessage(request: BaristaRequest) {
    addMessage({ content: request.message, type: 'human', sessionId: request.sessionId })
    isWorking.value = true
    try {
      return await baristaService.create(request)
    } catch (error) {
      addMessage({
        content: 'Sorry, there was an error processing your message.',
        type: 'ai',
        sessionId: request.sessionId
      })
      isWorking.value = false
      throw error
    }
  }

  /**
   * Reset the conversation by clearing all messages and generating a new session ID.
   * The next `sendMessage` call will start a fresh conversation with Barista.
   */
  function createNewSession() {
    messages.value = []
    sessionId.value = newSessionId()
    currentConversation.value = undefined
  }

  /**
   * Load a previously saved conversation into the store and switch `sessionId`
   * to it, so that the next `sendMessage` continues that conversation.
   */
  async function loadConversation(id: string) {
    const conversation = await baristaConversationsService.get(id)
    currentConversation.value = conversation
    messages.value = conversation.messages.map(toStoreMessage)
    sessionId.value = id
  }

  /** Rename a saved conversation. */
  async function editConversationTitle(id: string, label: string) {
    return baristaConversationsService.patch(id, { label })
  }

  /** The conversation record only exists once Barista has answered the first message. */
  function fetchCurrentConversation() {
    if (currentConversation.value) return
    baristaConversationsService
      .get(sessionId.value)
      .then(conversation => (currentConversation.value = conversation))
      .catch(err => console.warn('[BaristaStore] Failed to load conversation metadata:', err))
  }

  /**
   * Process a streaming payload from the Barista socket event.
   * Appends each message of the current session to the log and keeps track of the
   * suggested filters. A `done` payload ends the request.
   */
  function parseBaristaStream(payload: BaristaStreamPayload) {
    const isDone = payload.type === 'done'
    if (isDone && payload.remainingConversations !== undefined) {
      remainingConversations.value = payload.remainingConversations
    }

    const incoming = (payload.data ?? []).filter(msg => {
      if (msg.sessionId === sessionId.value) return true
      console.warn(
        `[BaristaStore] Dropping message from stale session (got "${msg.sessionId}", expected "${sessionId.value}")`
      )
      return false
    })

    incoming.forEach(msg => {
      addMessage(msg)
      const filters = supportsStructuredResponse(msg)
        ? (msg.structuredResponse?.searchQuery?.filters as Filter[] | undefined)
        : undefined
      if (filters) {
        lastFiltersReceived.value = toSerializedFilters(filters)
      }
    })

    if (isDone) {
      isWorking.value = false
      fetchCurrentConversation()
    }
  }

  return {
    messages,
    sessionId,
    currentConversation,
    isWorking,
    sendCurrentFilters,
    lastFiltersReceived,
    remainingConversations,
    latestMessage,
    sendMessage,
    createNewSession,
    parseBaristaStream,
    loadConversation,
    editConversationTitle
  }
})
