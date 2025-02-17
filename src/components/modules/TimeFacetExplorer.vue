<template>
  <div class="time-facet-explorer">
    <timeline
      :values="timevalues"
      :domain="timelineSpan"
      :brush="currentTimelineSelectionSpan"
      :height="'120px'"
      @brush-end="handleTimelineBrushed"
      @clear-selection="handleTimelineCleared"
    >
      <template v-slot="tooltipScope">
        <div v-if="tooltipScope.tooltip.item">
          {{ $d(tooltipScope?.tooltip?.item?.t ?? 0, 'year') }} &middot;
          <span
            v-html="
              $tc('numbers.articles', tooltipScope?.tooltip?.item?.w ?? 0, {
                n: $n(tooltipScope?.tooltip?.item?.w ?? 0)
              })
            "
          />
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
        size="sm"
        variant="success"
        v-html="$t('actions.addRangeToCurrentFilters')"
      ></b-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import Timeline from '@/components/modules/Timeline.vue'
import FilterDateRange from '@/components/modules/FilterDateRange.vue'
import Helpers from '@/plugins/Helpers'
import Daterange from '@/models/Daterange'
import { Filter } from '@/models'

interface IData {
  timelineSpan: Date[]
  timelineSelectionStart?: Date
  timelineSelectionEnd?: Date
}

export default defineComponent({
  data: () =>
    ({
      timelineSpan: [],
      timelineSelectionStart: undefined,
      timelineSelectionEnd: undefined
    }) satisfies IData,
  props: {
    modelValue: {
      type: Object as PropType<Filter>
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
  emits: ['update:modelValue'],
  components: {
    Timeline,
    FilterDateRange
  },
  computed: {
    filter() {
      return this.modelValue
    },
    timevalues() {
      return Helpers.timeline.fromBuckets(this.buckets)
    },
    currentTimelineSelectionSpan(): Date[] {
      if (this.timelineSelectionStart != null && this.timelineSelectionEnd != null) {
        return [this.timelineSelectionStart, this.timelineSelectionEnd]
      }
      return []
    }
  },
  mounted() {
    // @ts-ignore
    let { firstDate } = window.impressoDocumentsDateSpan
    const lastDate = new Date()
    firstDate = new Date(firstDate)
    this.timelineSpan = [firstDate.getFullYear(), lastDate.getFullYear()]
  },
  methods: {
    handleFilterChanged(filter) {
      console.info('(wip) @handleFilterChanged:', filter)
    },
    applyFilter() {
      const originalFilter = this.filter ? this.filter : { type: this.filterType }
      const updatedFilter = Object.assign({}, originalFilter, {
        q: new Daterange({
          start: this.timelineSelectionStart,
          end: this.timelineSelectionEnd
        }).getValue()
      })
      this.$emit('update:modelValue', updatedFilter)
    },
    handleTimelineBrushed({ minDate, maxDate }) {
      this.timelineSelectionStart = minDate
      this.timelineSelectionEnd = maxDate
    },
    handleTimelineCleared() {
      this.timelineSelectionStart = null
      this.timelineSelectionEnd = null
    }
  }
})
</script>

<style lang="scss"></style>
