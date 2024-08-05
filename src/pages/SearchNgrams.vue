<template>
  <i-layout id="SearchNgramsPage">
    <!-- sidebar (contains i-layout-section) -->
    <search-sidebar
      :filters="enrichedFilters"
      :ignored-filters="ignoredFilters"
      :facets="facets"
      contextTag="search-ngrams"
      @changed="handleFiltersChanged"
    >
      <template v-slot:header>
        <!-- tehre is a hidden filter in allowed filter :) -->
        <div v-if="allowedFilters.length < 2" class="mx-1 small">
          Filter your search with the options below.
        </div>
      </template>
      <b-form-group class="mx-3">
        <b-form-checkbox v-model="isFront" switch :modelValue="true">
          {{ $t('label.isFront') }}
        </b-form-checkbox>
      </b-form-group>
    </search-sidebar>
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
                  v-html="
                    $tc('numbers.articles', totalArticlesCount, { n: $n(totalArticlesCount) })
                  "
                />
                &nbsp;
                <search-query-summary
                  class="d-inline"
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
            <tags-input
              :value="unigrams"
              :disabled="isLoading"
              :placeholder="unigrams.length === 0 ? 'search unigrams ...' : ''"
              class="mb-2"
              @input="
                items => {
                  console.debug('[SearchNgrams] input', e)
                  unigrams = items
                }
              "
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
                {{ roundValueForDisplay(item.item.value, false) }} {{ $t('tooltipValueUnit') }} ({{
                  valuePerTotalTokens(item, index)
                }})
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

<script>
import { serializeFilters, optimizeFilters, toCanonicalFilter } from '@/logic/filters'
import { useUserStore } from '@/stores/user'
import { mapStores } from 'pinia'

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

import {
  search as searchService,
  ngramTrends as ngramTrendsService,
  searchFacets as searchFacetsService
} from '@/services'
import {
  DefaultFacetTypesForIndex,
  searchResponseToFacetsExtractor,
  buildEmptyFacets
} from '@/logic/facets'
import { CommonQueryParameters } from '@/router/util'
import { Navigation } from '@/plugins/Navigation'

/**
 * @typedef {import('../models').Filter} Filter
 * @typedef {import('../models').Facet} Facet
 * @typedef {import('../models').Bucket} Bucket
 */

/**
 * @param {Filter} filter
 * @returns {boolean}
 */
const isFrontFilter = ({ type }) => type === 'isFront'

const QueryParameters = Object.freeze({
  SearchFilters: CommonQueryParameters.SearchFilters,
  Unigrams: 'unigrams'
})

const AllowedFilterTypes = [
  'accessRight',
  'collection',
  'country',
  'isFront',
  // 'issue',
  'language',
  'location',
  'newspaper',
  'partner',
  'person',
  // 'string',
  // 'title',
  'topic',
  'type',
  'year',
  'daterange',
  'hasTextContents'
]

/**
 * @param {Facet[]} facets
 * @returns {number}
 */
function getTotalNumberOfResults(facets) {
  const facetsWithBuckets = facets.filter(({ buckets }) => buckets != null && buckets.length > 0)
  if (facetsWithBuckets.length === 0) return 0

  const { buckets } = facetsWithBuckets[0]
  return buckets.reduce((total, { count }) => total + count, 0)
}

/**
 * @param {Facet[]} facets
 * @param {number} fullYear
 * @returns {number}
 */
function getArticlesCountForYear(facets, fullYear) {
  const yearFacetsWithBuckets = facets.filter(
    ({ buckets, type }) => buckets != null && buckets.length > 0 && type === 'year'
  )
  if (yearFacetsWithBuckets.length === 0) return 0
  const { buckets } = yearFacetsWithBuckets[0]
  const bucket = buckets.filter(({ val }) => val === `${fullYear}`)[0]
  if (bucket == null) return 0
  return bucket.count
}

const EmptyNgramResult = Object.freeze({
  trends: [],
  domainValues: [],
  timeInterval: 'year'
})

const SupportedFacetTypes = DefaultFacetTypesForIndex.search

