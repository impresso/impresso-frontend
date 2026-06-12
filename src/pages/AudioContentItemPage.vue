<template>
  <i-layout class="AudioContentItemPage">
    <i-layout-section main>
      <template v-slot:header>
        <b-navbar class="pt-3 pb-1 d-block">
          <section class="py-1">
            <div class="label small-caps">
              <slot name="label"></slot>
            </div>
            <h3 class="mb-1"></h3>
            <AudioContentItem
              :content-item="props.contentItem"
              :enable-player="false"
              :is-playing="isAudioItemPlaying"
              :current-time="currentAudioItemReadingTime"
              :showTopics="false"
              showTitle
              showProvider
            >
            </AudioContentItem>
            <ContentItemAccess :item="props.contentItem" class="mt-2 mb-0" />
          </section>
        </b-navbar>
        <b-navbar-nav class="IssueViewerPage_tabs px-3 border-bottom pb-2">
          <b-tabs pills>
            <template v-slot:tabs-end>
              <b-nav-item
                class="pl-2"
                v-for="mode in AvailableViewModes"
                :key="mode"
                @click="changeViewMode(mode)"
                :class="{ active: mode === viewMode }"
              >
                <button size="sm" class="btn btn-transparent small-caps">
                  {{ $t('viewModes.' + mode) }}
                </button>
              </b-nav-item>
            </template>
          </b-tabs>
        </b-navbar-nav>
      </template>
      <div class="m-3">
        <AudioContentItem
          :content-item="props.contentItem"
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

        <pre>{{ JSON.stringify(props.contentItem, null, 2) }}</pre>
        <!-- <TranscriptViewer
          class="mt-3"
          v-if="contentItem?.text && transcriptData.rrrebs.length > 0"
          :utterances="transcriptData.utterances"
          :rrrebs="transcriptData.rrrebs"
          :current-time="currentTime"
          :disabled="false"
          :debug="false"
          @click="onTranscriptViewerClick"
        ></TranscriptViewer> -->
      </div>
    </i-layout-section>
  </i-layout>
</template>
<script setup lang="ts">
import type { ContentItem } from '@/models/generated/canonical/contentItem'
import AudioContentItem from '@/components/audio/AudioContentItem.vue'
import { useAudioStore } from '@/stores/audio'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import ContentItemAccess from '@/components/ContentItemAccess.vue'

const AvailableViewModes = ['overview', 'similarItems']

const viewMode = ref(AvailableViewModes[0])
const changeViewMode = (mode: (typeof AvailableViewModes)[number]) => {
  viewMode.value = mode
}
const props = defineProps<{
  contentItem: ContentItem
}>()

const audioStore = useAudioStore()
const currentAudioItemId = computed(() => {
  return props.contentItem.id
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

onBeforeUnmount(() => {
  audioStore.setIsPlaying(false)
  audioStore.setContentItemId(null)
})
</script>
