<template>
  <i-layout id="SearchNgramsPage">
    <!-- sidebar (contains i-layout-section) -->
    <search-sidebar
      :filters="enrichedFilters"
      :ignored-filters="ignoredFilters"
      :facets="facets"
      contextTag="searchNgrams"
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
        <span style="white-space:nowrap" class="mr-3">Enter unigram</span>
        <search-input
          @submit="handleUnigramsSubmitted"
          placeholder="search unigrams ..."
          :initial="unigrams.join(' ')">
        </search-input>
      </b-navbar>
    </div>
    <div class="m-3" v-if="trends.length > 0">
      <base-title-bar class="my-3">
        <span v-html="$t('label.timeline.unigramTitle')"/>
        <div slot="description">
        {{$t('label.timeline.unigramDescription')}}
        </div>
      </base-title-bar>
      <multi-line-plot
        :items-sets="plotItems"
        height="300px">
        <!-- <div slot-scope="tooltipScope">
          <div v-if="tooltipScope.tooltip.item">
            {{ $d(tooltipScope.tooltip.item.t, timelineResolution, 'en') }} &middot;
            <span v-html="$tc('numbers.unigramMentions', tooltipScope.tooltip.item.w, {
              unigram,
              n: $n(tooltipScope.tooltip.item.w),
            })"/>&nbsp;
            <span v-html="$tc('numbers.articles', getArticlesInYear(tooltipScope.tooltip.item.t), {
                n: getArticlesInYear(tooltipScope.tooltip.item.t),
            })"></span>
          </div>
        </div> -->
      </multi-line-plot>
    </div>
    <!-- without unigram -->
    <div v-else class="d-flex align-items-center justify-content-center h-100">
      <em v-html="$t('missingUnigram')"></em>
    </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
import { protobuf } from 'impresso-jscommons'
import { toSerializedFilters, toCanonicalFilter } from '../logic/filters'

import SearchSidebar from '@/components/modules/SearchSidebar';
import BaseTitleBar from '@/components/base/BaseTitleBar';
import SearchQuerySummary from '@/components/modules/SearchQuerySummary';
import SearchInput from '@/components/modules/SearchInput';
import MultiLinePlot from '@/components/modules/vis/MultiLinePlot'
import Ellipsis from '@/components/modules/Ellipsis';
import {
  filtersItems as filtersItemsService,
  search as searchService,
  ngramTrends as ngramTrendsService
} from '@/services';
import { getFacetsFromApiResponse } from '@/logic/facets'

/**
 * @typedef {import('../models').Filter} Filter
 * @typedef {import('../models').Facet} Facet
 * @typedef {import('../models').Bucket} Bucket
 */

// /** @param {Filter[]} filters */
const serializeFilters = filters => toSerializedFilters(filters)
/** @param {string} serializedFilters */
const deserializeFilters = serializedFilters => protobuf.searchQuery.deserialize(serializedFilters).filters

/**
 * @param {Filter} filter
 * @returns {boolean}
 */
const isFrontFilter = ({ type }) => type === 'isFront'

const QueryParameters = Object.freeze({
  SearchFilters: 'filters',
  Unigrams: 'unigrams'
})

const IgnoredFilterTypes = ['string', 'regex']
const SupportedFacetTypes = [
  'language',
  'newspaper',
  'type',
  'country',
  'topic',
  'collection',
  'accessRight',
  'partner',
  'person',
  'location',
  'year'
]

const TwoOperators = ['OR', 'AND']
const FacetsWithTwoOperators = ['person', 'location', 'topic']
const DefaultFacetOperatorsMap = FacetsWithTwoOperators
  .reduce((acc, type) => ({ ...acc, [type]: TwoOperators }), {})

/**
 * @param {string[]} facetTypes
 * @returns {(any) => Facet[]}
 */
const apiResponseToFacetsFactory = facetTypes => response => {
  const { facets: responseFacets = {} } = response.info

  const responseFacetsWithMissingTypes = facetTypes.reduce((acc, type) => {
    return { ...acc, [type]: responseFacets[type] || {} }
  }, {})

  return getFacetsFromApiResponse(
    responseFacetsWithMissingTypes,
    DefaultFacetOperatorsMap
  )
}

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

