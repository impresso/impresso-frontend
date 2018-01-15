<template lang="html">
  <div>
    <button type="button" name="button" v-on:click="addStringFilter">Add String Filter</button>
    <button type="button" name="button" v-on:click="addMapFilter">Add Map Filter</button>
    <button type="button" name="button" v-on:click="addDateRangeFilter">Add Date Range Filter</button>
    <div ref="filters" v-for="(filter, index) in filters" v-bind:key="index">
      <div v-if="filter.type.toLowerCase() == 'string'">
        <filter-string v-model="filters[index]" v-on:input="updateFilter" />
      </div>
      <div v-if="filter.type.toLowerCase() == 'daterange'">
        <filter-date-range v-model="filters[index]" v-on:input="updateFilter" />
      </div>
      <div v-if="filter.type.toLowerCase() == 'boundingbox'">
        <filter-map v-model="filters[index]" v-on:input="updateFilter" />
      </div>
      <hr>
    </div>
    <b-button v-on:click="submitFilter" id="button-filter" variant="primary" block>Filter</b-button>
  </div>
</template>

<script>
import FilterDateRange from './modules/FilterDateRange';
import FilterMap from './modules/FilterMap';
import FilterString from './modules/FilterString';

export default {
  computed: {
    filters: {
      get() {
        return this.$store.state.search.search.filters;
      },
    },
  },
  methods: {
    updateFilter(filter, key) {
      console.log(filter);
      this.$store.commit('search/UPDATE_FILTER', {
        filter,
        key,
      });
    },
    submitFilter() {
      this.$store.commit('search/STORE_SEARCH');
      this.$store.dispatch('search/SEARCH');
      this.$router.push({
        name: 'search_results',
      });
    },
    addStringFilter() {
      this.$store.commit('search/ADD_FILTER', {
        type: 'String',
        query: '',
        context: 'include',
      });
    },
    addMapFilter() {
      this.$store.commit('search/ADD_FILTER', {
        type: 'BoundingBox',
        topleft: [12.34, 56.78],
        bottomright: [23.45, 67.89],
        context: 'include',
      });
    },
    addDateRangeFilter() {
      this.$store.commit('search/ADD_FILTER', {
        type: 'DateRange',
        start: '1850',
        end: `${(new Date()).getFullYear()}`,
        context: 'include',
      });
    },
  },
  components: {
    'filter-map': FilterMap,
    'filter-string': FilterString,
    'filter-date-range': FilterDateRange,
  },
};
</script>

<style scoped lang="less">
</style>
