<template>
  <div class="barista-chat-panel">
    <div class="chat-history h-100" ref="chatHistoryRef">
      <div v-for="(message, index) in messages" :key="index" :class="['message', message.type]">
        <div class="message-content">{{ message.content }}</div>
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

    <div class="chat-input position-sticky bottom-0 bg-white input-group">
      <b-form-input
        type="text"
        v-model="inputMessage"
        @keyup.enter="handleSubmit"
        placeholder="Type your message..."
        :disabled="isLoading"
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
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'

interface Action {
  type: 'search'
  context: string
}

export interface ChatMessage {
  content: string
  timestamp: Date
  type: 'user' | 'system'
  actions?: Action[]
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
