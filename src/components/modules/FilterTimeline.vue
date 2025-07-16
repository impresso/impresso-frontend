<template>
  <div class="FilterTimeline">
    <base-title-bar
      >{{ $t(`label.timeline.${groupBy}`) }}
      <InfoButton v-if="infoButtonId" :name="infoButtonId" />
      <template v-slot:options>
        <b-button
          v-show="filters.length"
          size="sm"
          variant="outline-primary"
          @click="resetFilters()"
          data-testid="reset-filters-button"
        >
          {{ $t('actions.reset') }}
        </b-button>
      </template>
      <template v-slot:description>
        <span v-if="filters.length">
          {{ $t(`label.timelineDescription.${groupBy}.filtered.${displayStyle}`) }}
        </span>
        <span v-else>
          {{ $t(`label.timelineDescription.${groupBy}.description.${displayStyle}`) }}
        </span>
        <form v-if="!disableRelativeDisplayStyle" class="form-inline m-2">
          <radio-group
            :modelValue="displayStyle"
            @update:modelValue="displayStyle = $event"
            :options="displayStyleOptions"
            type="button"
          />
          <info-button name="relative-vs-absolute-year-graph" class="mx-2" />
          <radio-group
            :modelValue="exponent"
            @update:modelValue="exponent = $event"
            :options="exponentOptions"
            type="button"
          />
          <info-button name="linear-vs-power-scale-year-graph" class="ml-2" />
        </form>
      </template>
    </base-title-bar>

    <!--  timeline vis -->
    <timeline
      class="bg-light pb-2 mb-3"
      :values="values"
      :brushable="false"
      :brush="brush"
      @brush-end="onTimelineBrushEnd"
      :exponent="parseInt(exponent, 10)"
      :percentage="isPercentage"
      @brushed="onTimelineBrushed"
    >
      <template v-slot="tooltipScope">
        <div v-if="tooltipScope.tooltip?.item?.t">
          <div v-if="isPercentage">
            {{ $d(tooltipScope.tooltip.item.t, 'year') }}
            &middot;
            <b>{{ $n(tooltipScope.tooltip.item.p) }}%</b>
          </div>
          <div v-else>
            {{ $d(tooltipScope.tooltip.item.t, 'year') }}
            &middot;
            <b>{{ tooltipScope.tooltip.item.w ? $n(tooltipScope.tooltip.item.w) : '0' }}</b>
            {{ groupBy }}
          </div>
        </div>
      </template>
    </timeline>

    <div v-if="!temporaryFilter && !filters.length">
      <b-button
        size="sm"
        variant="outline-primary"
        @click="addTemporaryDaterangeFilter"
        data-testid="add-new-date-filter-button"
      >
        {{ $t('label.daterange.pick') }}
      </b-button>
    </div>

    <div
      class="p-2 bg-white border rounded"
      v-for="(filter, i) in filters"
      :key="i"
      style="box-shadow: var(--bs-box-shadow-sm)"
    >
      <filter-monitor
        :filter="filter"
        @daterange-changed="updateBrush($event)"
        @changed="updateDaterangeFilterAtIndex($event, i)"
        @removed="removeFilter(i)"
      />
    </div>
    <!-- temporary filter -->
    <div class="border p-2" v-if="temporaryFilter">
      <filter-monitor
        :filter="temporaryFilter"
        @daterange-changed="updateTemporaryFilter"
        @removed="removeTemporaryDaterangeFilter"
      />

      <b-row no-gutters>
        <b-col class="pr-1">
          <b-button
            size="sm"
            block
            variant="outline-primary"
            @click="removeTemporaryDaterangeFilter"
          >
            {{ $t('actions.dismiss') }}
          </b-button>
        </b-col>
        <b-col class="pl-1">
          <b-button size="sm" block variant="outline-primary" @click="addDaterangeFilter">
            {{ $t('actions.apply') }}
          </b-button>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script lang="ts">
import Daterange from '@/models/Daterange'
import FilterDaterange from '@/models/FilterDaterange'

import BaseTitleBar from '@/components/base/BaseTitleBar.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import Timeline from '@/components/modules/Timeline.vue'
import FilterMonitor from '@/components/modules/FilterMonitor.vue'
import RadioGroup from '@/components/layout/RadioGroup.vue'
import { getFilterHash } from '../../models/SearchQuery'
import { defineComponent, PropType } from 'vue'
import { Filter } from '@/models'
import { TimelineValue } from '@/logic/facets'

const DisplayStyleSum = 'sum'
const DisplayStylePercent = 'percent'
const ExponentLinear = '1'
const ExponentPower = '4'

export interface IData {
  temporaryFilter: FilterDaterange | null
  selectedFilterBrush: Date[]
  selectedFilterIndex: number
  displayStyle: string
  exponent: string
}