export default {
  name: 'SearchNgramsPage',
  components: {
    MultiLinePlot,
    SearchQuerySummary,
    Ellipsis,
    BaseTitleBar,
    SearchSidebar,
    InfoButton,
    EmbeddingsSearch,
    TagsInput,
    PageHeading
  },
  data: () => ({
    /** @type {Facet[]} */
    facets: [],
    /** @type {Filter[]} */
    // filtersWithItems: [],
    /** @type {any} */
    ngramResult: EmptyNgramResult,
    isLoading: false,
    isEmbeddingSearchDisplayed: false
  }),
  mounted() {
    this.facets = buildEmptyFacets(SupportedFacetTypes)
  },
  props: {
    filters: {
      type: Array,
      default: () => []
    },
    filtersWithItems: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    fullFilters: {
      /** @param {Filter[]} filters */
      async handler(filters) {
        const query = {
          filters: filters.map(toCanonicalFilter),
          limit: 0,
          facets: SupportedFacetTypes.filter(f => f !== 'collection'),
          group_by: 'articles'
        }
        const facets = await searchService
          .find({ query })
          .then(searchResponseToFacetsExtractor(SupportedFacetTypes))

        this.facets = facets.map(f => new FacetModel(f))
        if (this.isLoggedIn) {
          const collectionsFacet = await searchFacetsService.get('collection', {
            query: {
              filters
              // group_by: 'articles',
            }
          })
          this.facets = facets.concat(collectionsFacet).map(f => new FacetModel(f))
        }
      },
      immediate: true,
      deep: true
    },
    unigramsQueryParameters: {
      /** @param {{ ngrams: string[], filters: Filter[] }} query */
      async handler(query) {
        if (query.ngrams.length === 0) {
          this.ngramResult = EmptyNgramResult
        } else {
          try {
            this.isLoading = true
            this.ngramResult = await ngramTrendsService.create(query)
          } finally {
            this.isLoading = false
          }
        }
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    ...mapStores(useUserStore),
    $navigation() {
      return new Navigation(this)
    },
    /** @type {import('vue').ComputedOptions<string[]>} */
    unigrams: {
      /** @returns {string[]} */
      get() {
        const value = this.$route.query[QueryParameters.Unigrams]
        let serializedUnigrams = ''
        if (typeof value === 'string') serializedUnigrams = value
        if (Array.isArray(value)) serializedUnigrams = value.join(',')
        return serializedUnigrams.split(',').filter(v => v !== '')
      },
      /** @param {string[]} unigrams */
      set(unigrams) {
        this.$navigation.updateQueryParameters({
          [QueryParameters.Unigrams]: unigrams.join(',')
        })
      }
    },
    /** @returns {string} */
    unigramsSummary() {
      if (this.trends.length === 0) {
        return this.$t('label.noUnigram').toString()
      }
      const trends = this.trends
        .map(trend =>
          this.$tc('numbers.unigramMentions', trend.total || 0, {
            unigram: trend.ngram,
            n: this.$n(trend.total)
          })
        )
        .join('; ')
      return this.$t('label.withTrends', { trends }).toString()
    },
    /** @returns {Filter[]} */
    enrichedFilters() {
      return this.filtersWithItems != null
        ? this.filtersWithItems.filter(({ type }) => AllowedFilterTypes.includes(type))
        : this.allowedFilters
    },
    /** @returns {Filter[]} */
    ignoredFilters() {
      return this.filters.filter(({ type }) => !AllowedFilterTypes.includes(type))
    },
    /** @returns {Filter[]} */
    allowedFilters() {
      return (
        this.filters

          .filter(({ type }) => type !== 'hasTextContents' && AllowedFilterTypes.includes(type))
          // add implicit filters
          .concat([{ type: 'hasTextContents' }])
      )
    },
    /**
     * Full filters is what we use to filter the side panel facet filters.
     * They include filters + a string filter containing all entered unigrams.
     * @returns {Filter[]}
     */
    fullFilters() {
      const stringFilter = {
        type: 'string',
        op: 'OR',
        q: this.unigrams
      }
      return this.allowedFilters.concat(this.unigrams.length > 0 ? [stringFilter] : [])
    },
    isFront: {
      /** @returns {boolean} */
      get() {
        return this.filters.filter(isFrontFilter).length > 0
      },
      /** @param {boolean} isFront */
      set(isFront) {
        const newFilters = isFront
          ? this.filters.filter(f => !isFrontFilter(f)).concat([{ type: 'isFront' }])
          : this.filters.filter(f => !isFrontFilter(f))
        this.handleFiltersChanged(newFilters)
      }
    },
    isLoggedIn() {
      return this.userStore.userData
    },
    /** @returns {{ ngram: string, values: number[], total: number }[]} */
    trends() {
      return this.ngramResult.trends
    },
    /** @returns {number} */
    totalArticlesCount() {
      return getTotalNumberOfResults(this.facets)
    },
    /** @returns {{ name: string, query: any }} */
    searchPageLink() {
      const stringFilter = {
        type: 'string',
        precision: 'exact',
        op: 'OR',
        q: this.trends.map(({ ngram }) => ngram)
      }
      const filters = this.filters.concat([stringFilter])
      // const query = { f: JSON.stringify(filters) }
      console.info('sending filters', filters)
      return { name: 'search', query: { sq: serializeFilters(filters) } }
    },
    /** @returns {{ ngrams: string[], filters: Filter[] }} */
    unigramsQueryParameters() {
      return {
        ngrams: this.unigrams,
        filters: optimizeFilters(this.allowedFilters)
      }
    },
    /**
     * @typedef {{ value: number, time: Date }} Item
     * @typedef {{ items: Item[], label: string }} ItemsSet
     * @returns {ItemsSet[]}
     */
    plotItems() {
      const { domainValues, totals } = this.ngramResult
      const dates = domainValues.map(v => new Date(v))

      return this.ngramResult.trends.map(({ ngram, values }) => {
        return {
          label: ngram,
          items: values.map((value, index) => ({
            value: (value / totals[index]) * 1000000,
            time: dates[index]
          }))
        }
      })
    },
    /** @returns {string} */
    plotItemsData() {
      const { domainValues, totals } = this.ngramResult
      const data = this.ngramResult.trends.map(({ ngram, values }) => ({
        label: ngram,
        items: values.map((value, index) => ({
          value,
          total: totals[index],
          ppm: (value / totals[index]) * 1000000,
          date: domainValues[index]
        }))
      }))
      const jsonStr = JSON.stringify({
        // @ts-ignore
        url: window.location.href,
        filters: this.filters,
        exportDate: new Date(),
        data
      })
      return `data:text/plain;charset=utf-8,${encodeURIComponent(jsonStr)}`
    },
    /** @returns {string} */
    timelineResolution() {
      // the time-interval needs to be one i18n datetimeFormats, e.g `year`,
      return this.ngramResult.timeInterval
    },
    /** @returns {string[]} */
    isoDates() {
      const { domainValues } = this.ngramResult
      return domainValues.map(v => new Date(v).toISOString())
    },
    /** @returns {import('@/models').Filter | undefined} */
    embeddingsFilter() {
      const lastUnigram = this.unigrams[this.unigrams.length - 1]
      if (lastUnigram == null) return undefined
      return {
        q: [lastUnigram]
      }
    }
  },
  methods: {
    /** @param {Filter[]} filters */
    handleFiltersChanged(filters) {
      const sq = serializeFilters(optimizeFilters(filters).concat(this.ignoredFilters))
      const query = {
        sq
      }
      if (this.unigrams.length > 0) query[QueryParameters.Unigrams] = this.unigrams.join(',')
      this.$router.push({
        name: 'searchNgrams',
        query
      })
    },
    /** @returns {Date} */
    getTooltipScopeTime(scope) {
      const times = [...new Set(scope?.tooltip?.item?.items.map(({ item: { time } }) => time))]

      if (times.length > 1)
        console.warn(`More than one time found in tooltip data. Using first time`, times)

      return times[0]
    },
    /**
     * @param {Date} timestamp
     * @returns {number}
     */
    getTotalArticlesAtTimestamp(timestamp) {
      const fullYear = timestamp.getFullYear()
      return getArticlesCountForYear(this.facets, fullYear)
    },
    /**
     * @param {number} value
     * @param {boolean} withSuffix display ppm suffix
     */
    roundValueForDisplay(value, withSuffix = true) {
      // max 2 decimals
      const v = this.$n(value, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
      return withSuffix ? `${v} ppm` : v
    },
    /**
     * @param {any} item
     * @param {number} itemIndex
     * @param {any} scope
     */
    valuePerTotalTokens(item, itemIndex) {
      const { totals, trends } = this.ngramResult
      if (typeof trends[itemIndex] === 'undefined') return ''
      const dateIndex = this.isoDates.indexOf(item.item.time.toISOString())
      const absoluteValue = trends[itemIndex].values[dateIndex]
      const total = totals[dateIndex]

      return this.$tc('tooltipAbsoluteValue', absoluteValue, { count: absoluteValue, total })
    },
    /** @param {string} term */
    handleSuggestedTermSelected(term) {
      this['unigrams'] = this.unigrams.concat([term])
      this.$refs.embeddings.hide(true)
    }
  }
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
      "addSimilar": "add similar words"
    },
    "loading": "Loading ...",
    "tooltipValueUnit": "per 1 million",
    "downloadVisualisationData": "download data in JSON",
    "tooltipAbsoluteValue": "{count} tokens"
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
