<template>
  <i-layout class="AudioContentItem">
    <i-layout-section main>
      <template v-slot:header>
        <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
          <b-navbar-nav class="w-100 my-2">
            <div class="container">
              <section class="py-1">
                <div class="label small-caps">
                  <RouterLink :to="{ name: 'searchRadio' }">Radio</RouterLink>
                </div>
                <h3 class="mb-1" v-if="contentItem">
                  <div class="MediaSourceLabel d-inline-block">
                    <a href="" class="">
                      <span class="">{{ contentItem?.meta?.mediaId }}</span>
                      <span class="small-caps"> {{ contentItem?.meta?.sourceType }}</span>
                    </a>
                  </div>
                  <span class="date"
                    >&nbsp;—&nbsp;{{ $d(new Date(contentItem?.meta?.date), 'long') }}</span
                  >
                  <br />
                  <b>{{ contentItem?.text?.title }}</b>
                </h3>
                <div class="d-flex align-items-center">
                  <div class="textbox-fancy text-serif">
                    <span style="text-transform: capitalize">Episode</span>
                  </div>
                  <div class="ml-auto" style="min-width: 200px">
                    <div class="dropdown b-dropdown btn-group position-relative">
                      <button
                        aria-haspopup="menu"
                        aria-expanded="false"
                        type="button"
                        class="btn dropdown-toggle btn-sm btn-outline-primary"
                      >
                        Add to Collection ...<svg
                          data-v-1278d3c6=""
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          class="Icon Icon_chevron"
                        >
                          <g data-v-1278d3c6="">
                            <path
                              data-v-1278d3c6=""
                              d="M6 9L12 15L18 9"
                              style="fill: transparent; stroke-width: 1px"
                              strokeWidth="1"
                            ></path>
                          </g>
                        </svg>
                      </button>
                      <ul role="menu" tabindex="-1" class="dropdown-menu dropdown-menu-right">
                        <div class="CollectionAddToList">
                          <div class="header bg-light p-2 border-bottom">
                            <div class="input-group">
                              <input
                                type="text"
                                class="form-control form-control-sm"
                                placeholder="... type or pick a collection name"
                              />
                              <div class="input-group-append">
                                <button
                                  type="button"
                                  class="btn btn-outline-primary btn-sm disabled float-right float-right"
                                  disabled="false"
                                >
                                  Create New
                                </button>
                              </div>
                            </div>
                            <!--v-if-->
                          </div>
                          <ul class="p-0">
                            <li>
                              <div class="spinner text-center p-5"><span></span></div>
                            </li>
                          </ul>
                        </div>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </b-navbar-nav>
        </b-navbar>
        <b-navbar class="w-100 border-bottom">
          <div class="container">
            <!-- <AudioPlayer
              class="w-100 me-5 mr-5"
              :src="itemAudioSrc"
              :is-loading="status === 'loading'"
              :current-time="currentTime"
              @timeupdate="currentTime = $event"
            ></AudioPlayer> -->
          </div>
        </b-navbar>
      </template>
      <div class="container">
        <div v-for="(record, idx) in contentItem?.audio?.records ?? []" :key="idx">
          <AudioItem
            :audio-url="getAudioRecordUrl(record.id)"
            :title="'TODO'"
            :duration="contentItem?.audio?.duration"
            :data-provider="contentItem?.meta?.partnerId"
            :access-rights="contentItem?.access?.copyright!"
            :item-type="contentItem?.text?.itemType!"
            :media-source="mediaSource"
            :publication-date="contentItem?.meta?.date"
            :transcript-length="contentItem?.text?.contentLength"
            :is-loading="status === 'loading'"
            :excerpt="contentItem?.text?.snippet"
            :enable-player="true"
            :current-time="currentTime"
            @timeupdate="currentTime = $event"
          ></AudioItem>

          <TranscriptViewer
            class="mt-3"
            v-if="contentItem?.text"
            :content="contentItem?.text?.content"
            :audio-segments-locators="record.audioSegmentsLocators ?? []"
            :current-time="currentTime"
            @click="onTranscriptViewerClick"
          ></TranscriptViewer>
        </div>
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
import { MediaSource } from '@/models'
import type { ContentItem } from '@/models/generated/schemas/contentItem'
import { contentItems as contentItemsService } from '@/services'
import AudioItem from 'impresso-ui-components/components/AudioItem.vue'
// import AudioPlayer from 'impresso-ui-components/components/audioPlayer/AudioPlayer.vue'
import TranscriptViewer from 'impresso-ui-components/components/audioPlayer/TranscriptViewer.vue'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