export default defineComponent({
  name: 'FilterTimeline',
  props: {
    infoButtonId: String,
    startYear: Number,
    endYear: Number,
    minDate: Date,
    maxDate: Date,
    groupBy: {
      type: String,
      default: 'articles'
    },
    filters: {
      type: Array as PropType<Filter[]>,
      default: () => []
    },
    values: {
      type: Array as PropType<TimelineValue[]>,
      default: () => []
    },
    disableRelativeDisplayStyle: {
      type: Boolean,
      default: false
    }
  },
  data(): IData {
    return {
      temporaryFilter: null,
      selectedFilterBrush: [],
      selectedFilterIndex: -1,
      displayStyle: DisplayStyleSum,
      exponent: ExponentLinear
    }
  },
  components: {
    BaseTitleBar,
    InfoButton,
    Timeline,
    FilterMonitor,
    RadioGroup
  },
  computed: {
    brush() {
      if (this.temporaryFilter) {
        return [this.temporaryFilter.items[0].start, this.temporaryFilter.items[0].end]
      }
      if (this.filters.length) {
        return [this.filters[0].items[0].start, this.filters[0].items[0].end]
      }
      return []
    },
    startDate() {
      return new Date(`${this.startYear}-01-01`)
    },
    endDate() {
      return new Date(`${this.endYear}-12-31`)
    },
    startDaterange() {
      return this.minDate.toISOString().split('T').shift()
    },
    endDaterange() {
      return this.maxDate.toISOString().split('T').shift()
    },
    isPercentage() {
      return this.displayStyle === DisplayStylePercent
    },
    // a string of min amd max date
    dateRangeString() {
      return `${this.startDaterange} - ${this.endDaterange}`
    },
    displayStyleOptions() {
      return [DisplayStylePercent, DisplayStyleSum].map(value => ({
        text: this.$t(`label.display.${value}`),
        value
      }))
    },
    exponentOptions() {
      return [ExponentLinear, ExponentPower].map(value => ({
        text: this.$t(`label.exponent.${value}`),
        value
      }))
    }
  },
  methods: {
    resetFilters() {
      this.$emit('reset-filters', 'daterange')
      this.selectedFilterBrush = []
    },
    updateDaterangeFilterAtIndex(updatedFilter, i) {
      this.$emit(
        'changed',
        this.filters.map((filter, j) => {
          if (i === j) {
            return updatedFilter
          }
          return filter
        })
      )
    },
    updateTemporaryFilter(f) {
      console.info('updateTemporaryFilter', f)
      this.temporaryFilter = new FilterDaterange({
        type: 'daterange',
        q: [f.q]
      })
    },
    updateBrush(filter) {
      const daterange = new Daterange({
        daterange: filter.q
      })
      console.info('updateBrush', filter, daterange)
      this.selectedFilterBrush = [daterange.start, daterange.end]
    },
    addDaterangeFilter() {
      this.$emit('changed', [this.temporaryFilter].concat(this.filters))
      this.temporaryFilter = null
    },
    removeFilter(i) {
      console.log('removeFilter')
      this.$emit(
        'changed',
        this.filters.filter((_, j) => i !== j)
      )
    },
    removeTemporaryDaterangeFilter() {
      this.temporaryFilter = null
    },
    addTemporaryDaterangeFilter({ start, end } = { start: null, end: null }) {
      if (this.temporaryFilter) {
        return
      }
      const daterange = new Daterange({
        start: start || this.minDate,
        end: end || this.maxDate
      })
      console.info('addDaterangeFilter() q:', daterange.getValue())
      this.temporaryFilter = new FilterDaterange({
        type: 'daterange',
        q: [daterange.getValue()],
        daterange: daterange.getValue()
      })
      this.temporaryFilter.hash = getFilterHash(this.temporaryFilter)
      // set selectedIndex as first item.
      this.selectedFilterIndex = 0
    },
    onTimelineBrushEnd(data) {
      console.info('[FilterTimeline] @BrushEnd', data)
      if (!this.temporaryFilter && !this.filters.length) {
        this.addTemporaryDaterangeFilter({
          start: data.minDate,
          end: data.maxDate
        })
      }
    },
    onTimelineBrushed(data) {
      if (!this.temporaryFilter) {
        if (!this.filters) {
          // create a emporary filter...
          this.addTemporaryDaterangeFilter()
        } else {
          // create a clone of our filter...
          return
        }
      }
      const value = `${data.minValue}T00:00:00Z TO ${data.maxValue}T23:59:59Z`
      // console.info('',value, '\n', this.temporaryFilter.q[0]);
      if (value !== this.temporaryFilter.q[0]) {
        const daterange = new Daterange({
          start: data.minDate,
          end: data.maxDate
        })
        // console.log(daterange, data)
        this.temporaryFilter = new FilterDaterange({
          type: 'daterange',
          context: this.temporaryFilter.context,
          q: [daterange.getValue()],
          daterange: daterange.getValue()
        })
        this.temporaryFilter.hasChanges = true
      }
    }
  },
  watch: {
    dateRangeString() {
      console.debug('[FilterTimeline] changed minDate', this.minDate)
    }
  }
})
</script>

<style lang="css">
.FilterTimeline .form-inline .btn {
  padding: 4px 4px;
  line-height: 1em;
}
</style>
<i18n lang="json">
{
  "en": {
    "label": {
      "timeline": {
        "passages": "Number of passages per year",
        "articles": "publication date",
        "images": "publication date"
      },
      "timelineDescription": {
        "passages": {
          "description": {
            "sum": "Number of text reuse passages per year",
            "percent": "Percentage of passages per year"
          },
          "filtered": {
            "sum": "Number of passages per year (filtered)",
            "percent": "Percentage of passages per year (filtered)"
          }
        },
        "articles": {
          "description": {
            "sum": "Number of articles per year",
            "percent": "Percentage of articles per year"
          },
          "filtered": {
            "sum": "Number of articles per year (filtered)",
            "percent": "Percentage of articles per year (filtered)"
          }
        },
        "images": {
          "description": {
            "sum": "Number of images extracted per year",
            "percent": "Percentage of number of images per year"
          },
          "filtered": {
            "sum": "Number of images per year (filtered)",
            "percent": "Percentage of number of images per year (filtered)"
          }
        }
      },
      "display": {
        "sum": "sum",
        "percent": "%"
      },
      "exponent": {
        "1": "linear",
        "4": "power scale"
      },
      "daterange": {
        "pick": "add new date filter ...",
        "start": "from",
        "end": "to",
        "apply": "add as filter"
      }
    }
  }
}
</i18n>
