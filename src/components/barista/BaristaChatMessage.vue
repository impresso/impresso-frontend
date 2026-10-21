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
      <span
        class="small-caps BaristaChatMessage__persona"
        :class="{ 'sr-only': message.type === 'user' }"
      >
        {{ $t(`barista.persona.${message.type}`) }}
      </span>
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

      <TimeAgo class="message-timestamp" :date="message.timestamp" />
    </section>
    <section v-else-if="message.type === 'tool'" class="BaristaChatMessage__step">
      <div class="BaristaChatMessage__stepRow">
        <Icon name="check" :scale="0.6" :strokeWidth="2" class="BaristaChatMessage__stepIcon" />
        <span>{{ $t('barista.toolResult') }}</span>
        <span class="BaristaChatMessage__tool">{{ $t(`barista.tools.${toolId}`) }}</span>
        <button
          type="button"
          class="BaristaChatMessage__toggle"
          :aria-expanded="showDebug"
          @click="showDebug = !showDebug"
        >
          {{ $t('barista.debug') }}
          <Icon name="chevron" :scale="0.55" :strokeWidth="2" :class="{ 'is-open': showDebug }" />
        </button>
      </div>
      <pre v-if="showDebug" class="BaristaChatMessage__debug">{{ message }}</pre>
    </section>

    <section v-if="showToolCalls || message.reasoning" class="BaristaChatMessage__step">
      <div class="BaristaChatMessage__stepRow">
        <template v-if="showToolCalls">
          <span class="BaristaChatMessage__pending" aria-hidden="true"></span>
          <span>{{ $t('barista.usingTools') }}</span>
          <span
            v-for="(tool, toolIdx) in message.toolCalls"
            :key="toolIdx"
            class="BaristaChatMessage__tool"
          >
            {{ $t(`barista.tools.${tool}`) }}
          </span>
        </template>
        <button
          v-if="message.reasoning"
          type="button"
          class="BaristaChatMessage__toggle"
          :aria-expanded="showReasoning"
          @click="showReasoning = !showReasoning"
        >
          {{ $t('barista.reasoning') }}
          <Icon
            name="chevron"
            :scale="0.55"
            :strokeWidth="2"
            :class="{ 'is-open': showReasoning }"
          />
        </button>
      </div>
      <div
        v-if="showReasoning"
        class="BaristaChatMessage__reasoning"
        v-html="renderMarkdown(message.reasoning)"
      ></div>
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
  const hasContent = Boolean(
    message.structuredResponse?.searchQuerySummary ||
      message.content ||
      message.searchQuerySteps?.length
  )
  return hasContent && ['user', 'system', 'error'].includes(message.type)
})

const showToolCalls = computed(() => !hideToolCalls && Boolean(message.toolCalls?.length))

