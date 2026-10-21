<template>
  <div class="BaristaChatInput">
    <div class="BaristaChatInput__composer">
      <details class="BaristaChatInput__settings">
        <summary class="small text-muted d-flex align-items-center gap-2">
          <Icon name="chevron" :scale="0.7" :strokeWidth="2" class="details-chevron" />
          <span class="mr-auto">{{ $t('settings') }}</span>
          <BFormSelect
            v-if="showDeveloperSettings"
            v-model="selectedAgentType"
            :options="AgentTypeOptions"
            size="sm"
            class="w-auto"
            @click.stop
          />
          <WithTooltip
            placement="top-end"
            strategy="fixed"
            :content="getSessionIdTooltip($t('sessionId'))"
            :is-html="true"
            class="session-id-tooltip-hint very-small text-muted"
            @click.stop="copySessionId"
          >
            <Icon name="info" :scale="0.6" :strokeWidth="2" />
          </WithTooltip>
        </summary>
        <div class="mt-2 px-1">
          <template v-if="showDeveloperSettings">
            <label class="small d-block mb-1">{{ $t('model') }}</label>
            <BFormSelect v-model="selectedModelId" :options="ModelOptions" size="sm" class="mb-2" />
            <label class="small d-block mb-1">{{ $t('additionalInstructions') }}</label>
            <BTextarea
              v-model="additionalInstructions"
              :debounce="0"
              :placeholder="$t('additionalInstructionsPlaceholder')"
              class="border rounded-sm form-control form-control-sm"
              :rows="2"
              autosize
              :maxRows="6"
            />
          </template>
          <div class="d-flex align-items-center gap-2 mt-1">
            <BFormCheckbox v-model="allowTopicsFilters" switch size="sm" />
            <label class="small mb-0">{{ $t('allowTopicsFilters') }}</label>
          </div>
        </div>
      </details>

      <div class="BaristaChatInput__field">
        <BTextarea
          ref="humanPrompt"
          v-model="inputMessage"
          :debounce="0"
          :placeholder="$t('placeholder')"
          :disabled="isLoading"
          class="BaristaChatInput__textarea"
          :rows="1"
          autosize
          :maxRows="8"
          @keyup.enter="handleSubmit"
        />
        <button
          type="button"
          :disabled="!canSubmit"
          class="btn btn-sm btn-outline-secondary border border-dark BaristaChatInput__send"
          @click="handleSubmit"
        >
          {{ isLoading ? $t('sending') : $t('send') }}
        </button>
      </div>

      <div v-if="showRemainingConversations" class="mt-2 px-1">
        <p v-if="baristaStore.remainingConversations === 0" class="small text-danger mb-0">
          {{ $t('noConversationsLeft') }}
        </p>
        <p v-else class="very-small text-muted mb-0">
          {{
            $t(
              'conversationsLeft',
              { n: baristaStore.remainingConversations },
              baristaStore.remainingConversations ?? 0
            )
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BFormSelect, { type Option } from '@/components/legacy/bootstrap/BFormSelect.vue'
import BFormCheckbox from '@/components/legacy/bootstrap/BFormCheckbox.vue'
import Icon from '@/components/base/Icon.vue'
import WithTooltip from '@/components/base/WithTooltip.vue'
import type { Filter } from '@/models'
import type { BaristaRequest } from '@/services/types/barista'
import { useBaristaStore } from '@/stores/barista'
import { toSerializedFilters } from '@/logic/filters'

type AgentType = BaristaRequest['agentType']
type ModelId = NonNullable<BaristaRequest['modelId']>

/** how long the remaining-conversations hint stays visible after a reply */
const RemainingConversationsHintMs = 60_000

const AgentTypeOptions: Option[] = [
  { value: 'skills', text: 'Skills (experimental)' },
  { value: 'react', text: 'ReAct (deprecated)' },
  { value: 'router', text: 'Router (default)' }
]

const ModelOptions: Option[] = [
  { value: '', text: 'Default' },
  ...(
    [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'qwen/qwen3-32b',
      'openai/gpt-oss-20b',
      'openai/gpt-oss-120b'
    ] satisfies ModelId[]
  ).map(value => ({ value, text: value }))
]

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

const getSessionIdTooltip = (label: string) =>
  `<b>${label}</b><br><code style="white-space:nowrap;border:none;background:transparent;color:inherit;padding:0">${baristaStore.sessionId}</code>`

const inputMessage = ref('')
const selectedModelId = ref<ModelId | ''>('')
const selectedAgentType = ref<AgentType>('router')
const additionalInstructions = ref('')
const allowTopicsFilters = ref(false)
const humanPrompt = ref<HTMLTextAreaElement | null>(null)
const showRemainingConversations = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | undefined

const canSubmit = computed(() => inputMessage.value.trim().length > 0 && !props.isLoading)

watch(
  () => baristaStore.remainingConversations,
  value => {
    if (value === undefined) return
    showRemainingConversations.value = true
    clearTimeout(hideTimer)
    hideTimer = setTimeout(
      () => (showRemainingConversations.value = false),
      RemainingConversationsHintMs
    )
  }
)

/** filters are only sent when they differ from the ones Barista suggested last */
const shouldSendFilters = () =>
  baristaStore.sendCurrentFilters &&
  props.filters.length > 0 &&
  baristaStore.lastFiltersReceived !== toSerializedFilters(props.filters)

function handleSubmit() {
  if (!canSubmit.value) return

  emit('submit', {
    message: inputMessage.value.trim(),
    searchQuery: shouldSendFilters()
      ? { filters: props.filters as NonNullable<BaristaRequest['searchQuery']>['filters'] }
      : undefined,
    sessionId: baristaStore.sessionId,
    additionalInstructions: additionalInstructions.value.trim() || undefined,
    modelId: selectedModelId.value || null,
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

function setMessage(text: string) {
  inputMessage.value = text
  focus()
}

defineExpose({ focus, setMessage })
</script>

<i18n lang="json">
{
  "en": {
    "settings": "Settings",
    "sessionId": "Chat Session ID",
    "model": "Model",
    "additionalInstructions": "Additional instructions",
    "additionalInstructionsPlaceholder": "Extra instructions for Barista...",
    "allowTopicsFilters": "Allow topics filters",
    "placeholder": "Type your message...",
    "send": "Send",
    "sending": "Sending...",
    "noConversationsLeft": "You have used all your available requests. Please try again in a minute.",
    "conversationsLeft": "No conversations remaining | {n} conversation remaining | {n} conversations remaining"
  }
}
</i18n>

<style>
.session-id-tooltip-hint {
  cursor: pointer;
}
.session-id-tooltip-hint .tooltip-inner {
  max-width: none;
}
</style>

<style scoped>
.BaristaChatInput {
  flex: 0 0 auto;
  padding-top: 0.35rem;
  background-color: var(--impresso-color-white);
}
.BaristaChatInput__composer {
  border: 1px solid var(--clr-grey-600);
  border-radius: var(--border-radius-md);
  background-color: var(--impresso-color-white);
  padding: 0.55rem 0.55rem 0.55rem 0.8rem;
}
.BaristaChatInput__settings {
  margin-bottom: 0.35rem;
}
.BaristaChatInput__field {
  display: flex;
  align-items: flex-end;
  gap: 0.55rem;
}
.BaristaChatInput__textarea {
  flex: 1 1 auto;
  min-height: 2.5rem;
  max-height: 9rem;
  padding: 0.45rem 0.15rem;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  resize: none;
}
/* the composer draws the focus ring; the legacy theme forces one on every .form-control */
.BaristaChatInput__textarea:focus {
  outline: none;
  box-shadow: none !important;
}
.BaristaChatInput__composer:focus-within {
  border-color: var(--impresso-color-black);
  box-shadow: 0 0 0 1px var(--impresso-color-black);
}
.BaristaChatInput__send {
  flex: 0 0 auto;
  min-height: 2.25rem;
  padding-inline: 0.875rem;
  align-self: flex-end;
}
.btn.BaristaChatInput__send:hover:not(:disabled),
.btn.BaristaChatInput__send:active:not(:disabled) {
  background-color: var(--impresso-color-black);
  color: var(--impresso-color-white);
}
.BaristaChatInput__settings summary {
  cursor: pointer;
  list-style: none;
}
.BaristaChatInput__settings summary::-webkit-details-marker {
  display: none;
}
details[open] .details-chevron {
  transform: rotate(180deg);
}
.details-chevron {
  transition: transform 0.15s ease;
  flex-shrink: 0;
}
@media (prefers-reduced-motion: reduce) {
  .details-chevron {
    transition: none;
  }
}
</style>
