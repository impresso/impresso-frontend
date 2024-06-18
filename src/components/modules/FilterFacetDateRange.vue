<template>
  <div class="FilterFacetDateRange">
    <BaseTitleBar>{{ $t('label_daterange_title') }} {{ minDate }} - {{ maxDate }}
      <template v-slot:options>
        <b-button v-show="filters.length" size="sm" variant="outline-primary" @click="resetFilters()">
          {{ $t('actions.reset') }}
        </b-button>
      </template>
    </BaseTitleBar>
    <!-- <div class="border p-2 bg-white" v-for="(filter, i) in daterangeFilters" :key="i">
      <FilterMonitor
        :filter="filter"
        @daterange-changed="onFilterChanged"
        :min-date="minDate"
        :max-date="maxDate"
      />
    </div> -->
    <b-button size="sm" variant="outline-primary" @click="addDaterangeFilter">
      {{ $t('actions.addNewDateRangeFilter') }}
    </b-button>
    <FilterDateRangeCalendar v-if="newFilter" :min-date="minDate" :start-date="startDate || minDate" :max-date="maxDate"
      :end-date="endDate || maxDate" @changed="updateDaterangeFilters" />
  </div>
</template>

<script>
import Daterange from '@/models/Daterange'
import BaseTitleBar from '@/components/base/BaseTitleBar.vue'
import FilterDaterange from '@/models/FilterDaterange'
import FilterDateRangeCalendar from '@/components/modules/FilterDateRangeCalendar.vue'

export default {
  name: 'FilterFacetDateRange',
  components: {
    BaseTitleBar,
    FilterDateRangeCalendar,
  },
  data: () => ({
    newFilter: null,
  }),
  props: {
    minDate: { type: Date, required: true },
    maxDate: { type: Date, required: true },

    /**
     * The start date for the new date range filter.
     * @type {Date}
     * @default null
     * @required false
     */
    startDate: { type: Date, required: false },
    /**
     * The end date for the new date range filter.
     * @type {Date}
     * @default null
     * @required false
     */
    endDate: { type: Date, required: false },
    filterType: { type: String, required: true },
    filters: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    daterangeFilters() {
      return this.filters.filter(f => f.type === this.filterType)
    },
  },
  methods: {
    addDaterangeFilter() {
      const daterange = new Daterange({ start: this.minDate, end: this.maxDate })
      this.newFilter = new FilterDaterange({
        type: this.filterType,
        q: [daterange.getValue()],
      })
    },
    onFilterChanged(filter) {
      console.info('[FilterFacetDateRange] @changed:onFilterChanged', filter)
    },
    updateDaterangeFilters(filters) {
      this.newFilter = null
      console.info('[FilterFacetDateRange] @changed:updateDaterangeFilters', filters)
      this.$emit('changed', filters)
    },
    resetFilters() {
      this.$emit('reset-filters', 'daterange')
    },
  },
}
</script>
<i18n lang="json">{
  "en": {
    "label_daterange_title": "publication date"
  }
}</i18n>
