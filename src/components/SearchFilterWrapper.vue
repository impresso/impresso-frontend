<template lang="html">
  <div id="search-filter-wrapper">
    <b-dropdown text="Add Filter" class="add-filter">
      <b-dropdown-item v-on:click="addStringFilter">String</b-dropdown-item>
      <b-dropdown-item v-on:click="addMapFilter">Map</b-dropdown-item>
      <b-dropdown-item v-on:click="addDateRangeFilter">Date Range</b-dropdown-item>
    </b-dropdown>
    <div ref="filters" v-for="(filter, index) in filters" v-bind:key="index">
      <div v-if="filter.type.toLowerCase() == 'string'">
        <filter-string v-model="filters[index]" v-on:input="updateFilter" />
      </div>
      <div v-if="filter.type.toLowerCase() == 'daterange'">
        <filter-date-range v-model="filters[index]" v-on:input="updateFilter" />
      </div>
      <div v-if="filter.type.toLowerCase() == 'latlngbounds'">
        <filter-map v-model="filters[index]" v-on:input="updateFilter" />
      </div>
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
        type: 'LatLngBounds',
        SouthWest: {
          lat: 31.50362930577303,
          lng: -12.304687500000002,
        },
        NorthEast: {
          lat: 56.26776108757582,
          lng: 24.609375000000004,
        },
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

<style lang="less">
#search-filter-wrapper {
    .add-filter {
        margin-bottom: 20px;
        width: 100%;
        .dropdown-toggle {
            width: 100%;
        }
    }

    .filter {
        margin-bottom: 20px;
        border: 1px solid black;
        padding: 1px;
    }
}
</style>
