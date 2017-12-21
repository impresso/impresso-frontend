<template lang="html">
  <div>
    <filter-date-range
    v-bind:date-start="date_range.start"
    v-bind:date-end="date_range.end"
    v-on:changeDateStart="onChangeDateStart"
    v-on:changeDateEnd="onChangeDateEnd"
    />
    <filter-map />
    <b-button v-on:click="submitFilter" id="button-filter" variant="primary" block>Filter</b-button>
  </div>
</template>

<script>
import FilterDateRange from './modules/SearchFilterDateRange';
import FilterMap from './modules/SearchFilterMap';

export default {
  computed: {
    date_range: {
      get() {
        return {
          start: this.$store.state.search.search.filterDateRangeStart,
          end: this.$store.state.search.search.filterDateRangeEnd,
        };
      },
    },
  },
  methods: {
    onChangeDateStart(val) {
      this.date_range.start = val;
      this.updateFilterDateRange();
    },
    onChangeDateEnd(val) {
      this.date_range.end = val;
      this.updateFilterDateRange();
    },
    updateFilterDateRange() {
      this.$store.commit('search/UPDATE_FILTER_DATE_RANGE', {
        filterDateRangeStart: this.date_range.start,
        filterDateRangeEnd: this.date_range.end,
      });
    },
    submitFilter() {
      this.$store.commit('search/STORE_SEARCH');
      this.$router.push({
        name: 'search_results',
      });
    },
  },
  components: {
    'filter-date-range': FilterDateRange,
    'filter-map': FilterMap,
  },
};
</script>

<style scoped lang="less">
.filter {
    margin-bottom: 15px;
}
</style>
