<template>
  <div class="barista-chat-panel my-3">
    <div class="chat-history pb-5" ref="chatHistoryRef">
      <div v-for="(message, index) in messages" :key="index" :class="['message', message.type]">
        <div class="message-content" v-if="message.type === 'tool'">
          <h5 class="small-caps text-muted">{{ $t('barista.tool') }}</h5>
          <pre class="small text-white">{{ message.content }}</pre>
        </div>
        <div class="message-content" v-else>
          {{ message.content }}
        </div>
        <!-- Reasoning content (collapsible) -->
        <div v-if="message.reasoning" class="message-expandable">
          <h5 class="small-caps text-muted">{{ $t('barista.reasoning') }}</h5>
          <div class="border-top border-bottom border-tertiary pb-2 mb-3">
            <Ellipsis backgroundColor="#e9e9eb" :initialHeight="100" :maxHeight="0">
              <p class="small text-muted pt-2 pb-4">{{ message.reasoning }}</p>
            </Ellipsis>
          </div>
        </div>

        <!-- Tool calls -->
        <div
          v-if="message.toolCalls && message.toolCalls.length > 0"
          class="message-tools d-flex flex-wrap mb-2 align-items-center gap-2"
        >
          <div class="tools-label small-caps-bold text-muted">🔧 Tools called</div>
          <div class="tools-list small">
            <span v-for="(tool, toolIdx) in message.toolCalls" :key="toolIdx" class="tool-badge">
              {{ $t(`barista.tools.${tool}`) }}
            </span>
          </div>
        </div>

        <div class="message-actions" v-if="message.actions && message.actions.length > 0">
          <div class="action-dropdown">
            <span class="action-icon">
              <span class="icon">⚡</span>
              <span class="action-tooltip">
                <div
                  v-for="(action, actionIndex) in message.actions"
                  :key="actionIndex"
                  class="tooltip-action"
                >
                  {{ formatActionType(action.type) }}: {{ action.context }}
                </div>
              </span>
            </span>
          </div>
        </div>
        <div class="message-timestamp">
          <TimeAgo :date="message.timestamp" />
        </div>
      </div>
      <div v-if="isLoading">working...</div>
    </div>

    <div class="chat-input position-sticky bottom-0 rounded bg-white pb-3">
      <div class="border shadow-sm rounded p-2">
        <BFormCheckbox
          :disabled="!filters.length"
          switch
          v-model="shouldSendFilterToBarista"
          class="mb-2 ml-1"
        >
          Also Send current search filters to Barista
        </BFormCheckbox>
        <slot></slot>
        <div class="input-group">
          <b-form-input
            type="text"
            v-model="inputMessage"
            :debounce="300"
            @keyup.enter="handleSubmit"
            placeholder="Type your message..."
            :disabled="isLoading"
            ref="humanPrompt"
            class="BaristaChatPanel__humanPrompt"
          />
          <div class="input-group-append">
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
import { ref, watch, onMounted, nextTick, reactive } from 'vue'
import TimeAgo from '../TimeAgo.vue'
import BFormCheckbox from '../legacy/bootstrap/BFormCheckbox.vue'
import type { Filter } from '@/models'
import { ChatMessage } from '@/services/types/barista'
import Ellipsis from '../modules/Ellipsis.vue'

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
  (e: 'submit', message: string): void
  (e: 'updateHeight', height: number): void
}>()

const inputMessage = ref('')
const chatHistoryRef = ref<HTMLElement | null>(null)
const expandedMessages = reactive<Record<string, boolean>>({})
const shouldSendFilterToBarista = ref(true)

function getExpandKey(index: number, section: string): string {
  return `${index}-${section}`
}

function toggleExpanded(index: number, section: string) {
  const key = getExpandKey(index, section)
  expandedMessages[key] = !expandedMessages[key]
}

function isCollapsed(index: number, section: string): boolean {
  return expandedMessages[getExpandKey(index, section)] ?? false
}

function handleSubmit() {
  if (!inputMessage.value.trim() || props.isLoading) return
  let extraContext = ''
  if (shouldSendFilterToBarista.value && props.filters && props.filters.length > 0) {
    extraContext +=
      ' --- Consider the following filters as existing context: ' +
      JSON.stringify(props.filters || []) +
      ' ---'
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
const humanPrompt = ref<HTMLInputElement | null>(null)
onMounted(() => {
  humanPrompt.value?.focus()
  updateHeight()
})
</script>

<style scoped>
.BaristaChatPanel__humanPrompt {
  border: 1px solid var(--impresso-color-black);
  border-top-left-radius: var(--border-radius-sm);
  border-bottom-left-radius: var(--border-radius-sm);
}
.chat-history {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  padding: 10px 14px;
  border-radius: var(--impresso-border-radius-xs);
  max-width: 80%;
  word-break: break-word;
  position: relative;
}

.message.user {
  align-self: flex-end;
  background-color: #0084ff;
  color: white;
}

.message.system {
  align-self: flex-start;
  background-color: #e9e9eb;
  color: #333;
}

.message-content {
  margin-bottom: 4px;
}

.message-timestamp {
  font-size: 0.7rem;
  opacity: 0.7;
  text-align: right;
}

.message-actions {
  margin-top: 4px;
  margin-bottom: 4px;
}

.action-dropdown {
  position: relative;
  display: inline-block;
}

.action-icon {
  cursor: pointer;
  font-size: 1rem;
  color: inherit;
  opacity: 0.7;
  padding: 2px 6px;
  border-radius: 4px;
  position: relative;
}

.action-icon:hover .action-tooltip {
  display: block;
}

.action-tooltip {
  display: none;
  position: absolute;
  bottom: 100%;
  left: 0;
  background-color: white;
  opacity: 1;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  min-width: 150px;
  z-index: 10;
  margin-bottom: 8px;
  padding: 6px 0;
}

.tooltip-action {
  padding: 8px 12px;
  color: #333;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.message.system .action-icon:hover {
  background-color: #d8d8d8;
}

.message.user .action-icon:hover {
  background-color: #007af2;
}
.message.tool {
  background-color: var(--impresso-color-black);
  color: var(--impresso-color-white);
}
.icon {
  display: inline-block;
}
</style>
<i18n lang="json">
{
  "en": {
    "barista": {
      "reasoning": "Reasoning",
      "tool": "Tool result",
      "tools": {
        "BaristaFormattedResponse": "Suggest filters",
        "find_entities_ids": "Find Entities"
      }
    }
  }
}
</i18n>
