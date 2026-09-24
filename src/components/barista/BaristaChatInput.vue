<template>
  <div class="chat-input position-sticky bottom-0 rounded bg-white pb-3">
    <div class="border shadow-sm rounded p-2">
      <details class="mb-2">
        <summary
          class="small text-muted d-flex align-items-center gap-2"
          style="cursor: pointer; list-style: none"
        >
          <Icon name="chevron" :scale="0.7" :strokeWidth="2" class="details-chevron" />
          <span class="mr-auto">Settings</span>
          <BFormSelect
            v-if="showDeveloperSettings"
            v-model="selectedAgentType"
            :options="agentTypeOptions"
            size="sm"
            style="width: auto"
            @click.stop
          />
          <WithTooltip
            v-if="baristaStore.sessionId"
            placement="top-end"
            strategy="fixed"
            :content="sessionIdTooltipContent"
            :is-html="true"
            class="session-id-tooltip-hint very-small text-muted"
            style="cursor: pointer"
            @click.stop="copySessionId"
          >
            <Icon name="info" :scale="0.6" :strokeWidth="2" />
          </WithTooltip>
        </summary>
        <div class="mt-2 px-1">
          <template v-if="showDeveloperSettings">
            <label class="small d-block mb-1">Model</label>
            <BFormSelect v-model="selectedModelId" :options="modelOptions" size="sm" class="mb-2" />
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
          </template>
          <div class="d-flex align-items-center gap-2 mt-1">
            <BFormCheckbox v-model="allowTopicsFilters" switch size="sm" />
            <label class="small mb-0">Allow topics filters</label>
          </div>
        </div>
      </details>

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

      <div v-if="showRemainingConversations" class="mt-2 px-1">
        <p v-if="baristaStore.remainingConversations === 0" class="small text-danger mb-0">
          You have used all your available requests. Please try again in a minute.
        </p>
        <p v-else class="very-small text-muted mb-0">
          {{ baristaStore.remainingConversations }} conversation{{
            baristaStore.remainingConversations === 1 ? '' : 's'
          }}
          remaining
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BFormSelect, { type Option } from '../legacy/bootstrap/BFormSelect.vue'
import BFormCheckbox from '../legacy/bootstrap/BFormCheckbox.vue'
import type { Filter } from '@/models'
import { BaristaRequest } from '@/services/types/barista'
import { useBaristaStore } from '@/stores/barista'
import Icon from '../base/Icon.vue'
import WithTooltip from '../base/WithTooltip.vue'
import { toSerializedFilters } from '@/logic/filters'

export interface BaristaChatInputProps {
  isLoading?: boolean
  filters?: Filter[]
  showDeveloperSettings?: boolean
}

const baristaStore = useBaristaStore()
const props = withDefaults(defineProps<BaristaChatInputProps>(), {
  isLoading: false,
  filters: () => [],
  showDeveloperSettings: false
})
const emit = defineEmits<{
  (e: 'submit', request: BaristaRequest): void
}>()

const sessionIdTooltipContent = computed(
  () =>
    `<b>Chat Session ID</b><br><code style="white-space:nowrap;border:none;background:transparent;color:inherit;padding:0">${baristaStore.sessionId}</code>`
)

const inputMessage = ref('')
const selectedModelId = ref('')
const selectedAgentType = ref<'react' | 'router' | 'skills'>('router')
const additionalInstructions = ref('')
const allowTopicsFilters = ref(false)
const humanPrompt = ref<HTMLTextAreaElement | null>(null)
const showRemainingConversations = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | undefined

watch(
  () => baristaStore.remainingConversations,
  value => {
    if (value === undefined) return
    showRemainingConversations.value = true
    clearTimeout(hideTimer)
    hideTimer = setTimeout(() => (showRemainingConversations.value = false), 60_000)
  }
)

const agentTypeOptions: Option[] = [
  { value: 'skills', text: 'Skills (experimental)' },
  { value: 'react', text: 'ReAct (deprecated)' },
  { value: 'router', text: 'Router (default)' }
]

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

  const modelId = (selectedModelId.value?.trim() ?? '') == '' ? null : selectedModelId.value.trim()

  emit('submit', {
    message: inputMessage.value.trim(),
    searchQuery: shouldSendFilters ? { filters: props.filters as any } : undefined,
    sessionId: baristaStore.sessionId,
    additionalInstructions: additionalInstructions.value.trim() || undefined,
    modelId: modelId as any,
    agentType: selectedAgentType.value,
    prohibitedFilterTypes: allowTopicsFilters.value ? undefined : ['topic']
  })
  inputMessage.value = ''
}

function copySessionId() {
  navigator.clipboard.writeText(baristaStore.sessionId)
}

function focus() {
  humanPrompt.value?.focus()
}

defineExpose({ focus })
</script>

<style>
.session-id-tooltip-hint .tooltip-inner {
  max-width: none;
}
</style>

<style scoped>
details summary::-webkit-details-marker {
  display: none;
}
details[open] .details-chevron {
  transform: rotate(180deg);
}
.details-chevron {
  transition: transform 0.15s ease;
  flex-shrink: 0;
}
</style>
