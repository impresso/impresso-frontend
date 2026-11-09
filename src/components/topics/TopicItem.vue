<template>
  <div class="TopicItem" @click="emit('click', topic)">
    <div class="d-flex align-items-baseline gap-2">
      <div v-if="showLanguage && topic.language" class="badge badge-light small-caps">
        {{ topic.language }}
      </div>
      <h2 v-if="showTitle" class="m-0 font-size-inherit font-weight-bold">
        <router-link
          v-if="showLink && topic.id"
          :to="{
            name: Routes.topics.children.topic.children.metadata.name,
            params: { topic_id: topic.id }
          }"
        >
          {{ title }}
        </router-link>
        <span v-else>{{ title }}</span>
      </h2>
    </div>
    <div v-if="termContext.length" class="small mt-2 TopicItem__term-context">
      <template v-for="(match, index) in termContext" :key="`${match.word}-${index}`">
        <template v-if="match.hasMoreBefore">… · </template>
        <template v-if="match.previous">{{ match.previous }} · </template>
        <span class="highlight">{{ match.word }}</span>
        <template v-if="match.next"> · {{ match.next }}</template>
        <template v-if="match.hasMoreAfter"> · …</template>
        <template v-if="index < termContext.length - 1"> · … · </template>
      </template>
    </div>
    <div v-if="showRepresentativeTerms && topic.representativeTerms?.length">
      <div class="small mt-2">
        <span v-if="showCategory && topic.category" class="small-caps text-muted">
          {{ topic.category }} &mdash;
        </span>
        <span v-for="(term, i) in topic.representativeTerms" :key="term">
          {{ term }}<span v-if="i < topic.representativeTerms.length - 1">, </span>
        </span>
      </div>
    </div>
    <div v-if="showModel && topic.model" class="small-caps">{{ topic.model }}</div>
    <div
      v-if="showCount && hasCount"
      class="small mt-2"
      v-html="
        $t('numbers.contentItems', { n: $n(topic.contentItemsCount!) }, topic.contentItemsCount!)
      "
    ></div>

    <ContentItemIdLabel v-if="showId && topic.id" :id="topic.id" />
    <p v-if="showDescription && topic.description" class="my-2">{{ topic.description }}</p>
    <slot name="actions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TopicPayload } from '@/models/Topic'
import { Routes } from '@/router/routes'
import ContentItemIdLabel from '@/components/ContentItemIdLabel.vue'

export interface TopicItemProps {
  topic: TopicPayload & { id: string }
  showTitle?: boolean
  showLink?: boolean
  showLanguage?: boolean
  showModel?: boolean
  showCount?: boolean
  showId?: boolean
  showDescription?: boolean
  showCategory?: boolean
  showRepresentativeTerms?: boolean
  term?: string
}

const props = withDefaults(defineProps<TopicItemProps>(), {
  showTitle: true,
  showLink: true,
  showLanguage: true,
  showModel: false,
  showCount: true,
  showId: false,
  showDescription: false,
  showCategory: false,
  showRepresentativeTerms: false,
  term: ''
})

const emit = defineEmits<{ click: [topic: TopicItemProps['topic']] }>()
const title = computed(
  () =>
    props.topic.label?.trim() ||
    props.topic.longLabel?.trim() ||
    (props.topic.excerpt?.length ? props.topic.excerpt : props.topic.words)
      ?.slice(0, 5)
      .map(word => word.w)
      .filter(Boolean)
      .join(' · ') ||
    props.topic.id
)
export interface TermContextMatch {
  previous?: string
  word: string
  next?: string
  hasMoreBefore: boolean
  hasMoreAfter: boolean
}

const termContext = computed<TermContextMatch[]>(() => {
  const term = props.term?.trim().toLowerCase()
  if (!term) return []

  const words = (props.topic.words ?? [])
    .map(word => word.w?.trim())
    .filter((word): word is string => Boolean(word))

  return words.reduce<TermContextMatch[]>((matches, word, index) => {
    if (!word.toLowerCase().includes(term)) return matches

    matches.push({
      previous: words[index - 1],
      word,
      next: words[index + 1],
      hasMoreBefore: index > 1,
      hasMoreAfter: index < words.length - 2
    })
    return matches
  }, [])
})
const hasCount = computed(
  () =>
    typeof props.topic.contentItemsCount === 'number' &&
    Number.isFinite(props.topic.contentItemsCount) &&
    props.topic.contentItemsCount >= 0
)
</script>
