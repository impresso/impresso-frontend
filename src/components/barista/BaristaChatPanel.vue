<template>
  <div class="barista-chat-panel">
    <div class="chat-history" ref="chatHistoryRef">
      <section v-if="!messages.length && !isLoading" class="BaristaChatPanel__empty">
        <span class="BaristaChatPanel__mark" aria-hidden="true">
          <Icon name="coffeeCup" :scale="1" :stroke-width="1.5" />
        </span>
        <h2 class="BaristaChatPanel__title">{{ $t('empty.title') }}</h2>
        <p class="BaristaChatPanel__intro">{{ $t('empty.intro') }}</p>
        <p class="small-caps BaristaChatPanel__tryLabel">{{ $t('empty.try') }}</p>
        <ul class="BaristaChatPanel__starters">
          <li v-for="starter in Starters" :key="starter">
            <button
              type="button"
              class="BaristaChatPanel__starter"
              @click="useStarter($t(`starters.${starter}`))"
            >
              <span>{{ $t(`starters.${starter}`) }}</span>
              <Icon name="arrowRight" :scale="0.6" :stroke-width="1.75" />
            </button>
          </li>
        </ul>
        <details class="BaristaChatPanel__about">
          <summary>{{ $t('empty.aboutTitle') }}</summary>
          <p>{{ $t('empty.about') }}</p>
        </details>
      </section>
      <BaristaChatMessage
        v-for="(message, index) in messages"
        :key="index"
        :message="message"
        :hideToolCalls="shouldHideToolCalls(message)"
      />
      <div v-if="isLoading" class="BaristaChatPanel__status" role="status">
        <span class="BaristaChatPanel__dots" aria-hidden="true"><i></i><i></i><i></i></span>
        {{ $t('working') }}
      </div>
    </div>

    <BaristaChatInput
      ref="chatInputRef"
      :isLoading="isLoading"
      :filters="filters"
      :initial-prompt="initialPrompt"
      @submit="emit('submit', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import type { Filter } from '@/models'
import type { BaristaRequest, ChatMessage } from '@/services/types/barista'
import Icon from '@/components/base/Icon.vue'
import BaristaChatMessage from './BaristaChatMessage.vue'
import BaristaChatInput from './BaristaChatInput.vue'

export interface BaristaChatPanelProps {
  messages: ChatMessage[]
  isLoading?: boolean
  filters?: Filter[]
  initialPrompt?: string
}

/** one starter per Barista task: build filters, explain Impresso, sum up the current search */
const Starters = ['findArticles', 'explainFeature', 'summariseSearch'] as const

const props = withDefaults(defineProps<BaristaChatPanelProps>(), {
  messages: () => [],
  isLoading: false,
  filters: () => []
})
const emit = defineEmits<{
  (e: 'submit', request: BaristaRequest): void
}>()

const chatHistoryRef = ref<HTMLElement | null>(null)
const chatInputRef = ref<InstanceType<typeof BaristaChatInput> | null>(null)

const resolvedToolCallIds = computed(() => {
  const ids = new Set<string>()
  for (const msg of props.messages) {
    if (msg.type === 'tool' && msg.toolCallIds) {
      msg.toolCallIds.forEach(id => ids.add(id))
    }
  }
  return ids
})

function shouldHideToolCalls(message: ChatMessage): boolean {
  if (!message.toolCallIds?.length) return false
  return message.toolCallIds.some(id => resolvedToolCallIds.value.has(id))
}

function useStarter(text: string) {
  chatInputRef.value?.setMessage(text)
}

async function scrollToLatest() {
  await nextTick()
  chatHistoryRef.value?.scrollTo({ top: chatHistoryRef.value.scrollHeight, behavior: 'smooth' })
  chatInputRef.value?.focus()
}

watch(() => props.messages.length, scrollToLatest)

onMounted(scrollToLatest)
</script>

