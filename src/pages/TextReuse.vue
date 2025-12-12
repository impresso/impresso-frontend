<template>
  <i-layout>
    <i-layout-section width="400px">
      <!--  header -->
      <template v-slot:header>
        <b-tabs pills class="mx-2 pt-2">
          <template v-slot:tabs-end>
            <b-nav-item :to="{ name: 'textReuseOverview' }" class="active" active-class="none">
              <span
                v-html="
                  $tc('searchTextReuseLabel', 10000, {
                    n: $n(10000)
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
                  detail: ignoredFilters.map(f => f.type).join(', ')
                })
              "
            />
          </div>
          <search-pills
            :filters="filtersWithItems"
            @changed="handleFiltersChanged"
            :includedFilterTypes="allowedFilterTypes"
          />
          <search-input
            @submit="handleSearchInputSubmit"
            placeholder="start searching..."
          ></search-input>
        </div>
      </template>
      <template v-if="timelineValues.length">
        <FilterTimeline
          info-button-id="text-reuse-filter-year"
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
        class="py-2 mx-3"
        index="tr_passages"
        :facetType="textReuseClusterSizeFacet?.type"
        :facet-filters="allowedFilters"
        :isFiltered="allowedFilters.some(f => f.type === textReuseClusterSizeFacet.type)"
        @changed="handleFiltersChanged"
        @clicked="handleFacetFiltersClicked"
        :info-button-id="`text-reuse-filter-${textReuseClusterSizeFacet.type}`"
        value-label="textReuseClusterSizeValueLabel"
        value-as-range-label="textReuseClusterSizeValueAsRangeLabel"
        count-label="numbers.passages"
      >
        <template v-slot:description>
          <div class="mb-3">
            How to read histograms
            <InfoButton name="how-to-read-histograms" class="ml-1" />
          </div>
        </template>
      </FilterDynamicRange>
      <FilterDynamicRange
        v-for="(facet, i) in dynamicRangeFacets"
        class="py-2 mx-3"
        index="tr_passages"
        :key="`rd-${i}`"
        :facetType="facet?.type"
        :facet-filters="allowedFilters"
        :isFiltered="allowedFilters.some(f => f.type === facet.type)"
        @changed="handleFiltersChanged"
        @clicked="handleFacetFiltersClicked"
        count-label="numbers.passages"
        :isPercentage="facet.type === 'textReuseClusterLexicalOverlap'"
        :value-percentage-label="facet.type + 'ValuePercentageLabel'"
        :value-label="'test-' + facet.type + 'ValueLabel'"
        :value-as-range-label="facet.type + 'ValueAsRangeLabel'"
        :info-button-id="`text-reuse-filter-${facet.type}`"
      />

      <FilterFacet
        v-for="(facet, index) in standardFacets"
        class="border-top py-2 mx-3"
        search-index="tr_passages"
        :facet="facet"
        :key="index"
        :context-filters="allowedFilters"
        collapsible
        @changed="fs => handleFacetFiltersChanged(fs, facet.type)"
        :info-button-id="
          facet.type === 'textReuseCluster' ? 'text-reuse-filter-textReuseCluster' : null
        "
      />
    </i-layout-section>
    <router-view :filters="filters" :filtersWithItems="filtersWithItems"></router-view>
  </i-layout>
</template>
<script>
import SearchPills from '@/components/SearchPills.vue'
import SearchInput from '@/components/modules/SearchInput.vue'
import { serializeFilters, SupportedFiltersByContext } from '@/logic/filters'
import { CommonQueryParameters } from '@/router/util'
import FilterFacet from '@/components/modules/FilterFacet.vue'
import FilterDynamicRange from '@/components/modules/FilterDynamicRange.vue'
import Facet from '@/models/Facet'
import { getSearchFacetsService } from '@/services'
import FilterFactory from '@/models/FilterFactory'
import { facetToTimelineValues } from '@/logic/facets'
import FilterTimeline from '@/components/modules/FilterTimeline.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import { mapStores } from 'pinia'
import { useSelectionMonitorStore } from '@/stores/selectionMonitor'
import { Navigation } from '@/plugins/Navigation'

/**
 * @typedef {import('../models').Filter} Filter
 * @typedef {import('../models').SearchQuery} SearchQuery
 * @typedef {import('@/models').Facet} Facet
 */

const FacetTypes = [
  'textReuseCluster',
  'newspaper',
  'topic',
  'collection',
  'year',
  'country',
  // 'type',
  'language',
  'person',
  'location',
  'organisation',
  'nag',
  'textReuseClusterSize',
  'textReuseClusterLexicalOverlap',
  'textReuseClusterDayDelta'
]

