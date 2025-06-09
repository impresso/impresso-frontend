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
          <b-navbar-nav class="px-3 py-3 flex-grow-1 border-right">
            <PageHeading :label="$t('label_group')" :title="$t('pages.searchRadio')"></PageHeading>
          </b-navbar-nav>
        </b-navbar>
      </template>
      <ul class="list-unstyled" v-if="!isLoading">
        <li class="list-item">
          <AudioItem :item="fetchAudioItemResponse.data"></AudioItem>
        </li>
      </ul>
    </i-layout-section>
  </i-layout>
</template>

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

const itemUrl =
  'https://raw.githubusercontent.com/impresso/impresso-ui-components/2d1ad9707bbec310f9d6f731a78669e1c685eebc/src/assets/CFCE-1996-09-08-a-i0001-mock.json'
const fetchAudioItemResponse = ref<{
  status: 'loading' | 'success' | 'error'
  data: AudioContentItem | null
}>({
  status: 'loading',
  data: null
})

const isLoading = computed(() => fetchAudioItemResponse.value?.status === 'loading')

onMounted(() => {
  fetch(itemUrl)
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
})
</script>
