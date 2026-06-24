<template>
  <i-layout class="AudioContentItemPage">
    <i-layout-section width="300px">
      <template #header>
        <ContentItemIdLabel v-if="contentItem && showSidebar" :item="contentItem" class="mt-1" />
      </template>

      <ListOfFindResponseItems  v-if="showSidebar"
        :service="contentItemService"
        :params="listParams"
        :list-is-empty-message="$t('no conversations')"
        :error-loading-items-message="$t('error loading conversations')"
        items-class="p-0"
      >
        <template #header="{ total }">
          <div
            class="px-2 py-1 small text-muted"
            v-html="$t('numbers.itemsGeneric', { n: $n(total) }, total)"
          />
        </template>
        <template #default="{ items }">
          <ContentItem
            v-for="item in items"
            :key="item.id"
            :contentItem="item"
            class="m-3 p-2 rounded-md border shadow-sm mb-4"
            showLink
            showIcon
            showMeta
            showSnippet
            showSemanticEnrichments
            showProvider
            showType
        /></template>
      </ListOfFindResponseItems>
    </i-layout-section>
    <i-layout-section main>
      <template v-slot:header>
        <b-navbar class="py-3 d-block container ml-0">
          <section class="py-1">
            <div class="label small-caps">Audio Content Item</div>
            <h3 class="mb-1">
              {{ title }}
            </h3>
            <AudioContentItem
              v-if="contentItem"
              :content-item="contentItem"
              :enable-player="false"
              :showTopics="false"
              :showTitle="false"
              show-content-item-access
              showDate
              showId
              showMediaSource
              showOcrQuality
              showProvider
              showSpecs
              showType
            >
            </AudioContentItem>
            
          </section>
        </b-navbar>
        <b-navbar-nav class="container ml-0 pb-2">
          <b-tabs pills class="border-0">
            <template v-slot:tabs-end>
              <li
                class="nav-item px-3"
                v-for="nestedRoute in AvailableNestedRoutes"
                :key="nestedRoute.name"
              >
                <router-link
                  :to="{
                    name: nestedRoute.name
                  }"
                  exact-active-class="active"
                  active-class=""
                  :active="route.name === nestedRoute.name"
                  class="nav-link"
                >
                  <span> {{ $t('routes.' + nestedRoute.name) }}</span>
                </router-link>
              </li>
            </template>
          </b-tabs>
        </b-navbar-nav>
      </template>
      <div class="container ml-0 py-4 pr-5">
        <router-view :content-item="contentItem"></router-view>
      </div>  
    </i-layout-section>
  </i-layout>
</template>
<script setup lang="ts">
import AudioContentItem from '@/components/audio/AudioContentItem.vue'
import { useAudioStore } from '@/stores/audio'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useContentItem } from '@/composables/useContentItem'
import { useRoute } from 'vue-router'
import ContentItemIdLabel from '@/components/ContentItemIdLabel.vue'
import { Routes } from '@/router/routes'
import { contentItems as contentItemService } from '@/services'
import ListOfFindResponseItems from '@/components/ListOfFindResponseItems.vue'
import FilterFactory from '@/models/FilterFactory'
import ContentItem from '@/components/modules/lists/ContentItem.vue'

const route = useRoute()

export interface AudioContentItemPageProps {
  showSidebar?: boolean
}

const props = defineProps<AudioContentItemPageProps>()

const AvailableNestedRoutes = [
  Routes.audioContentItem.children.transcript,
  Routes.audioContentItem.children.citeAs,
  Routes.audioContentItem.children.similarItems
] as const

const { contentItem, fetchContentItem } = useContentItem()
const audioStore = useAudioStore()

const title = computed(() => {
  if (!contentItem.value) {
    return ''
  }
  return contentItem.value.text.title || contentItem.value.id
})

const sameDateFilters = computed(() => {
  if (!contentItem.value || !contentItem.value.meta?.date) {
    return []
  }

  const publicationDate = new Date(contentItem.value.meta.date)
  const startOfDay = new Date(publicationDate)
  startOfDay.setUTCHours(0, 0, 0, 0)

  const endOfDay = new Date(publicationDate)
  endOfDay.setUTCHours(23, 59, 59, 999)

  return [
    FilterFactory.create({
      type: 'daterange',
      q: `${startOfDay.toISOString()} TO ${endOfDay.toISOString()}`
    })
  ]
})

const listParams = computed(() => {
  return {
    query: {
      limit: 5,
      offset: 0,
      filters: [...sameDateFilters.value]
    }
  }
})

watch(
  () => route.params.content_item_id as string,
  async newId => {
    if (newId) await fetchContentItem(newId)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  audioStore.setIsPlaying(false)
  audioStore.setContentItemId(null)
})
</script>
<i18n lang="json">
{
  "en": {
    "routes": {
      "audioContentItemTranscript": "Transcript",
      "audioContentItemCiteAs": "Cite As",
      "audioContentItemSimilarItems": "Similar Items"
    }
  }
}
</i18n>