const EmptyNgramResult = Object.freeze({
  trends: [],
  domainValues: [],
  timeInterval: 'year'
})

export default {
  name: 'SearchNgramsPage',
  components: {
    SearchInput,
    MultiLinePlot,
    SearchQuerySummary,
    Ellipsis,
    BaseTitleBar,
    SearchSidebar,
  },
  data: () => ({
    /** @type {Facet[]} */
    facets: [],
    /** @type {Filter[]} */
    filtersWithItems: [],
    /** @type {any} */
    ngramResult: EmptyNgramResult
  }),
  watch: {
    filters: {
      /** @param {Filter[]} filters */
      async handler(filters) {
        const query = {
          filters: filters.map(toCanonicalFilter),
          limit: 0,
          facets: SupportedFacetTypes,
          group_by: 'articles',
        }

        const [
          facets,
          { filtersWithItems: items },
        ] = await Promise.all([
          searchService.find({ query }).then(apiResponseToFacetsFactory(SupportedFacetTypes)),
          filtersItemsService.find({ query: { filters: serializeFilters(filters) }})
        ])

        this.facets = facets
        const filtersWithItems = items.map((/** @type {{ filter: Filter, items: any[] }} */ { filter, items }) => ({ ...filter, items }))
        this.filtersWithItems = /** @type {Filter[]} */ (filtersWithItems)
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
          this.ngramResult = await ngramTrendsService.create(query);
        }
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    /** @returns {string[]} */
    unigrams() {
      const value = this.$route.query[QueryParameters.Unigrams]
      let serializedUnigrams = ''
      if (typeof value === 'string') serializedUnigrams = value
      if (Array.isArray(value)) serializedUnigrams = value.join(',')
      return serializedUnigrams.split(',').filter(v => v !== '')
    },
    /** @returns {Filter[]} */
    allFilters() {
      const serializedFilters = this.$route.query[QueryParameters.SearchFilters]
      return serializedFilters
        ? deserializeFilters(/** @type {string} */ (serializedFilters))
        : []
    },
    /** @returns {Filter[]} */
    enrichedFilters() {
      return this.filtersWithItems != null
        ? this.filtersWithItems
        : this.filters
    },
    /** @returns {Filter[]} */
    ignoredFilters() { return this.allFilters.filter(({ type }) => IgnoredFilterTypes.includes(type)) },
    /** @returns {Filter[]} */
    filters() { return this.allFilters.filter(({ type }) => !IgnoredFilterTypes.includes(type)) },
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
        op: 'AND',
        q: this.trends.map(({ ngram }) => ngram),
      }
      const filters = this.filters.concat([stringFilter])
      const query = { f: JSON.stringify(filters) }
      return { name: 'search', query }
    },
    /** @returns {{ ngrams: string[], filters: Filter[] }} */
    unigramsQueryParameters() {
      return {
        ngrams: this.unigrams,
        filters: this.filters
      }
    },
    /**
     * @typedef {{ value: number, time: Date }} Item
     * @typedef {{ items: Item[], label: string }} ItemsSet
     * @returns {ItemsSet[]}
     */
    plotItems() {
      const { domainValues } = this.ngramResult
      const dates = domainValues.map(v => new Date(v))

      return this.ngramResult.trends.map(({ ngram, values }) => {
        return {
          label: ngram,
          items: values.map((value, index) => ({ value, time: dates[index] }))
        }
      })
    }

    // timelineValues() {
    //   const pairs = (this.trend.values || []).map((value, idx) => {
    //     const domainValue = this.trend.domain[idx];
    //     return [domainValue, value];
    //   });
    //   const v = pairs
    //     .map(([d, val]) => ({ t: new Date(d), w: val }));
    //   return Helpers.timeline.addEmptyIntervals(v, this.trend.timeInterval).sort((a, b) => a.t - b.t);
    // },
    // trend() {
    //   return this.$store.state.searchNgrams.trend;
    // },
    // trendBackground() {
    //   return this.$store.state.searchNgrams.trendBackground;
    // },
    // unigram() {
    //   return this.$store.state.searchNgrams.unigram;
    // },
    // searchQuery() {
    //   return this.$store.state.searchNgrams.search;
    // },
    // filters() {
    //   return this.searchQuery.filters;
    // },
    // filtersAvailable() {
    //   // this is here because we need all filters to return how many filters have been removed...
    //   return this.filters.filter(d => !this.excludedTypes.includes(d.type));
    // },
    // isFront: {
    //   get() {
    //     return this.filters.filter(d => d.type === 'isFront').length > 0;
    //   },
    //   set(val) {
    //     if (val) {
    //       this.onAddFilter({ type: 'isFront' });
    //     } else {
    //       this.onFilterReset('isFront');
    //     }
    //   },
    // },
    // facets() {
    //   const ignoreFacets = window.impressoDataVersion > 1
    //     ? []
    //     : ['accessRight', 'partner'];
    //   return this.$store.state.searchNgrams.facets
    //     .filter(d => !ignoreFacets.includes(d.type))
    //     .map((d) => {
    //       d.isFiltered = this.$store.state.searchNgrams.search.filtersIndex[d.type];
    //       return d;
    //     })
    //     // .sort((a, b) => {
    //     //   const indexA = this.facetsOrder.indexOf(a.type);
    //     //   const indexB = this.facetsOrder.indexOf(b.type);
    //     //   return indexA - indexB;
    //     // });
    // },
    // allowedFilters() {
    //   return this.filters.filter(d => !this.excludedTypes.includes(d.type));
    // },
    // timelineResolution() {
    //   return this.trend.timeInterval;
    // },
    // searchPageLink() {
    //   const filters = [...this.allowedFilters, {
    //     type: 'string',
    //     precision: 'exact',
    //     q: this.unigram,
    //   }];
    //   const query = {
    //     f: JSON.stringify(filters),
    //   };
    //   return { name: 'search', query };
    // },
  },
  methods: {
    /** @param {Filter[]} filters */
    handleFiltersChanged(filters) {
      this.$navigation.updateQueryParameters({
        [QueryParameters.SearchFilters]: serializeFilters(filters)
      })
    },
    /** @param {{ q: string }} value */
    handleUnigramsSubmitted({ q }) {
      const unigrams = q.split(/\s/).map(v => v.trim()).filter(v => v !== '')

      this.$navigation.updateQueryParameters({
        [QueryParameters.Unigrams]: unigrams.join(',')
      })
    },
    // getArticlesInYear(d) {
    //   if (!d) {
    //     return 0;
    //   }
    //   const y = d.getFullYear();
    //   return this.trendBackground.values[y] || 0;
    // },
    // executeSearch() {
    //   this.$store.dispatch('searchNgrams/PULL_SEARCH_PARAMS', this.$route.query);
    // },
    // onNgramsSubmitted({ q }) {
    //   this.$store.commit('searchNgrams/SET_UNIGRAM', q);
    //   this.$store.dispatch('searchNgrams/PUSH_SEARCH_PARAMS');
    // },
    // handleFiltersChanged(filters) {
    //   this.$store.dispatch('searchNgrams/UPDATE_SEARCH_QUERY_FILTERS', filters)
    //   this.$store.dispatch('searchNgrams/PUSH_SEARCH_PARAMS');
    // },
    // onAddFilter(facet) {
    //   this.$store.commit('searchNgrams/ADD_FILTER', facet);
    //   this.$store.dispatch('searchNgrams/PUSH_SEARCH_PARAMS');
    // },
    // onFilterUpdated(filter) {
    //   this.$store.commit('searchNgrams/UPDATE_FILTER', filter);
    //   this.$store.dispatch('searchNgrams/PUSH_SEARCH_PARAMS');
    // },
    // onFilterReset(type) {
    //   this.$store.commit('searchNgrams/RESET_FILTER', type);
    //   this.$store.dispatch('searchNgrams/PUSH_SEARCH_PARAMS');
    // },
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
          "unigramTitle": "Number of unigram mentions per year",
          "unigramDescription": " "
        },
        "seeArticles": "See articles",
        "noUnigram": "... look for a specific <em>unigram</em> in",
        "availableFacets": "Available filters for ngram analysis"
      }
    }
  }
</i18n>

<style lang="scss">
  @import "impresso-theme/src/scss/variables.sass";
</style>
