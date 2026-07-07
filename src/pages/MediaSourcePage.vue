<template>
  <i-layout>
    <i-layout-section collapsible width="auto">
      <template #header>
        <ul class="nav nav-pills mx-2 mt-1">
          <li class="nav-item active">
            <span class="nav-link">
              {{ $t('mediaSources') }}
            </span>
          </li>
        </ul>
      </template>

      <ListOfFindResponseItems
        :service="mediaSourcesService"
        :params="listParams"
        :list-is-empty-message="$t('no_media_sources')"
      >
        <template #header="{ total, isLoading }">
          <div class="p-3">
            <form @submit.prevent="handleSubmitSuggestionQuery">
              <div class="input-group">
                <b-form-input
                  class="border border-dark"
                  :style="{
                    'border-top-left-radius': 'var(--border-radius-sm)',
                    'border-bottom-left-radius': 'var(--border-radius-sm)',
                    'background-color': 'transparent',
                    'box-shadow': 'var(--bs-box-shadow-sm)',
                    color: 'var(--impresso-color-black)'
                  }"
                  v-model.trim="suggestionQuery"
                  :placeholder="$t('label_filter_media_sources')"
                />
                <div class="input-group-append">
                  <button
                    type="button"
                    class="btn btn-outline-primary"
                    :title="$t('placeholder.search')"
                    @click="handleSubmitSuggestionQuery"
                    :disabled="isLoading"
                  >
                    search
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div class="d-flex justify-content-between align-items-center px-3 pb-3">
            <h5
              class="m-0 font-size-inherit"
              v-html="$t('numbers.mediaSources', { n: $n(total || 0) }, total || 0)"
            ></h5>
            <div class="d-flex align-items-center gap-2">
              <b-dropdown size="sm" variant="outline-primary" right>
                <template #button-content>
                  {{ $t(`sort_${orderBy}`) }}
                </template>
                <b-dropdown-item
                  v-for="value in OrderByOptions"
                  :key="value"
                  @click="orderBy = value"
                >
                  {{ $t(`sort_${value}`) }}
                </b-dropdown-item>
              </b-dropdown>
            </div>
          </div>
        </template>
        <template #default="{ items = [], isSuccess }">
          <div ref="sidebarItemsContainerRef">
            <MediaSourceItem
              v-for="item in items"
              show-type
              show-medium
              :mediaSourceItem="item"
              :key="item.id"
              class="m-3 p-2 rounded-md border shadow-sm mb-4"
              :class="{ 'border-dark': item.id === mediaSource.id }"
            />
          </div>
        </template>
      </ListOfFindResponseItems>
    </i-layout-section>
    <i-layout-section main width="auto">
      <template v-slot:header>
        <div class="container-xxl">
          <div class="row">
            <PageNavbarHeading
              :label="$t('buckets.sourceType.' + (mediaSource?.type || ''))"
              :title="title"
              class="w-100"
              hideBorder
            >
              {{ otherTitles }}
              <template #actions>
                <div v-if="mediaSource?.id" class="d-flex gap-2">
                  <OpenInSearchButton :filters="[{ type: 'newspaper', q: mediaSource.id }]" />
                </div>
              </template>
            </PageNavbarHeading>
          </div>
          <div class="row mt-2">
            <b-tabs pills v-if="mediaSource">
              <template v-slot:tabs-end>
                <li class="nav-item pl-2" v-for="tab in nestedRoutes" :key="tab.name">
                  <RouterLink
                    :to="{ name: tab.name, params: { media_source_id: mediaSource.id } }"
                    class="nav-link"
                    :class="{
                      active: route.name === tab.name
                    }"
                  >
                    {{ $t(`route.${tab.name}`) }}
                  </RouterLink>
                </li>
              </template>
            </b-tabs>
          </div>
        </div>
      </template>
      <!-- Timeline -->
      <div class="container-xxl my-3" v-if="shouldDisplayTimeline">
        <div class="row">
          <div class="col-12">
            <SearchFacetTimeline
              facetType="year"
              searchIndex="search"
              :title="$t('contentItemOverTime.title')"
              height="85px"
              :filters="timelineFilters"
            >
              <template #afterHeader>
                <p class="small mb-2" v-html="$t('contentItemOverTime.description')"></p>
              </template>
              <template #tooltip="{ tooltip }">
                <div v-if="tooltip?.item">
                  {{ $d(tooltip.item.t, 'year') }}
                  &middot;
                  <span
                    v-html="
                      $t(
                        'numbers.contentItems',
                        { n: $n(tooltip.item.w || 0) },
                        tooltip.item.w || 0
                      )
                    "
                  />
                </div>
              </template>
            </SearchFacetTimeline>
          </div>
        </div>
      </div>
      <router-view
        :mediaSource="mediaSource"
        :listFilters="[{ type: 'newspaper', q: route.params.media_source_id }]"
      />
    </i-layout-section>
  </i-layout>
