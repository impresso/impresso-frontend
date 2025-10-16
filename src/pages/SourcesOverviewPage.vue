<script setup lang="ts">
import Ellipsis from '@/components/modules/Ellipsis.vue'
import SearchSidebar from '@/components/modules/SearchSidebar.vue'
import PageNavbarHeading from '@/components/PageNavbarHeading.vue'
import SourcesOverviewTimeline from '@/components/sourcesOverview/SourcesOverviewTimeline.vue'
import { buildEmptyFacets } from '@/logic/facets'
import { serializeFilters, SupportedFiltersByContext } from '@/logic/filters'
import FacetModel, { FacetType } from '@/models/Facet'
import {
  mediaSources as mediaSourcesService,
  searchFacets as searchFacetsService,
  stats as statsService
} from '@/services'
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
const dateRangeBounds = computed<{ min: Date; max: Date }>(() => {
  const allDates: Date[] = dataValues.value.flatMap((dv: DataValue) => dv.dateRange)
  return allDates.reduce(
    (bounds: { min: Date; max: Date }, date: Date) => ({
      min: date < bounds.min ? date : bounds.min,
      max: date > bounds.max ? date : bounds.max
    }),
    { min: new Date('2030-12-31'), max: new Date('1700-01-01') }
  )
})

const minStartDate = computed(() => dateRangeBounds.value.min)
const maxEndDate = computed(() => dateRangeBounds.value.max)

const totalContentItems = computed(() => dataValues.value.reduce((sum, dv) => sum + dv.value, 0))
const facets = ref([])
const dataValues = ref<DataValue[]>([])
const isLoading = ref(true)
const totalResults = ref(0)

const normalizeOptions = [
  { value: false, text: 'Show absolute values' },
  { value: true, text: 'Show normalized values' }
]
const normalize = ref(false)
watch(
  () => props.filters,
  async newVal => {
    isLoading.value = true
    totalResults.value = 0
    const facetsItems = await searchFacetsService
      .find({
        query: {
          facets: FacetTypes,
          filters: newVal
        }
      })
      .then(response => response.data.map(f => new FacetModel(f as any)))

    const timelineFacets = await searchFacetsService
      .find({
        query: {
          facets: ['year'],
          filters: newVal,
          limit: 300 // get all values
        }
      })
      .then(response => response.data.map(f => new FacetModel(f as any)))
    facets.value = [...timelineFacets, ...facetsItems]
    const statsItems = await statsService.find({
      query: {
        facet: 'newspaper',
        domain: 'time',
        index: 'search',
        filters: serializeFilters(newVal)
      }
    })
    console.log('statsItems', statsItems)

    const dataValuesByMediaSourceId: Record<string, DataValue[]> = statsItems.items.reduce(
      (
        acc: Record<string, DataValue[]>,
        d: {
          domain: string
          value: {
            count: number
            items: {
              term: string
              count: number
            }[]
          }
        }
      ) => {
        d.value.items.forEach(item => {
          if (!acc[item.term]) {
            acc[item.term] = []
          }
          const date = new Date(d.domain)
          let startDate = new Date(date.getFullYear(), 0, 1)
          let endDate = new Date(date.getFullYear(), 11, 31)
          if (statsItems.meta.resolution === 'month') {
            startDate = new Date(date.getFullYear(), date.getMonth(), 1)
            endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
          } else if (statsItems.meta.resolution === 'day') {
            startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
            endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
          }
          acc[item.term].push({
            date: startDate,
            dateRange: [startDate, endDate],
            value: item.count,
            label: item.term
          } as DataValue)
        })
        return acc
      },
      {} as Record<string, DataValue[]>
    )
    console.log('dataValuesByMediaSourceId', dataValuesByMediaSourceId)

    dataValues.value = Object.entries(dataValuesByMediaSourceId).map(([mediaSourceId, values]) => {
      const allDates = values.flatMap(v => [v.dateRange[0], v.dateRange[1]])
      const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
      const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
      const totalValue = values.reduce((sum, v) => sum + v.value, 0)
      const label = statsItems.itemsDictionary[mediaSourceId] ?? mediaSourceId
      return {
        id: mediaSourceId,
        date: minDate,
        dateRange: [minDate, maxDate],
        value: totalValue,
        label,
        dataValues: values
      } as DataValue
    })
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
  <i-layout class="SearchOverviewPage">
    <SearchSidebar
      width="300px"
      :filters="allowedFiltersWithItems"
      :facets="facets"
      contextTag="search"
      @changed="props.onFiltersChanged"
    >
      <template #tabs>
        <b-tabs pills class="mx-2 pt-2">
          <template v-slot:tabs-end>
            <b-nav-item :to="{ name: 'sources' }" class="active" active-class="none">
              <span v-html="$t('pageLabel' + (isLoading ? '-loading' : ''))" />
            </b-nav-item>
          </template>
        </b-tabs>
      </template>
    </SearchSidebar>
    <i-layout-section main>
      <template v-slot:header>
        <PageNavbarHeading
          :label="$t('pageLabel' + (isLoading ? '-loading' : ''))"
          :title="$t('pageTitle' + (isLoading ? '-loading' : ''))"
        >
          <template #summaryActions>
            <i-dropdown
              v-model="normalize"
              v-bind:options="normalizeOptions"
              size="sm"
              variant="outline-primary"
              right
              data-testid="order-by-dropdown"
            ></i-dropdown>
          </template>
          <template #summary>
            <Ellipsis v-bind:initialHeight="60">
              <div v-if="isLoading">Loading...</div>
              <div v-else>
                <span
                  v-html="
                    $tc('numbers.contentItems', totalContentItems, { n: $n(totalContentItems) })
                  "
                ></span>
                {{ $tc('sources_overview_page_summary', totalResults, { total: totalResults }) }}
                <span
                  v-html="
                    $t('dates.fromTo', {
                      from: $d(minStartDate, 'short'),
                      to: $d(maxEndDate, 'short')
                    })
                  "
                ></span>
              </div>
            </Ellipsis>
          </template>
        </PageNavbarHeading>
      </template>
      <SourcesOverviewTimeline
        :normalizeLocally="normalize"
        class="h-100"
        :startDate="minStartDate"
        :endDate="maxEndDate"
        :dataValues="dataValues"
        :minimumGap="10"
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
    "sources_overview_page_summary": "0 media sources | in 1 media source | in {total} media sources"
  }
}
</i18n>
