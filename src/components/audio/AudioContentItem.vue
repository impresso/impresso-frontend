<template>
  <div class="AudioContentItem" v-bind="attrs">
    <ContentItemCommon
      :contentItem="props.contentItem"
      iconName="antennaSignalTag"
      :showDate="props.showDate"
      :showIcon="props.showIcon"
      :showLink="props.showLink"
      :showTitle="props.showTitle"
      :showMeta="props.showMeta"
      :showSnippet="props.showSnippet"
      :showMatches="props.showMatches"
      :showMediaSource="props.showMediaSource"
      :showProvider="props.showProvider"
      :showType="props.showType"
      :showTopics="props.showTopics"
      :showSpecs="props.showSpecs"
      :showContentItemAccess="props.showContentItemAccess"
    ></ContentItemCommon>

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
import { computed, useAttrs } from 'vue'

import { formatTime, getSeekTimeInSeconds, timeToSeconds } from './utils'
import AudioPlayer from './AudioPlayer.vue'
import ContentItemTopicItem from '../modules/lists/ContentItemTopicItem.vue'

import ContentItemCommon, { ContentItemCommonProps } from '../contentItem/ContentItemCommon.vue'

defineOptions({ inheritAttrs: false })

export interface AudioContentItemProps extends ContentItemCommonProps {
  contentItem: ContentItem
  isPlaying?: boolean
  currentTime?: number
  enablePlayer?: boolean
}
const props = withDefaults(defineProps<AudioContentItemProps>(), {
  isPlaying: false,
  currentTime: 0,
  enablePlayer: false
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
