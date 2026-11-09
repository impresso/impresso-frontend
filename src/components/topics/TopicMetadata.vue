<template>
  <div v-if="item" class="TopicMetadata container-xxl ml-0 pl-4">
    <section class="row">
      <div class="col-12 position-sticky top-0 bg-light z-index-1 border-bottom py-2">
        <h3 class="font-weight-bold font-size-inherit m-0">Topic details</h3>
      </div>

      <div
        v-for="property in topicProperties"
        :key="property.label"
        class="col-sm-12 col-md-6 col-lg-6 col-xl-3"
      >
        <div class="py-2">
          <div class="font-weight-bold very-small mb-2">{{ property.label }}</div>
          <div class="border rounded px-2 py-1 bg-light d-inline-block TopicMetadata__value">
            {{ property.value }}
          </div>
        </div>
      </div>
    </section>

    <section v-if="item.representativeTerms?.length || wordsWithRelevance.length" class="row mt-3">
      <div class="col-12 position-sticky top-0 bg-light z-index-1 border-bottom py-2">
        <h3 class="font-weight-bold font-size-inherit m-0">Terms</h3>
      </div>

      <div v-if="item.representativeTerms?.length" class="col-sm-12 col-md-6 col-lg-6 col-xl-3">
        <div class="py-2">
          <div class="font-weight-bold very-small mb-2">Representative terms</div>
          <ul
            class="TopicMetadata__pills border rounded p-2 mb-0 bg-light"
            aria-label="Representative terms"
          >
            <li v-for="term in item.representativeTerms" :key="term" class="TopicMetadata__pill">
              {{ term }}
            </li>
          </ul>
        </div>
      </div>

      <div v-if="wordsWithRelevance.length" class="col-sm-12 col-md-6 col-lg-6 col-xl-9">
        <div class="py-2">
          <div class="d-flex justify-content-between align-items-baseline mb-2">
            <div class="font-weight-bold very-small">Words and relevance</div>
            <span class="very-small text-muted">{{ wordsWithRelevance.length }} words</span>
          </div>
          <ul
            class="TopicMetadata__pills TopicMetadata__pills--relevance border rounded p-2 mb-0 bg-light"
            aria-label="Words in topic, with relevance"
          >
            <li
              v-for="word in wordsWithRelevance"
              :key="word.w"
              class="d-flex align-items-center gap-2 TopicMetadata__pill TopicMetadata__pill--relevance"
              :style="{ '--relevance': `${relativeRelevance(word.p)}%` }"
              :title="`${word.w}: ${formatProbability(word.p)} relevance`"
            >
              <span>{{ word.w }}</span>
              <span class="number very-small text-muted">{{ formatProbability(word.p) }}</span>
            </li>
          </ul>
          <p class="very-small text-muted mt-2 mb-0">
            The fill of each pill indicates relevance relative to the most probable word.
          </p>
        </div>
      </div>
    </section>
  </div>

  <div v-else class="container-xxl text-muted">Loading topic metadata…</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type Topic from '@/models/Topic'

export interface TopicMetadataProps {
  item: Topic | null | undefined
}

const props = defineProps<TopicMetadataProps>()

const topicProperties = computed(() => {
  if (!props.item) return []

  return [
    ['Language', props.item.language],
    ['Topic number', props.item.topicNumber],
    ['Model', props.item.model],
    ['Category', props.item.category && formatCategory(props.item.category)],
    ['Confidence', props.item.confidence],
    ['Label source', props.item.generatedBy],
    ['Topic ID', props.item.id]
  ]
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([label, value]) => ({ label, value: String(value) }))
})

const wordsWithRelevance = computed(() =>
  (props.item?.words ?? [])
    .filter(word => word.w && Number.isFinite(word.p) && word.p > 0)
    .slice()
    .sort((a, b) => b.p - a.p)
)

const maxProbability = computed(() => wordsWithRelevance.value[0]?.p ?? 0)

const relativeRelevance = (probability: number) =>
  maxProbability.value ? Math.max(4, (probability / maxProbability.value) * 100) : 0

const formatProbability = (probability: number) =>
  new Intl.NumberFormat(undefined, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(probability)

const formatCategory = (category: string) => category.replace(/_/g, ' ')
</script>

<style scoped lang="scss">
.TopicMetadata__value {
  max-width: 100%;
  overflow-wrap: anywhere;
}

.TopicMetadata__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  list-style: none;
}

.TopicMetadata__pill {
  padding: 0.25rem 0.55rem;
  border: 1px solid var(--impresso-color-black-alpha-70, #d0d0d0);
  border-radius: 999px;
  background: var(--impresso-color-white, #fff);
  line-height: 1.25;
}

.TopicMetadata__pill--relevance {
  position: relative;
  isolation: isolate;
  display: inline-flex;
  gap: 0.4rem;
  overflow: hidden;
}

.TopicMetadata__pill--relevance::before {
  position: absolute;
  z-index: -1;
  top: 0;
  bottom: 0;
  left: 0;
  width: var(--relevance);
  content: '';
  background: var(--impresso-color-black-alpha-30, #e6f0ff);
}
</style>
