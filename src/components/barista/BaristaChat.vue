<template>
  <div class="barista-chat">
    <div class="barista-chat-container">
      <BaristaChatPanel
        :messages="messages.filter(m => m != null)"
        :isLoading="isLoading"
        @submit="handleMessageSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import BaristaChatPanel from './BaristaChatPanel.vue'
import { barista } from '@/services'
import type { ChatMessage } from './BaristaChatPanel.vue'
import { BaristaMessage, getSearchFiltersAsBase64 } from '@/services/types/barista'
import {
  useBaristaStore,
  type BaristaMessageItem,
  type AIMessage,
  type ToolMessage
} from '@/stores/barista'

const emit = defineEmits<{
  (e: 'search', searchFilters: string): void
}>()

// Barista store for socket messages
const baristaStore = useBaristaStore()

// Convert barista socket message to chat message format
const convertBaristaMessageToChat = (
  message: BaristaMessageItem,
  timestamp: Date
): ChatMessage | undefined => {
  if (message.type === 'human') {
    return {
      content: message.content,
      timestamp,
      type: 'user'
    }
  }

  if (message.type === 'ai') {
    const aiMsg = message as AIMessage
    const toolCallNames = aiMsg.toolCalls?.map(tc => {
      if (typeof tc === 'object' && tc !== null && 'name' in tc) {
        return String(tc.name)
      }
      return 'unknown'
    })

    return {
      content: aiMsg.content,
      timestamp,
      type: 'system',
      reasoning: aiMsg.reasoningContent ?? undefined,
      toolCalls: toolCallNames?.length ? toolCallNames : undefined,
      structuredResponse: aiMsg.structuredResponse ?? undefined
    }
  }

  if (message.type === 'tool') {
    const toolMsg = message as ToolMessage
    return {
      content: `[${toolMsg.name}] ${toolMsg.content}`,
      timestamp,
      type: 'tool',
      structuredResponse: toolMsg.structuredResponse ?? undefined
    }
  }

  return undefined
}

// Watch for new socket messages and add them to the chat
watch(
  () => baristaStore.latestMessage,
  newMessage => {
    if (newMessage && !newMessage.isLast) {
      const chatMessage = convertBaristaMessageToChat(newMessage.message, newMessage.timestamp)
      messages.value.push(chatMessage)
    }
  }
)

// State for messages
const messages = ref<ChatMessage[]>([])
const isLoading = ref(false)

const ChatTypeConverter: Record<BaristaMessage['type'], ChatMessage['type']> = {
  ai: 'system',
  human: 'user'
}

// Convert service message to panel message format
const convertServiceMessageToPanel = (message: BaristaMessage): ChatMessage | undefined => {
  if (!Object.keys(ChatTypeConverter).includes(message.type)) return undefined
  const searchFilters = message.additional_kwargs
    ? getSearchFiltersAsBase64(message.additional_kwargs)
    : undefined
  return {
    content: message.content,
    timestamp: new Date(),
    type: ChatTypeConverter[message.type],
    actions: searchFilters
      ? [
          {
            type: 'search',
            context: searchFilters
          }
        ]
      : undefined
  }
}

// Handler for sending messages
const handleMessageSubmit = async (text: string) => {
  if (!text.trim()) return

  // Add user message to panel
  messages.value.push(
    convertServiceMessageToPanel({
      content: text,
      type: 'human'
    })
  )

  isLoading.value = true

  try {
    // Send message to barista service
    const response = await barista.create({
      message: text
    })

    // Add barista response to panel
    response.messages.forEach(message => {
      messages.value.push(convertServiceMessageToPanel(message))

      const searchFilters = message.additional_kwargs
        ? getSearchFiltersAsBase64(message.additional_kwargs)
        : undefined

      if (searchFilters) {
        emit('search', searchFilters)
      }
    })
  } catch (error) {
    console.error('Error sending message to barista service:', error)

    // Add error message
    messages.value.push(
      convertServiceMessageToPanel({
        content: 'Sorry, there was an error processing your message.',
        type: 'ai'
      })
    )
  } finally {
    isLoading.value = false
  }
}

// Initialize with a welcome message
onMounted(() => {
  messages.value.push(
    convertServiceMessageToPanel({
      content: 'Hello! I am Barista, your Impresso assistant. How can I help you today?',
      type: 'ai'
    })
  )
})
</script>

<style lang="scss" scoped>
.barista-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--clr-grey-100);

  &-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    height: 100%;
    background-color: white;
    border-radius: var(--impresso-border-radius-md);
    box-shadow: var(--bs-box-shadow-sm);
  }
}
</style>
