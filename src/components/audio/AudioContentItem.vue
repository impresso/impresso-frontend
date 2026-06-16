<template>
  <div class="AudioContentItem" v-bind="attrs">
    <div class="d-flex align-items-start gap-2">
      <section v-if="props.showIcon">
        <Icon name="antennaSignalTag" />
      </section>
      <section v-if="props.showTitle">
        <slot name="title">
          <h2
            v-if="contentItem.text?.title"
            class="mb-0 font-weight-bold font-size-inherit line-height-inherit"
          >
            <RouterLink
              class="text-decoration-underline"
              :to="routerLinkUrl"
              v-html="contentItem.text?.title || ''"
            ></RouterLink>
          </h2>
        </slot>
      </section>
    </div>
    <section v-if="props.showProvider">
      <MediaSourceLabel v-if="mediaSource" :item="mediaSource" show-link class="d-inline-block" />
      <span v-else>{{ contentItem.meta?.mediaTitle || contentItem.meta?.mediaId || '' }}</span>
    </section>
    <section v-if="props.showMeta">
      {{ $t(`buckets.type.${contentTypeKey}`) }}, {{ formattedDuration }}.
      {{ contentItem.meta?.date ? $d(new Date(contentItem.meta.date), 'long') : '' }}
    </section>
    <section
      class="pb-2"
      v-if="props.showProvider && dataProvider.length"
      data-testid="article-access-rights"
    >
      {{ $t(`buckets.accessRight.${copyright}`) }} &mdash;
      {{ $t('providedBy') }}
      <!-- <ItemSelector
          :id="contentItem.dataProvider"
          :label="$t(`buckets.dataProvider.${contentItem.dataProvider}`)"
          :item="{ id: contentItem.dataProvider }"
          type="partner"
        /> -->
      <span class="text-decoration-underline">{{ dataProvider }}</span>
    </section>
    <!-- snippet -->
    <section v-if="props.showSnippet && contentItem.text?.snippet" class="article-excerpt pb-2">
      <blockquote class="text-muted m-0">{{ contentItem.text?.snippet }}[...]</blockquote>
    </section>
    <!-- other metadata-->
    <section v-if="props.showMeta" class="pb-2">
      <div class="badge bg-light me-1 mr-1 pt-1">
        <span v-if="transcriptLength > 200">{{
          $t('readingTime', { min: Math.round(transcriptLength / 200) })
        }}</span>
        <span v-else>{{ $t('contentItem.reducedReadingTime') }}</span>
      </div>
      <div class="badge bg-light me-1 mr-1 pt-1">
        {{ $t('listeningTime', { duration: formattedDuration }) }}
      </div>
    </section>

    <div v-if="props.showTopics && contentItem.semanticEnrichments.topics?.length" class="pb-2">
      <b-badge variant="light" class="mr-1 very-small-caps d-inline-block">{{
        $t('topics')
      }}</b-badge>
      <div class="d-flex flex-wrap gap-2">
        <ContentItemTopicItem
          :item="topic"
          v-for="topic in contentItem.semanticEnrichments.topics"
          v-bind:key="topic.id"
          :style="{ minWidth: '400px', maxWidth: '30%' }"
        />
      </div>
    </div>

    <ul
      v-if="props.showMatches && contentItem.text?.matches?.length"
      class="AudioContentItem__textMatches d-flex flex-wrap p-0"
    >
      <li
        class="p-1 mb-2 mr-2 me-2 rounded"
        v-for="(match, i) in contentItem.text.matches"
        v-bind:key="i"
        v-html="match.fragment"
        v-show="match.fragment.trim().length > 0"
      />
    </ul>
  </div>
  <slot name="beforePlayer"></slot>
  <section
    v-if="props.enablePlayer && audioSrc"
    class="position-sticky top-0 bg-light border-bottom"
    style="z-index: 1000"
  >
    <AudioPlayer
      class="py-2"
      :src="audioSrc"
      v-model:is-playing="isPlayingModel"
      v-model:current-time="currentTimeModel"
    />
  </section>
</template>
<script setup lang="ts">
import { ContentItem } from '@/models/generated/canonical/contentItem'
import type { MediaSource } from '@/models'
import MediaSourceLabel from '../modules/lists/MediaSourceLabel.vue'
import { computed, useAttrs } from 'vue'

