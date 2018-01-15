<template lang="html">
  <div>
    <filter-date-range v-model="date_range" />
    <filter-map />
    <!-- <b-button v-on:click="submitFilter" id="button-filter" variant="primary" block>Filter</b-button> -->
  </div>
</template>

<script>
import FilterDateRange from './modules/SearchFilterDateRange';
import FilterMap from './modules/SearchFilterMap';

export default {
  data() {
    return {
      date_range: {
        start: this.$store.state.search.dateRangeStart,
        end: this.$store.state.search.dateRangeEnd,
      },
      bounding_box: {

      },
    };
  },
  methods: {
    submitFilter() {
      this.$store.commit('search/STORE_SEARCH');
      this.$store.dispatch('search/SEARCH');
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
