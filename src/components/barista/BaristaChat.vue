<template>
  <div class="barista-chat">
    <BaristaChatPanel
      :filters="simplifiedFilters"
      :messages="messages"
      :isLoading="baristaStore.isWorking"
      @submit="handleMessageSubmit"
    />
  </div>
</template>

<style scoped>
.barista-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.barista-chat > :deep(*) {
  flex: 1 1 auto;
  min-height: 0;
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import BaristaChatPanel from './BaristaChatPanel.vue'
import {
  type BaristaFormattedResponse,
  type BaristaMessageItem,
  type BaristaRequest,
  type ChatMessage,
  isAIMessage,
  isErrorMessage,
  isHumanMessage,
  isToolMessage
} from '@/services/types/barista'
import { useBaristaStore } from '@/stores/barista'
import type { Filter } from '@/models'
import { SupportedFiltersByContext } from '@/logic/filters'
import { ExtraContentSeparator } from '@/logic/barista'
import { includes } from '@/util/fn.js'

/** Formatting tool call that always comes last; not relevant to show to users */
const HiddenToolCallName = 'BaristaFormattedResponse'

const props = withDefaults(defineProps<{ filters?: Filter[] }>(), {
  filters: () => []
})

const emit = defineEmits<{
  (e: 'suggestFilters', searchFilters: Filter[]): void
  (e: 'submit', request: BaristaRequest): void
}>()

const baristaStore = useBaristaStore()
const messages = ref<ChatMessage[]>([])

const simplifiedFilters = computed(() =>
  props.filters
    .filter(f => includes(SupportedFiltersByContext.search, f.type) && f.type !== 'hasTextContents')
    .map(f => ({ type: f.type, context: f.context, op: f.op, q: f.q }) satisfies Filter)
)

const getStructuredContent = (response?: BaristaFormattedResponse) =>
  response?.assistantClarification ?? response?.impressoHelp ?? response?.searchQuerySummary

const getVisibleToolCalls = (toolCalls: unknown[] = []) =>
  toolCalls.flatMap(toolCall => {
    if (typeof toolCall !== 'object' || toolCall === null || !('name' in toolCall)) return []
    const { name, id } = toolCall as { name: unknown; id?: unknown }
    if (name === HiddenToolCallName) return []
    return [{ name: String(name), id: id == null ? undefined : String(id) }]
  })

const toChatMessage = (message: BaristaMessageItem, timestamp: Date): ChatMessage | undefined => {
  if (isHumanMessage(message)) {
    const [content, additionalContent] = message.content.split(ExtraContentSeparator, 2)
    return { content, additionalContent, timestamp, type: 'user' }
  }

  if (isAIMessage(message)) {
    const response = message.structuredResponse ?? undefined
    const toolCalls = getVisibleToolCalls(message.toolCalls ?? undefined)
    const toolCallIds = toolCalls.flatMap(({ id }) => (id ? [id] : []))
    return {
      content: getStructuredContent(response) ?? message.content,
      timestamp,
      type: 'system',
      reasoning: message.reasoningContent ?? undefined,
      toolCalls: toolCalls.length ? toolCalls.map(({ name }) => name) : undefined,
      toolCallIds: toolCallIds.length ? toolCallIds : undefined,
      structuredResponse: response,
      searchQuerySteps: response?.searchQuerySteps ?? undefined
    }
  }

  if (isToolMessage(message)) {
    const response = message.structuredResponse ?? undefined
    return {
      content: getStructuredContent(response) ?? `[${message.name}] ${message.content}`,
      timestamp,
      type: 'tool',
      structuredResponse: response,
      searchQuerySteps: response?.searchQuerySteps ?? undefined,
      toolCallIds: message.toolCallId ? [message.toolCallId] : undefined
    }
  }

  if (isErrorMessage(message)) {
    return { content: message.content || 'An error occurred.', timestamp, type: 'error' }
  }

  return undefined
}

/** Filters of the most recent Barista answer that suggested some */
const getLatestSuggestedFilters = (): Filter[] | undefined =>
  [...messages.value]
    .reverse()
    .find(msg => Array.isArray(msg.structuredResponse?.searchQuery?.filters))?.structuredResponse
    ?.searchQuery?.filters as Filter[] | undefined

const handleMessageSubmit = async (request: BaristaRequest) => {
  if (!request.message.trim()) return
  if (!request.sessionId) {
    throw new Error('Session ID is required to send a message to Barista.')
  }
  try {
    await baristaStore.sendMessage(request)
    emit('submit', request)
  } catch (error) {
    console.error('[BaristaChat] Error sending message to Barista:', error)
  }
}

function rebuildMessages() {
  messages.value = baristaStore.messages
    .map(({ message, timestamp }) => toChatMessage(message, timestamp))
    .filter((msg): msg is ChatMessage => msg != null)
}

watch(() => baristaStore.sessionId, rebuildMessages)

watch(
  () => baristaStore.latestMessage,
  latest => {
    if (!latest) {
      messages.value = []
      return
    }
    const chatMessage = toChatMessage(latest.message, latest.timestamp)
    if (chatMessage) messages.value.push(chatMessage)

    const suggestedFilters = getLatestSuggestedFilters()
    if (suggestedFilters?.length) emit('suggestFilters', suggestedFilters)
  }
)

onMounted(rebuildMessages)
</script>