import { formatTime, getSeekTimeInSeconds, timeToSeconds } from './utils'
import AudioPlayer from './AudioPlayer.vue'
import ContentItemTopicItem from '../modules/lists/ContentItemTopicItem.vue'
import Icon from '../base/Icon.vue'
import { Routes } from '@/router/routes.js'
import { RouteLocationRaw } from 'vue-router'

defineOptions({ inheritAttrs: false })

export interface AudioContentItemProps {
  contentItem: ContentItem
  isPlaying?: boolean
  currentTime?: number
  enablePlayer?: boolean
  showTopics?: boolean
  showMatches?: boolean
  showTitle?: boolean
  showSnippet?: boolean
  showMeta?: boolean
  showProvider?: boolean
  showIcon?: boolean
}
const props = withDefaults(defineProps<AudioContentItemProps>(), {
  isPlaying: false,
  showTopics: false,
  showMatches: true,
  showTitle: true,
  currentTime: 0,
  enablePlayer: false,
  showSnippet: false,
  showMeta: false,
  showProvider: false,
  showIcon: false
})

const attrs = useAttrs()

const emit = defineEmits<{
  'update:isPlaying': [value: boolean]
  'update:currentTime': [value: number]
}>()

const isPlayingModel = computed({
  get: () => props.isPlaying,
  set: value => emit('update:isPlaying', value)
})

const currentTimeModel = computed({
  get: () => props.currentTime,
  set: value => emit('update:currentTime', value)
})

const routerLinkUrl = computed(() => {
  return {
    name: Routes.audioContentItem.children.transcript.name,
    params: { content_item_id: props.contentItem.id }
  } as RouteLocationRaw
})

const mediaSource = computed<MediaSource | null>(() => {
  const mediaId = props.contentItem.meta?.mediaId
  const sourceType = props.contentItem.meta?.sourceType
  if (!mediaId || !sourceType) {
    return null
  }
  return {
    id: mediaId,
    name: props.contentItem.meta?.mediaTitle || mediaId,
    type: sourceType
  }
})

const contentTypeKey = computed(() => {
  return props.contentItem.text?.itemType || props.contentItem.meta?.sourceType || 'audio'
})

const dataProvider = computed(() => {
  return props.contentItem.meta?.partnerTitle || props.contentItem.meta?.partnerId || ''
})

const copyright = computed(() => {
  return props.contentItem.access?.copyright || 'private'
})

const transcriptLength = computed(() => {
  return props.contentItem.text?.contentLength || 0
})

const audioSrc = computed(() => {
  return (
    props.contentItem.audio?.records?.[0]?.audioFileUrl ||
    'https://ia800508.us.archive.org/18/items/jah_roots_-_whole_lotta_dub_-_2002_net_single/jah_roots_-_whole_lotta_dub.mp3?cnt=0'
  )
})
/**
 * duration as total seek time (duration - startTime) if startTime is provided, otherwise duration
 */
const duration = computed<number>(() => {
  const audioDuration = props.contentItem.audio?.duration
  if (!audioDuration) {
    return 0
  }
  try {
    if (!props.contentItem.audio?.startTime || props.contentItem.audio.startTime === '00:00:00') {
      return timeToSeconds(audioDuration)
    }
    return getSeekTimeInSeconds(props.contentItem.audio.startTime, audioDuration)
  } catch {
    return 0
  }
})

const formattedDuration = computed(() => {
  return formatTime(duration.value)
})
</script>
<i18n lang="json">
{
  "en": {
    "readingTime": "Transcript reading time: { min } min",
    "listeningTime": "Audio listening time: { duration }",
    "contentItem": {
      "reducedReadingTime": "Transcript reading time: < 1 min",
      "type": {
        "radio_broadcast_episode": "Episode",
        "radio_broadcast": "Radio Broadcast",
        "audio": "Audio"
      }
    },
    "providedBy": "Provided by",
    "buckets": {
      "accessRight": {
        "public": "Public",
        "in_cpy": "Restricted",
        "private": "Private"
      }
    }
  }
}
</i18n>
