<template>
  <i-layout id="SearchNgramsPage">
    <!-- sidebar (contains i-layout-section) -->
    <SearchSidebar
      :filters="enrichedFilters"
      :ignored-filter-types="ignoredFilters.map(({ type }) => type)"
      :facets="facets"
      :excluded-facet-types="['mediaSource']"
      contextTag="search-ngrams"
      @changed="handleFiltersChanged"
    >
      <template v-slot:header>
        <div
          v-if="ignoredFilters.length > 0 && ignoredFilters.some(d => d.type === 'string')"
          class="mx-1 small"
        >
          {{ $t('label_ignored_string_filters') }}
        </div>
        <!-- tehre is a hidden filter in allowed filter :) -->
        <div v-if="allowedFilters.length < 2" class="mx-1 small">
          Filter your search with the options below.
        </div>
      </template>
      <b-form-group class="mx-3">
        <b-form-checkbox v-model="isFront" switch>
          {{ $t('label.isFront') }}
        </b-form-checkbox>
      </b-form-group>
    </SearchSidebar>
    <!-- main section -->
    <i-layout-section main>
      <template v-slot:header>
        <b-navbar class="d-flex p-0 border-bottom align-items-center">
          <b-navbar-nav class="border-right flex-grow-1 px-2 pl-3 py-2">
            <PageHeading :label="$t('search_ngrams_label')" :title="$t('search_ngrams_title')">
              <ellipsis v-bind:initialHeight="60">
                <span v-html="unigramsSummary"></span>
                <span
                  class="ml-1"
                  v-html="$t('numbers.articles', { n: $n(totalArticlesCount) }, totalArticlesCount)"
                />
                <search-query-summary
                  class="d-inline ml-0"
                  :search-query="{ filters: enrichedFilters }"
                />
              </ellipsis>
            </PageHeading>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto px-2">
            <router-link
              :disabled="trends.length === 0"
              class="btn btn-outline-primary btn-sm"
              :to="searchPageLink"
            >
              {{ $t('label.seeArticles') }}
            </router-link>
          </b-navbar-nav>
        </b-navbar>
        <b-navbar class="border-bottom">
          <span style="white-space: nowrap" class="mr-3"
            >Enter unigram
            <info-button name="what-are-ngram" />
          </span>
          <div class="input-group">
            <TagsInput
              :value="unigrams"
              :disabled="isLoading"
              :placeholder="unigrams.length === 0 ? 'search unigrams ...' : ''"
              class="mb-2"
              @input="items => (unigrams = items)"
            />
            <b-dropdown
              ref="embeddings"
              class="mb-2"
              size="sm"
              right
              variant="outline-primary"
              :text="$t('label.addSimilar')"
              @shown="isEmbeddingSearchDisplayed = true"
              @hidden="isEmbeddingSearchDisplayed = false"
            >
              <div :style="{ 'min-width': '300px' }">
                <embeddings-search
                  v-if="isEmbeddingSearchDisplayed"
                  :filter="embeddingsFilter"
                  @embdding-selected="handleSuggestedTermSelected"
                />
              </div>
            </b-dropdown>
          </div>
        </b-navbar>
      </template>
      <div
        class="m-3"
        v-if="unigrams.length > 0"
        :style="{ position: isLoading ? 'relative' : undefined }"
      >
        <base-title-bar class="my-3">
          <span v-html="$t('label.timeline.unigramTitle')" />
          <template v-slot:description>
            {{ $t('label.timeline.unigramDescription') }}
          </template>
        </base-title-bar>
        <multi-line-plot
          :items-sets="plotItems"
          :round-value-fn="roundValueForDisplay"
          :height="300"
        >
          <template v-slot="tooltipScope">
            <div>
              <h4>
                {{ $d(getTooltipScopeTime(tooltipScope) ?? new Date(), timelineResolution, 'en') }}
              </h4>
              <div v-for="(item, index) in tooltipScope.tooltip.item.items" :key="item.label">
                <div
                  :style="{ 'background-color': tooltipScope.tooltip.item.colors[index] }"
                  class="legend-dot mr-1"
                ></div>
                <b>{{ item.label }}</b>
                &middot;
                {{ roundValueForDisplay(Number(item.item.value), false) }}
                {{ $t('tooltipValueUnit') }} ({{ valuePerTotalTokens(item, index) }})
              </div>
            </div>
          </template>
        </multi-line-plot>
        <div class="loading-overlay" v-if="isLoading">
          <em>{{ $t('loading') }}</em>
        </div>
        <div class="text-right mt-5 mr-3">
          <a
            class="btn btn-outline-primary btn-sm"
            download="unigrams.json"
            :href="plotItemsData"
            target="_blank"
          >
            <div class="d-flex align-items-center">
              <div>
                {{ $t('downloadVisualisationData') }}
              </div>
              <div class="d-flex dripicons dripicons-download ml-2" />
            </div>
          </a>
        </div>
      </div>
      <!-- without unigram -->
      <div v-else class="d-flex align-items-center justify-content-center h-100">
        <em v-html="$t('missingUnigram')"></em>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue'
