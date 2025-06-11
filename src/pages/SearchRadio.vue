<template>
  <i-layout class="SearchRadio">
    <i-layout-section width="400px">
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
    </i-layout-section>
    <i-layout-section main>
      <template v-slot:header>
        <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
          <b-navbar-nav class="px-3 pt-3 flex-grow-1 border-right">
            <PageHeading :label="$t('label_group')" :title="$t('pages.searchRadio')"></PageHeading>
          </b-navbar-nav>
        </b-navbar>
        <b-tabs pills class="mx-3">
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
      </template>
      <ul class="list-unstyled py-3" v-if="!isLoading && fetchAudioItemsResponse.data">
        <li
          class="list-item p-3 mb-3 border-bottom"
          v-for="(item, index) in fetchAudioItemsResponse.data"
          :key="index"
        >
          <AudioItem
            :item="item"
            :routerLinkUrl="{
              name: 'audioContentItem',
              params: {
                content_item_uid: item.uid
              }
            }"
          ></AudioItem>
        </li>
      </ul>
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

const itemsUrl =
  'https://gist.githubusercontent.com/danieleguido/450b77a714b6f45a408bb6719666068c/raw/d1e032b9422c620beb5cf7b27fd0ac60cd36ba87/audio-items.json'
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
