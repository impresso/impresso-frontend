<template>
  <div class="BaristaChatMessage">
    <section
      v-if="isUserOrSystemWithContent"
      :class="[
        'BaristaChatMessage__content',
        message.type,
        message.reasoning ? 'with-reasoning' : ''
      ]"
    >
      <h5 class="small-caps mb-1" :class="{ 'text-white': message.type === 'user' }">
        {{ $t(`barista.persona.${message.type}`) }}
      </h5>
      <div class="message-content" v-html="renderMarkdown(message.content)"></div>

      <!-- Additional content -->
      <div
        v-if="message.additionalContent"
        class="message-additional-content very-small text-light"
      >
        <details>
          <summary class="mb-2">Show additional content</summary>
          <div v-html="renderMarkdown(message.additionalContent)"></div>
        </details>
      </div>

      <div
        v-if="message.structuredResponse?.searchQuerySummary"
        v-html="renderMarkdown(message.structuredResponse.searchQuerySummary)"
        class="message-search-query-summary small mt-2 mb-0 text-muted"
      ></div>

      <ol v-if="message.searchQuerySteps?.length" class="message-search-steps mt-2 mb-0">
        <li
          v-for="(step, i) in message.searchQuerySteps"
          :key="i"
          v-html="renderMarkdown(step)"
        ></li>
      </ol>

      <TimeAgo
        class="message-timestamp very-small text-muted text-ellipsis no-wrap"
        style="white-space: nowrap"
        :date="message.timestamp"
      />
    </section>
    <section v-else-if="message.type === 'tool'" class="BaristaChatMessage__tool">
      <div class="d-flex align-items-center flex-wrap gap-1 small">
        <Icon name="brainElectricity" :scale="0.75" :strokeWidth="2" />
        <span class="font-style-italic text-muted">{{ $t('barista.toolResult') }}</span>
        <span class="badge badge-light">{{ $t(`barista.tools.${toolId}`) }}</span>
        <button class="tool-toggle" @click="showDebug = !showDebug">
          {{ showDebug ? '▾' : '▸' }} {{ $t('barista.debug') }}
        </button>
      </div>
      <p v-if="showDebug" class="text-muted very-small mt-1 mb-0">{{ message }}</p>
    </section>

    <!-- Tool calls -->
    <section
      v-if="
        (!hideToolCalls && message.toolCalls && message.toolCalls.length > 0) || message.reasoning
      "
      class="BaristaChatMessage__tools"
    >
      <div class="d-flex align-items-center flex-wrap gap-1 small">
        <template v-if="!hideToolCalls && message.toolCalls && message.toolCalls.length > 0">
          <Icon name="coffeeCup" :scale="0.75" :strokeWidth="2" />
          <span class="font-style-italic text-muted">{{ $t('barista.usingTools') }}</span>
          <span
            v-for="(tool, toolIdx) in message.toolCalls"
            :key="toolIdx"
            class="badge badge-light"
          >
            {{ $t(`barista.tools.${tool}`) }}
          </span>
        </template>
        <button
          v-if="message.reasoning"
          class="tool-toggle"
          @click="showReasoning = !showReasoning"
        >
          {{ showReasoning ? '▾' : '▸' }} {{ $t('barista.reasoning') }}
        </button>
      </div>
      <p
        v-if="showReasoning"
        class="text-muted very-small mt-1 mb-0"
        v-html="renderMarkdown(message.reasoning)"
      ></p>
    </section>
    <!-- Actions -->
    <section
      v-if="message.actions && message.actions.length > 0"
      class="BaristaChatMessage__actions mt-2"
    >
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
    </section>
  </div>
</template>

<script setup lang="ts">
import TimeAgo from '@/components/TimeAgo.vue'
import type { ChatMessage } from '@/services/types/barista'
import Icon from '../base/Icon.vue'
import { computed, ref } from 'vue'
import { marked } from 'marked'

