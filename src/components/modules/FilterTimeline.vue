<template lang="html">
  <div class="filter-timeline">
    <base-title-bar>{{$t(`label.timeline.${groupBy}`)}}
      <div slot="options">
        <b-button v-show="filters.length" size="sm" variant="outline-primary" @click="resetFilters()">
          {{ $t('actions.reset') }}
        </b-button>
      </div>
      <div slot="description">
        <span v-if="filters.length">
          {{$t(`label.timelineDescription.${groupBy}.filtered.${displayStyle}`)}}
        </span>
        <span v-else>
            {{$t(`label.timelineDescription.${groupBy}.description.${displayStyle}`)}}
        </span>
        <b-nav-form>
          <b-form-radio-group v-model="displayStyle" :options="displayStyleOptions" button-variant="outline-primary" size="sm" buttons/>
          <info-button name="relative-vs-absolute-year-graph" class="ml-2" />
        </b-nav-form>
      </div>
    </base-title-bar>

    <!--  timeline vis -->
    <timeline class='bg-light pb-2'
      :values="values"
      :brush="brush"
      :domain="[startYear, endYear]"
      :percentage="isPercentage"
      @brushed="onTimelineBrushed">
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

    <div v-if="!filters.length" class="pt-3">
      <b-button size="sm" variant="outline-primary" @click="addDaterangeFilter">
      {{ $t('label.daterange.pick') }}
      </b-button>
    </div>
    <!-- temporary filter -->
    <filter-monitor
      v-if="temporaryFilter" class="border p-2 mt-2"
      :filter="temporaryFilter"
      @changed="updateDaterangeFilter" />
  </div>
</template>

<script>
import Daterange from '@/models/Daterange';
import FilterDaterange from '@/models/FilterDaterange';

import BaseTitleBar from '@/components/base/BaseTitleBar';
import InfoButton from '@/components/base/InfoButton';
import Timeline from '@/components/modules/Timeline';
import FilterMonitor from '@/components/modules/FilterMonitor';

export default {
  props: {
    startYear: Number,
    endYear: Number,
    minDate: Date,
    maxDate: Date,
    groupBy: {
      type: String,
      default: 'articles',
    },
    filters: {
      /** @type {import('vue').PropType<import('../models/models').Filter[]>} */
      type: Array,
      default: () => [],
    },
    values: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    temporaryFilter: null,
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
      if (this.selectedFilter) {
        return [
          this.selectedFilter.items[0].start,
          this.selectedFilter.items[0].end,
        ];
      }
      return null;
    },
    startDate() {
      return new Date(`${this.startYear}-01-01`);
    },
    endDate() {
      return new Date(`${this.endYear}-12-31`);
    },
    daterangeFilters() {
      if (this.temporaryFilter) {
        return [
          this.temporaryFilter,
        ].concat(this.filters);
      }
      return [].concat(this.filters);
    },
    startDaterange() {
      let d;
      if (this.selectedFilter) {
        console.info('selectedFilter changed', this.selectedFilter);
        d = this.minDate.toISOString();
      } else {
        d = this.minDate.toISOString();
      }
      return d.split('T').shift();
    },
    endDaterange() {
      const d = this.maxDate.toISOString();
      return d.split('T').shift();
    },
    isPercentage() {
      return this.displayStyle === 'percent';
    },
    displayStyleOptions() {
      return ['percent', 'sum'].map(value => ({
        text: this.$t(`label.display.${value}`),
        value,
      }));
    },
  },
  methods: {
    resetFilters() {
      this.$emit('reset-filters', 'daterange');
    },
    updateDaterangeFilter() {
      console.info('updateDaterangeFilter');
    },
    addDaterangeFilter() {
      if (this.temporaryFilter) {
        return;
      }
      const daterange = new Daterange({
        start: this.minDate,
        end: this.maxDate,
      });
      console.info('addDaterangeFilter() q:', daterange.getValue());
      this.temporaryFilter = new FilterDaterange({
        type: 'daterange',
        q:[daterange.getValue()],
        daterange: daterange.getValue(),
      });
      this.temporaryFilter.hash = this.temporaryFilter.getHash();
      // set selectedIndex as first item.
      this.selectedFilterIndex = 0;
    },
    onTimelineBrushed(data) {
      if (!this.temporaryFilter) {
        return;
      }
      const value = `${data.minValue}T00:00:00Z TO ${data.maxValue}T23:59:59Z`;
      // console.info('',value, '\n', this.temporaryFilter.q[0]);
      if (value !== this.temporaryFilter.q[0]) {
        const daterange = new Daterange({
          start: data.minDate,
          end: data.maxDate,
        });
        // console.log(daterange, data)
        this.temporaryFilter = new FilterDaterange({
          type: 'daterange',
          context: this.temporaryFilter.context,
          q:[daterange.getValue()],
          daterange: daterange.getValue(),
        });
        this.temporaryFilter.hasChanges = true;
      }
      // let changed = false;
      // if (this.startDaterange !== data.minValue) {
      //   changed = true;
      //   this.startDaterange = data.minValue;
      // }
      // if (this.endDaterange !== data.maxValue) {
      //   changed = true;
      //   this.endDaterange = data.maxValue;
      // }
      // if (!changed) {
      //   return;
      // }
      // const item = new Daterange({
      //   start: this.startDaterange,
      //   end: this.endDaterange,
      // });
      // item.checked = true;
      // if (this.daterangeSelected) {
      //   this.$store.commit(`${this.store}/UPDATE_FILTER_ITEM`, {
      //     filter: this.daterangeSelected,
      //     item,
      //     uid: this.daterangeSelected.items[this.daterangeSelectedItemIndex].uid,
      //   });
      // }
    },
  },
};
</script>

<style lang="css" scoped>
</style>
<i18n>
{
  "en": {
    "label": {
      "timeline": {
        "articles": "publication date",
        "images": "publication date"
      },
      "timelineDescription": {
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
        "pick": "add filter ...",
        "start": "from",
        "end": "to",
        "apply": "add as filter"
      }
    }
  }
}
</i18n>
