<template lang="html">
  <div class="time-facet-explorer">
    <timeline
      :values="timevalues"
      :domain="timelineSpan"
      :brush="currentTimelineSelectionSpan"
      :height="'120px'"
      @brush-end="handleTimelineBrushed"
      @clear-selection="handleTimelineCleared">
      <template v-slot="tooltipScope">
        <div v-if="tooltipScope.tooltip.item">
          {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
          <span v-html="$tc('numbers.articles', tooltipScope.tooltip.item.w, {
            n: $n(tooltipScope.tooltip.item.w),
          })"/>
        </div>
      </template>
    </timeline>
    <div class="p-3" v-if="currentTimelineSelectionSpan.length">
      <filter-date-range
        :start="timelineSelectionStart"
        :end="timelineSelectionEnd"
        @changed="handleFilterChanged"
        />
      <b-button
        block
        @click="applyFilter()"
        size="sm" variant="success"
        v-html="$t('actions.addRangeToCurrentFilters')"></b-button>
    </div>
  </div>
</template>

<script>
import Timeline from '@/components/modules/Timeline.vue'
import FilterDateRange from '@/components/modules/FilterDateRange.vue'
import Helpers from '@/plugins/Helpers';
import Daterange from '@/models/Daterange';

export default {
  model: {
    prop: 'filter',
    event: 'change'
  },
  data: () => ({
    timelineSpan: /** @type {Date[]} */ ([]),
    timelineSelectionStart: null,
    timelineSelectionEnd: null,
  }),
  props: {
    filter: {
      /** @type {import('vue').PropType<import('../../models/models').Filter>} */
      type: Object
    },
    filterType: {
      type: String,
      required: true
    },
    buckets: {
      type: Array,
      default: () => []
    }
  },
  components: {
    Timeline,
    FilterDateRange,
  },
  computed: {
    timevalues() {
      return Helpers.timeline.fromBuckets(this.buckets);
    },
    /** @return {Date[]} */
    currentTimelineSelectionSpan() {
      if (this.timelineSelectionStart != null && this.timelineSelectionEnd != null) {
        return [
          this.timelineSelectionStart,
          this.timelineSelectionEnd
        ]
      }
      return []
    },
  },
  mounted() {
    // @ts-ignore
    let { firstDate } = window.impressoDocumentsDateSpan
    const lastDate = new Date()
    firstDate = new Date(firstDate)
    this.timelineSpan = [
      firstDate.getFullYear(),
      lastDate.getFullYear()
    ];
  },
  methods: {
    handleFilterChanged(filter) {
      console.info('(wip) @handleFilterChanged:', filter);
    },
    applyFilter() {
      const originalFilter = this.filter
        ? this.filter
        : { type: this.filterType }
      const updatedFilter = Object.assign({}, originalFilter, {
        q: new Daterange({
          start: this.timelineSelectionStart,
          end: this.timelineSelectionEnd
        }).getValue()
      })
      this.$emit('change', updatedFilter)
    },
    handleTimelineBrushed({ minDate, maxDate }) {
      this.timelineSelectionStart = minDate
      this.timelineSelectionEnd = maxDate
    },
    handleTimelineCleared() {
      this.timelineSelectionStart = null
      this.timelineSelectionEnd = null
    },
  }
};
</script>

<style lang="scss">
</style>
