<template>
  <div class="AudioContentItem" v-bind="attrs">
    <ContentItemCommon
      :contentItem="props.contentItem"
      :enableAddToCollection="props.enableAddToCollection"
      :showCollections="props.showCollections"
      :showDate="props.showDate"
      :showId="props.showId"
      :showIcon="props.showIcon"
      :showLink="props.showLink"
      :showTitle="props.showTitle"
      :showMeta="props.showMeta"
      :showSnippet="props.showSnippet"
      :showMatches="props.showMatches"
      :showMediaSource="props.showMediaSource"
      :showOcrQuality="props.showOcrQuality"
      :showProvider="props.showProvider"
      :showType="props.showType"
      :showTopics="props.showTopics"
      :showSpecs="props.showSpecs"
      :showContentItemAccess="props.showContentItemAccess"
      :showSemanticEnrichments="props.showSemanticEnrichments"
    ></ContentItemCommon>
  </div>
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
import { computed, useAttrs } from 'vue'
import AudioPlayer from './AudioPlayer.vue'

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

const audioSrc = computed(() => {
  return props.contentItem.audio?.records?.[0]?.audioFileUrl
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
      "copyright": {
        "pbl": "Public",
        "in_cpy": "Restricted",
        "euo": "Private",
        "unk": "Unknown",
        "und": "Undetermined",
        "nkn": "Not known"
      }
    }
  }
}
</i18n>
