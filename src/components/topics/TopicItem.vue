<template>
  <div class="TopicItem" @click="emit('click', topic)">
    <div class="d-flex align-items-baseline gap-2">
      <div v-if="showLanguage && topic.language" class="badge badge-light small-caps">
        {{ topic.language }}
      </div>
      <h2 v-if="showTitle" class="m-0 font-size-inherit font-weight-bold">
        <router-link
          v-if="showLink && topic.id"
          :to="{ name: Routes.topics.children.topic.name, params: { topic_id: topic.id } }"
        >
          {{ title }}
        </router-link>
        <span v-else>{{ title }}</span>
      </h2>
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
}

const props = withDefaults(defineProps<TopicItemProps>(), {
  showTitle: true,
  showLink: true,
  showLanguage: true,
  showModel: false,
  showCount: true,
  showId: false,
  showDescription: false
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
const hasCount = computed(
  () =>
    typeof props.topic.contentItemsCount === 'number' &&
    Number.isFinite(props.topic.contentItemsCount) &&
    props.topic.contentItemsCount >= 0
)
</script>
