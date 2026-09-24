<template>
  <div class="ItemPreview">
    <blockquote class="border px-2 py-1 mt-2 rounded bg-light" v-if="loadedTopic">
      <Ellipsis :initialHeight="100" :max-height="200">
        <label class="label very-small-caps m-0">{{ $t('wordsInTopic') }}</label> {{ ' ' }}
        <TopicWord
          v-for="(word, index) in loadedTopic.words"
          :key="`${word.w}-${index}`"
          :item="word"
          class="small"
        />
        <template #more="{ isCollapsed, onClick }">
          <button class="btn btn-transparent pointer-events-auto small" @click="onClick">
            {{ $t(isCollapsed ? 'expand' : 'collapse') }}
          </button>
        </template>
      </Ellipsis>
      <router-link
        v-if="loadedTopic.id"
        :to="{
          name: Routes.topic.name,
          params: {
            topic_id: item.id
          }
        }"
        @click="emit('more')"
      >
        {{ $t('actions.more') }}
      </router-link>
    </blockquote>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { topics as topicsService } from '@/services'
import Topic from '@/models/Topic'
import TopicWord from './TopicWord.vue'
import { Routes } from '@/router/routes'
import Ellipsis from '../modules/Ellipsis.vue'

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
    "wordsInTopic": "Words in topic:",
    "expand": "Expand",
    "collapse": "Collapse"
  }
}
</i18n>
