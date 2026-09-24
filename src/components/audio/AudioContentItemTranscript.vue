<template>
  <div class="AudioContentItemTranscript">
    <AudioContentItem
      v-if="contentItem"
      :content-item="contentItem"
      :enable-player="true"
      :is-playing="isAudioItemPlaying"
      :current-time="currentAudioItemReadingTime"
      showTopics
      :showTitle="false"
      showSnippet
      showMeta
      @update:is-playing="onAudioItemPlayingChanged"
      @update:current-time="onAudioItemCurrentTimeChanged"
    >
    </AudioContentItem>
    <AudioTranscriptViewer
      class="mt-3"
      v-if="transcriptWords.length > 0"
      :utterances="transcriptUtterances"
      :words="transcriptWords"
      :current-time="currentAudioItemReadingTime"
      :disabled="false"
      :debug="false"
      @click="onTranscriptViewerClick"
    ></AudioTranscriptViewer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import { useAudioStore } from '@/stores/audio'
import type { ContentItem, ContentItemAudioLocator } from '@/models/generated/canonical/contentItem'
import type { TranscriptWord, Utterance } from '@/components/audio/AudioTranscriptViewer.vue'
import AudioContentItem from '@/components/audio/AudioContentItem.vue'
import AudioTranscriptViewer from '@/components/audio/AudioTranscriptViewer.vue'

export interface AudioContentItemTranscriptProps {
  contentItem?: ContentItem
}
const audioStore = useAudioStore()
const props = defineProps<AudioContentItemTranscriptProps>()
const currentAudioItemId = computed(() => {
  return props.contentItem?.id
})

const isAudioItemPlaying = computed(() => {
  return (
    currentAudioItemId.value != null &&
    audioStore.contentItemId === currentAudioItemId.value &&
    audioStore.isPlaying
  )
})

const currentAudioItemReadingTime = computed(() => {
  if (currentAudioItemId.value == null) {
    return 0
  }
  return audioStore.getReadingTimeByContentItemId(currentAudioItemId.value)
})

const onAudioItemCurrentTimeChanged = (currentTime: number) => {
  if (currentAudioItemId.value == null) {
    return
  }

  audioStore.setReadingTime(currentAudioItemId.value, currentTime)
}

const onAudioItemPlayingChanged = (isPlaying: boolean) => {
  if (currentAudioItemId.value == null) {
    return
  }

  if (isPlaying) {
    audioStore.setContentItemId(currentAudioItemId.value)
    audioStore.setIsPlaying(true)
    return
  }

  if (audioStore.contentItemId === currentAudioItemId.value) {
    audioStore.setIsPlaying(false)
  }
}

const transcriptLocators = computed<ContentItemAudioLocator[]>(() => {
  if (!props.contentItem) {
    return []
  }
  return (
    props.contentItem?.audio?.records
      ?.flatMap(record => record.audioSegmentsLocators ?? [])
      .filter(locator => Array.isArray(locator.timeCode) && locator.timeCode.length >= 2) ?? []
  )
})

const transcriptWords = computed<TranscriptWord[]>(() => {
  const transcript = props.contentItem?.text?.content || ''

  return transcriptLocators.value
    .map((locator, idx) => {
      const startTime = locator.timeCode?.[0] ?? 0
      const duration = locator.timeCode?.[1] ?? 0
      const textStart = locator.textLocation?.[0]
      const textLength = locator.textLocation?.[1]
      const text =
        textStart != null && textLength != null
          ? transcript.slice(textStart, textStart + textLength).trim()
          : ''

      return {
        idx,
        text: text || '[...]',
        startTime,
        endTime: startTime + duration,
        locator
      }
    })
    .sort((a, b) => a.startTime - b.startTime)
})

const transcriptUtterances = computed<Utterance[]>(() => {
  if (transcriptWords.value.length === 0) {
    return []
  }

  const groupedIndices = new Map<number, number[]>()

  transcriptWords.value.forEach((word, index) => {
    const utteranceIndex = word.locator?.utteranceIndex ?? index
    const indices = groupedIndices.get(utteranceIndex) ?? []
    indices.push(index)
    groupedIndices.set(utteranceIndex, indices)
  })

  return Array.from(groupedIndices.values())
    .map(indices => {
      const first = transcriptWords.value[indices[0]]
      const last = transcriptWords.value[indices[indices.length - 1]]

      return {
        startTime: first?.startTime ?? 0,
        endTime: last?.endTime ?? first?.endTime ?? 0,
        indices
      }
    })
    .sort((a, b) => a.startTime - b.startTime)
})

const onTranscriptViewerClick = (word: TranscriptWord) => {
  onAudioItemCurrentTimeChanged(word.startTime)
}

onBeforeUnmount(() => {
  audioStore.setIsPlaying(false)
  audioStore.setContentItemId(null)
})
</script>