/** tool message content starts with the tool id: '[get_search_facets] [ ... ]' */
const toolId = computed(() =>
  message.type === 'tool' ? message.content?.match(/^\s*\[([^\]]+)\]/)?.[1] : undefined
)
</script>
<i18n lang="json">
{
  "en": {
    "barista": {
      "usingTools": "Working on",
      "debug": "Details",
      "toolResult": "Done",
      "persona": {
        "user": "You",
        "system": "Barista",
        "tool": "Barista (tool)",
        "error": "Barista (error)"
      },
      "reasoning": "Reasoning",
      "tools": {
        "BaristaFormattedResponse": "Suggest filters",
        "find_entities_ids": "Find Entities",
        "find_newspapers_ids": "Find Newspapers",
        "find_topics_ids": "Find Topics",
        "get_impresso_feature_explanation": "Explain Feature",
        "get_search_facets": "Sum up search filters results",
        "filter_builder": "Help with search filters"
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
  border-radius: var(--border-radius-md);
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
  background-color: var(--impresso-color-paper);
  color: var(--impresso-color-black);
}

.BaristaChatMessage .message-content h1,
.BaristaChatMessage .message-content h2,
.BaristaChatMessage .message-content h3,
.BaristaChatMessage .message-content h4,
.BaristaChatMessage .message-content h5,
.BaristaChatMessage .message-content h6 {
  font-size: 1em;
  font-weight: 600;
  margin: 0.75em 0 0.25em;
}
.BaristaChatMessage .message-content h1:first-child,
.BaristaChatMessage .message-content h2:first-child,
.BaristaChatMessage .message-content h3:first-child {
  margin-top: 0;
}
.BaristaChatMessage .message-content hr {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  margin: 0.5em 0;
}
.BaristaChatMessage .message-content p {
  margin: 0 0 0.5em;
}
.BaristaChatMessage .message-content p:last-child {
  margin-bottom: 0;
}
.BaristaChatMessage .message-content ul,
.BaristaChatMessage .message-content ol {
  padding-left: 1.25em;
  margin: 0 0 0.5em;
}
.BaristaChatMessage .message-content code {
  font-size: 0.85em;
  background: rgba(0, 0, 0, 0.08);
  border-radius: var(--border-radius-sm);
  padding: 0.1em 0.3em;
}
.BaristaChatMessage .message-content pre {
  background: rgba(0, 0, 0, 0.08);
  border-radius: var(--border-radius-sm);
  padding: 0.5em 0.75em;
  overflow-x: auto;
}
.BaristaChatMessage .message-content pre code {
  background: none;
  padding: 0;
}

.BaristaChatMessage__persona {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--clr-grey-200);
}
.BaristaChatMessage__content .message-timestamp {
  display: block;
  margin-top: 0.375rem;
  font-size: 0.6875rem;
  white-space: nowrap;
  color: var(--clr-grey-300);
}
.BaristaChatMessage__content.user .message-timestamp {
  color: var(--clr-grey-500);
}
.BaristaChatMessage__content.error {
  border-left: 2px solid var(--bs-danger, #b02a37);
}
.BaristaChatMessage__step {
  max-width: 92%;
  padding-left: 0.25rem;
}
.BaristaChatMessage__stepRow {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--clr-grey-300);
}
.BaristaChatMessage__stepIcon {
  color: var(--clr-grey-200);
}
.BaristaChatMessage__pending {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--clr-grey-300);
}
.BaristaChatMessage__tool {
  padding: 0.0625rem 0.375rem;
  border: 1px solid var(--clr-grey-600);
  border-radius: var(--border-radius-sm);
  background-color: var(--impresso-color-white);
  color: var(--impresso-color-black);
  font-size: 0.75rem;
}
.BaristaChatMessage__toggle {
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  color: var(--clr-grey-300);
  transition: color 0.2s ease;
}
.BaristaChatMessage__toggle:hover {
  color: var(--impresso-color-black);
}
.BaristaChatMessage__toggle:focus-visible {
  outline: 2px solid var(--impresso-color-black);
  outline-offset: 2px;
  border-radius: var(--border-radius-sm);
}
.BaristaChatMessage__toggle .Icon {
  transition: transform 0.2s ease;
}
.BaristaChatMessage__toggle .Icon.is-open {
  transform: rotate(180deg);
}
.BaristaChatMessage__reasoning {
  margin-top: 0.375rem;
  padding-left: 0.75rem;
  border-left: 1px solid var(--clr-grey-600);
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--clr-grey-200);
}
.BaristaChatMessage__reasoning p:last-child {
  margin-bottom: 0;
}
.BaristaChatMessage__debug {
  max-height: 12rem;
  margin: 0.375rem 0 0;
  padding: 0.5rem 0.625rem;
  overflow: auto;
  border-radius: var(--border-radius-sm);
  background-color: var(--impresso-color-paper);
  font-size: 0.6875rem;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--clr-grey-200);
}
@media (prefers-reduced-motion: reduce) {
  .BaristaChatMessage__toggle,
  .BaristaChatMessage__toggle .Icon {
    transition: none;
  }
}

.BaristaChatMessage ol.message-search-steps {
  counter-reset: step;
  list-style: none;
  padding-left: 0;
}
.BaristaChatMessage ol.message-search-steps > li {
  margin-bottom: var(--spacing-3);
}
</style>
