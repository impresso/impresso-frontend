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
            :audio-url="record.audioFileUrl"
            :title="'TODO'"
            :duration="contentItem?.audio?.duration"
            :data-provider="contentItem?.meta?.partnerId"
            :access-rights="contentItem?.access?.copyright"
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
import type { ContentItem, ContentItemAudioLocator } from '@/models/generated/schemas/contentItem'
import { contentItems as contentItemsService } from '@/services'
import AudioItem from 'impresso-ui-components/components/AudioItem.vue'
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

const currentTime = ref(0)

const onTranscriptViewerClick = (locator: ContentItemAudioLocator): void => {
  const startTime = locator.timeCode?.[0]
  if (startTime != null) {
    currentTime.value = startTime
  }
}

const loadContentItem = async (id: string) => {
  try {
    status.value = 'loading'
    const response = await contentItemsService.get(id)
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

// const getAudioRecordUrl = (id: string) => {
//   // return ContentItemAudioSrcs[id] ?? null
// }

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
