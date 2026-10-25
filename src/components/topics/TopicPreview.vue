<template>
  <div class="TopicPreview rounded border border-dark" v-if="loadedTopic">
    <blockquote
      class="TopicPreview__metadata rounded text-dark p-2 m-0 d-flex align-items-center flex-wrap"
    >
      <div class="small">
        <p v-if="loadedTopic.description" class="mb-2">{{ loadedTopic.description }}</p>
        <label class="label very-small-caps m-0">{{ $t('wordsInTopic') }}</label> {{ ' ' }}
        <TopicWord
          v-for="(word, index) in loadedTopic.words"
          :key="`${word.w}-${index}`"
          :item="word"
          class="small"
        />
      </div>
    </blockquote>
    <div class="d-flex justify-content-center w-100 border-top border-tertiary">
      <router-link
        v-if="loadedTopic.id"
        class="btn btn-sm btn-outline-secondary m-2"
        :to="{
          name: Routes.topics.children.topic.name,
          params: {
            topic_id: item.id
          }
        }"
        @click="emit('more')"
      >
        {{ $t('actions.more') }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { topics as topicsService } from '@/services'
import Topic from '@/models/Topic'
import TopicWord from './TopicWord.vue'
import { Routes } from '@/router/routes'

export interface TopicPreviewItem {
  id: string
}

export interface TopicPreviewProps {
  item: TopicPreviewItem
}

const props = defineProps<TopicPreviewProps>()

const emit = defineEmits<{
  (e: 'more'): void
}>()

const loadedTopic = ref<Topic | null>(null)

async function fetchTopic() {
  if (!props.item?.id) {
    loadedTopic.value = null
    return
  }

  try {
    const topic = await topicsService.get(props.item.id)
    loadedTopic.value = new Topic(topic)
  } catch (err) {
    console.error('[TopicPreview] Error fetching topic:', err)
    loadedTopic.value = null
  }
}

watch(() => props.item.id, fetchTopic, { immediate: true })
</script>
<i18n lang="json">
{
  "en": {
    "wordsInTopic": "Words in topic:"
  }
}
</i18n>

<style>
.TopicPreview {
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  border-color: var(--impresso-color-black);
}

.TopicPreview__metadata {
  max-height: 100px;
  overflow-y: auto;
  background-color: var(--impresso-color-light-grey);
}
</style>