export default {
  components: {
    SearchPills,
    SearchInput,
    FilterFacet,
    FilterTimeline,
    FilterDynamicRange,
    InfoButton
  },
  data: () => ({
    isLoading: false,
    facets: FacetTypes.map(type => new Facet({ type }))
  }),
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
  computed: {
    ...mapStores(useSelectionMonitorStore),
    $navigation() {
      return new Navigation(this)
    },
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
          !SupportedFiltersByContext.textReusePassages.includes(type) && type !== 'hasTextContents'
      )
    },
    standardFacets() {
      return this.facets.filter(({ type }) =>
        [
          'newspaper',
          'collection',
          'textReuseCluster',
          'topic',
          'type',
          'country',
          'language',
          'person',
          'location',
          'organisation',
          'nag'
        ].includes(type)
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
          this.timelineValues[0].t
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
          this.timelineValues[0].t
        )
        return new Date(`${y}-12-31`)
      }
      return new Date(`${this.endYear}-12-31`)
    },
    textReuseClusterSizeFacet() {
      return this.facets.find(({ type }) => type === 'textReuseClusterSize')
    },
    dynamicRangeFacets() {
      const rangeFacets = this.facets.filter(({ type }) =>
        ['textReuseClusterDayDelta', 'textReuseClusterLexicalOverlap'].includes(type)
      )
      return rangeFacets
    },
    /** @returns {{ query: any, hash: string }} */
    searchFacetApiQueryParams() {
      const query = {
        limit: 10,
        order_by: '-count',
        page: 1,
        filters: this.allowedFilters
      }
      // eslint-disable-next-line
      console.debug('[TextReuse] searchFacetApiQueryParams', query)
      return {
        query,
        hash: JSON.stringify(query).split('').sort().join('')
      }
    }
  },
  methods: {
    /** @param {Filter[]} filters */
    handleFiltersChanged(filters) {
      // eslint-disable-next-line
      console.debug('[TextReuse] handleFiltersChanged', filters)
      this.$navigation.updateQueryParameters({
        [CommonQueryParameters.SearchFilters]: serializeFilters(filters)
      })
    },
    handleFacetFiltersChanged(filters, type) {
      if (!filters.length) {
        // reset only filter by type
        this.handleFiltersChanged(this.filters.filter(({ type: t }) => t !== type))
        return
      }
      // eslint-disable-next-line
      console.debug('[TextReuse] handleFacetFiltersChanged', filters)
      // filter exists, update it
      const filterExists = this.filters.some(({ type }) => type === filters[0].type)
      if (filterExists) {
        this.handleFiltersChanged(
          this.filters.map(filter => {
            const updatedFilter = filters.find(({ type }) => type === filter.type)
            return updatedFilter || filter
          })
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
      if (filter.type === 'textReuseClusterLexicalOverlap') {
        this.selectionMonitorStore.show({
          item: {
            ...filter,
            q: [String(filter.q[0]), String(parseInt(filter.q[0], 10) + 0.999)]
          },
          searchIndex: 'tr_passages',
          type: filter.type,
          scope: 'closeUp',
          applyCurrentSearchFilters: true
        })
        return
      }
      // open selection monitor
      this.selectionMonitorStore.show({
        item: filter,
        searchIndex: 'tr_passages',
        type: filter.type,
        scope: 'closeUp',
        applyCurrentSearchFilters: true
      })
    },
    handleSearchInputSubmit({ q, appendIfExisting = false }) {
      if (q.trim().length === 0) {
        return
      }
      const stringFilter = FilterFactory.create({ type: 'string', q })
      const filterExists = this.filters.some(({ type }) => type === 'string')
      // eslint-disable-next-line
      console.debug(
        '[TextReuse] handleSearchInputSubmit \n - q:',
        q,
        '\n - appendIfExisting:',
        appendIfExisting
      )

      if (filterExists && appendIfExisting) {
        this.handleFiltersChanged(
          this.filters.map(filter => {
            if (filter.type === 'string') {
              return stringFilter
            }
            return filter
          })
        )
      } else {
        this.handleFiltersChanged([...this.filters, stringFilter])
      }
    },
    focusHandler(value) {
      this.hasFocus = !!value
    },
    loadFacets(types) {
      types.forEach(type => {
        this.loadFacet(type)
      })
      getSearchFacetsService('tr_passages')
        .find({
          query: {
            facets: types,
            ...this.searchFacetApiQueryParams.query
          }
        })
        .then(result => {
          console.debug('[TextReuse] loadFacets', result)
          result.data.forEach(result => {
            const facet = this.facets.find(facet => result.type === facet.type)
            if (facet) {
              facet.numBuckets = result.numBuckets
              facet.setBuckets(result.buckets)
            }
          })
        })
    },
    loadFacet(type, opts = {}) {
      // eslint-disable-next-line
      console.debug('[TextReuse] loadFacet', type, 'query', this.searchFacetApiQueryParams.query)
      getSearchFacetsService('tr_passages')
        .get(type, {
          query: {
            ...this.searchFacetApiQueryParams.query,
            ...opts
          }
        })

        .then(response => {
          const facet = this.facets.find(facet => facet.type === type)
          console.debug('[TextReuse] loadFacet', response)
          if (facet) {
            facet.numBuckets = response.numBuckets
            facet.setBuckets(response.buckets)
          }
        })
    }
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
        await this.loadFacet('year', { limit: 500 }) //, groupby: 'textReuseCluster' })
        await this.loadFacet('collection')

        await this.loadFacets([
          'newspaper',
          'textReuseCluster',
          'topic',
          'country',
          'language',
          'person',
          'location',
          'organisation',
          'nag'
        ])
      },
      immediate: true,
      deep: false
    }
  }
}
</script>

<i18n lang="json">
{
  "en": {
    "searchTextReuseLabel": "search text reuse passages",
    "searchTextReusePlaceholder": "search text reuse passages"
  }
}
</i18n>
