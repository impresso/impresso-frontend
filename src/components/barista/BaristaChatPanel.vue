<template>
  <div class="barista-chat-panel">
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
        <div class="message-timestamp">{{ formatTimestamp(message.timestamp) }}</div>
      </div>
    </div>

    <div class="chat-input">
      <input
        type="text"
        v-model="inputMessage"
        @keyup.enter="handleSubmit"
        placeholder="Type your message..."
        :disabled="isLoading"
      />
      <button
        @click="handleSubmit"
        :disabled="!inputMessage.trim() || isLoading"
        class="submit-button"
      >
        <span v-if="isLoading">Sending...</span>
        <span v-else>Send</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, reactive } from 'vue'
import type { BaristaFormattedResponse } from '@/stores/barista'

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

function formatTimestamp(timestamp: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp)
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

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.barista-chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.chat-history {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #f5f5f5;
}

.message {
  padding: 10px 14px;
  border-radius: 8px;
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

.chat-input {
  display: flex;
  padding: 12px;
  border-top: 1px solid #e0e0e0;
  background-color: white;
}

.chat-input input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 20px;
  margin-right: 8px;
  font-size: 1rem;
}

.submit-button {
  padding: 10px 16px;
  background-color: #0084ff;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
}

.submit-button:hover:not(:disabled) {
  background-color: #0073e6;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.message-expandable {
  margin-top: 8px;
}

.expand-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  color: inherit;
  opacity: 0.8;
}

.expand-toggle:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.1);
}

.expand-icon {
  font-size: 0.7rem;
}

.expandable-content {
  margin-top: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.expandable-content pre {
  margin: 0;
  padding: 8px;
  font-size: 0.75rem;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.message.system .expandable-content pre {
  background-color: #d8d8d8;
  color: #333;
}

.message.user .expandable-content pre {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
}

.message.tool {
  align-self: flex-start;
  background-color: #fff3cd;
  color: #856404;
  border-left: 3px solid #ffc107;
}

.message-tools {
  margin-top: 8px;
  padding: 6px 0;
}

.tools-label {
  font-size: 0.8rem;
  opacity: 0.9;
  margin-bottom: 4px;
}

.tools-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tool-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 0.75rem;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.1);
}

.message.system .tool-badge {
  background-color: #c8c8ca;
}

.message.user .tool-badge {
  background-color: rgba(255, 255, 255, 0.2);
}

.reasoning-content p {
  margin: 0;
  padding: 8px;
  font-size: 0.85rem;
  font-style: italic;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  border-left: 3px solid rgba(0, 0, 0, 0.2);
}

.structured-item {
  margin-bottom: 8px;
  font-size: 0.85rem;
}

.structured-item strong {
  display: block;
  margin-bottom: 4px;
}

.structured-item pre {
  margin: 4px 0 0;
  padding: 8px;
  font-size: 0.75rem;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow-x: auto;
}
</style>