type Status = 'noContentItemId' | 'loading' | 'loaded' | 'error' | 'unsupportedContentItemType'

const status = ref<Status>('noContentItemId')
const contentItem = ref<ContentItem | null>(null)

const mediaSource = computed<MediaSource | null>(() => {
  if (contentItem.value) {
    return {
      id: contentItem.value.meta?.mediaId!,
      uid: contentItem.value.meta?.mediaId!,
      type: contentItem.value?.meta?.sourceType!,
      name: contentItem.value.meta?.mediaId!
    } satisfies MediaSource
  }
  return null
})

const isContentItemSupported = (item: ContentItem) => {
  return item?.meta?.sourceMedium === 'audio'
}

const ContentItemAudioSrcs = {
  'CFCE-1996-09-08-a-i0001': '/mock-media/CFCE-1996-09-08-a-r0001.MP3',
  'CFCE-1996-09-15-a-i0001': '/mock-media/CFCE-1996-09-15-a-r0001.MP3',
  'RDN-1950-01-12-a-i0001': '/mock-media/RDN-1950-01-12-a-r0001.MP3'
}
const itemAudioSrc = computed(() => {
  const contentItemUid = route.params.content_item_uid as string
  if (ContentItemAudioSrcs[contentItemUid]) {
    return ContentItemAudioSrcs[contentItemUid]
  }
  return 'https://gilberttrausch.uni.lu/audio/ch3-3fkl01junckertrauschbechdupong.mp3'
})
const ContentItemJsonUrls = {
  'CFCE-1996-09-15-a-i0001':
    'https://gist.githubusercontent.com/danieleguido/5ab7d5c5d9c02d09010283e9aee22e4b/raw/17d304e12b994c480bef08723cf67dc3dd7200ce/CFCE-1996-09-15-a-i0001.json',
  'CFCE-1996-09-08-a-i0001':
    'https://gist.githubusercontent.com/danieleguido/d3e76a1f8f3ba494f3da367b8349271a/raw/1afe0813772a5fc5b7049db1b9d4d9fa473a427e/CFCE-1996-09-08-a-i0001.json',
  'RDN-1950-01-12-a-i0001':
    'https://gist.githubusercontent.com/danieleguido/93bae33a202e442eea622970cbf065a0/raw/8890f58cb6deb245ef8211666e9c2f47ea88d358/RDN-1950-01-12-a-i0001.json'
}

const currentTime = ref(0)

const onTranscriptViewerClick = (rrreb: any): void => {
  console.debug('[AudioContentItem] onTranscriptViewerClick', rrreb)
  // Here you can handle the click event on the transcript viewer
  // For example, you might want to update the current time of the audio player
  currentTime.value = rrreb.startTime
}

const loadContentItem = async (id: string) => {
  try {
    status.value = 'loading'
    const response = await contentItemsService.get(id)
    console.log('RRR', response)
    contentItem.value = response

    if (contentItem.value == null) {
      status.value = 'noContentItemId'
      return
    } else if (isContentItemSupported(contentItem.value)) {
      status.value = 'loaded'
    } else {
      status.value = 'unsupportedContentItemType'
    }
  } catch (e) {
    status.value = 'error'
    throw e
  }
}

const getAudioRecordUrl = (id: string) => {
  return ContentItemAudioSrcs[id] ?? null
}

watch(
  () => route.params.content_item_uid as string,
  async (newId, oldId) => {
    // react to route changes...
    if (newId !== oldId) {
      await loadContentItem(newId)
    }
  },
  { immediate: true }
)
</script>
