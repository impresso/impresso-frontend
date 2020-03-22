<template>
  <i-layout>
    <!-- sidebar -->
    <search-sidebar width="400px"
      :filters="enrichedFilters"
      :facets="facets"
      contextTag="powerUserVis"
      @changed="handleFiltersChanged">
      <div slot="tabs"/>
      <div slot="header">
        <autocomplete v-on:submit="handleAutocompleteSubmit" />
      </div>
    </search-sidebar>

    <!-- main section -->
    <i-layout-section main>
      <div>
        <i-dropdown v-model="statsFacetModel"
                    :options="availableStatsFacets"
                    size="sm"
                    variant="outline-primary"/>
        <i-dropdown v-model="statsDomain"
                    :options="statsDomainsOptions"
                    size="sm"
                    variant="outline-primary"/>
      </div>
      <div>
        <h3>Filters</h3>
        <pre>{{JSON.stringify(filters, null, 2)}}</pre>
      </div>
      <div>
        <h3>Stats</h3>
        <pre v-if="!statsLoading">{{JSON.stringify(stats, null, 2)}}</pre>
        <spinner v-if="statsLoading"/>
      </div>
    </i-layout-section>
  </i-layout>
</template>


<script>
import { protobuf } from 'impresso-jscommons'
import SearchSidebar from '@/components/modules/SearchSidebar'
import Autocomplete from '@/components/Autocomplete'
import Spinner from '@/components/layout/Spinner'
import {
  search,
  filtersItems,
  stats
} from '@/services';
import {
  toSerializedFilters,
  toCanonicalFilter,
  optimizeFilters
} from '../logic/filters'
import { getFacetsFromApiResponse } from '../logic/facets'
import { getQueryParameter } from '@/router/util'

/**
 * @typedef {import('../models').Filter} Filter
 * @typedef {import('../models').Facet} Facet
 * @typedef {import('../models').Bucket} Bucket
 */

const DefaultSearchFacetsTypes = [
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
];
const TwoOperators = ['OR', 'AND']
const FacetsWithTwoOperators = ['person', 'location', 'topic']
const DefaultFacetOperatorsMap = FacetsWithTwoOperators
  .reduce((acc, type) => ({ ...acc, [type]: TwoOperators }), {})

const DefaultEmptyApiResponse = { info: { facets: {} } }

const QueryParameters = Object.freeze({
  SearchFilters: 'filters',
  Facet: 'facet',
  Index: 'index',
  Domain: 'domain'
})

/** @typedef {{[key: string]: string[]}} StringArrayMap */
/** @type {{[key: string]: StringArrayMap}} */
const StatsFacets = {
  search: {
    term: [
      'newspaper',
      'country',
      'type',
      'topic',
      'language',
      'person',
      'location'
    ],
    numeric: [
      'contentLength',
      'pagesCount'
    ]
  },
  tr_clusters: {
    term: ['newspaper'],
    numeric: [
      'textReuseClusterSize',
      'textReuseClusterLexicalOverlap',
      'textReuseClusterDayDelta'
    ]
  }
}

const AvailableStatsFacetsIds = Object.keys(StatsFacets).flatMap(index => {
  const facets = Object.values(StatsFacets[index]).flat()
  return facets.map(facet => {
    const key = `${index}.${facet}`
    return { value: key, text: key }
  })
})

/** @param {Filter[]} filters */
const serializeFilters = filters => toSerializedFilters(filters)
/** @param {string} serializedFilters */
const deserializeFilters = serializedFilters => protobuf.searchQuery.deserialize(serializedFilters).filters
/** @param {any} response */
const apiResponseToFacets = response => {
  const { facets: responseFacets = {} } = response.info

  const responseFacetsWithMissing = DefaultSearchFacetsTypes.reduce((acc, type) => {
    return { ...acc, [type]: responseFacets[type] || {} }
  }, {})

  return getFacetsFromApiResponse(responseFacetsWithMissing, DefaultFacetOperatorsMap)
}

export default {
  data: () => ({
    /** @type {Facet[]} */
    facets: apiResponseToFacets(DefaultEmptyApiResponse),
    /** @type {Filter[]} */
    filtersWithItems: [],
    stats: {},
    statsLoading: false,
    availableStatsFacets: AvailableStatsFacetsIds,
  }),
  methods: {
    /** @param {Filter} filter */
    handleAutocompleteSubmit(filter) {
      this.handleFiltersChanged(this.filters.concat([filter]))
    },
    /** @param {Filter[]} filters */
    handleFiltersChanged(filters) {
      this.$navigation.updateQueryParameters({
        [QueryParameters.SearchFilters]: serializeFilters(optimizeFilters(filters))
      })
    }
  },
  components: {
    SearchSidebar,
    Autocomplete,
    Spinner
  },
  computed: {
    /** @returns {Filter[]} */
    filters() {
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
    /** @return {object} */
    statsRequest() {
      const facet = this.statsFacet
      const index = this.statsIndex
      const domain = this.statsDomain
      const filters = serializeFilters(this.filters)

      return {
        facet,
        index,
        domain,
        filters
      }
    },
    /** @returns {string} */
    statsFacet() { return /** @type {string} */ (getQueryParameter(this, QueryParameters.Facet, 'contentLength')) },
    /** @returns {string} */
    statsIndex() { return /** @type {string} */ (getQueryParameter(this, QueryParameters.Index, 'search')) },
    statsFacetModel: {
      /** @returns {string} */
      get() { return `${this.statsIndex}.${this.statsFacet}` },
      /** @param {string} value */
      set(value) {
        const [index, facet] = value.split('.')
        this.$navigation.updateQueryParameters({
          [QueryParameters.Index]: index,
          [QueryParameters.Facet]: facet
        })
      }
    },
    statsDomain: {
      /** @returns {string} */
      get() {
        const value = /** @type {string} */ (getQueryParameter(this, QueryParameters.Domain, 'time'))
        const options = this.statsDomainsOptions.map(({ value }) => value)
        if (!options.includes(value)) {
          // Reset stats domain if the value is no longer in the options
          // due to changed facet
          this.$navigation.updateQueryParameters({
            [QueryParameters.Domain]: undefined
          })
          return 'time'
        }
        return value
      },
      /** @param {string} value */
      set(value) {
        this.$navigation.updateQueryParameters({
          [QueryParameters.Domain]: value
        })
      }
    },
    /** @returns {{ value: string, text: string }[]} */
    statsDomainsOptions() {
      const options = (StatsFacets[this.statsIndex].term || [])
        .map(key => ({ value: key, text: key }))
      return [{ value: 'time', text: 'time' }].concat(options)
    }
  },
  watch: {
    filters: {
      /** @param {Filter[]} filters */
      async handler(filters) {
        const query = {
          filters: filters.map(toCanonicalFilter),
          limit: 0,
          facets: DefaultSearchFacetsTypes,
          group_by: 'articles',
        }
        const [
          facets,
          filtersWithItemsResponse,
        ] = await Promise.all([
          search.find({ query }).then(apiResponseToFacets),
          filtersItems.find({ query: { filters: serializeFilters(filters) }})
        ])
        this.facets = facets
        this.filtersWithItems = filtersWithItemsResponse.filtersWithItems
          .map((/** @type {{ filter: Filter, items: any[] }} */ { filter, items }) => ({ ...filter, items }))
      },
      immediate: true
    },
    statsRequest: {
      async handler(query) {
        try {
          this.statsLoading = true
          this.stats = await stats.find({ query })
        } finally {
          this.statsLoading = false
        }
      },
      immediate: true
    }
  }
}
</script>