import type { ComponentCustomProperties } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { serializeFilters, optimizeFilters, toCanonicalFilter } from '@/logic/filters'
import { useUserStore } from '@/stores/user'
import type { Filter, FacetType, FilterType, Facet } from '@/models'

import FacetModel from '@/models/Facet'
import SearchSidebar from '@/components/modules/SearchSidebar.vue'
import BaseTitleBar from '@/components/base/BaseTitleBar.vue'
import SearchQuerySummary from '@/components/modules/SearchQuerySummary.vue'
import MultiLinePlot from '@/components/modules/vis/MultiLinePlot.vue'
import Ellipsis from '@/components/modules/Ellipsis.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import EmbeddingsSearch from '@/components/modules/EmbeddingsSearch.vue'
import TagsInput from '@/components/base/TagsInput.vue'
import PageHeading from '@/components/base/PageHeading.vue'

import { ngramTrends as ngramTrendsService, searchFacets as searchFacetsService } from '@/services'
import { DefaultFacetTypesForIndex, buildEmptyFacets } from '@/logic/facets'
import { CommonQueryParameters } from '@/router/util'
import { Navigation } from '@/plugins/Navigation'
import type { RouteLocationRaw } from 'vue-router'

interface NgramTrend {
  ngram: string
  values: number[]
  total: number
}

interface NgramResult {
  trends: NgramTrend[]
  domainValues: string[]
  totals: number[]
  timeInterval: string
}

interface PlotItem {
  value: number
  time: Date
}

interface ItemsSet {
  label: string
  items: PlotItem[]
}

interface TooltipItem {
  label: string
  item: PlotItem
}

interface TooltipItemsGroup {
  items: TooltipItem[]
  colors: string[]
}

interface TooltipScope {
  tooltip?: {
    item?: TooltipItemsGroup
  }
}

interface NgramTrendsQuery {
  ngrams: string[]
  filters: Filter[]
}

type NgramTrendsService = {
  create(query: NgramTrendsQuery): Promise<NgramResult>
}

const proxy = getCurrentInstance()!.proxy as ComponentCustomProperties

const isFrontFilter = ({ type }: { type: string }): boolean => type === 'isFront'

const QueryParameters = Object.freeze({
  SearchFilters: CommonQueryParameters.SearchFilters,
  Unigrams: 'unigrams'
})

const AllowedFilterTypes: FilterType[] = [
  'copyright',
  'collection',
  'country',
  'isFront',
  // 'issue',
  'language',
  'location',
  'newspaper',
  'partner',
  'person',
  'nag',
  'organisation',
  // 'string',
  // 'title',
  'topic',
  'type',
  'year',
  'daterange',
  'hasTextContents'
]

function getTotalNumberOfResults(facets: Facet[]): number {
  const facetsWithBuckets = facets.filter(({ buckets }) => buckets != null && buckets.length > 0)
  if (facetsWithBuckets.length === 0) return 0

  const { buckets } = facetsWithBuckets[0]
  return buckets.reduce((total, { count }) => total + count, 0)
}

function getArticlesCountForYear(facets: Facet[], fullYear: number): number {
  const yearFacetsWithBuckets = facets.filter(
    ({ buckets, type }) => buckets != null && buckets.length > 0 && type === 'year'
  )
  if (yearFacetsWithBuckets.length === 0) return 0
  const { buckets } = yearFacetsWithBuckets[0]
  const bucket = buckets.find(({ item }) => item && 'id' in item && item.id === `${fullYear}`)
  if (bucket == null) return 0
  return bucket.count
}

const EmptyNgramResult: NgramResult = Object.freeze({
  trends: [],
  domainValues: [],
  totals: [],
  timeInterval: 'year'
})

const SupportedFacetTypes = DefaultFacetTypesForIndex.search
const typedNgramTrendsService = ngramTrendsService as NgramTrendsService

interface Props {
  filters?: Filter[]
  filtersWithItems?: Filter[]
}

const props = withDefaults(defineProps<Props>(), {
  filters: () => [],
  filtersWithItems: () => []
})

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const facets = ref<Facet[]>([])
const ngramResult = ref<NgramResult>({ ...EmptyNgramResult })
const isLoading = ref(false)
const isEmbeddingSearchDisplayed = ref(false)

