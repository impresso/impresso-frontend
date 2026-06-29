<template>
  <i-layout>
    <i-layout-section main>
      <template v-slot:header>
        <div class="container-xxl">
          <div class="row">
            <PageNavbarHeading
              :label="$t('types.' + (mediaSource?.type || ''))"
              :title="title"
              class="w-100"
            >
              <template #actions>
                <router-link class="btn btn-outline-primary btn-sm" :to="searchPageLink">
                  {{ $t('actions.searchMore') }}
                </router-link>
                <router-link
                  v-if="!isThisMediaSourceInCurrentFilter"
                  class="btn btn-outline-primary btn-sm"
                  :to="addMediaSourceFilterToSearchPage"
                >
                  {{ $t('actions.addToCurrentFilters') }}
                </router-link>
              </template>
              {{ otherTitles }}
            </PageNavbarHeading>
          </div>
          <div class="row">
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
import { serializeFilters } from '@/logic/filters'
import { CommonQueryParameters } from '@/router/util'

import PageNavbarHeading from '@/components/PageNavbarHeading.vue'
import SearchFacetTimeline from '@/components/SearchFacetTimeline.vue'

const route = useRoute()
const mediaSource = ref<MediaSource>()
const loading = ref(true)
const error = ref(false)

const props = withDefaults(defineProps<{ filtersWithItems: Filter[]; filters: Filter[] }>(), {
  filtersWithItems: () => [],
  filters: () => []
})

const timelineFilters = computed<Filter[]>(() => [
  {
    type: 'newspaper',
    q: mediaSource.value?.id || ''
  }
])

const serializedFilters = computed(() => {
  return serializeFilters([{ type: 'newspaper', q: mediaSource.value?.id || '' }])
})

const searchPageLink = computed(() => {
  return {
    name: 'search',
    query: {
      [CommonQueryParameters.SearchFilters]: serializedFilters.value
    }
  }
})

const shouldDisplayTimeline = computed(() => {
  return mediaSource.value && route.name === Routes.mediaSource.children.overview.name
})

const isThisMediaSourceInCurrentFilter = computed(() => {
  return props.filters.some(
    filter => filter.type === 'newspaper' && filter.q === mediaSource.value?.id
  )
})

const addMediaSourceFilterToSearchPage = computed(() => {
  if (isThisMediaSourceInCurrentFilter.value) {
    return searchPageLink.value
  }
  return {
    name: 'search',
    query: {
      [CommonQueryParameters.SearchFilters]: serializeFilters(
        props.filters.concat([{ type: 'newspaper', q: mediaSource.value?.id || '' }])
      )
    }
  }
})

const nestedRoutes = Routes.mediaSource.children

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
    "mediaSource": "Media Source",
    "contentItemOverTime": {
      "title": "Content items over time",
      "description": "Number of content items associated with this media source over time"
    },
    "route": {
      "mediaSourceMetadata": "List of Metadata",
      "mediaSourceOverview": "Overview",
      "mediaSourceContentItems": "List of Content Items"
    },
    "types": {
      "newspaper": "Newspaper",
      "periodical": "Periodical",
      "book": "Book",
      "manuscript": "Manuscript",
      "map": "Map",
      "photograph": "Photograph",
      "audioRecording": "Audio Recording",
      "videoRecording": "Video Recording",
      "other": "Other"
    }
  }
}
</i18n>
