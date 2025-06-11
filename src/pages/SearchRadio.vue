<template>
  <i-layout class="SearchRadio">
    <!-- <i-layout-section width="400px">
      <template v-slot:header>
        <b-tabs pills class="mx-2 pt-2">
          <template v-slot:tabs-end>
            <b-nav-item :to="{ name: 'searchRadio' }" class="active" active-class="none">
              <span v-html="$t('pages.searchRadio')" />
              <span v-if="isLoading" class=""> &mdash; {{ $t('actions.loading') }}</span>
            </b-nav-item>
          </template>
        </b-tabs>
      </template>
    </i-layout-section> -->
    <i-layout-section main>
      <template v-slot:header>
        <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
          <div class="container">
            <b-navbar-nav class="px-3 pt-3 flex-grow-1">
              <PageHeading
                :label="$t('label_group')"
                :title="$t('pages.searchRadio')"
              ></PageHeading>
            </b-navbar-nav>
          </div>
        </b-navbar>
        <div class="container">
          <b-tabs pills class="m-0" style="margin: 0 !important">
            <template v-slot:tabs-end>
              <li class="nav-item pl-2 active">
                <RouterLink class="nav-link" :to="{ name: 'searchRadio' }"
                  ><span
                    v-html="
                      $tc('audioContentItems', 3, {
                        n: isLoading ? '...' : $n(3)
                      })
                    "
                  ></span>
                </RouterLink>
              </li>
            </template>
          </b-tabs>
        </div>
      </template>
      <div class="container">
        <ul class="list-unstyled py-3" v-if="!isLoading && fetchAudioItemsResponse.data">
          <li
            class="list-item py-3 border-bottom border-dark"
            v-for="(item, index) in fetchAudioItemsResponse.data"
            :key="index"
          >
            <AudioItem
              @toggleplay="() => toggleplay(item.uid)"
              :is-playing="item.uid === currentPlayingUid"
              :item="item"
              :routerLinkUrl="{
                name: 'audioContentItem',
                params: {
                  content_item_uid: item.uid
                }
              }"
            ></AudioItem>
            <AudioPlayer
              class="w-100 me-5 mr-5"
              :src="ContentItemAudioSrcs[item.uid]"
              :is-loading="isLoading"
            />
          </li>
        </ul>
      </div>
    </i-layout-section>
  </i-layout>
</template>
<i18n lang="json">
{
  "en": {
    "audioContentItems": "listen to <span class='number'>{n} </span> audio items",
    "pages": {
      "searchRadio": "Search Radio"
    },
    "radio_broadcast": "Radio Broadcast",
    "label_group": "Radio",
    "actions": {
      "loading": "Loading"
    },
    "contentItem": {
      "reducedReadingTime": "Reduced Reading Time",
      "type": {
        "radio_broadcast_episode": "Radio Broadcast Episode"
      }
    },
    "readingTime": "{min} min read"
  }
}
</i18n>
<script setup lang="ts">
import PageHeading from '@/components/base/PageHeading.vue'
import AudioItem from 'impresso-ui-components/components/AudioItem.vue'
import AudioPlayer from 'impresso-ui-components/components/audioPlayer/AudioPlayer.vue'
import { computed, onMounted, ref } from 'vue'

export interface MediaSource {
  uid: string
  name: string
  type: 'newspaper' | 'radio' | 'radio_broadcast'
}

export interface ContentItem {
  uid: string
  type: 'audio' | 'ar'
  publicationDate: string
  title?: string
  excerpt?: string
  transcript: string
  transcriptLength: number
  href?: string
  link?: string
  mediaSource: MediaSource
}

export interface AudioContentItem extends ContentItem {
  duration: number
  startTime: number
}
const ContentItemAudioSrcs = {
  'CFCE-1996-09-08-a-i0001': '/mock-media/CFCE-1996-09-08-a-r0001.MP3',
  'CFCE-1996-09-15-a-i0001': '/mock-media/CFCE-1996-09-15-a-r0001.MP3',
  'RDN-1950-01-12-a-i0001': '/mock-media/RDN-1950-01-12-a-r0001.MP3'
}

const currentPlayingUid = ref<string | null>(null)
const toggleplay = (uid: string) => {
  currentPlayingUid.value = currentPlayingUid.value === uid ? null : uid
}
const isAudioPlaying = computed(() => currentPlayingUid.value !== null)
const itemsUrl =
  'https://gist.githubusercontent.com/danieleguido/450b77a714b6f45a408bb6719666068c/raw/7eb9825fe3669b9cb2c60eb527933fde7a11ebdd/audio-items.json'
const fetchAudioItemsResponse = ref<{
  status: 'loading' | 'success' | 'error'
  data: AudioContentItem[] | null
}>({
  status: 'loading',
  data: null
})

const isLoading = computed(() => fetchAudioItemsResponse.value?.status === 'loading')

onMounted(() => {
  fetch(itemsUrl)
    .then(response => response.json())
    .then(({ results }: { results: AudioContentItem[] }) => {
      fetchAudioItemsResponse.value = {
        status: 'success',
        data: results
      }
    })
    .catch(error => {
      console.error('Error fetching audio item:', error)
      fetchAudioItemsResponse.value = {
        status: 'error',
        data: null
      }
    })
})
</script>