onMounted(() => {
  facets.value = buildEmptyFacets(SupportedFacetTypes) as Facet[]
})

const unigrams = computed<string[]>({
  get() {
    const value = route.query[QueryParameters.Unigrams]
    let serializedUnigrams = ''
    if (typeof value === 'string') serializedUnigrams = value
    if (Array.isArray(value)) serializedUnigrams = value.join(',')
    return serializedUnigrams
      .split(',')
      .filter(v => v !== '')
      .map(v => v.trim().replace(' ', ''))
  },
  set(newUnigrams: string[]) {
    const sanitisedUnigrams = newUnigrams.map(v => v.trim().replace(' ', ''))
    const navigation = new Navigation(proxy)
    navigation.updateQueryParameters({
      [QueryParameters.Unigrams]: sanitisedUnigrams.join(',')
    })
  }
})

const isLoggedIn = computed(() => userStore.userData)

const trends = computed<NgramTrend[]>(() => ngramResult.value.trends)

const totalArticlesCount = computed<number>(() => getTotalNumberOfResults(facets.value))

const unigramsSummary = computed<string>(() => {
  if (trends.value.length === 0) {
    return proxy.$t('label.noUnigram').toString()
  }
  const trendsText = trends.value
    .map(trend =>
      proxy.$t(
        'numbers.unigramMentions',
        {
          unigram: trend.ngram,
          n: proxy.$n(trend.total)
        },
        trend.total || 0
      )
    )
    .join('; ')
  return proxy.$t('label.withTrends', { trends: trendsText }).toString()
})

const enrichedFilters = computed<Filter[]>(() => {
  return props.filtersWithItems != null
    ? props.filtersWithItems.filter(({ type }) => AllowedFilterTypes.includes(type))
    : allowedFilters.value
})

const ignoredFilters = computed<Filter[]>(() => {
  return props.filters.filter(({ type }) => !AllowedFilterTypes.includes(type))
})

const allowedFilters = computed<Filter[]>(() => {
  return (
    props.filters
      .filter(({ type }) => type !== 'hasTextContents' && AllowedFilterTypes.includes(type))
      // add implicit filters
      .concat([{ type: 'hasTextContents' } as Filter])
  )
})

const isFront = computed<boolean>({
  get() {
    return props.filters.filter(isFrontFilter).length > 0
  },
  set(isFrontValue: boolean) {
    const newFilters = isFrontValue
      ? props.filters.filter(f => !isFrontFilter(f)).concat([{ type: 'isFront' } as Filter])
      : props.filters.filter(f => !isFrontFilter(f))
    handleFiltersChanged(newFilters)
  }
})

const searchPageLink = computed<RouteLocationRaw>(() => {
  const stringFilter: Filter = {
    type: 'string',
    precision: 'exact',
    op: 'OR',
    q: trends.value.map(({ ngram }) => ngram)
  }
  const filters = props.filters.concat([stringFilter])
  console.info('sending filters', filters)
  return { name: 'search', query: { sq: serializeFilters(filters) } }
})

const plotItems = computed<ItemsSet[]>(() => {
  const { domainValues, totals } = ngramResult.value
  const dates = domainValues.map(v => new Date(v))

  return ngramResult.value.trends.map(({ ngram, values }) => {
    return {
      label: ngram,
      items: values.map((value, index) => ({
        value: (value / totals[index]) * 1000000,
        time: dates[index]
      }))
    }
  })
})

const plotItemsData = computed<string>(() => {
  const { domainValues, totals } = ngramResult.value
  const data = ngramResult.value.trends.map(({ ngram, values }) => ({
    label: ngram,
    items: values.map((value, index) => ({
      value,
      total: totals[index],
      ppm: (value / totals[index]) * 1000000,
      date: domainValues[index]
    }))
  }))
  const jsonStr = JSON.stringify({
    url: window.location.href,
    filters: props.filters,
    exportDate: new Date(),
    data
  })
  return `data:text/plain;charset=utf-8,${encodeURIComponent(jsonStr)}`
})

const timelineResolution = computed<string>(() => {
  return ngramResult.value.timeInterval
})

const isoDates = computed<string[]>(() => {
  const { domainValues } = ngramResult.value
  return domainValues.map(v => new Date(v).toISOString())
})

const embeddingsFilter = computed<Filter | undefined>(() => {
  const lastUnigram = unigrams.value[unigrams.value.length - 1]
  if (lastUnigram == null) return undefined
  return {
    q: [lastUnigram]
  } as Filter
})

const fullFilters = computed<Filter[]>(() => {
  const stringFilter: Filter = {
    type: 'string',
    op: 'OR',
    q: unigrams.value
  }
  return allowedFilters.value.concat(unigrams.value.length > 0 ? [stringFilter] : [])
})

