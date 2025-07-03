<template>
  <i-layout>
    <!-- sidebar -->
    <search-sidebar
      width="400px"
      :filters="enrichedFilters"
      :facets="facets"
      contextTag="powerUserVis"
      @changed="handleFiltersChanged"
    >
      <template v-slot:tabs>
        <b-tabs pills class="mx-2 pt-2">
          <template v-slot:tabs-end>
            <b-nav-item class="active"><span v-html="$t('tabs.powervis')" /> </b-nav-item>
          </template>
        </b-tabs>
      </template>
      <template v-slot:header>
        <autocomplete v-on:submit="handleAutocompleteSubmit" />
      </template>
    </search-sidebar>

    <!-- main section -->
    <i-layout-section main>
      <PowerVisBase :data="stats" :id-filters="selectedItems" @item:click="handleItemClicked">
        <template v-slot:header>
          <b-navbar>
            <section>
              <h3 class="mb-1">{{ $t('pages.powervis.title') }}</h3>
            </section>
          </b-navbar>

          <b-navbar class="border-top border-bottom py-0 px-3">
            <b-navbar-nav class="pl-0 pr-2 py-2 border-right">
              <label class="mr-2">{{ $t('yvalue') }}</label>
              <i-dropdown
                v-model="statsFacetModel"
                :options="availableStatsFacets"
                size="sm"
                variant="outline-primary"
              />
            </b-navbar-nav>
            <b-navbar-nav class="p-2 border-right">
              <label class="mr-2">{{ $t('xvalue') }}</label>
              <i-dropdown
                v-model="statsDomain"
                :options="statsDomainsOptions"
                size="sm"
                variant="outline-primary"
              />
            </b-navbar-nav>
          </b-navbar>
        </template>

        <template v-slot:footer>
          <div class="border-top p-2 pb-3" style="max-height: 180px; overflow: scroll">
            <div
              class="d-inline-flex mx-1 align-items-center"
              v-for="item in statsLegendItems"
              :key="item.id"
            >
              <b-form-checkbox
                :modelValue="selectedItems[item.id]"
                @update:modelValue="v => handleItemChanged(item.id, v)"
              >
                <div
                  class="pl-1 pr-1 d-flex"
                  :style="{
                    'background-color': item.color.length > 7 ? item.color : `${item.color}77`
                  }"
                >
                  {{ item.label }}
                </div>
              </b-form-checkbox>
            </div>
          </div>
        </template>
      </PowerVisBase>
    </i-layout-section>

    <Modal
      hide-footer
      body-class="m-0 p-0"
      id="itemClickedActionModal"
      :title="'TODO'"
      :show="isItemModalVisible"
      @close="hideItemModal()"
    >
      <b>{{ JSON.stringify(itemEvent, null, 2) }}</b>
    </Modal>
  </i-layout>
</template>

<script lang="ts">
import { schemeCategory10, schemeAccent } from 'd3'

import SearchSidebar from '@/components/modules/SearchSidebar.vue'
import Autocomplete from '@/components/Autocomplete.vue'
import PowerVisBase, { MetricsByFacetType } from '@/components/modules/vis/PowerVisBase.vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'

import { searchFacets, filtersItems, stats } from '@/services'
import {
  serializeFilters,
  deserializeFilters,
  toCanonicalFilter,
  optimizeFilters,
  joinFiltersWithItems
} from '../logic/filters'
import { DefaultFacetTypesForIndex, buildEmptyFacets } from '@/logic/facets'
import { getQueryParameter, CommonQueryParameters } from '@/router/util'
import { Navigation } from '@/plugins/Navigation'

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

const NoFacetFilters = {
  search: ['string'],
  tr_clusters: [],
  tr_passages: []
}

const QueryParameters = Object.freeze({
  SearchFilters: CommonQueryParameters.SearchFilters,
  Facet: 'facet',
  Index: 'index',
  Domain: 'domain'
})

/** @typedef {{[key: string]: string[]}} StringArrayMap */
/** @type {{[key: string]: StringArrayMap}} */
const StatsFacets = {
  search: {
    term: ['newspaper', 'country', 'type', 'topic', 'language', 'person', 'location'],
    numeric: ['contentLength', 'pagesCount'],
    temporal: ['time']
  },
  tr_clusters: {
    term: ['newspaper'],
    numeric: ['textReuseClusterSize', 'textReuseClusterLexicalOverlap', 'textReuseClusterDayDelta'],
    temporal: []
  },
  tr_passages: {
    term: ['newspaper'],
    numeric: ['textReuseClusterSize', 'textReuseClusterLexicalOverlap', 'textReuseClusterDayDelta'],
    temporal: ['time']
  }
}

const colorInLegendEnabled = (domain, facetType) => {
  if (domain !== 'time' && facetType === 'term') return false
  return true
}

