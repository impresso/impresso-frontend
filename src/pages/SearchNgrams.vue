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
    <b-form-group class="mx-3">
      <b-form-checkbox v-model="isFront" switch v-bind:value="true">
        {{$t('label.isFront')}}
      </b-form-checkbox>
    </b-form-group>
  </search-sidebar>
    <!-- main section -->
    <i-layout-section main>
      <div slot="header">
      <b-navbar class="d-flex p-0 border-bottom align-items-center">
        <b-navbar-nav class="border-right flex-grow-1 px-2 pl-3 py-2 ">
          <section class="search-results-summary text-serif textbox-fancy border-tertiary">
            <label>ngrams viewer</label>
            <ellipsis v-bind:initialHeight="60">
              <span v-for="trend in trends"
                    :key="trend.ngram"
                    v-html="$tc('numbers.unigramMentions', trend.total || 0, { unigram: trend.ngram, n: $n(trend.total) })"/>
              <span v-if="trends.length === 0"
                    v-html="$t('label.noUnigram')" />
              &nbsp;
              <span v-html="$tc('numbers.articles', totalArticlesCount, { n: $n(totalArticlesCount) })" />
              &nbsp;
              <search-query-summary class="d-inline" :search-query="{ filters: enrichedFilters }"/>
            </ellipsis>

          </section>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto px-2">
          <router-link
            :disabled="trends.length === 0"
            class="btn btn-outline-primary btn-sm"
            :to="searchPageLink">
            {{ $t('label.seeArticles') }}
          </router-link>
        </b-navbar-nav>
      </b-navbar>
      <b-navbar class="border-bottom">
        <span style="white-space:nowrap" class="mr-3">Enter unigram
          <info-button name="what-are-ngram" />
        </span>
        <b-input-group>
          <b-form-tags
            v-model="unigrams"
            :disabled="isLoading"
            separator=" ,;"
            :placeholder="unigrams.length === 0 ? 'search unigrams ...' : ''"
            class="mb-2"/>
        </b-input-group>
      </b-navbar>
    </div>
    <div class="m-3" v-if="unigrams.length > 0" :style="{ position: isLoading ? 'relative' : undefined }">
      <base-title-bar class="my-3">
        <span v-html="$t('label.timeline.unigramTitle')"/>
        <div slot="description">
        {{$t('label.timeline.unigramDescription')}}
        </div>
      </base-title-bar>
      <multi-line-plot
        :items-sets="plotItems"
        :round-value-fn="roundValueForDisplay"
        :height="300">
        <div slot-scope="tooltipScope">
          <div>
            <div>{{ $d(getTooltipScopeTime(tooltipScope), timelineResolution, 'en') }} &middot;</div>
            <div v-for="(item, index) in tooltipScope.tooltip.item.items" :key="item.label">
              <div :style="{ 'background-color': tooltipScope.tooltip.item.colors[index] }" class="legend-dot mr-1"></div>
              <b>{{item.label}}</b>
              &middot;
              {{roundValueForDisplay(item.item.value)}} {{$t('tooltipValueUnit')}}
            </div>
          </div>
        </div>
      </multi-line-plot>
      <div class="loading-overlay" v-if="isLoading"><em>{{ $t('loading') }}</em></div>
      <div class="text-right mt-5 mr-3">
        <a class="btn btn-outline-primary btn-sm" download="unigrams.json" :href="plotItemsData" target="_blank">
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
import {
  serializeFilters,
  optimizeFilters,
  toCanonicalFilter,
  joinFiltersWithItems
} from '@/logic/filters'
import {
  searchQueryGetter,
  searchQuerySetter,
} from '@/logic/queryParams'
import SearchSidebar from '@/components/modules/SearchSidebar';
import BaseTitleBar from '@/components/base/BaseTitleBar';
import SearchQuerySummary from '@/components/modules/SearchQuerySummary';
import MultiLinePlot from '@/components/modules/vis/MultiLinePlot'
import Ellipsis from '@/components/modules/Ellipsis';
import InfoButton from '@/components/base/InfoButton';
import {
  filtersItems as filtersItemsService,
  search as searchService,
  ngramTrends as ngramTrendsService
} from '@/services';
import {
  DefaultFacetTypesForIndex,
  searchResponseToFacetsExtractor,
  buildEmptyFacets
} from '@/logic/facets'
import { CommonQueryParameters } from '@/router/util';
import FilterFactory from '@/models/FilterFactory';
import SearchQuery from '@/models/SearchQuery';

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
  // 'collection',
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
];

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
  const yearFacetsWithBuckets = facets
    .filter(({ buckets, type }) => buckets != null && buckets.length > 0 && type === 'year')
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
  },
  data: () => ({
    /** @type {Facet[]} */
    facets: [],
    /** @type {Filter[]} */
    filtersWithItems: [],
    /** @type {any} */
    ngramResult: EmptyNgramResult,
    isLoading: false
  }),
  mounted() {
    this.facets = buildEmptyFacets(SupportedFacetTypes)
  },
  watch: {
    fullFilters: {
      /** @param {Filter[]} filters */
      async handler(filters) {
        const query = {
          filters: filters.map(toCanonicalFilter),
          limit: 0,
          facets: SupportedFacetTypes,
          group_by: 'articles',
        }

        const [facets, filtersWithItems] = await Promise.all([
          searchService.find({ query }).then(searchResponseToFacetsExtractor(SupportedFacetTypes)),
          filtersItemsService.find({ query: { filters: serializeFilters(filters) }}).then(joinFiltersWithItems)
        ]);
        this.facets = facets
        this.filtersWithItems = filtersWithItems.filter(({ type }) => AllowedFilterTypes.includes(type))
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
            this.ngramResult = await ngramTrendsService.create(query);
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
    searchQuery: {
      ...searchQueryGetter(),
      ...searchQuerySetter(),
    },
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
    /** @returns {Filter[]} */
    enrichedFilters() {
      return this.filtersWithItems != null
        ? this.filtersWithItems
        : this.filters
    },
    /** @returns {Filter[]} */
    ignoredFilters() {
      return this.searchQuery.filters
        .filter(({ type }) => !AllowedFilterTypes.includes(type))
    },
    /** @returns {Filter[]} */
    filters() {
      return this.searchQuery.filters
        .filter(({ type }) => AllowedFilterTypes.includes(type))
        // add implicit filters
        .concat([
          FilterFactory.create({ type: 'hasTextContents' }),
        ]);
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
      return this.filters.concat(this.unigrams.length > 0 ? [stringFilter] : [])
    },
    isFront: {
      /** @returns {boolean} */
      get() { return this.filters.filter(isFrontFilter).length > 0 },
      /** @param {boolean} isFront */
      set(isFront) {
        const newFilters = isFront
          ? this.filters.filter(f => !isFrontFilter(f)).concat([{ type: 'isFront' }])
          : this.filters.filter(f => !isFrontFilter(f))
        this.handleFiltersChanged(newFilters)
      },
    },
    /** @returns {{ ngram: string, values: number[], total: number }[]} */
    trends() { return this.ngramResult.trends },
    /** @returns {number} */
    totalArticlesCount() { return getTotalNumberOfResults(this.facets) },
    /** @returns {{ name: string, query: any }} */
    searchPageLink() {
      const stringFilter = {
        type: 'string',
        precision: 'exact',
        op: 'OR',
        q: this.trends.map(({ ngram }) => ngram),
      }
      const filters = this.filters.concat([ stringFilter ])
      // const query = { f: JSON.stringify(filters) }
      console.info('sending filters', filters);
      return { name: 'search', query: { sq: serializeFilters(filters) }}
    },
    /** @returns {{ ngrams: string[], filters: Filter[] }} */
    unigramsQueryParameters() {
      return {
        ngrams: this.unigrams,
        filters: this.filters.map((d) => d.getQuery()),
      };
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
            value: (value / totals[index]) * 1000000 ,
            time: dates[index]
          }))
        }
      })
    },
    plotItemsData() {
      const { domainValues, totals } = this.ngramResult
      const data = this.ngramResult.trends.map(({ ngram, values }) => ({
        label: ngram,
        items: values.map((value, index) => ({
          value,
          total: totals[index],
          ppm: (value / totals[index]) * 1000000,
          date: domainValues[index],
        }))
      }));
      const jsonStr = JSON.stringify({
        url: window.location.href,
        filters: this.filters.map((d) => d.getQuery()),
        exportDate: new Date(),
        data,
      });
      return `data:text/plain;charset=utf-8,${encodeURIComponent(jsonStr)}`;
    },
    /** @returns {string} */
    timelineResolution() { return this.ngramResult.timeInterval }
  },
  methods: {
    /** @param {Filter[]} filters */
    handleFiltersChanged(filters) {
      this.searchQuery = new SearchQuery({
        filters: optimizeFilters(filters).concat(this.ignoredFilters),
      });
    },
    /** @returns {Date} */
    getTooltipScopeTime(scope) {
      const times = [...new Set(scope?.tooltip?.item?.items.map(({ item: { time } }) => time))]
      if (times.length > 1) console.warn(`More than one time found in tooltip data. Using first time`, times)
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
    /** @param {number} value */
    roundValueForDisplay(value) { return this.$n(value, { notation: 'short' }) }
  }
};
</script>

<i18n>
  {
    "en": {
      "tabs": {
        "text": "search articles",
        "images": "search images",
        "ngrams": "ngrams"
      },
      "missingUnigram": " ... (no unigram has been selected)",
      "label": {
        "timeline": {
          "unigramTitle": "Yearly unigram mentions (per million)",
          "unigramDescription": " "
        },
        "seeArticles": "See articles",
        "noUnigram": "... look for a specific <em>unigram</em> in",
        "availableFacets": "Available filters for ngram analysis"
      },
      "loading": "Loading ...",
      "tooltipValueUnit": "per 1 million",
      "downloadVisualisationData": "download data in JSON"
    }
  }
</i18n>

<style lang="scss">
  @import "impresso-theme/src/scss/variables.sass";

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
</style>