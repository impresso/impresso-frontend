import { getFiltersAndSearchDestination } from '@/logic/barista'
import { toSerializedFilters } from '@/logic/filters'
import {
  barista as baristaService,
  baristaConversations as baristaConversationsService
} from '@/services'
import { type BaristaMessageItem, type BaristaRequest } from '@/services/types/barista'
import type {
  BaristaConversation,
  BaristaConversationsFindResult
} from '@/services/types/baristaConversations'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export interface BaristaStoreMessage {
  id: string
  timestamp: Date
  isLast: boolean
  message: BaristaMessageItem
}

export const useBaristaStore = defineStore('barista', () => {
  /** Ordered list of all messages in the current session. */
  const messages = ref<BaristaStoreMessage[]>([])
  /** Unique identifier for the current conversation session, sent with every request. */
  const sessionId = ref<string>(crypto.randomUUID())
  /** True while a request has been sent and the stream has not yet signalled completion. */
  const isWorking = ref(false)
  /** When true, the current search filters are included in outgoing requests. */
  const sendCurrentFilters = ref(true)
  /** Serialized form of the most recent filter set suggested by Barista, if any. */
  const lastFiltersReceived = ref<string | undefined>(undefined)
  /** Search destination (e.g. 'search', 'tr_passages') paired with `lastFiltersReceived`. */
  const lastFiltersDestination = ref<string | undefined>(undefined)
  /** The conversation record currently loaded in the panel, if any. Carries the label shown in the UI. */
  const currentConversation = ref<BaristaConversation | undefined>(undefined)

  /** The most recently appended message, used to drive reactive UI updates. */
  const latestMessage = computed<BaristaStoreMessage | undefined>(() =>
    messages.value.length > 0 ? messages.value[messages.value.length - 1] : undefined
  )
  /** Convenience alias for `lastFiltersReceived`. */
  const lastFilters = computed(() => lastFiltersReceived.value)

  function addMessage(message: BaristaMessageItem, isLast: boolean) {
    messages.value.push({ id: crypto.randomUUID(), timestamp: new Date(), isLast, message })
  }

  /**
   * Send a user message to Barista. Prepends the human message to the log,
   * sets `isWorking`, and appends a fallback error message if the request fails.
   * The response arrives asynchronously via `parseBaristaStream`.
   */
  async function sendMessage(request: BaristaRequest) {
    addMessage({ content: request.message, type: 'human', sessionId: request.sessionId }, true)
    isWorking.value = true
    try {
      return await baristaService.create(request)
    } catch (error) {
      addMessage(
        {
          content: 'Sorry, there was an error processing your message.',
          type: 'ai',
          sessionId: request.sessionId
        },
        true
      )
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
    sessionId.value = crypto.randomUUID()
    currentConversation.value = undefined
  }

  /**
   * Fetch a paginated list of the user's saved conversations.
   * Delegates directly to the conversations service `find` endpoint.
   */
  async function getConversations(
    params?: Parameters<typeof baristaConversationsService.find>[0]
  ): Promise<BaristaConversationsFindResult> {
    return baristaConversationsService.find(params) as Promise<BaristaConversationsFindResult>
  }

  /**
   * Load a previously saved conversation into the store.
   * Fetches the full message history for the given session ID, replaces the
   * current message list with it, and switches `sessionId` to match — so that
   * any subsequent `sendMessage` call continues the loaded conversation rather
   * than starting a new one.
   */
  async function loadConversation(id: string) {
    const conversation = await baristaConversationsService.get(id)
    currentConversation.value = conversation
    messages.value = conversation.messages.map(msg => ({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      isLast: true,
      message: msg
    }))
    sessionId.value = id
  }

  /**
   * Rename a saved conversation. `id` is the numeric row ID of the
   * conversation record (not the session UUID); `label` is the new title.
   */
  async function editConversationTitle(id: string, label: string) {
    return baristaConversationsService.patch(id, { label })
  }

  /**
   * Process a streaming payload from the Barista socket event.
   * Appends each message to the log and extracts any suggested filters.
   * Marks `isWorking` as false when the stream signals completion (`type === 'done'`).
   */
  function parseBaristaStream(payload: { type: string; data: BaristaMessageItem[] }) {
    const isLast = payload?.type === 'done'
    const incoming = (payload?.data ?? []).filter((msg: BaristaMessageItem) => {
      if (msg.sessionId !== sessionId.value) {
        console.warn(
          `[BaristaStore] Dropping message from stale session (got "${msg.sessionId}", expected "${sessionId.value}")`
        )
        return false
      }
      return true
    })
    console.debug('Parsing Barista stream payload:', payload, isLast && incoming.length === 0)
    if (isLast && incoming.length === 0) {
      isWorking.value = false
      if (!currentConversation.value) {
        baristaConversationsService
          .get(sessionId.value)
          .then(conversation => (currentConversation.value = conversation))
          .catch(err => console.warn('[BaristaStore] Failed to load conversation metadata:', err))
      }
      return
    }
    incoming.forEach((msg: BaristaMessageItem) => {
      addMessage(msg, isLast)
      if (isLast) {
        isWorking.value = false
        if (!currentConversation.value) {
          baristaConversationsService
            .get(sessionId.value)
            .then(conversation => (currentConversation.value = conversation))
            .catch(err => console.warn('[BaristaStore] Failed to load conversation metadata:', err))
        }
      }
      const filtersAndDestination = getFiltersAndSearchDestination(msg)
      if (filtersAndDestination) {
        const [filters, destination] = filtersAndDestination
        if (filters) {
          lastFiltersReceived.value = toSerializedFilters(filters)
          lastFiltersDestination.value = destination
        }
      }
    })
  }

  return {
    messages,
    sessionId,
    currentConversation,
    isWorking,
    sendCurrentFilters,
    lastFiltersReceived,
    lastFiltersDestination,
    latestMessage,
    lastFilters,
    sendMessage,
    createNewSession,
    parseBaristaStream,
    getConversations,
    loadConversation,
    editConversationTitle
  }
})