<i18n lang="json">
{
  "en": {
    "working": "Barista is working on it",
    "empty": {
      "title": "What are you researching?",
      "intro": "Barista works through your question step by step. It looks up the newspapers, people, places and topics involved, turns them into search filters and explains how Impresso can help.",
      "try": "Try asking",
      "aboutTitle": "Why the name Barista?",
      "about": "Barista [ba’rista] is the person behind the counter in a coffee shop: they listen carefully to your order, your hesitations, and sometimes even your worries. Of course they don’t have the answer you need, but they help you figure it out, and then prepare a proper coffee in the meanwhile, to clear your mind. Don’t worry, they’re the ultimate local expert: they suggest the connections that matter for your problem, and help you understand the neighbourhood, without ever leaving the counter."
    },
    "starters": {
      "findArticles": "Find articles about Robert Schumann in Luxembourg newspapers",
      "explainFeature": "How does text reuse work in Impresso?",
      "summariseSearch": "Sum up the results of my current search"
    }
  }
}
</i18n>

<style scoped>
.barista-chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.chat-history {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 0.85rem 0.15rem 1rem;
  scroll-behavior: smooth;
}
.BaristaChatPanel__empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 34rem;
  margin-top: auto;
  padding: 0.5rem 0.25rem 0.75rem;
}
.BaristaChatPanel__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 1rem;
  border: 1px solid var(--clr-grey-600);
  border-radius: var(--border-radius-md);
  background-color: var(--impresso-color-paper);
}
.BaristaChatPanel__title {
  margin: 0 0 0.5rem;
  font-size: 1.375rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
  font-weight: 550;
  font-variation-settings: 'wght' 550;
  text-wrap: balance;
}
.BaristaChatPanel__intro {
  max-width: 62ch;
  margin: 0 0 1.25rem;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--clr-grey-200);
  text-wrap: pretty;
}
.BaristaChatPanel__tryLabel {
  margin: 0 0 0.375rem;
  color: var(--clr-grey-300);
}
.BaristaChatPanel__starters {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--clr-grey-700);
}
.BaristaChatPanel__starters li {
  border-bottom: 1px solid var(--clr-grey-700);
}
.BaristaChatPanel__starter {
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  padding: 0.6rem 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  line-height: 1.35;
  color: var(--impresso-color-black);
  transition:
    background-color 0.2s ease,
    padding 0.2s ease;
}
.BaristaChatPanel__starter .Icon {
  flex: 0 0 auto;
  opacity: 0.4;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}
.BaristaChatPanel__starter:hover {
  background-color: var(--impresso-color-paper);
}
.BaristaChatPanel__starter:hover .Icon {
  opacity: 1;
  transform: translateX(2px);
}
.BaristaChatPanel__starter:active {
  transform: translateY(1px);
}
.BaristaChatPanel__starter:focus-visible {
  outline: 2px solid var(--impresso-color-black);
  outline-offset: -2px;
  border-radius: var(--border-radius-sm);
}
.BaristaChatPanel__about {
  margin-top: 1rem;
  font-size: 0.8125rem;
  color: var(--clr-grey-300);
}
.BaristaChatPanel__about summary {
  width: fit-content;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: var(--clr-grey-600);
  text-underline-offset: 0.2em;
}
.BaristaChatPanel__about summary:hover {
  color: var(--impresso-color-black);
}
.BaristaChatPanel__about p {
  max-width: 62ch;
  margin: 0.5rem 0 0;
  line-height: 1.55;
  color: var(--clr-grey-200);
}
.BaristaChatPanel__status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-start;
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius-md);
  background-color: var(--impresso-color-paper);
  font-size: 0.8125rem;
  color: var(--clr-grey-200);
}
.BaristaChatPanel__dots {
  display: inline-flex;
  gap: 3px;
}
.BaristaChatPanel__dots i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: var(--clr-grey-300);
  animation: barista-dot 1.2s ease-in-out infinite;
}
.BaristaChatPanel__dots i:nth-child(2) {
  animation-delay: 0.15s;
}
.BaristaChatPanel__dots i:nth-child(3) {
  animation-delay: 0.3s;
}
@keyframes barista-dot {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-2px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .chat-history {
    scroll-behavior: auto;
  }
  .BaristaChatPanel__dots i,
  .BaristaChatPanel__starter,
  .BaristaChatPanel__starter .Icon {
    animation: none;
    transition: none;
  }
}
</style>
