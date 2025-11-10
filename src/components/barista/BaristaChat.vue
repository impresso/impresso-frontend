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
import { BaristaMessage } from '@/services/types/barista'

const lastResponseFilters: Ref<string | null> = ref(null)

const emit = defineEmits<{
  (e: 'search', searchFilters: string): void
  (e: 'filtersDetected', aiFilters: any): void
}>()

// State for messages
const messages = ref<any[]>([])
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
const handleMessageSubmit = async (text: string, opts?:  { silent?: boolean }) => {
  if (!text.trim()) return

  // // Add user message to panel
  
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
       if (message.type === 'human') return // skip echoing user messages
      const panelMessage = convertServiceMessageToPanel(message)
      if (panelMessage) messages.value.push(panelMessage)

      if (message.additional_kwargs) {

  const cloned = JSON.parse(JSON.stringify(message.additional_kwargs))
  lastResponseFilters.value = JSON.stringify(cloned, null, 2)
  emit('search', cloned)
  emit('filtersDetected', cloned)

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

const props = defineProps<{
  initialFilters?: string | Record<string, any> | Record<string, any>[]
}>()


onMounted(async () => {
  
  const incoming = Array.isArray(props.initialFilters)
    ? props.initialFilters
    : [props.initialFilters]

  
  const incomingFilters = incoming
    .filter(
      f => f && f.type && f.type !== 'hasTextContents'
    )
    .map(f => ({
      context: f.context,
      op: f.op,
      type: f.type,
      q: f.q
    }))

  if (!incomingFilters.length) {
    messages.value.push(
      convertServiceMessageToPanel({
        content: 'Hello! I am Barista, your Impresso assistant. How can I help you today?',
        type: 'ai'
      })!
    )
    return
  }

  const qValues = incomingFilters
    .flatMap(f => (Array.isArray(f.q) ? f.q : [f.q]))
    .filter(q => typeof q === 'string' && q.trim())
    .map(q => q.trim())

  if (qValues.length) {
    const combinedQuery =
      qValues.length === 1
        ? qValues[0]
        : qValues.slice(0, -1).join(', ') + ' and ' + qValues[qValues.length - 1]

    const prompt = `Current search query: "${combinedQuery}". Do you want to refine or add anything to it?`

    messages.value.push(
      convertServiceMessageToPanel({
        content: prompt,
        type: 'ai'
      })!
    )
    emit('filtersDetected', incomingFilters) 
  } else {
    messages.value.push(
      convertServiceMessageToPanel({
        content: 'Hello! I am Barista, your Impresso assistant. How can I help you today?',
        type: 'ai'
      })!
    )
  }
})
</script>
