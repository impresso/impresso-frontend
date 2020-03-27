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
      <div class="d-flex flex-column">
        <spinner v-if="statsLoading"/>

        <!-- 1. selectors -->
        <div class="d-flex flex-row">
          <i-dropdown v-model="statsFacetModel"
                      :options="availableStatsFacets"
                      size="sm"
                      variant="outline-primary"/>
          <i-dropdown v-model="statsDomain"
                      :options="statsDomainsOptions"
                      size="sm"
                      variant="outline-primary"/>
        </div>

        <!-- 2. chart -->
        <div
          ref="chart"
          :style="`height: ${chartHeightString};`"/>

        <!-- 3. items -->
        <div class="d-flex flex-column ml-2 flex-wrap">
          <b-form-checkbox
            v-for="item in statsLegendItems"
            :key="item.id"
            :checked="selectedItems[item.id]"
            @input="v => handleItemChanged(item.id, v)">
            <div class="pl-1 pr-1 d-flex"
                :style="{
                  'background-color': item.color.length > 7 ? item.color : `${item.color}77`
                }">
              {{ item.label }}
            </div>
          </b-form-checkbox>
        </div>
      </div>
    </i-layout-section>
  </i-layout>
</template>


<script>
import { protobuf } from 'impresso-jscommons'
import { schemeCategory10, schemeAccent } from 'd3'

import SearchSidebar from '@/components/modules/SearchSidebar'
import Autocomplete from '@/components/Autocomplete'
import Spinner from '@/components/layout/Spinner'
import LineChart from '@/d3-modules/LineChart'
import CategoricalMultiValueBarChart from '@/d3-modules/CategoricalMultiValueBarChart'
import CategoricalCircleChart from '@/d3-modules/CategoricalCircleChart'

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
import { getFacetsFromApiResponse } from '@/logic/facets'
import { getQueryParameter } from '@/router/util'
import { withMissingDates } from '@/logic/time'

/**
 * @param {number} index
 * @returns {string} hex color string
 */
export function colorForLineMetric(index) {
  if (index < 0) return '#ffffffff'
  return schemeCategory10[index % schemeCategory10.length]
}

/**
 * @param {number} index
 * @returns {string} hex color string
 */
export function colorForAreaMetric(index) {
  if (index < 0) return '#ffffffff'
  return `${schemeAccent[index % schemeAccent.length]}33`
}

/**
 * @typedef {import('../models').Filter} Filter
 * @typedef {import('../models').Facet} Facet
 * @typedef {import('../models').Bucket} Bucket
 */

const DefaultNumberOfItemsInChart = 10

const FacetTypes = {
  search: [
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
  ],
  tr_clusters: [
    'newspaper',
  ],
  tr_passages: [
    'newspaper',
  ]
}

const NoFacetFilters = {
  search: ['string'],
  tr_clusters: [],
  tr_passages: []
}

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
    ],
    temporal: ['time']
  },
  tr_clusters: {
    term: ['newspaper'],
    numeric: [
      'textReuseClusterSize',
      'textReuseClusterLexicalOverlap',
      'textReuseClusterDayDelta'
    ],
    temporal: []
  },
  tr_passages: {
    term: ['newspaper'],
    numeric: [
      'textReuseClusterSize',
      'textReuseClusterLexicalOverlap',
      'textReuseClusterDayDelta'
    ],
    temporal: ['time']
  }
}


/** @returns {typeof LineChart | typeof CategoricalCircleChart | typeof CategoricalMultiValueBarChart} */
const getChartClass = (domain, facetType) => {
  if (domain === 'time') {
    return LineChart
  }
  if (facetType === 'term') return CategoricalCircleChart
  return CategoricalMultiValueBarChart
}

