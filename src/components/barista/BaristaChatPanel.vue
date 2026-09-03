<template>
  <div class="barista-chat-panel my-3">
    <div class="chat-history pb-5" ref="chatHistoryRef">
      <BaristaChatMessage
        v-for="(message, index) in messages"
        :key="index"
        :message="message"
        :hideToolCalls="shouldHideToolCalls(message)"
        :class="{
          'position-sticky top-0': message.type === 'user'
        }"
      />
      <div v-if="isLoading">working...</div>
    </div>

    <BaristaChatInput
      ref="chatInputRef"
      :isLoading="isLoading"
      :filters="filters"
      @submit="emit('submit', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import type { Filter } from '@/models'
import { BaristaRequest, ChatMessage } from '@/services/types/barista'
import BaristaChatMessage from './BaristaChatMessage.vue'
import BaristaChatInput from './BaristaChatInput.vue'

export interface BaristaChatPanelProps {
  messages: ChatMessage[]
  isLoading?: boolean
  filters?: Filter[]
}

const props = withDefaults(defineProps<BaristaChatPanelProps>(), {
  messages: () => [],
  isLoading: false,
  filters: () => []
})
const emit = defineEmits<{
  (e: 'submit', request: BaristaRequest): void
  (e: 'updateHeight', height: number): void
}>()

const chatHistoryRef = ref<HTMLElement | null>(null)
const chatInputRef = ref<InstanceType<typeof BaristaChatInput> | null>(null)

const resolvedToolCallIds = computed(() => {
  const ids = new Set<string>()
  for (const msg of props.messages) {
    if (msg.type === 'tool' && msg.toolCallIds) {
      msg.toolCallIds.forEach(id => ids.add(id))
    }
  }
  return ids
})

function shouldHideToolCalls(message: ChatMessage): boolean {
  if (!message.toolCallIds?.length) return false
  return message.toolCallIds.some(id => resolvedToolCallIds.value.has(id))
}

function updateHeight() {
  nextTick(() => {
    console.debug(
      '[BaristaChatPanel] Emitting updated height:',
      chatHistoryRef.value?.scrollHeight || 0
    )

    chatInputRef.value?.focus()
    emit('updateHeight', chatHistoryRef.value?.scrollHeight || 0)
  })
}

watch(
  () => props.messages.length,
  () => {
    updateHeight()
  }
)

onMounted(() => {
  chatInputRef.value?.focus()
  updateHeight()
})
</script>

<style scoped>
.chat-history {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
