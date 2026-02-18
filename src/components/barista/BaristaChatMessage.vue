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
      <div class="message-content" v-html="message.content"></div>

      <!-- Additional content -->
      <div
        v-if="message.additionalContent"
        class="message-additional-content very-small text-light"
      >
        <details>
          <summary class="mb-2">Show additional content</summary>
          <div v-html="message.additionalContent"></div>
        </details>
      </div>

      <div v-if="message.structuredResponse?.searchQuerySummary">
        {{ message.structuredResponse?.searchQuerySummary }}
      </div>

      <TimeAgo
        class="message-timestamp very-small text-muted text-ellipsis no-wrap"
        style="white-space: nowrap"
        :date="message.timestamp"
      />
    </section>
    <section v-else-if="message.type === 'tool'" class="BaristaChatMessage__tool">
      <div class="d-flex align-items-center gap-1 small">
        <Icon name="brainElectricity" :scale="0.75" :strokeWidth="2" />
        <h5 class="font-size-inherit font-style-italic mb-0 mr-2 text-muted">
          {{ $t('barista.toolResult') }}
        </h5>
        <div>
          {{ $t(`barista.tools.${toolId}`) }}
        </div>
      </div>

      <details class="ml-3 small">
        <summary>
          {{ $t('barista.debug') }}
        </summary>
        <p class="text-muted mb-0">{{ message }}</p>
      </details>
    </section>

    <!-- Tool calls -->
    <section
      v-if="message.toolCalls && message.toolCalls.length > 0"
      class="BaristaChatMessage__tools"
    >
      <div class="d-flex align-items-center gap-1 small">
        <Icon name="coffeeCup" :scale="0.75" :strokeWidth="2" />
        <h5 class="font-size-inherit font-style-italic mb-0 mr-2 text-muted">
          {{ $t('barista.usingTools') }}
        </h5>
        <div v-for="(tool, toolIdx) in message.toolCalls" :key="toolIdx" class="tool-badge">
          {{ $t(`barista.tools.${tool}`) }}
          <span v-if="toolIdx < message.toolCalls.length - 1">, </span>
        </div>
      </div>

      <details class="ml-3 small">
        <summary>
          {{ $t('barista.reasoning') }}
        </summary>
        <p class="text-muted mb-0">{{ message.reasoning }}</p>
      </details>
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
import { computed } from 'vue'

/**
 * BaristaChatMessage component props
 */
export interface BaristaChatMessageProps {
  message: ChatMessage
}

const { message } = defineProps<BaristaChatMessageProps>()

const isUserOrSystemWithContent = computed(() => {
  const contentLength =
    (message.structuredResponse?.searchQuerySummary?.length || 0) + (message.content?.length || 0)
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
.BaristaChatMessage__content {
  padding: 10px 14px;
  border-radius: var(--impresso-border-radius-xs);
  max-width: 80%;
  word-break: break-word;
  position: relative;
  display: inline-block;
}

.BaristaChatMessage__content.user {
  align-self: flex-end;
  background-color: #0084ff;
  color: white;
}

.BaristaChatMessage__content.system,
.BaristaChatMessage__content.tool {
  align-self: flex-start;
  background-color: #ebebeb;
  color: var(--impresso-color-black);
}

.BaristaChatMessage__content.user {
  background-color: var(--impresso-color-black);
  color: var(--impresso-color-white);
}
</style>
