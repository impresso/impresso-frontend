<template>
  <div class="barista-chat">
    <BaristaChatPanel
      :filters="simplifiedFilters"
      :messages="messages.filter(m => m != null)"
      :isLoading="isWorking"
      @submit="handleMessageSubmit"
      @updateHeight="handleUpdateHeight"
    >
    </BaristaChatPanel>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import BaristaChatPanel from './BaristaChatPanel.vue'
import { barista as baristaService } from '@/services'
import {
  type ChatMessage,
  type BaristaMessageItem,
  isAIMessage,
  isHumanMessage,
  isToolMessage,
  isErrorMessage,
  BaristaRequest
} from '@/services/types/barista'
import { useBaristaStore } from '@/stores/barista'
import type { Filter } from 'impresso-jscommons'
import { computed } from 'vue'
import { SupportedFiltersByContext } from '@/logic/filters'
import { ExtraContentSeparator } from '@/logic/barista'

// Barista store for socket messages
const baristaStore = useBaristaStore()
const isWorking = computed(() => baristaStore.isWorking)
const props = withDefaults(
  defineProps<{
    filters?: Filter[]
  }>(),
  {
    filters: () => []
  }
)

const simplifiedFilters = computed(() => {
  return props.filters
    ?.filter(f => SupportedFiltersByContext.search.includes(f.type) && f.type !== 'hasTextContents')
    .map(
      f =>
        ({
          type: f.type,
          context: f.context,
          op: f.op,
          q: f.q
        }) satisfies Filter
    )
})

const emit = defineEmits<{
  (e: 'suggestFilters', searchFilters: Filter[]): void
  (e: 'submit', request: BaristaRequest): void
  (e: 'updateHeight', height: number): void
}>()

// Convert barista socket message to chat message format
const convertBaristaMessageToChat = (
  message: BaristaMessageItem,
  timestamp: Date
): ChatMessage | undefined => {
  const [messageContent, additionalContent] = message.content.split(ExtraContentSeparator, 2)

  if (isHumanMessage(message)) {
    return {
      content: messageContent,
      additionalContent: additionalContent,
      timestamp,
      type: 'user'
    }
  }

  if (isAIMessage(message)) {
    const toolCallNamesAndIds = message.toolCalls
      ?.map(tc => {
        // hide response formatting tool call. It always comes last and is not relevant to show to users
        if (
          typeof tc === 'object' &&
          tc !== null &&
          'name' in tc &&
          tc['name'] != 'BaristaFormattedResponse'
        ) {
          return [String(tc.name), String(tc['id'])]
        }
        return ['unknown', undefined]
      })
      ?.filter(([name, id]) => name !== 'unknown' && id != null)

    const sr = message.structuredResponse
    const structuredContent =
      sr?.assistantClarification ??
      sr?.impressoHelp ??
      sr?.searchQueryFollowUp ??
      sr?.searchQuerySummary

    const toolCallNames: string[] | undefined = Array.isArray(toolCallNamesAndIds)
      ? toolCallNamesAndIds.map(([name]) => name)
      : undefined
    const toolCallIds = Array.isArray(toolCallNamesAndIds)
      ? toolCallNamesAndIds.map(([_, id]) => id)
      : undefined

    return {
      content: structuredContent ?? message.content,
      timestamp,
      type: 'system',
      reasoning: message.reasoningContent ?? undefined,
      toolCalls: toolCallNames?.length ? toolCallNames : undefined,
      toolCallIds: toolCallIds?.length ? toolCallIds : undefined,
      structuredResponse: sr ?? undefined,
      searchQuerySteps: sr?.searchQuerySteps ?? undefined
    }
  }

  if (isToolMessage(message)) {
    const sr = message.structuredResponse
    const structuredContent =
      sr?.assistantClarification ??
      sr?.impressoHelp ??
      sr?.searchQueryFollowUp ??
      sr?.searchQuerySummary

    const toolCallId = message.source?.['tool_call_id'] as string | undefined

    console.log('*** T', toolCallId, message.source)
    return {
      content: structuredContent ?? `[${message.name}] ${message.content}`,
      timestamp,
      type: 'tool',
      structuredResponse: sr ?? undefined,
      searchQuerySteps: sr?.searchQuerySteps ?? undefined,
      toolCallIds: toolCallId ? [toolCallId] : undefined
    }
  }

  if (isErrorMessage(message)) {
    return {
      content: message.content || 'An error occurred.',
      timestamp,
      type: 'error'
    }
  }

  return undefined
}

// State for messages
const messages = ref<ChatMessage[]>([])
const isLoading = ref(false)

// Handler for sending messages
const handleMessageSubmit = async (request: BaristaRequest) => {
  if (!request.message.trim()) return
  // Add user message to panel using baristaStore
  baristaStore.addMessage(
    {
      content: request.message,
      type: 'human'
    },
    true
  )

  isLoading.value = true
  baristaStore.setIsWorking(true)

  try {
    // Send message to barista service
    await baristaService.create(request)
    emit('submit', request)
  } catch (error) {
    console.error(
      'Error sending message to barista service:',
      error.name,
      error.type,
      error.message
    )
    // Add error message
    baristaStore.addMessage(
      {
        content: 'Sorry, there was an error processing your message.',
        type: 'ai'
      },
      true
    )
    baristaStore.setIsWorking(false)
  } finally {
    isLoading.value = false
  }
}

const handleUpdateHeight = (height: number) => {
  console.debug('[BaristaChat] Chat height updated:', height)
  emit('updateHeight', height)
}

// Watch for new socket messages and add them to the chat
watch(
  () => baristaStore.latestMessage,
  newMessage => {
    if (newMessage) {
      console.debug('[BaristaChat] new message received. Adding to chat panel:', newMessage)

      const chatMessage = convertBaristaMessageToChat(newMessage.message, newMessage.timestamp)
      if (chatMessage != null) {
        messages.value.push(chatMessage)
      }

      const suggestedFilters: Filter[] = messages.value.reduce((acc: Filter[], msg) => {
        if (Array.isArray(msg?.structuredResponse?.searchQuery?.filters)) {
          acc = msg.structuredResponse.searchQuery.filters as Filter[]
        }
        return acc
      }, [])

      if (suggestedFilters.length > 0) {
        console.log('[BaristaChat] Emitting search with suggested filters:', suggestedFilters)
        emit('suggestFilters', suggestedFilters)
      }
    } else {
      console.debug(
        "[BaristaChat] Undefined message received from barista store, let's reset chat."
      )
      messages.value = []
    }
  }
)

// Initialize with a welcome message
onMounted(() => {
  if (!baristaStore.messages.length) {
    baristaStore.addMessage(
      {
        content:
          'Hello! I am Barista, I can serve you a query search and listen to your prompts. Tell me what you would like to find! I can also help you understanding better the Impresso ecosystem, just ask.',
        type: 'ai'
      },
      true
    )
  } else {
    console.debug(
      '[BaristaChat] Initializing chat with existing messages from store.',
      baristaStore.messages.length
    )
    messages.value = baristaStore.messages
      .map(msg => convertBaristaMessageToChat(msg.message, msg.timestamp))
      .filter((msg): msg is ChatMessage => msg != null)
  }
})
</script>
