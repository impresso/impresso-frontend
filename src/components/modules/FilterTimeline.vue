<template>
  <div class="filter-timeline">
    <base-title-bar
      >{{ $t(`label.timeline.${groupBy}`) }}
      <InfoButton v-if="infoButtonId" :name="infoButtonId" />
      <div slot="options">
        <b-button
          v-show="filters.length"
          size="sm"
          variant="outline-primary"
          @click="resetFilters()"
        >
          {{ $t('actions.reset') }}
        </b-button>
      </div>
      <div slot="description">
        <span v-if="filters.length">
          {{ $t(`label.timelineDescription.${groupBy}.filtered.${displayStyle}`) }}
        </span>
        <span v-else>
          {{ $t(`label.timelineDescription.${groupBy}.description.${displayStyle}`) }}
        </span>
        <b-nav-form v-if="!disableRelativeDisplayStyle">
          <b-form-radio-group
            v-model="displayStyle"
            :options="displayStyleOptions"
            button-variant="outline-primary"
            size="sm"
            buttons
          />
          <info-button name="relative-vs-absolute-year-graph" class="ml-2" />
        </b-nav-form>
      </div>
    </base-title-bar>

    <!--  timeline vis -->
    <timeline
      class="bg-light pb-2 mb-3"
      :values="values"
      :brush="brush"
      :percentage="isPercentage"
      @brushed="onTimelineBrushed"
    >
      <div slot-scope="tooltipScope">
        <div v-if="tooltipScope.tooltip.item">
          {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
          <b>{{ $n(tooltipScope.tooltip.item.w) }}</b> {{ groupBy }}
          <!-- <br />
          <span class="contrast" v-if="tooltipScope.tooltip.item.w1 > 0">
          &mdash; <b>{{ percent(tooltipScope.tooltip.item.w1, tooltipScope.tooltip.item.w) }}%</b>
          ({{ tooltipScope.tooltip.item.w1 }}) {{ contrastLabel }}
          </span> -->
        </div>
      </div>
    </timeline>

    <div v-if="!temporaryFilter && !filters.length">
      <b-button size="sm" variant="outline-primary" @click="addTemporaryDaterangeFilter">
        {{ $t('label.daterange.pick') }}
      </b-button>
    </div>

    <div class="border p-2 bg-white" v-for="(filter, i) in filters" :key="i">
      <filter-monitor
        :filter="filter"
        @daterange-changed="updateBrush($event)"
        @changed="updateDaterangeFilterAtIndex($event, i)"
      />
    </div>
    <!-- temporary filter -->
    <div class="border p-2" v-if="temporaryFilter">
      <filter-monitor :filter="temporaryFilter" @daterange-changed="updateTemporaryFilter" />

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

<script>
import Daterange from '@/models/Daterange'
import FilterDaterange from '@/models/FilterDaterange'

import BaseTitleBar from '@/components/base/BaseTitleBar'
import InfoButton from '@/components/base/InfoButton'
import Timeline from '@/components/modules/Timeline'
import FilterMonitor from '@/components/modules/FilterMonitor'
import { getFilterHash } from '../../models/SearchQuery'

export default {
  name: 'FilterTimeline',
  props: {
    infoButtonId: String,
    startYear: Number,
    endYear: Number,
    minDate: Date,
    maxDate: Date,
    groupBy: {
      type: String,
      default: 'articles',
    },
    filters: {
      /** @type {import('vue').PropType<import('@/models').Filter[]>} */
      type: Array,
      default: () => [],
    },
    values: {
      type: Array,
      default: () => [],
    },
    disableRelativeDisplayStyle: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    temporaryFilter: null,
    selectedFilterBrush: [],
    selectedFilterIndex: -1,
    displayStyle: 'sum',
  }),
  components: {
    BaseTitleBar,
    InfoButton,
    Timeline,
    FilterMonitor,
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
      let d
      if (this.selectedFilter) {
        console.info('selectedFilter changed', this.selectedFilter)
        d = this.minDate.toISOString()
      } else {
        d = this.minDate.toISOString()
      }
      return d.split('T').shift()
    },
    endDaterange() {
      const d = this.maxDate.toISOString()
      return d.split('T').shift()
    },
    isPercentage() {
      return this.displayStyle === 'percent'
    },
    displayStyleOptions() {
      return ['percent', 'sum'].map((value) => ({
        text: this.$t(`label.display.${value}`),
        value,
      }))
    },
    // a string of min amd max date
    dateRangeString() {
      return `${this.startDaterange} - ${this.endDaterange}`
    },
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
        }),
      )
    },
    updateTemporaryFilter(f) {
      console.info('updateTemporaryFilter', f)
      this.temporaryFilter = new FilterDaterange({
        type: 'daterange',
        q: [f.q],
      })
    },
    updateBrush(filter) {
      const daterange = new Daterange({
        daterange: filter.q,
      })
      console.info('updateBrush', filter, daterange)
      this.selectedFilterBrush = [daterange.start, daterange.end]
    },
    addDaterangeFilter() {
      this.$emit('changed', [this.temporaryFilter].concat(this.filters))
      this.temporaryFilter = null
    },
    removeTemporaryDaterangeFilter() {
      this.temporaryFilter = null
    },
    addTemporaryDaterangeFilter() {
      if (this.temporaryFilter) {
        return
      }
      const daterange = new Daterange({
        start: this.minDate,
        end: this.maxDate,
      })
      console.info('addDaterangeFilter() q:', daterange.getValue())
      this.temporaryFilter = new FilterDaterange({
        type: 'daterange',
        q: [daterange.getValue()],
        daterange: daterange.getValue(),
      })
      this.temporaryFilter.hash = getFilterHash(this.temporaryFilter)
      // set selectedIndex as first item.
      this.selectedFilterIndex = 0
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
          end: data.maxDate,
        })
        // console.log(daterange, data)
        this.temporaryFilter = new FilterDaterange({
          type: 'daterange',
          context: this.temporaryFilter.context,
          q: [daterange.getValue()],
          daterange: daterange.getValue(),
        })
        this.temporaryFilter.hasChanges = true
      }
    },
  },
  watch: {
    dateRangeString() {
      console.debug('[FilterTimeline] changed minDate', this.minDate)
    },
  },
}
</script>

<style lang="css" scoped></style>
<i18n>
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
