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
        <h3>Filters</h3>
        <pre>
          {{JSON.stringify(filters, null, 2)}}
        </pre>
      </div>
    </i-layout-section>
  </i-layout>
</template>


<script>
import { protobuf } from 'impresso-jscommons'
import SearchSidebar from '@/components/modules/SearchSidebar'
import Autocomplete from '@/components/Autocomplete'
import { search, filtersItems } from '@/services';
import { toSerializedFilters, toCanonicalFilter } from '../logic/filters'
import { getFacetsFromApiResponse } from '../logic/facets'

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

const DefaultEmptyApiResponse = {
  info: {
    facets: DefaultSearchFacetsTypes.reduce((acc, type) => ({ ...acc, [type]: {} }), {})
  }
}


const QueryParameters = Object.freeze({
  SearchFilters: 'filters'
})

/** @param {Filter[]} filters */
const serializeFilters = filters => toSerializedFilters(filters)
/** @param {string} serializedFilters */
const deserializeFilters = serializedFilters => protobuf.searchQuery.deserialize(serializedFilters).filters
/** @param {any} response */
const apiResponseToFacets = response => getFacetsFromApiResponse(response, DefaultFacetOperatorsMap)

export default {
  data: () => ({
    /** @type {Facet[]} */
    facets: apiResponseToFacets(DefaultEmptyApiResponse),
    /** @type {Filter[]} */
    filtersWithItems: []
  }),
  methods: {
    /** @param {Filter} filter */
    handleAutocompleteSubmit(filter) {
      this.handleFiltersChanged(this.filters.concat([filter]))
    },
    /** @param {Filter[]} filters */
    handleFiltersChanged(filters) {
      this.$navigation.updateQueryParameters({
        [QueryParameters.SearchFilters]: serializeFilters(filters)
      })
    }
  },
  components: {
    SearchSidebar,
    Autocomplete
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
    }
  }
}
</script>
