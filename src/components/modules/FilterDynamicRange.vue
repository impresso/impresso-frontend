<template>
  <div class="FilterDynamicRange">
    <BaseTitleBar>
      {{ $t(`label.${facetType}.filterTitle`).toLowerCase() }}
      <InfoButton v-if="infoButtonId" :name="infoButtonId" class="ml-1" />
      <template v-slot:description>
        <slot name="description"></slot>
      </template>
      <template v-slot:options>
        <b-button v-show="isFiltered" size="sm" variant="outline-primary" @click="resetValues">
          {{ $t(`actions.reset`) }}
        </b-button>
      </template>
    </BaseTitleBar>

    <!-- min 100px height -->
    <div v-if="loading" class="text-center" style="height: 100px">
      <span role="status" aria-hidden class="spinner-grow spinner-grow-sm text-primary"> </span>
    </div>
    <div v-else-if="loaded" class="position-relative">
      <HistogramSlider
        class="histo-slider"
        v-model="sliderValue"
        :buckets="buckets"
        :only-range-labels="true"
        :scale-type="'symlog'"
        :sliderValue="value"
        @mousemove="handleMouseMove"
        @click="handleClick"
      />
      <tooltip :tooltip="tooltip">
        <slot :tooltip="tooltip">
          <div v-if="tooltip.item">
            <div v-html="tooltip.item.label"></div>
            <div
              v-html="
                $tc(countLabel, tooltip.item?.count ?? 0, { n: $n(tooltip.item?.count ?? 0) })
              "
            />
          </div>
        </slot>
      </tooltip>
    </div>
    <div class="p-2" v-if="hasChanged">
      <b-button size="sm" v-if="hasChanged" block variant="outline-primary" @click="applyValues">
        {{ $t(isFiltered ? 'actions.applyChanges' : 'actions.apply') }}
      </b-button>
    </div>
  </div>
</template>
<script lang="ts">
import BaseTitleBar from '@/components/base/BaseTitleBar.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import HistogramSlider from '@/components/modules/vis/HistogramSlider.vue'
import { serializeFilters } from '@/logic/filters'
import { Bucket, Facet, Filter } from '@/models'
import FilterFactory from '@/models/FilterFactory'
import { getSearchFacetsService, stats as statsService } from '@/services'
import { defineComponent, PropType } from 'vue'
import Tooltip from './tooltips/Tooltip.vue'

interface StatsQueryParams {
  index: string
  stats: string
  filters: string
  groupby?: string
}

interface StatsResponse {
  statistics: {
    min: string | number
    max: string | number
  }
  total: string | number
}

interface FacetSearchQueryParameters {
  filters: Filter[]
  group_by: string
  rangeStart: number
  rangeEnd: number
  rangeGap: number
  rangeInclude?: string
}

type FacetSearchResponse = Facet

type FacetDataProvider<Q, R> = (type: string, params: { query: Q }) => Promise<R>
type FacetDataProviderFactory<Q, R> = (index: string) => FacetDataProvider<Q, R>

export type StatsDataProvider = FacetDataProvider<StatsQueryParams, StatsResponse>
export type FacetSearchDataProvider = FacetDataProvider<
  FacetSearchQueryParameters,
  FacetSearchResponse
>

/**
 * display range facets based on actual stats for the solr field
 */
