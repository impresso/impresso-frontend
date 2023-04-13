<template>
  <div class="FilterDynamicRange">
    <BaseTitleBar>
      {{ $t(`label.${facet.type}.filterTitle`).toLowerCase() }}
    </BaseTitleBar>
    <!-- min 100px height -->
    <div v-if="loading" class="text-center" style="height: 100px">
      <b-spinner small type="grow" variant="primary" />
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
              v-html="$tc('numbers.results', tooltip.item.count, { n: $n(tooltip.item.count) })"
            />
          </div>
        </slot>
      </tooltip>
    </div>
    <div class="p-2" v-if="hasChanged || filterValue">
      <b-row no-gutters>
        <b-col class="pr-1">
          <b-button
            size="sm"
            v-if="filterValue"
            block
            variant="outline-primary"
            @click="resetValues"
          >
            {{ $t('actions.dismiss') }}
          </b-button>
        </b-col>
        <b-col class="pl-1">
          <b-button
            size="sm"
            v-if="hasChanged"
            block
            variant="outline-primary"
            @click="applyValues"
          >
            {{ $t('actions.apply') }}
          </b-button>
        </b-col>
      </b-row>
    </div>
  </div>
</template>
<script>
import BaseTitleBar from '@/components/base/BaseTitleBar'
import HistogramSlider from '@/components/modules/vis/HistogramSlider'
import { serializeFilters } from '@/logic/filters'
import { stats as statsService, searchFacets as searchFacetsService } from '@/services'
import Tooltip from './tooltips/Tooltip'
import FilterFactory from '@/models/FilterFactory'
/** export vue component that display range facets based on actual stats for the solr field */
export default {
  name: 'FilterDynamicRange',
  components: {
    BaseTitleBar,
    HistogramSlider,
    Tooltip,
  },
  data() {
    return {
      loading: false,
      loaded: false,
      start: 0,
      end: 0,
      gap: 1,
      value: /** @type {number[]} */ ([]),
      sliderValue: [],
      buckets: [],
      total: 0,
      tooltip: {
        item: null,
      },
    }
  },
  props: {
    facet: {
      type: Object,
      required: true,
    },
    facetFilters: {
      type: Array,
      required: true,
    },
    groupby: {
      type: String,
      default: null,
    },
    index: {
      type: String,
      default: 'search',
    },

    maxExpectedBuckets: {
      type: Number,
      default: 100,
    },
  },
  methods: {
    applyValues() {
      // create a new filter
      const rangeFilter = FilterFactory.create({
        type: this.facet.type,
        q: this.sliderValue.map(v => v.toString()),
      })
      // if filterValue, change its values
      this.$emit('changed', [...this.otherFilters, rangeFilter])
    },
    resetValues() {
      this.$emit('changed', [...this.otherFilters])
    },
    handleMouseMove(value) {
      if (!value) {
        this.tooltip.item = null
        this.tooltip.isActive = false
        return
      }
      // eslint-disable-next-line
      // console.debug('[FilterDynamicRange] handleMouseMove', value.pointer)
      const label =
        value.bucket.upper && value.bucket.upper !== value.bucket.lower
          ? this.$t('valueAsRange', {
              upper: this.$n(value.bucket.upper),
              lower: this.$n(value.bucket.lower),
            })
          : this.$t('value', { val: this.$n(value.bucket.val) })
      this.tooltip = {
        item: {
          label,
          ...value.bucket,
        },
        isActive: true,
        x: -10 + value.pointer.x,
        y: -50 + value.pointer.y,
      }
    },
    handleClick({ bucket }) {
      if (isNaN(bucket.upper) || isNaN(bucket.lower)) {
        // eslint-disable-next-line
        console.warn('[FilterDynamicRange] handleClick warning: bucket values not valid.', bucket)
        return
      }
      // eslint-disable-next-line
      console.debug('[FilterDynamicRange] handleClick', JSON.stringify(bucket))

      // create a filter and emit it
      const rangeFilter = FilterFactory.create({
        type: this.facet.type,
        q: [bucket.lower, bucket.upper],
      })
      this.$emit('clicked', rangeFilter)
    },
  },
  computed: {
    hasChanged() {
      return this.value.join(',') !== this.sliderValue.join(',')
    },
    filterValue() {
      // check for type
      return this.facetFilters.find(filter => filter.type === this.facet.type)
    },
    otherFilters() {
      return this.facetFilters.filter(filter => filter.type !== this.facet.type)
    },
    // get min and max for the given query, allowing for adynamic range
    statsApiQueryParameters() {
      const query = {
        index: this.index,
        stats: 'min,max',
        filters: serializeFilters(this.facetFilters),
      }
      if (this.groupby) {
        query['groupby'] = this.groupby
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
  watch: {
    statsApiQueryParameters: {
      immediate: true,
      async handler({ query, hash }, previousValue) {
        if (previousValue && previousValue.hash === hash) {
          return false
        }
        this.loading = true
        // eslint-disable-next-line
        console.debug('[FilterDynamicRange] query: query', query, 'type', this.facet.type)
        await statsService
          .get(this.facet.type, { query })
          .then(response => {
            // eslint-disable-next-line
            this.start = parseInt(response.statistics.min, 10)
            this.end = parseInt(response.statistics.max, 10)
            this.total = parseInt(response.total, 10)
            this.value = [this.start, this.end]
            this.sliderValue = [this.start, this.end]
            const range = this.end - this.start
            this.gap = Math.max(1, Math.round(range / (this.maxExpectedBuckets + 1)))
            console.debug(
              '[FilterDynamicRange] statsService response',
              response,
              this.start,
              this.end,
              this.gap,
            )
          })
          .catch(error => {
            // eslint-disable-next-line
            console.error('[FilterDynamicRange] error', error)
          })
        // when min and max have been calculated, set the range
        await searchFacetsService
          .get(this.facet.type, {
            query: {
              index: this.index,
              // searchFacets doesn't support serialized filters
              filters: this.facetFilters,
              groupby: query.groupby,
              rangeStart: this.start,
              rangeEnd: this.end + 1,
              rangeGap: this.gap,
              // rangeInclude: 'edge',
            },
          })
          .then(response => {
            console.debug('[FilterDynamicRange] loadFacet', response)
            this.buckets = response[0].buckets
          })
          .catch(error => {
            // eslint-disable-next-line
            console.error('[FilterDynamicRange] loadFacet error', error)
          })
        this.loading = false
        this.loaded = true
      },
    },
  },
}
</script>
<i18n>
{
  "en": {
    "value": "value: <span class='number'>{val}</span>",
    "valueAsRange": "range: <span class='number'>{lower} - {upper}</span>"
  }
}
</i18n>