export default {
  data: () => ({
    /** @type {Facet[]} */
    facets: [],
    /** @type {Filter[]} */
    filtersWithItems: [],
    stats: {},
    statsLoading: false,
    /** @type {{[key: number]: boolean}} */
    selectedItems: {},
    /** @type {(() => void) | undefined} */
    resizeHandler: undefined,
    itemEvent: undefined,
    isItemModalVisible: false
  }),
  methods: {
    showItemModal() {
      this.isItemModalVisible = true
    },
    hideItemModal() {
      this.isItemModalVisible = false
    },
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
      this.selectedItems[id] = value
    },
    /**
     * @param {string} index
     * @param {string} type
     * @returns {boolean}
     */
    isFilterTypeSupporedInIndex(index, type) {
      // NOTE: daterange is the only filter type that does not have corresponding facet at the moment
      const filterTypes = DefaultFacetTypesForIndex[index].concat(['daterange'])
      return filterTypes.includes(type) && !NoFacetFilters[index].includes(type)
    },
    handleItemClicked(event) {
      this.itemEvent = event
      this.showItemModal()
    }
  },
  components: {
    SearchSidebar,
    Autocomplete,
    PowerVisBase,
    Modal
  },
  mounted() {
    this.facets = buildEmptyFacets(this.facetTypes)
  },
  computed: {
    $navigation() {
      return new Navigation(this)
    },
    /** @returns {boolean} */
    textReuseEnabled() {
      // @ts-ignore
      return !!window.impressoFeatures?.textReuse?.enabled
    },
    /** @returns {{ value: string, text: string}[]} */
    availableStatsFacets() {
      const indexes = this.textReuseEnabled
        ? Object.keys(StatsFacets)
        : Object.keys(StatsFacets).filter(index => !['tr_clusters', 'tr_passages'].includes(index))

      return indexes.flatMap(index => {
        const facets = Object.values(StatsFacets[index])
          .flat()
          .filter(v => v !== 'time')
        return facets.map(facet => {
          const key = `${index}.${facet}`
          return { value: key, text: this.$t(key).toString() }
        })
      })
    },
    /** @returns {Filter[]} */
    filters() {
      return deserializeFilters(getQueryParameter(this, QueryParameters.SearchFilters))
    },
    /** @returns {Filter[]} */
    enrichedFilters() {
      return this.filtersWithItems ?? this.filters
    },
    /** @returns {string[]} */
    facetTypes() {
      return DefaultFacetTypesForIndex[this.statsIndex]
    },
    /** @return {object} */
    statsRequest() {
      return {
        facet: this.statsFacet,
        index: this.statsIndex,
        domain: this.statsDomain,
        filters: serializeFilters(this.filters)
      }
    },
    /** @returns {string} */
    statsFacet() {
      return getQueryParameter(this, QueryParameters.Facet) ?? 'contentLength'
    },
    /** @returns {string} */
    statsIndex() {
      return getQueryParameter(this, QueryParameters.Index) ?? 'search'
    },
    statsFacetModel: {
      /** @returns {string} */
      get() {
        return `${this.statsIndex}.${this.statsFacet}`
      },
      /** @param {string} value */
      set(value) {
        const [index, facet] = value.split('.')
        const supportedFilters = this.filters.filter(({ type }) =>
          this.isFilterTypeSupporedInIndex(this.statsIndex, type)
        )

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
        const value = getQueryParameter(this, QueryParameters.Domain) ?? 'time'
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
      const options = (StatsFacets[this.statsIndex].term || []).map(key => ({
        value: key,
        text: key
      }))
      const temporalOptions = (StatsFacets[this.statsIndex].temporal || []).map(key => ({
        value: key,
        text: key
      }))
      return temporalOptions.concat(options)
    },
    /** @return {string} */
    chartHeightString() {
      // @ts-ignore
      return `${0.5 * window.innerHeight}px`
    },
    /** @return {{ id: string, label: string | undefined, color: string }[]} */
    statsLegendItems() {
      // if (this.chart == null) return []
      const { meta, itemsDictionary = {} } = this.stats as any
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
    }
  },
  watch: {
    filters: {
      /** @param {Filter[]} filters */
      async handler(filters) {
        const query = {
          filters: filters.map(toCanonicalFilter),
          limit: 10,
          facets: this.facetTypes
          // group_by: 'articles'
        }
        const [facets, filtersWithItems] = await Promise.all([
          searchFacets.find({ query }).then(response => response.data),
          filtersItems
            .find({ query: { filters: serializeFilters(filters) } })
            .then(joinFiltersWithItems)
        ])
        this.facets = facets
        this.filtersWithItems = filtersWithItems
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
    // chartData(chartData) { this.renderChart(chartData) },
    stats(value) {
      const { meta } = value
      if (meta == null) return

      const metrics = MetricsByFacetType[meta.facetType]
      const lineMetrics = metrics.line(this.stats)
      const areaMetrics = metrics.area(this.stats)

      this.selectedItems = lineMetrics
        .map(({ id }) => id)
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
      const supportedFilters = this.filters.filter(({ type }) =>
        this.isFilterTypeSupporedInIndex(this.statsIndex, type)
      )
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
<style lang="scss" scoped>
.chart {
  display: block;
}
</style>

<i18n lang="json">
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
    },
    "xvalue": "x axis",
    "yvalue": "y axis",
    "search": {
      "newspaper": "number of articles published, per newspaper",
      "country": "number of articles published, per newspaper",
      "type": "number of articles published, per type",
      "topic": "number of articles published, by topic",
      "language": "number of articles published, by language",
      "person": "number of articles published per entity (person)",
      "location": "number of articles published per entity (location)",
      "contentLength": "article length (n of tokens, average)",
      "pagesCount": "number of pages (average)"
    }
  }
}
</i18n>
