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
          <div class="mb-2" v-if="ignoredFilters.length">
            <em
              class="small"
              v-html="
                $tc('numbers.ignoredFiltersDetailed', ignoredFilters.length, {
                  n: ignoredFilters.length,
                  detail: ignoredFilters.map(f => f.type).join(', '),
                })
              "
            />
          </div>
          <search-pills
            :filters="filtersWithItems"
            @changed="handleFiltersChanged"
            :includedFilterTypes="allowedFilterTypes"
          />
          <search-input @submit="handleSearchInputSubmit" placeholder="..."></search-input>
        </div>
      </template>
      <template v-if="timelineValues.length">
        <FilterTimeline
          class="py-2 mx-3"
          :key="`t-year`"
          group-by="passages"
          disableRelativeDisplayStyle
          :facet="timelineFacets[0]"
          :facet-filters="filters"
          :values="timelineValues"
          :min-date="minDate"
          :max-date="maxDate"
          :start-year="minDate.getFullYear()"
          :end-year="maxDate.getFullYear()"
          @changed="handleFacetFiltersChanged"
        />
      </template>
      <FilterDynamicRange
        v-for="(facet, i) in dynamicRangeFacets"
        class="py-2 mx-3"
        index="tr_passages"
        :key="`rd-${i}`"
        :facet="facet"
        :facet-filters="allowedFilters"
        @changed="handleFiltersChanged"
        @clicked="handleFacetFiltersClicked"
      />
      <FilterFacet
        v-for="(facet, index) in standardFacets"
        class="border-top py-2 mx-3"
        search-index="tr_passages"
        :facet="facet"
        :key="index"
        :context-filters="allowedFilters"
        collapsible
        @changed="handleFacetFiltersChanged"
      />
    </i-layout-section>
    <router-view :filters="filters" :filtersWithItems="filtersWithItems"></router-view>
  </i-layout>
</template>
<script>
import SearchPills from '@/components/SearchPills'
import SearchInput from '@/components/modules/SearchInput'
import { serializeFilters, optimizeFilters, SupportedFiltersByContext } from '@/logic/filters'
import { CommonQueryParameters } from '@/router/util'
import FilterFacet from '@/components/modules/FilterFacet'
import FilterRange from '@/components/modules/FilterRange'
import FilterDynamicRange from '@/components/modules/FilterDynamicRange'
import Facet from '@/models/Facet'
import { searchFacets } from '@/services'
import FilterFactory from '@/models/FilterFactory'
import { facetToTimelineValues } from '@/logic/facets'
import FilterTimeline from '@/components/modules/FilterTimeline'

/**
 * @typedef {import('../models').Filter} Filter
 * @typedef {import('../models').SearchQuery} SearchQuery
 * @typedef {import('@/models').Facet} Facet
 */

const FacetTypes = [
  'newspaper',
  'topic',
  'collection',
  'year',
  'country',
  'type',
  'textReuseClusterSize',
  'textReuseClusterLexicalOverlap',
  'textReuseClusterDayDelta',
  'textReuseCluster',
]

