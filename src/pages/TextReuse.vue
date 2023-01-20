<template>
  <i-layout>
    <i-layout-section width="400px">
      <!--  header -->
      <template slot="header">
        <b-tabs pills class="mx-2 pt-2">
          <template v-slot:tabs-end>
            <b-nav-item class="active" active-class="none">
              <span
                v-html="
                  $tc('searchTextReuseLabel', 10000, {
                    n: $n(10000),
                  })
                "
              />
              <span v-if="isLoading" class=""> &mdash; {{ $t('actions.loading') }}</span>
            </b-nav-item>
          </template>
        </b-tabs>
        <div class="p-3 border-bottom bg-light">
          <search-pills :filters="filtersWithItems" @changed="handleFiltersChanged" />
          <search-input @submit="handleSearchInputSubmit" placeholder="..."></search-input>
        </div>
      </template>
      <filterRange
        v-for="(facet, index) in rangeFacets"
        class="py-2 mx-3"
        :key="`r-${index}`"
        :facet="facet"
        :facet-filters="filters"
        @changed="handleFacetFiltersChanged"
      />
      <FilterFacet
        v-for="(facet, index) in standardFacets"
        class="border-top py-2 mx-3"
        search-index="tr_passages"
        :facet="facet"
        :key="index"
        :filters="filters"
        @changed="handleFacetFiltersChanged"
      />
    </i-layout-section>
    <router-view></router-view>
  </i-layout>
</template>
<script>
import SearchPills from '@/components/SearchPills'
import SearchInput from '@/components/modules/SearchInput'
import { searchQueryGetter } from '@/logic/queryParams'
import {
  serializeFilters,
  optimizeFilters,
  SupportedFiltersByContext,
  joinFiltersWithItems,
} from '@/logic/filters'
import { CommonQueryParameters } from '@/router/util'
import FilterFacet from '@/components/modules/FilterFacet'
import FilterRange from '@/components/modules/FilterRange'
import Facet from '@/models/Facet'
import { filtersItems, searchFacets } from '@/services'

/**
 * @typedef {import('../models').Filter} Filter
 * @typedef {import('../models').SearchQuery} SearchQuery
 * @typedef {import('@/models').Facet} Facet
 */

const FacetTypes = [
  'newspaper',
  'textReuseClusterSize',
  'textReuseClusterLexicalOverlap',
  'textReuseClusterDayDelta',
]

export default {
  components: {
    SearchPills,
    SearchInput,
    FilterFacet,
    FilterRange,
  },
  data: () => ({
    isLoading: false,
    facets: FacetTypes.map(type => new Facet({ type })),
    filtersWithItems: [],
  }),
  computed: {
    searchQuery: {
      ...searchQueryGetter(),
    },
    /** @returns {Filter[]} */
    filters() {
      // filter by type
      return this.searchQuery.filters
    },
    allowedFilters() {
      return this.filters.filter(({ type }) => SupportedFiltersByContext.textReuse.includes(type))
    },
    standardFacets() {
      return this.facets.filter(({ type }) => ['newspaper'].includes(type))
    },

    rangeFacets() {
      return this.facets.filter(({ type }) =>
        [
          'textReuseClusterSize',
          'textReuseClusterLexicalOverlap',
          'textReuseClusterDayDelta',
        ].includes(type),
      )
    },
    /** @returns {{ query: any, hash: string }} */
    searchFacetApiQueryParams() {
      const query = {
        index: 'tr_passages',
        limit: 10,
        order_by: '-count',
        page: 1,
        filters: this.allowedFilters,
      }
      return {
        query,
        hash: JSON.stringify(query)
          .split('')
          .sort()
          .join(''),
      }
    },
  },
  methods: {
    /** @param {Filter[]} filters */
    handleFiltersChanged(filters) {
      // eslint-disable-next-line
      console.debug('[TextReuse] handleFiltersChanged', filters)
      this.$navigation.updateQueryParameters({
        [CommonQueryParameters.SearchFilters]: serializeFilters(optimizeFilters(filters)),
      })
    },
    handleFacetFiltersChanged(filters) {
      // eslint-disable-next-line
      console.debug('[TextReuse] handleFacetFiltersChanged', filters)
    },
    handleSearchInputSubmit(filters) {
      // eslint-disable-next-line
      console.debug('[TextReuse] handleSearchInputSubmit', filters)
    },
    focusHandler(value) {
      this.hasFocus = !!value
    },
    loadFacet(type) {
      // eslint-disable-next-line
      console.debug('[TextReuse] loadFacet', type)
      searchFacets
        .get(type, {
          query: this.searchFacetApiQueryParams.query,
        })
        .then(response => {
          // eslint-disable-next-line no-console
          console.debug('[TextReuse] loadFacet', type, response)
          const facet = this.facets.find(facet => facet.type === type)
          if (facet) {
            facet.setBuckets(response[0].buckets)
            //   facet.update(response.data)
          }
        })
    },
    async loadFilterItems() {
      const filtersWithItems = await filtersItems
        .find({ query: { filters: serializeFilters(this.filters) } })
        .then(joinFiltersWithItems)
      this.filtersWithItems = filtersWithItems
    },
  },
  mounted() {
    // eslint-disable-next-line
    console.debug('[TextReuse] @mounted')
  },
  watch: {
    searchFacetApiQueryParams: {
      async handler({ query, hash }, previousValue) {
        if (previousValue && previousValue.hash === hash) {
          return false
        }
        // eslint-disable-next-line
        console.debug('[TextReuse] @searchApiQueryParameters \n query:', query, hash, previousValue)
        await this.loadFilterItems()
        FacetTypes.forEach(type => this.loadFacet(type))
      },
      immediate: true,
      deep: false,
    },
  },
}
</script>

<i18n>
  {
    "en": {
      "searchTextReuseLabel": "search text reuse passages",
      "searchTextReusePlaceholder": "search text reuse passages"
    }
  }
  </i18n>