export default defineComponent({
  name: 'FilterDynamicRange',
  components: {
    BaseTitleBar,
    HistogramSlider,
    Tooltip,
    InfoButton
  },
  data() {
    return {
      loading: false,
      loaded: false,
      start: 0,
      end: 0,
      gap: 1,
      value: /** @type {number[]} */ [],
      sliderValue: [],
      buckets: [],
      total: 0,
      tooltip: {
        item: null,
        isActive: false,
        x: 0,
        y: 0
      }
    }
  },
  props: {
    isFiltered: Boolean,
    countLabel: {
      type: String,
      default: 'numbers.results'
    },
    valueLabel: {
      type: String,
      default: 'value'
    },
    valueAsRangeLabel: {
      type: String,
      default: 'valueAsRange'
    },
    valuePercentageLabel: {
      type: String,
      default: 'valuePercentage'
    },
    isPercentage: {
      type: Boolean,
      default: false
    },
    infoButtonId: {
      type: String
    },
    facetType: {
      type: String,
      required: true
    },
    facetFilters: {
      type: Array as PropType<Filter[]>,
      default: () => []
    },
    groupby: {
      type: String,
      default: null
    },
    index: {
      type: String,
      default: 'search'
    },
    maxExpectedBuckets: {
      type: Number,
      default: 100
    },
    statsProvider: {
      type: Function as PropType<StatsDataProvider>,
      default: statsService.get.bind(statsService)
    },
    facetSearchProvider: {
      type: Function as PropType<
        FacetDataProviderFactory<FacetSearchQueryParameters, FacetSearchResponse>
      >,
      default: (index: string) => {
        const service = getSearchFacetsService(index)
        return service?.get?.bind(service)
      }
    }
  },
  emits: ['changed', 'clicked'],
  methods: {
    applyValues() {
      // create a new filter
      const rangeFilter = FilterFactory.create({
        type: this.facetType,
        q: this.sliderValue.map(v => v.toString())
      })
      // if isFiltered, change its values
      this.$emit('changed', [...this.otherFilters, rangeFilter])
    },
    resetValues() {
      this.$emit('changed', [...this.otherFilters])
    },
    getTooltipLabel(bucket: Bucket) {
      if (bucket.upper == null || bucket.lower == null) return ''

      if (this.isPercentage) {
        // 1. values are different
        if (bucket.upper !== bucket.lower)
          return this.$t(this.valuePercentageLabel, {
            upper: this.$n(bucket.upper),
            lower: this.$n(bucket.lower)
          })
        // 2. values are the same
        return this.$t(this.valuePercentageLabel, {
          upper: this.$n(bucket.upper + 0.999),
          lower: this.$n(bucket.lower)
        })
      }
      // otherwise

      // 1. values are different
      if (bucket.upper !== bucket.lower)
        return this.$t(this.valueAsRangeLabel, {
          upper: this.$n(bucket.upper),
          lower: this.$n(bucket.lower)
        })
      // 2. values are the same
      return this.$t(this.valueLabel, { val: this.$n(parseInt(bucket?.val) ?? 0) })
    },
    handleMouseMove(value) {
      if (!value) {
        this.tooltip.item = null
        this.tooltip.isActive = false
        return
      }

      const bucket: Bucket = value.bucket

      const label = this.getTooltipLabel(bucket)

      this.tooltip = {
        item: {
          label,
          ...value.bucket
        },
        isActive: true,
        x: -10 + (value.pointer?.x ?? 0),
        y: -50 + (value.pointer?.y ?? 0)
      }
    },
    handleClick({ bucket }) {
      if (isNaN(bucket.upper) || isNaN(bucket.lower)) {
        return
      }

      // create a filter and emit it
      const rangeFilter = FilterFactory.create({
        type: this.facetType,
        q: [bucket.lower, bucket.upper]
      })
      this.$emit('clicked', rangeFilter)
    }
  },
  computed: {
    hasChanged() {
      return this.value.join(',') !== this.sliderValue.join(',')
    },

    otherFilters() {
      return this.facetFilters.filter(filter => filter.type !== this.facetType)
    },
    // get min and max for the given query, allowing for adynamic range
    statsApiQueryParameters() {
      const query = {
        index: this.index,
        stats: 'min,max',
        filters: serializeFilters(this.facetFilters)
      }
      if (this.groupby) {
        query['groupby'] = this.groupby
      }
      return {
        query,
        hash: JSON.stringify(query).split('').sort().join('')
      }
    }
  },
  watch: {
    statsApiQueryParameters: {
      immediate: true,
      async handler({ query, hash }, previousValue) {
        if (previousValue && previousValue.hash === hash) {
          return false
        }
        this.loading = true
        await this.statsProvider(this.facetType, { query })
          .then(response => {
            // eslint-disable-next-line
            this.start = parseInt(String(response.statistics.min), 10)
            this.end = parseInt(String(response.statistics.max), 10)
            this.total = parseInt(String(response.total), 10)
            this.value = [this.start, this.end]
            this.sliderValue = [this.start, this.end]
            const range = this.end - this.start
            this.gap = Math.max(1, Math.round(range / (this.maxExpectedBuckets + 1)))
          })
          .catch(error => {
            // eslint-disable-next-line
            console.error('[FilterDynamicRange] error', error)
          })
        // when min and max have been calculated, set the range
        const facetSearchService = this.facetSearchProvider(this.index)
        await facetSearchService(this.facetType, {
          query: {
            // searchFacets doesn't support serialized filters
            filters: this.facetFilters,
            group_by: query.groupby,
            rangeStart: this.start,
            rangeEnd: this.end + 1,
            rangeGap: this.gap
            // rangeInclude: 'edge',
          }
        })
          .then(response => {
            // console.debug('[FilterDynamicRange] loadFacet', response)
            this.buckets = response.buckets
          })
          .catch(error => {
            // eslint-disable-next-line
            console.error('[FilterDynamicRange] loadFacet error', error)
          })
        this.loading = false
        this.loaded = true
      }
    }
  }
})
</script>
<i18n lang="json">
{
  "en": {
    "value": "value: <span class='number'>{val}</span>",
    "valuePercentage": "value: <span class='number'>{lower}% - {upper}%</span>",
    "valueAsRange": "range: <span class='number'>{lower} - {upper}</span>",
    "textReuseClusterSizeValueLabel": "cluster size: <span class='number'>{val}</span> passages per cluster",
    "textReuseClusterSizeValueAsRangeLabel": "cluster size: <span class='number'>{lower} - {upper}</span>",
    "textReuseClusterLexicalOverlapValuePercentageLabel": "<span class='number'>{lower}% - {upper}%</span> lexical overlap",
    "textReuseClusterDayDeltaValueLabel": "<span class='number'>{val}</span> days",
    "textReuseClusterDayDeltaValueAsRangeLabel": "<span class='number'>{lower} - {upper}</span> days"
  }
}
</i18n>