</template>
<script lang="ts" setup>
import type { MediaSource } from '@/models/generated/canonical'
import { Routes } from '@/router/routes'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { mediaSources as mediaSourcesService } from '@/services'
import { Filter } from '@/models'

import SearchFacetTimeline from '@/components/SearchFacetTimeline.vue'
import PageNavbarHeading from '@/components/PageNavbarHeading.vue'
import OpenInSearchButton from '@/components/OpenInSearchButton.vue'
import ListOfFindResponseItems from '@/components/ListOfFindResponseItems.vue'
import MediaSourceItem from '@/components/modules/lists/MediaSourceItem.vue'

const route = useRoute()

const mediaSource = ref<MediaSource>()
const loading = ref(true)
const error = ref(false)
const OrderByOptions = ['name', '-name', 'firstIssue', '-firstIssue', 'lastIssue', '-lastIssue']
const OrderByDefault = 'name'
const orderBy = ref(OrderByDefault)

const props = withDefaults(defineProps<{ filtersWithItems: Filter[]; filters: Filter[] }>(), {
  filtersWithItems: () => [],
  filters: () => []
})

const nestedRoutes = computed(() => {
  const baseRoutes: (typeof Routes.mediaSource.children)[keyof typeof Routes.mediaSource.children][] =
    [
      Routes.mediaSource.children.overview,
      Routes.mediaSource.children.metadata,
      Routes.mediaSource.children.contentItems
    ]
  if (mediaSource.value?.type === 'newspaper') {
    baseRoutes.push(Routes.mediaSource.children.firstPages)
  }
  return baseRoutes
})

const timelineFilters = computed<Filter[]>(() => [
  {
    type: 'newspaper',
    q: mediaSource.value?.id || ''
  }
])

const shouldDisplayTimeline = computed(() => {
  if (!mediaSource.value) return false
  return (
    route.name === Routes.mediaSource.children.overview.name ||
    route.name === Routes.mediaSource.children.metadata.name
  )
})

const otherTitles = computed(() => {
  if (!Array.isArray(mediaSource.value?.properties)) return ''
  return mediaSource.value.properties
    .filter(prop => ['otherTitle', 'variantTitle'].includes(prop.id))
    .map(prop => prop.value.trim())
    .join(', ')
})

const title = computed(() => {
  if (!mediaSource.value) {
    return '...'
  }
  if (!Array.isArray(mediaSource.value?.properties)) {
    return mediaSource.value.name
  }
  const startYear = mediaSource.value.properties
    .find(prop => prop.id === 'firstPubYear')
    ?.value?.trim()
  const endYear = mediaSource.value.properties
    .find(prop => prop.id === 'lastPubYear')
    ?.value?.trim()

  return (
    mediaSource.value.name +
    (startYear ? ` (${startYear}` : '') +
    (endYear ? ` - ${endYear})` : startYear ? ')' : '')
  )
})

const listParams = computed(() => ({
  query: {
    limit: 50,
    offset: 0,
    order_by: orderBy.value,
    term: searchQuery.value ? searchQuery.value : undefined
  }
}))

const suggestionQuery = ref('')
const searchQuery = ref('')
const handleSubmitSuggestionQuery = async () => {
  searchQuery.value = suggestionQuery.value
}

async function fetchMediaSource(): Promise<MediaSource | void> {
  loading.value = true
  error.value = false
  try {
    const response = await mediaSourcesService.get(route.params.media_source_id as string)
    mediaSource.value = response
  } catch (err) {
    console.error('Error fetching media source:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}
watch(() => route.params.media_source_id, fetchMediaSource, { immediate: true })
</script>
<i18n lang="json">
{
  "en": {
    "label_filter_media_sources": "Search media sources",
    "no_media_sources": "No media sources found",
    "mediaSources": "Media Sources",
    "sort_name": "order by name, A-Z",
    "sort_-name": "order by name, Z-A",
    "sort_firstIssue": "order by first pub., asc",
    "sort_-firstIssue": "order by first pub., desc",
    "sort_lastIssue": "order by last pub., asc",
    "sort_-lastIssue": "order by last pub., desc",
    "contentItemOverTime": {
      "title": "Content items over time",
      "description": "Number of content items associated with this media source over time"
    },
    "route": {
      "mediaSourceMetadata": "List of Metadata",
      "mediaSourceOverview": "Overview",
      "mediaSourceContentItems": "List of Content Items",
      "mediaSourceFirstPages": "List of First Pages"
    }
  }
}
</i18n>
