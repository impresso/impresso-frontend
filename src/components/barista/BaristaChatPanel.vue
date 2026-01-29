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
        <details class="mb-2">
          <summary class="small text-muted" style="cursor: pointer">Settings</summary>
          <div class="mt-2 px-1">
            <label class="small d-block mb-1">Model</label>
            <BFormSelect
              v-model="selectedModelId"
              :options="modelOptions"
              size="sm"
              class="mb-2"
            />
            <label class="small d-block mb-1">Additional instructions</label>
            <BTextarea
              v-model="additionalInstructions"
              :debounce="0"
              placeholder="Extra instructions for Barista..."
              class="border rounded-sm form-control form-control-sm"
              :rows="2"
              autosize
              :maxRows="6"
            />
          </div>
        </details>
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
import BFormSelect, { type Option } from '../legacy/bootstrap/BFormSelect.vue'
import type { Filter } from '@/models'
import { BaristaRequest, ChatMessage } from '@/services/types/barista'
import { useBaristaStore } from '@/stores/barista'
import BaristaChatMessage from './BaristaChatMessage.vue'
import { toSerializedFilters } from '@/logic/filters'

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
  (e: 'submit', request: BaristaRequest): void
  (e: 'updateHeight', height: number): void
}>()

const inputMessage = ref('')
const selectedModelId = ref('')
const additionalInstructions = ref('')
const chatHistoryRef = ref<HTMLElement | null>(null)

const modelOptions: Option[] = [
  { value: '', text: 'Default' },
  { value: 'llama-3.3-70b-versatile', text: 'llama-3.3-70b-versatile' },
  { value: 'llama-3.1-8b-instant', text: 'llama-3.1-8b-instant' },
  { value: 'qwen/qwen3-32b', text: 'qwen/qwen3-32b' },
  { value: 'openai/gpt-oss-20b', text: 'openai/gpt-oss-20b' },
  { value: 'openai/gpt-oss-120b', text: 'openai/gpt-oss-120b' }
]

function handleSubmit() {
  if (!inputMessage.value.trim() || props.isLoading) return

  const shouldSendFilters =
    baristaStore.sendCurrentFilters &&
    props.filters.length > 0 &&
    baristaStore.lastFiltersReceived != toSerializedFilters(props.filters || [])

  emit('submit', {
    message: inputMessage.value.trim(),
    searchQuery: shouldSendFilters ? { filters: props.filters as any } : undefined,
    sessionId: baristaStore.sessionId,
    additionalInstructions: additionalInstructions.value.trim() || undefined,
    modelId: selectedModelId.value || undefined
  })
  inputMessage.value = ''
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