const colorInLegendEnabled = (domain, facetType) => {
  if (domain !== 'time' && facetType === 'term') return false
  return true
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
 * @typedef {{ id: string, extractor: (any) => number }} LineMetricExtractor
 * @typedef {{ id: string, extractor: (any) => [number, number] }} AreaMetricExtractor
 */

/**
 * @param {string} metric
 * @return {LineMetricExtractor}
 */
const lineMetricExtractorFactory = metric => ({ id: metric, extractor: value => (value || {})[metric] })

/**
 * @param {string} metric
 * @return {AreaMetricExtractor}
 */
const stdAreaMetricExtractorFactory = metric => ({
  id: metric,
  extractor: value => {
    const { mean, stddev } = value || {}
    return [mean - stddev, mean + stddev]
  }
})

/**
 * @param {string} metric
 * @return {LineMetricExtractor}
 */
const itemCountLineMetricExtractorFactory = metric => ({
  id: metric,
  extractor: value => {
    const { items = [] } = value
    const item = items.find(({ term }) => term === metric)
    return item ? item.count : undefined
  }
})

/** @type {{[facetType: string] : {line: (any) => LineMetricExtractor[], area: (any) => AreaMetricExtractor[]}}} */
const MetricsByFacetType = {
  numeric: {
    /** @return {LineMetricExtractor[]} */
    line: () => [
      lineMetricExtractorFactory('min'),
      lineMetricExtractorFactory('max'),
      lineMetricExtractorFactory('mean'),
      lineMetricExtractorFactory('p99_7')
    ],
    /** @return {AreaMetricExtractor[]} */
    area: () => [
      stdAreaMetricExtractorFactory('onesigma')
    ]
  },
  term: {
    /** @return {LineMetricExtractor[]} */
    line: response => {
      const itemsIds = Object.keys(response.itemsDictionary)
      return itemsIds.map(itemCountLineMetricExtractorFactory)
    },
    /** @return {AreaMetricExtractor[]} */
    area: () => []
  }
}

export default {
  data: () => ({
    /** @type {Facet[]} */
    facets: [],
    /** @type {Filter[]} */
    filtersWithItems: [],
    stats: {},
    statsLoading: false,
    availableStatsFacets: AvailableStatsFacetsIds,
    /** @type {LineChart | CategoricalMultiValueBarChart | CategoricalCircleChart | undefined} */
    chart: undefined,
    /** @type {{[key: number]: boolean}} */
    selectedItems: {}
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
    },
    /**
     * @param {string} id
     * @param {boolean} value
     */
    handleItemChanged(id, value) {
      this.$set(this.selectedItems, id, value)
    }
  },
  components: {
    SearchSidebar,
    Autocomplete,
    Spinner
  },
  mounted() {
    this.facets = apiResponseToFacetsFactory(this.facetTypes)(DefaultEmptyApiResponse)
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
    /** @returns {string[]} */
    facetTypes() {
      return FacetTypes[this.statsIndex]
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
        const supportedFilters = this.filters.filter(({ type }) => FacetTypes[index].includes(type) || NoFacetFilters[index].includes(type))

        this.$navigation.updateQueryParameters({
          [QueryParameters.Index]: index,
          [QueryParameters.Facet]: facet,
          // when index is changed, some filters may need to be removed
          // because they are not supported in the new filter anymore
          [QueryParameters.SearchFilters]: serializeFilters(optimizeFilters(supportedFilters))
        })
      }
    },
    statsDomain: {
      /** @returns {string} */
      get() {
        const value = /** @type {string} */ (getQueryParameter(this, QueryParameters.Domain, 'time'))
        const options = this.statsDomainsOptions.map(({ value }) => value)
        if (!options.includes(value)) return options[0]
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
      const temporalOptions = (StatsFacets[this.statsIndex].temporal || [])
        .map(key => ({ value: key, text: key }))
      return temporalOptions.concat(options)
    },
    /** @return {string} */
    chartHeightString() {
      // @ts-ignore
      return `${0.5 * window.innerHeight}px`
    },
    /** @return {{ id: string, label: string | undefined, color: string }[]} */
    statsLegendItems() {
      if (this.chart == null) return []
      const { meta, itemsDictionary = {} } = this.stats
      if (meta == null) return []

      const isColorEnabled = colorInLegendEnabled(meta.domain, meta.facetType)

      const metrics = MetricsByFacetType[meta.facetType]

      const lineItems = metrics.line(this.stats).map(({ id }, index) => {
        return {
          id,
          label: itemsDictionary[id] || this.$t(`legendLabels.${id}`),
          color: isColorEnabled ? colorForLineMetric(index) : '#ffffff'
        }
      })

      const areaItems = metrics.area(this.stats).map(({ id }, index) => {
        return {
          id,
          label: itemsDictionary[id] || this.$t(`legendLabels.${id}`),
          color: isColorEnabled ? colorForAreaMetric(index + lineItems.length) : '#ffffff'
        }
      })

      return lineItems.concat(areaItems)
    },
    /**
     * @returns {{ stats: any, lineMetrics: LineMetricExtractor[], areaMetrics: AreaMetricExtractor[] }}
     */
    chartData() {
      const { meta } = this.stats
      if (meta == null) return { stats, lineMetrics: [], areaMetrics: [] }

      const metrics = MetricsByFacetType[meta.facetType]
      const lineMetrics = metrics.line(this.stats)
      const areaMetrics = metrics.area(this.stats)

      const filteredLineMetrics = lineMetrics.filter(metric => this.selectedItems[metric.id])
      const filteredAreaMetrics = areaMetrics.filter(metric => this.selectedItems[metric.id])

      return {
        stats: this.stats,
        lineMetrics: filteredLineMetrics,
        areaMetrics: filteredAreaMetrics
      }
    },
    /** @returns {{[key: string]: string}} */
    colorPalette() {
      const { meta } = this.stats
      if (meta == null) return {}

      const metrics = MetricsByFacetType[meta.facetType]
      const lineMetrics = metrics.line(this.stats)
      const areaMetrics = metrics.area(this.stats)

      const getId = ({ id }) => id
      const paletteReducer = (fn, base = 0) => (acc, id, index) => ({ ...acc, [id]: fn(base + index)})

      const linePalette = lineMetrics.map(getId).reduce(paletteReducer(colorForLineMetric), {})
      const areaPalette = areaMetrics.map(getId).reduce(paletteReducer(colorForAreaMetric, lineMetrics.length), {})

      return { ...linePalette, ...areaPalette }
    }
  },
  watch: {
    filters: {
      /** @param {Filter[]} filters */
      async handler(filters) {
        const query = {
          filters: filters.map(toCanonicalFilter),
          limit: 0,
          facets: this.facetTypes,
          group_by: 'articles',
        }
        const [
          facets,
          filtersWithItemsResponse,
        ] = await Promise.all([
          search.find({ query }).then(apiResponseToFacetsFactory(this.facetTypes)),
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
    },
    chartData({ stats, lineMetrics, areaMetrics }) {
      const { meta, items: statsItems, itemsDictionary } = stats
      if (meta == null) return

      const ChartClass = getChartClass(meta.domain, meta.facetType)

      if (!(this.chart instanceof ChartClass)) {
        const element = this.$refs.chart
        element.textContent = ''
        this.chart = new ChartClass({ element })
      }

      const items = meta.domain === 'time'
        ? statsItems.map(({ domain, value }) => ({
          domain: new Date(domain),
          value
        }))
        : statsItems

      const entrichedItems = meta.domain === 'time'
        ? withMissingDates(
          items,
          meta.resolution,
          item => item.domain,
          date => ({ domain: date, value: {} })
        )
        : items


      this.chart.render(
        entrichedItems,
        lineMetrics,
        areaMetrics,
        { itemsDictionary, colorPalette: this.colorPalette }
      )
    },
    stats(value) {
      const { meta } = value
      if (meta == null) return

      const metrics = MetricsByFacetType[meta.facetType]
      const lineMetrics = metrics.line(this.stats)
      const areaMetrics = metrics.area(this.stats)

      this.selectedItems = lineMetrics.map(({ id }) => id)
        .concat(areaMetrics.map(({ id }) => id))
        .reduce((acc, id, index) => {
          if (index > DefaultNumberOfItemsInChart) return acc
          acc[id] = true
          return acc
        }, {})
    },
    facetTypes() {
      // when facet types change we want to go through our active filters
      // and remove those, that are not supported.
      const supportedFilters = this.filters.filter(({ type }) => this.facetTypes.includes(type) || NoFacetFilters[this.statsIndex].includes(type))
      this.handleFiltersChanged(supportedFilters)
    },
    statsDomain() {
      const options = this.statsDomainsOptions.map(({ value }) => value)
      if (!options.includes(this.statsDomain) && this.$navigation) {
        // Reset stats domain if the value is no longer in the options
        // due to changed facet
        this.$navigation.updateQueryParameters({
          [QueryParameters.Domain]: this.statsDomainsOptions[0].value
        })
      }
    }
  }
}
</script>

<i18n>
{
  "en": {
    "legendLabels": {
      "min": "Minimum",
      "max": "Maximum",
      "mean": "Mean",
      "onesigma": "Mean ± 1σ",
      "p99_7": "99.7 percentile",

      "fr": "French",
      "de": "German",
      "lb": "Luxembourgish",
      "en": "English"
    }
  }
}
</i18n>