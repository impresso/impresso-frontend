<template>
  <div class="FilterDynamicRange">
    <BaseTitleBar>
      {{ $t(`label.${facet.type}.filterTitle`).toLowerCase() }}
    </BaseTitleBar>
    <div v-if="loading" class="text-center">
      <b-spinner small type="grow" variant="primary" />
    </div>
    <div v-else-if="loaded">
      {{ start }} - {{ end }} ({{ total }})

      <HistogramSlider
        class="histo-slider"
        v-model="sliderValue"
        :buckets="buckets"
        :only-range-labels="true"
        :scale-type="'symlog'"
        :sliderValue="value"
        @mousemove="handleMouseMove"
      />
    </div>
  </div>
</template>
<script>
import BaseTitleBar from '@/components/base/BaseTitleBar'
import HistogramSlider from '@/components/modules/vis/HistogramSlider'
import { serializeFilters } from '@/logic/filters'
import { stats as statsService, searchFacets as searchFacetsService } from '@/services'
/** export vue component that display range facets based on actual stats for the solr field */
export default {
  name: 'FilterDynamicRange',
  components: {
    BaseTitleBar,
    HistogramSlider,
  },
  data() {
    return {
      loading: false,
      loaded: false,
      start: 0,
      end: 0,
      gap: 1,
      value: /** @type {number[]} */ ([]),
      buckets: [],
      total: 0,
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
    handleMouseMove(value) {
      // eslint-disable-next-line
      console.debug('[FilterDynamicRange] handleMouseMove', value)
    },
  },
  computed: {
    sliderValue: {
      /** @returns {number[]} */
      get() {
        return [this.start, this.end]
      },
      /** @param val {number[]} */
      set(val) {
        this.value = val
      },
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
