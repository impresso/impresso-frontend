<template lang="html">
  <div>
    <div v-for="(filter, index) in filters" v-bind:key="index">
      <div v-if="filter.type.toLowerCase() == 'string'">
        <filter-string v-model="filters[index]" v-on:input="updateFilter" />
      </div>
      <div v-if="filter.type.toLowerCase() == 'daterange'">
        <filter-date-range v-model="filters[index]" />
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