const renderMarkdown = (text?: string | null): string => {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

/**
 * BaristaChatMessage component props
 */
export interface BaristaChatMessageProps {
  message: ChatMessage
  hideToolCalls?: boolean
}

const { message, hideToolCalls } = defineProps<BaristaChatMessageProps>()

const showDebug = ref(false)
const showReasoning = ref(false)

const isUserOrSystemWithContent = computed(() => {
  const contentLength =
    (message.structuredResponse?.searchQuerySummary?.length || 0) +
    (message.content?.length || 0) +
    (message.searchQuerySteps?.length || 0)
  return contentLength > 0 && ['user', 'system', 'error'].includes(message.type)
})

const toolParsedContent = computed<{
  toolId: string
  data: any
} | null>(() => {
  if (message.type !== 'tool') return null
  // meszsage.content is expected to be something unreadable like:
  // message.content= '[get_search_facets] [ "<json-as-string>", <actual-json> ]'
  const match: RegExpMatchArray | null = message.content?.match(/^\s*\[([^\]]+)\]/)
  if (!match) return null
  const toolId = match[1]
  const dataStartIndex = message.content.indexOf(']') + 1
  return {
    toolId,
    data: message.content.slice(dataStartIndex).trim()
  }
})

const toolId = computed<string | undefined>(() => toolParsedContent.value?.toolId)

/**
 * Formats action type by capitalizing the first letter
 */
const formatActionType = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1)
}
</script>
<i18n lang="json">
{
  "en": {
    "barista": {
      "usingTools": "ordering tools...",
      "debug": "Debug Info",
      "toolResult": "oh! I got a result for the tool",
      "persona": {
        "user": "You",
        "system": "Barista",
        "tool": "Barista (tool)",
        "error": "Barista (error)",
        "userReasoning": "You",
        "systemReasoning": "Barista (with reasoning)",
        "toolReasoning": "Barista (tool with reasoning)"
      },
      "reasoning": "Reasoning",
      "tools": {
        "BaristaFormattedResponse": "Suggest filters",
        "find_entities_ids": "Find Entities",
        "find_newspapers_ids": "Find Newspapers",
        "find_topics_ids": "Find Topics",
        "get_impresso_feature_explanation": "Explain Feature",
        "get_search_facets": "Sum up search filters results"
      }
    }
  }
}
</i18n>
<style>
.BaristaChatMessage {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.BaristaChatMessage__content {
  padding: 10px 14px;
  border-radius: var(--impresso-border-radius-xs);
  max-width: 80%;
  word-break: break-word;
  position: relative;
}

.BaristaChatMessage__content.user {
  align-self: flex-end;
  background-color: var(--impresso-color-black);
  color: var(--impresso-color-white);
}

.BaristaChatMessage__content.system,
.BaristaChatMessage__content.error {
  align-self: flex-start;
  background-color: #ebebeb;
  color: var(--impresso-color-black);
}

.message-content :deep(h1),
.message-content :deep(h2),
.message-content :deep(h3),
.message-content :deep(h4),
.message-content :deep(h5),
.message-content :deep(h6) {
  font-size: 1em;
  font-weight: 600;
  margin: 0.75em 0 0.25em;
}
.message-content :deep(h1:first-child),
.message-content :deep(h2:first-child),
.message-content :deep(h3:first-child) {
  margin-top: 0;
}
.message-content :deep(hr) {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  margin: 0.5em 0;
}
.message-content :deep(p) {
  margin: 0 0 0.5em;
}
.message-content :deep(p:last-child) {
  margin-bottom: 0;
}
.message-content :deep(ul),
.message-content :deep(ol) {
  padding-left: 1.25em;
  margin: 0 0 0.5em;
}
.message-content :deep(code) {
  font-size: 0.85em;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 3px;
  padding: 0.1em 0.3em;
}
.message-content :deep(pre) {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  padding: 0.5em 0.75em;
  overflow-x: auto;
}
.message-content :deep(pre) code {
  background: none;
  padding: 0;
}

.tool-toggle {
  all: unset;
  cursor: pointer;
  opacity: 0.55;
  font-size: inherit;
}

.BaristaChatMessage ol.message-search-steps {
  counter-reset: step;
  list-style: none;
  padding-left: 0;
}
.BaristaChatMessage li {
  margin-bottom: var(--spacing-3);
}
</style>
