<template>
  <div class="ContentItemAudio d-flex align-items-center">
    <div
      class="flex-shrink-0 mr-2"
      style="width: 50px"
      v-if="enablePlayer"
      @click="$emit('toggleplay')"
    >
      <Icon name="pause" v-if="isPlaying" />
      <Icon name="play" v-else />
    </div>
    <div class="flex-grow-1">
      <slot name="title">
        <h2 v-if="item.title" class="mb-0 font-weight-bold font-size-bigger">
          <RouterLink
            class="text-decoration-underline"
            :to="routerLinkUrl"
            v-html="item.title"
          ></RouterLink>
        </h2>
      </slot>
      <div>
        {{ item.radioChannel }}
        <MediaSourceLabel :item="item.mediaSource" show-link class="d-inline-block mx-2" />{{ ' ' }}
      </div>
      <div>
        {{ $t(`contentItem.type.${item.type}`) }}, {{ duration }}.
        {{ $d(new Date(item.meta.date), 'long') }}
      </div>
      <div
        data-testid="article-access-rights"
        v-if="item.dataProvider != null && item.dataProvider.length"
      >
        {{ $t(`buckets.accessRight.${item.copyright}`) }} &mdash;
        {{ $t('providedBy') }}
        <!-- <ItemSelector
          :id="item.dataProvider"
          :label="$t(`buckets.dataProvider.${item.dataProvider}`)"
          :item="{ id: item.dataProvider }"
          type="partner"
        /> -->
        <span class="text-decoration-underline">
          {{ item.dataProvider }}
        </span>
      </div>
      <div v-if="item.excerpt" class="article-excerpt mt-2">
        <blockquote class="text-muted">{{ item.excerpt }}[...]</blockquote>
      </div>
      <div class="badge bg-light me-1 mr-1 pt-1">
        <span v-if="item.transcriptLength > 200">{{
          $t('readingTime', { min: Math.round(item.transcriptLength / 200) })
        }}</span>
        <span v-else>{{ $t('contentItem.reducedReadingTime') }}</span>
      </div>
      <div class="badge bg-light me-1 mr-1 pt-1">
        {{ $t('listeningTime', { duration }) }}
      </div>
      <AudioPlayer
        v-if="enablePlayer && item.audioSrc"
        :src="item.audioSrc"
        :is-playing="isPlaying"
      />
    </div>
    <!-- <pre>{{ JSON.stringify(item, null, 2) }}</pre> -->
  </div>
</template>
<script setup lang="ts">
import Icon from 'impresso-ui-components/components/Icon.vue'
import { ContentItem } from '@/models/generated/canonical/contentItem'
import MediaSourceLabel from '../modules/lists/MediaSourceLabel.vue'
import { computed } from 'vue'

import { formatTime } from './utils.js'
import AudioPlayer from './AudioPlayer.vue'
import { MediaSource } from '@/models/generated/canonical.js'

export interface ContentItemAudioProps {
  contentItem: ContentItem
  isPlaying?: boolean
  enablePlayer?: boolean
}
const props = withDefaults(defineProps<ContentItemAudioProps>(), {
  isPlaying: false,
  enablePlayer: false
})

const routerLinkUrl = computed(() => {
  return { name: 'ContentItemAudio', params: { id: props.contentItem.id } }
})
/**
 * duration is a
 */
const duration = computed(() => {
  if (props.contentItem.audio && props.contentItem.audio.duration && props.contentItem.audio.startTime) {
    if(props.contentItem.audio.startTime === '00:00:00') {
      return props.contentItem.audio.duration
    }
      return formatTime(props.contentItem.audio.duration - props.contentItem.audio.startTime)
    }
    return formatTime(props.contentItem.audio.duration)
  }
  return formatTime(props.contentItem.audio.duration)
const mediaSource = computed(() => {
  return props.contentItem.meta.mediaId
    ? { id: props.contentItem.meta.mediaId, name: props.contentItem.meta.mediaId, type:props.contentItem.meta.sourceMedium }
    : null
})
defineEmits<{
  click: []
  toggleplay: []
}>()
</script>
<i18n lang="json">
{
  "en": {
    "readingTime": "Transcript reading time: { min } min",
    "listeningTime": "Audio listening time: { duration }",
    "contentItem": {
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
