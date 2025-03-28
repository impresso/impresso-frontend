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
import { ref, onMounted } from 'vue'
import BaristaChatPanel from './BaristaChatPanel.vue'
import { barista } from '@/services'
import type { ChatMessage } from './BaristaChatPanel.vue'
import { BaristaMessage, getSearchFiltersAsBase64 } from '@/services/types/barista'

const emit = defineEmits<{
  (e: 'search', searchFilters: string): void
}>()

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
