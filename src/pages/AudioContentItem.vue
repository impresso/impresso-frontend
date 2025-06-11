<template>
  <i-layout class="AudioContentItem">
    <i-layout-section main>
      <template v-slot:header>
        <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
          <b-navbar-nav class="px-3 pt-3 flex-grow-1 border-right">
            <PageHeading :label="$t('label_group')" :title="$t('pages.searchRadio')"></PageHeading>
          </b-navbar-nav>
        </b-navbar>
        <b-navbar class="w-100 border-bottom">
          <div class="container">
            <AudioPlayer
              class="w-100 me-5 mr-5"
              :src="itemAudioSrc"
              :is-loading="isLoading"
              :current-time="currentTime"
              @timeupdate="currentTime = $event"
            ></AudioPlayer>
          </div>
        </b-navbar>
      </template>
      <div class="container">
        <AudioItem
          v-if="fetchAudioItemResponse.data"
          :item="fetchAudioItemResponse.data"
          :is-loading="isLoading"
        ></AudioItem>

        <TranscriptViewer
          v-if="fetchAudioItemResponse.data"
          :rrrebs="fetchAudioItemResponse.data.rrrebs"
          :utterances="fetchAudioItemResponse.data.utterances"
          :current-time="currentTime"
          @click="onTranscriptViewerClick"
        ></TranscriptViewer>
        {{ currentTime }}
        <pre
          >{{ JSON.stringify(fetchAudioItemResponse.data, null, 2) }}
        </pre>
      </div>
    </i-layout-section>
  </i-layout>
</template>
<i18n lang="json">
{
  "en": {
    "pages": {
      "searchRadio": "Search Radio"
    },
    "label_group": "Audio Content Item"
  }
}
</i18n>
<script setup lang="ts">
import PageHeading from '@/components/base/PageHeading.vue'
import type { AudioContentItem, Rrreb } from '@/models'
import AudioItem from 'impresso-ui-components/components/AudioItem.vue'
import AudioPlayer from 'impresso-ui-components/components/audioPlayer/AudioPlayer.vue'
import TranscriptViewer from 'impresso-ui-components/components/audioPlayer/TranscriptViewer.vue'
import { watch } from 'vue'
import { computed, ref } from 'vue'

const itemUrl = computed(() => {
  // CFCE-1996-09-08-a-i0001
  return 'https://gist.githubusercontent.com/danieleguido/d3e76a1f8f3ba494f3da367b8349271a/raw/7aa93892ed6a5b4b5c83fa347fdc869c8f7f5500/CFCE-1996-09-08-a-i0001.json'
})
const itemAudioSrc = computed(() => {
  return 'https://gilberttrausch.uni.lu/audio/ch3-3fkl01junckertrauschbechdupong.mp3'
})
const fetchAudioItemResponse = ref<{
  status: 'loading' | 'success' | 'error'
  data: AudioContentItem | null
}>({
  status: 'loading',
  data: null
})

const currentTime = ref(0)
const isLoading = computed(() => fetchAudioItemResponse.value?.status === 'loading')

const onTranscriptViewerClick = (rrreb: Rrreb): void => {
  console.debug('[AudioContentItem] onTranscriptViewerClick', rrreb)
  // Here you can handle the click event on the transcript viewer
  // For example, you might want to update the current time of the audio player
  currentTime.value = rrreb.startTime
}

function fetchAudioItem(): void {
  fetch(itemUrl.value)
    .then(response => response.json())
    .then((data: AudioContentItem) => {
      fetchAudioItemResponse.value = {
        status: 'success',
        data
      }
    })
    .catch(error => {
      console.error('Error fetching audio item:', error)
      fetchAudioItemResponse.value = {
        status: 'error',
        data: null
      }
    })
}

import { useRoute } from 'vue-router'

const route = useRoute()

watch(
  () => route.params.content_item_uid,
  (newId, oldId) => {
    // react to route changes...
    if (newId !== oldId) {
      console.debug('[AudioContentItem] Route changed, fetching new audio item...')
      fetchAudioItem()
    }
  },
  { immediate: true }
)
</script>
