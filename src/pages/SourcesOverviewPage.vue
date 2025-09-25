<script setup lang="ts">
import Ellipsis from '@/components/modules/Ellipsis.vue'
import SearchSidebar from '@/components/modules/SearchSidebar.vue'
import PageNavbarHeading from '@/components/PageNavbarHeading.vue'
import SourcesOverviewTimeline from '@/components/sourcesOverview/SourcesOverviewTimeline.vue'
import { buildEmptyFacets } from '@/logic/facets'
import { SupportedFiltersByContext } from '@/logic/filters'
import FacetModel, { FacetType } from '@/models/Facet'
import { searchFacets } from '@/services'
import { watch } from 'vue'
import { computed, onMounted, ref } from 'vue'
import type { DataValue } from '@/components/sourcesOverview/SourcesOverviewDateValueItem.vue'
interface Props {
  filtersWithItems?: Array<any>
  filters?: Array<any>
  onFiltersChanged?: (newFilters: Array<any>) => void
}

const FacetTypes = [
  'language',
  'newspaper',
  'type',
  'country',
  'partner',
  // 'year',
  'contentLength',
  'copyright',
  'sourceType',
  'sourceMedium',
  // DPFS facets
  'person',
  'location',
  'nag',
  'organisation',
  'topic'
] satisfies FacetType[]

const props = withDefaults(defineProps<Props>(), {
  filters: () => [],
  filtersWithItems: () => [],
  onFiltersChanged: () => {}
})

const allowedFiltersWithItems = computed(() => {
  return props.filtersWithItems.filter(({ type }) =>
    SupportedFiltersByContext.search.includes(type)
  )
})

const facets = ref([])
const dataValues = ref<DataValue[]>([])
const isLoading = ref(true)
const totalResults = ref(0)

watch(
  () => props.filters,
  async newVal => {
    isLoading.value = true
    totalResults.value = 0
    const facetsItems = await searchFacets
      .find({
        query: {
          facets: FacetTypes,
          filters: newVal
        }
      })
      .then(response => response.data.map(f => new FacetModel(f as any)))
    facets.value = facetsItems

    const mediaSourceBuckets = await searchFacets
      .find({
        query: {
          facets: ['newspaper'],
          filters: newVal,
          limit: 1000
        }
      })

      .then(response => response.data.map(f => new FacetModel(f as any))[0].buckets)

    dataValues.value =
      mediaSourceBuckets
        ?.map(bucket => {
          const item = bucket.item as any
          if (!item?.startYear && !item?.endYear) {
            return null
          }
          const startDate = new Date(item.startYear, 0, 1)
          const endDate = new Date(item.endYear, 11, 31)
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return null
          }
          return {
            id: item.id,
            date: startDate,
            dateRange: [startDate, endDate],
            value: 0,
            label: item.name || 'Unknown'
          } as DataValue
        })
        .filter((item): item is DataValue => item !== null) || []
    totalResults.value = dataValues.value.length
    isLoading.value = false
  },
  { immediate: true }
)

onMounted(() => {
  facets.value = buildEmptyFacets(FacetTypes)
})
</script>

<template>
  <i-layout id="SearchPage">
    <SearchSidebar
      width="400px"
      :filters="allowedFiltersWithItems"
      :facets="facets"
      contextTag="search"
      @changed="props.onFiltersChanged"
    >
    </SearchSidebar>
    <i-layout-section main>
      <template v-slot:header>
        <PageNavbarHeading
          :label="$t('pageLabel' + (isLoading ? '-loading' : ''))"
          :title="$t('pageTitle' + (isLoading ? '-loading' : ''))"
        >
          <template #summary>
            <Ellipsis v-bind:initialHeight="60">
              <div v-if="isLoading">Loading...</div>
              <div v-else>
                {{ $tc('sources_overview_page_summary', totalResults, { total: totalResults }) }}
              </div>
            </Ellipsis>
          </template>
        </PageNavbarHeading>
      </template>
      <SourcesOverviewTimeline
        class="h-100"
        :startDate="new Date('1700-01-01')"
        :endDate="new Date('2030-12-31')"
        :dataValues="dataValues"
      />
    </i-layout-section>
  </i-layout>
</template>

<i18n lang="json">
{
  "en": {
    "pageLabel": "Sources Overview",
    "pageTitle": "Explore the sources in the archive",
    "pageLabel-loading": "Loading...",
    "pageTitle-loading": "Loading...",
    "sources_overview_page_summary": "Ouch no result? | 1 source | {total} sources in the archive"
  },
  "de": {
    "pageLabel": "Quellenübersicht",
    "pageTitle": "Entdecken Sie die Quellen im Archiv",
    "pageLabel-loading": "Lädt...",
    "pageTitle-loading": "Lädt...",
    "sources_overview_page_summary": "{total} Quellen im Archiv"
  }
}
</i18n>
