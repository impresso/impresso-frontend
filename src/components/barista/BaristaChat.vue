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
  type AIMessage,
  type ToolMessage
} from '@/services/types/barista'
import { convertServiceMessageToPanel } from '@/logic/barista'
import { useBaristaStore } from '@/stores/barista'
import type { Filter } from '@/models'
import { computed } from 'vue'
import { SupportedFiltersByContext } from '@/logic/filters'

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
  (e: 'submit', message: string): void
  (e: 'updateHeight', height: number): void
}>()

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

// State for messages
const messages = ref<ChatMessage[]>([])
const isLoading = ref(false)

// Handler for sending messages
const handleMessageSubmit = async (text: string) => {
  if (!text.trim()) return
  // Add user message to panel using baristaStore
  baristaStore.addMessage(
    {
      content: text,
      type: 'human'
    },
    true
  )

  isLoading.value = true
  baristaStore.setIsWorking(true)

  try {
    // Send message to barista service
    await baristaService.create({
      message: text
    })
    emit('submit', text)
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
        if (Array.isArray(msg?.structuredResponse?.search_query?.filters)) {
          acc = msg.structuredResponse.search_query.filters as Filter[]
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
    messages.value = baristaStore.messages
      .map(msg => convertBaristaMessageToChat(msg.message, msg.timestamp))
      .filter((msg): msg is ChatMessage => msg != null)
  }
})
</script>
