<template>
  <div class="barista-chat h-100">
    <BaristaChatPanel
      class="h-100"
      :messages="messages.filter(m => m != null)"
      :isLoading="isLoading"
      @submit="handleMessageSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref, onMounted } from 'vue'
import BaristaChatPanel from './BaristaChatPanel.vue'
import { barista } from '@/services'
import type { ChatMessage } from './BaristaChatPanel.vue'
import { BaristaMessage, getSearchFiltersAsBase64 } from '@/services/types/barista'
import type { AdditionalKwargs } from '@/services/types/barista'

const lastResponseFilters: Ref<string | null> = ref(null)

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

const convertServiceMessageToPanel = (message: BaristaMessage): ChatMessage | undefined => {
  if (!Object.keys(ChatTypeConverter).includes(message.type)) return undefined
  return {
    content: message.content,
    timestamp: new Date(),
    type: ChatTypeConverter[message.type]
  }
}

//  Handles user input + Barista response
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
    const response = await barista.create({
      message: text
    })

    let filterMessageShown = false

    response.messages.forEach(message => {
      const panelMessage = convertServiceMessageToPanel(message)
      if (panelMessage) messages.value.push(panelMessage)

      if (message.additional_kwargs) {
        const stringified = JSON.stringify(message.additional_kwargs, null, 2)
        lastResponseFilters.value = stringified
        emit('search', stringified) // send string to parent (for modal display)
        if (!filterMessageShown) {
          messages.value.push(
            convertServiceMessageToPanel({
              content:
                'I’ve prepared some filters for you. Check them on the right and click Apply Filters to use them.',
              type: 'ai'
            })!
          )
          filterMessageShown = true
        }
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
