<template>
  <div class="barista-chat-panel my-3">
    <div class="chat-history" ref="chatHistoryRef">
      <div v-for="(message, index) in messages" :key="index" :class="['message', message.type]">
        <div class="message-content">{{ message.content }}</div>

        <!-- Reasoning content (collapsible) -->
        <div v-if="message.reasoning" class="message-expandable">
          <button class="expand-toggle" @click="toggleExpanded(index, 'reasoning')" type="button">
            <span class="expand-icon">{{ isExpanded(index, 'reasoning') ? '▼' : '▶' }}</span>
            <span>Reasoning</span>
          </button>
          <div v-if="isExpanded(index, 'reasoning')" class="expandable-content reasoning-content">
            <p>{{ message.reasoning }}</p>
          </div>
        </div>

        <!-- Tool calls -->
        <div v-if="message.toolCalls && message.toolCalls.length > 0" class="message-tools">
          <div class="tools-label">🔧 Tools called:</div>
          <div class="tools-list">
            <span v-for="(tool, toolIdx) in message.toolCalls" :key="toolIdx" class="tool-badge">
              {{ tool }}
            </span>
          </div>
        </div>

        <!-- Structured response (collapsible) -->
        <div v-if="message.structuredResponse" class="message-expandable">
          <button class="expand-toggle" @click="toggleExpanded(index, 'structured')" type="button">
            <span class="expand-icon">{{ isExpanded(index, 'structured') ? '▼' : '▶' }}</span>
            <span>Structured Response</span>
          </button>
          <div v-if="isExpanded(index, 'structured')" class="expandable-content">
            <div v-if="message.structuredResponse.impresso_help" class="structured-item">
              <strong>Help:</strong> {{ message.structuredResponse.impresso_help }}
            </div>
            <div v-if="message.structuredResponse.search_query" class="structured-item">
              <strong>Search Query:</strong>
              <pre>{{ JSON.stringify(message.structuredResponse.search_query, null, 2) }}</pre>
            </div>
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
    </div>
    <div class="p-3"></div>
    <div class="chat-input position-sticky bottom-0 rounded bg-white pb-3">
      <div class="border border-dark shadow-sm rounded p-2">
        <BFormCheckbox switch v-model="shouldSendFilterToBarista" class="mb-2 ml-1">
          Also Send current search filters to Barista
        </BFormCheckbox>

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
import type { BaristaFormattedResponse } from '@/stores/barista'
import TimeAgo from '../TimeAgo.vue'
import BFormCheckbox from '../legacy/bootstrap/BFormCheckbox.vue'

interface Action {
  type: 'search'
  context: string
}

export interface ChatMessage {
  content: string
  timestamp: Date
  type: 'user' | 'system' | 'tool'
  actions?: Action[]
  reasoning?: string
  toolCalls?: string[]
  structuredResponse?: BaristaFormattedResponse
}

const props = defineProps<{
  messages: ChatMessage[]
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', message: string): void
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

function isExpanded(index: number, section: string): boolean {
  return expandedMessages[getExpandKey(index, section)] ?? false
}

function handleSubmit() {
  if (!inputMessage.value.trim() || props.isLoading) return

  emit('submit', inputMessage.value)
  inputMessage.value = ''
}

function formatActionType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function scrollToBottom() {
  nextTick(() => {
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
    }
  })
}

// Scroll to bottom when new messages are added
watch(
  () => props.messages,
  () => {
    scrollToBottom()
  },
  { deep: true }
)
const humanPrompt = ref<HTMLInputElement | null>(null)
onMounted(() => {
  humanPrompt.value?.focus()
  scrollToBottom()
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

.icon {
  display: inline-block;
}
</style>