export default {
  components: {
    SearchPills,
    SearchInput,
    FilterFacet,
    FilterRange,
    FilterTimeline,
    FilterDynamicRange,
  },
  data: () => ({
    isLoading: false,
    facets: FacetTypes.map(type => new Facet({ type })),
  }),
  props: {
    filters: {
      type: Array,
      default: () => [],
    },
    filtersWithItems: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    allowedFilters() {
      return this.filters.filter(({ type }) => SupportedFiltersByContext.textReuse.includes(type))
    },
    allowedFilterTypes() {
      // we have to remove the 'isFront' filter from the list of allowed filters, see front immplementation in searchPills
      return [...SupportedFiltersByContext.textReusePassages].filter(type => type !== 'isFront')
    },
    ignoredFilters() {
      // we exclude also `hasTextContents` as it is useless for text reuse
      return this.filters.filter(
        ({ type }) =>
          !SupportedFiltersByContext.textReusePassages.includes(type) && type !== 'hasTextContents',
      )
    },
    standardFacets() {
      return this.facets.filter(({ type }) =>
        ['newspaper', 'collection', 'textReuseCluster', 'topic', 'type', 'country'].includes(type),
      )
    },
    timelineFacets() {
      return this.facets.filter(({ type }) => type === 'year')
    },
    /** @returns {any[]} */
    timelineValues() {
      if (!this.timelineFacets.length) return []
      const yearFacet = this.timelineFacets[0]
      if (!yearFacet.buckets.length) return []
      return facetToTimelineValues(yearFacet)
    },
    /** @returns {Date} */
    minDate() {
      if (this.timelineValues.length) {
        const y = this.timelineValues.reduce(
          (min, d) => (d.t < min ? d.t : min),
          this.timelineValues[0].t,
        )
        return new Date(`${y}-01-01`)
      }
      return new Date(`${this.startYear}-01-01`)
    },
    /** @returns {Date} */
    maxDate() {
      if (this.timelineValues.length) {
        const y = this.timelineValues.reduce(
          (max, d) => (d.t > max ? d.t : max),
          this.timelineValues[0].t,
        )
        return new Date(`${y}-12-31`)
      }
      return new Date(`${this.endYear}-12-31`)
    },
    dynamicRangeFacets() {
      const rangeFacets = this.facets.filter(({ type }) =>
        [
          'textReuseClusterSize',
          'textReuseClusterDayDelta',
          'textReuseClusterLexicalOverlap',
        ].includes(type),
      )
      return rangeFacets
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
      // eslint-disable-next-line
      console.debug('[TextReuse] searchFacetApiQueryParams', query)
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
      // filter exists, update it
      const filterExists = this.filters.some(({ type }) => type === filters[0].type)
      if (filterExists) {
        this.handleFiltersChanged(
          this.filters.map(filter => {
            const updatedFilter = filters.find(({ type }) => type === filter.type)
            return updatedFilter || filter
          }),
        )
        return
      } else {
        this.handleFiltersChanged([...this.filters, ...filters])
      }
    },
    /**
     * dispatch SelectionMonitor show action to preview the filter
     * @param {Object} facet
     * @param {Object} value
     */
    handleFacetFiltersClicked(filter) {
      // open selection monitor
      this.$store.dispatch('selectionMonitor/show', {
        item: filter,
        context: 'textReuse',
        type: filter.type,
        scope: 'closeUp',
        applyCurrentSearchFilters: true,
      })
    },
    handleSearchInputSubmit({ q }) {
      if (q.trim().length === 0) {
        return
      }
      // eslint-disable-next-line
      console.debug('[TextReuse] handleSearchInputSubmit q:', q)

      const filterExists = this.filters.some(({ type }) => type === 'string')
      const stringFilter = FilterFactory.create({ type: 'string', q })
      if (filterExists) {
        this.handleFiltersChanged(
          this.filters.map(filter => {
            if (filter.type === 'string') {
              return stringFilter
            }
            return filter
          }),
        )
      } else {
        this.handleFiltersChanged([...this.filters, stringFilter])
      }
    },
    focusHandler(value) {
      this.hasFocus = !!value
    },
    loadFacet(type, opts = {}) {
      // eslint-disable-next-line
      console.debug('[TextReuse] loadFacet', type, 'query', this.searchFacetApiQueryParams.query)
      searchFacets
        .get(type, {
          query: {
            ...this.searchFacetApiQueryParams.query,
            ...opts,
          },
        })
        .then(response => {
          const facet = this.facets.find(facet => facet.type === type)
          console.debug('[TextReuse] loadFacet', response)
          if (facet) {
            facet.numBuckets = response[0].numBuckets
            facet.setBuckets(response[0].buckets)
          }
        })
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
        console.debug('[TextReuse] @searchApiQueryParameters \n query:', query)
        await this.loadFacet('newspaper')
        await this.loadFacet('year', { limit: 500 }) //, groupby: 'textReuseCluster' })
        await this.loadFacet('collection')
        await this.loadFacet('textReuseCluster')
        await this.loadFacet('topic')
        await this.loadFacet('type')
        await this.loadFacet('country')
        // await this.loadFacet('textReuseClusterSize', { groupby: 'textReuseCluster' })
        await this.loadFacet('textReuseClusterLexicalOverlap', { groupby: 'textReuseCluster' })
        // await this.loadFacet('textReuseClusterDayDelta', { groupby: 'textReuseCluster' })
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
