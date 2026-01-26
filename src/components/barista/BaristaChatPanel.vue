<template>
  <div class="barista-chat-panel my-3">
    <div class="chat-history pb-5" ref="chatHistoryRef">
      <BaristaChatMessage
        v-for="(message, index) in messages"
        :key="index"
        :message="message"
        :class="{
          'position-sticky top-0': message.type === 'user'
        }"
      />
      <div class="text-muted very-small px-3">current session id: {{ baristaStore.sessionId }}</div>
      <div v-if="isLoading">working...</div>
    </div>

    <div class="chat-input position-sticky bottom-0 rounded bg-white pb-3">
      <div class="border shadow-sm rounded p-2">
        <BFormCheckbox
          :disabled="!filters.length"
          switch
          v-model="baristaStore.sendCurrentFilters"
          class="mb-2 ml-1"
        >
          Share current search filters with Barista
        </BFormCheckbox>
        <div class="d-flex align-items-end">
          <BTextarea
            v-model="inputMessage"
            :debounce="0"
            @keyup.enter="handleSubmit"
            placeholder="Type your message..."
            :disabled="isLoading"
            ref="humanPrompt"
            class="border rounded-sm form-control border-dark"
            :rows="3"
            autosize
            :maxRows="10"
          />

          <div class="ml-2">
            <button
              @click="handleSubmit"
              :disabled="!inputMessage.trim() || isLoading"
              class="btn btn-outline-primary"
            >
              <span v-if="isLoading">Sending...</span>
              <span v-else>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import BFormCheckbox from '../legacy/bootstrap/BFormCheckbox.vue'
import type { Filter } from '@/models'
import { ChatMessage } from '@/services/types/barista'
import { useBaristaStore } from '@/stores/barista'
import { ExtraContentSeparator } from '@/logic/barista'
import BaristaChatMessage from './BaristaChatMessage.vue'

export interface BaristaChatPanelProps {
  messages: ChatMessage[]
  isLoading?: boolean
  filters?: Filter[]
}

const baristaStore = useBaristaStore()
const props = withDefaults(defineProps<BaristaChatPanelProps>(), {
  messages: () => [],
  isLoading: false,
  filters: () => []
})
const emit = defineEmits<{
  (e: 'submit', message: string): void
  (e: 'updateHeight', height: number): void
}>()

const inputMessage = ref('')
const chatHistoryRef = ref<HTMLElement | null>(null)

function handleSubmit() {
  if (!inputMessage.value.trim() || props.isLoading) return
  let extraContext = ''
  if (baristaStore.sendCurrentFilters && props.filters && props.filters.length > 0) {
    extraContext +=
      ` ${ExtraContentSeparator} Consider the following filters as existing context: ` +
      JSON.stringify(props.filters || [])
  }
  emit('submit', inputMessage.value + extraContext)
  inputMessage.value = ''
}

function formatActionType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function updateHeight() {
  nextTick(() => {
    console.debug(
      '[BaristaChatPanel] Emitting updated height:',
      chatHistoryRef.value?.scrollHeight || 0
    )

    humanPrompt.value?.focus()
    emit('updateHeight', chatHistoryRef.value?.scrollHeight || 0)
  })
}

// Scroll to bottom when new messages are added
watch(
  () => props.messages.length,
  () => {
    updateHeight()
  }
)
const humanPrompt = ref<HTMLTextAreaElement | null>(null)
onMounted(() => {
  humanPrompt.value?.focus()
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