watch(
  fullFilters,
  async (filters: Filter[]) => {
    const query = {
      filters: filters.map(toCanonicalFilter),
      limit: 25,
      facets: SupportedFacetTypes.filter(t => t !== 'collection')
      // group_by: 'articles'
    }
    const result = await searchFacetsService.find({ query })
    const fetchedFacets = result.data || []

    facets.value = fetchedFacets.map(f => FacetModel.fromSearchFacet(f)) as Facet[]
    if (isLoggedIn.value) {
      const collectionsFacet = await searchFacetsService.get('collection', {
        query: {
          filters
          // group_by: 'articles',
        }
      })
      facets.value = fetchedFacets
        .concat(collectionsFacet)
        .map(f => FacetModel.fromSearchFacet(f)) as Facet[]
    }
  },
  { immediate: true, deep: true }
)

const unigramsQueryParameters = computed(() => ({
  ngrams: unigrams.value,
  filters: optimizeFilters(allowedFilters.value)
}))

watch(
  unigramsQueryParameters,
  async (query: { ngrams: string[]; filters: Filter[] }) => {
    if (query.ngrams.length === 0) {
      ngramResult.value = { ...EmptyNgramResult }
    } else {
      try {
        isLoading.value = true
        ngramResult.value = await typedNgramTrendsService.create(query)
      } finally {
        isLoading.value = false
      }
    }
  },
  { immediate: true, deep: true }
)

function handleFiltersChanged(filters: Filter[]) {
  const sq = serializeFilters(optimizeFilters(filters).concat(ignoredFilters.value))
  const query: Record<string, string> = {
    sq
  }
  if (unigrams.value.length > 0) query[QueryParameters.Unigrams] = unigrams.value.join(',')
  router.push({
    name: 'searchNgrams',
    query
  })
}

function getTooltipScopeTime(scope: TooltipScope | undefined): Date | undefined {
  const times = [...new Set(scope?.tooltip?.item?.items.map(({ item: { time } }) => time))]

  if (times.length > 1)
    console.warn(`More than one time found in tooltip data. Using first time`, times)

  return times[0]
}

function getTotalArticlesAtTimestamp(timestamp: Date): number {
  const fullYear = timestamp.getFullYear()
  return getArticlesCountForYear(facets.value, fullYear)
}

function roundValueForDisplay(value: string | number, withSuffix = true): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  const v = proxy.$n(numValue, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return withSuffix ? `${v} ppm` : v
}

function valuePerTotalTokens(item: TooltipItem, itemIndex: number | string): string {
  const { totals, trends: resultTrends } = ngramResult.value
  const trendIndex = Number(itemIndex)
  if (Number.isNaN(trendIndex) || typeof resultTrends[trendIndex] === 'undefined') return ''

  const dateIndex = isoDates.value.indexOf(item.item.time.toISOString())
  if (dateIndex < 0) return ''

  const absoluteValue = resultTrends[trendIndex].values[dateIndex]
  const total = totals[dateIndex]
  if (typeof absoluteValue !== 'number' || typeof total !== 'number') return ''

  return proxy.$t('tooltipAbsoluteValue', { count: absoluteValue, total }, absoluteValue)
}

function handleSuggestedTermSelected(term: string) {
  unigrams.value = [...unigrams.value, term]
}
</script>

<i18n lang="json">
{
  "en": {
    "tabs": {
      "text": "search articles",
      "images": "search images",
      "ngrams": "ngrams"
    },
    "search_ngrams_title": "Search for Unigrams",
    "search_ngrams_label": "Ngram viewer",
    "missingUnigram": " ... (no unigram has been selected)",
    "label": {
      "timeline": {
        "unigramTitle": "Yearly unigram mentions (per million)",
        "unigramDescription": " "
      },
      "seeArticles": "See articles",
      "noUnigram": "... look for a specific <em>unigram</em> in",
      "withTrends": "{trends} in",
      "availableFacets": "Available filters for ngram analysis",
      "addSimilar": "add similar"
    },
    "loading": "Loading ...",
    "tooltipValueUnit": "per 1 million",
    "downloadVisualisationData": "download data in JSON",
    "tooltipAbsoluteValue": "{count} tokens",
    "label_ignored_string_filters": "It is currently not possible to use keyword or phrase filters to retrieve unigram counts."
  }
}
</i18n>

<style scoped lang="css">
.legend-dot {
  width: 0.5em;
  height: 0.5em;
  display: inline-block;
  border-radius: 0.25em;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  align-items: center;
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: center;
  background-color: #d4d4d412;
  backdrop-filter: blur(0.8px);
}

.tooltip h4 {
  color: var(--white);
}
</style>
