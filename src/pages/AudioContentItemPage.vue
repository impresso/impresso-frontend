<template>
  <i-layout class="AudioContentItemPage">
    <i-layout-section width="380px">
      <template #header>
        <ul class="nav nav-pills mx-2 mt-2">
          <li class="nav-item active">
            <router-link
              :to="{
                name: 'audioContentItem',
                params: { content_item_id: route.params.content_item_id }
              }"
              exact-active-class="active"
              active-class=""
              class="nav-link"
            >
              On air, same day
            </router-link>
          </li>
        </ul>
      </template>

      <ListOfFindResponseItems
        v-if="showSidebar && contentItem"
        :service="contentItemService"
        :params="listParams"
        :list-is-empty-message="$t('no conversations')"
        :error-loading-items-message="$t('error loading conversations')"
        items-class="p-0"
        @items-rendered="scrollSidebarSelectedItemIntoView"
      >
        <template #header="{ total, isLoading }">
          <div class="my-3 mx-3">
            <SearchResultsSummary
              :is-loading="isLoading"
              groupBy="audioContentItems"
              :totalRows="total"
              :searchQuery="{ filters: sidebarFiltersWithItems }"
            />
          </div>
        </template>
        <template #default="{ items, isSuccess }">
          <div ref="sidebarItemsContainerRef">
            <ContentItem
              v-for="item in items"
              :key="item.id"
              :data-content-item-id="item.id"
              :contentItem="item"
              class="m-3 p-2 rounded-md border shadow-sm mb-4"
              :class="{ 'border-dark': item.id === contentItem.id }"
              :showDate="item.id !== contentItem.id"
              :showMediaSource="item.id !== contentItem.id"
              showLink
              showIcon
              :showMeta="item.id !== contentItem.id"
              :showSnippet="item.id !== contentItem.id"
              :showSemanticEnrichments="item.id !== contentItem.id"
              :showProvider="item.id !== contentItem.id"
              :showType="item.id !== contentItem.id"
            />
          </div>
        </template>
      </ListOfFindResponseItems>
    </i-layout-section>

    <i-layout-section main>
      <template v-slot:header>
        <b-navbar class="py-3 d-block container ml-0">
          <section class="py-1">
            <div class="label small-caps">Audio Content Item</div>
            <h3 class="mb-1">{{ title }}</h3>
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
            />
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
                  :to="{ name: nestedRoute.name }"
                  exact-active-class="active"
                  active-class=""
                  :active="route.name === nestedRoute.name"
                  class="nav-link"
                >
                  <span>{{ $t('routes.' + nestedRoute.name) }}</span>
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
import { Routes } from '@/router/routes'
import { contentItems as contentItemService } from '@/services'
import ListOfFindResponseItems from '@/components/ListOfFindResponseItems.vue'
import FilterFactory from '@/models/FilterFactory'
import ContentItem from '@/components/modules/lists/ContentItem.vue'
import { Filter } from '@/models'
import SearchResultsSummary from '@/components/modules/SearchResultsSummary.vue'
import { filtersItems as filterItemsService } from '@/services'
import { joinFiltersWithItems, serializeFilters } from '@/logic/filters'

const route = useRoute()

export interface AudioContentItemPageProps {
  showSidebar?: boolean
}

const props = withDefaults(defineProps<AudioContentItemPageProps>(), {
  showSidebar: true
})

const AvailableNestedRoutes = [
  Routes.audioContentItem.children.transcript,
  Routes.audioContentItem.children.citeAs,
  Routes.audioContentItem.children.similarItems
] as const

const { contentItem, fetchContentItem } = useContentItem()
const audioStore = useAudioStore()
const sidebarItemsContainerRef = ref<HTMLElement | null>(null)

const title = computed(() => {
  if (!contentItem.value) return ''
  return contentItem.value.text.title || contentItem.value.id
})

const sidebarFilters = computed<Filter[]>(() => {
  if (!contentItem.value?.meta?.date || !contentItem.value?.meta?.mediaId) {
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
    }),
    {
      /** @deprecated */
      type: 'newspaper',
      q: contentItem.value.meta.mediaId
    }
  ]
})

const sidebarFiltersWithItems = ref<Filter[]>([])

const listParams = computed(() => ({
  query: {
    limit: 10,
    offset: 0,
    filters: [...sidebarFilters.value],
    order_by: 'id'
  }
}))

/**
 * Called by ListOfFindResponseItems via @items-rendered, which fires only after
 * nextTick inside the child — meaning the DOM is guaranteed to be up to date.
 * No polling, no retries, no stale-ref risk.
 *
 * We still capture the target id at call time so that a rapid route change
 * that updates contentItem before this runs doesn't scroll to the wrong element.
 */
const scrollSidebarSelectedItemIntoView = () => {
  const targetId = contentItem.value?.id
  if (!targetId || !sidebarItemsContainerRef.value) return

  const selector = `[data-content-item-id="${targetId}"]`
  const el = sidebarItemsContainerRef.value.querySelector(selector)
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

watch(
  () => route.params.content_item_id as string,
  async newId => {
    if (newId) await fetchContentItem(newId)
  },
  { immediate: true }
)

watch(
  () => sidebarFilters.value,
  async newFilters => {
    if (!newFilters.length) {
      sidebarFiltersWithItems.value = []
      return
    }
    sidebarFiltersWithItems.value = await filterItemsService
      .find({ query: { filters: serializeFilters(newFilters) } })
      .then(joinFiltersWithItems)
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
