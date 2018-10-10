<template lang="html">
  <div id="search-filters" class="px-4">
    <div v-for="(filter, index) in filters">
      <filter-string
        v-if="filter.type.toLowerCase() === 'string'"
        v-model="filters[index]"
        v-on:input="updateFilter"
        v-on:submit="submitFilter"
        v-on:remove="removeFilter(index)"
        />
      <filter-named-entity
        v-if="filter.type.toLowerCase() === 'entity'"
        v-model="filters[index]"
        v-on:submit="submitFilter"
        v-on:remove="removeFilter(index)"
        />
      <filter-date-range
        v-if="filter.type.toLowerCase() === 'daterange'"
        v-model="filters[index]"
        v-on:submit="submitFilter"
        v-on:remove="removeFilter(index)"
        />
    </div>
    <div class="pb-2">
      <base-title-bar>Timeline</base-title-bar>
      <!--
        TODO load min date and max date from config ?
        Or we always provide an extent from the IML?
      -->
      <skyline :height="80" :data="timelineData" />
    </div>
    <div v-for="(filter, index) in filters">
      <filter-facet
        v-if="facetTypes.includes(filter.type.toLowerCase())"
        v-model="filters[index]"
        v-on:input="updateFilter"
        v-on:remove="submitFilter"
        />
    </div>
  </div>
</template>

<script>
import BaseTitleBar from './base/BaseTitleBar';
import FilterFacet from './modules/FilterFacet';
import FilterDateRange from './modules/FilterDateRange';
import FilterNamedEntity from './modules/FilterNamedEntity';
import FilterString from './modules/FilterString';
import FilterFacetYear from './modules/FilterFacetYear';
import Skyline from './d3/Skyline';

export default {
  computed: {
    search: {
      get() {
        return this.$store.getters['search/getSearch'];
      },
    },
    facetTypes: {
      get() {
        return this.$store.state.search.facetTypes;
      },
    },
    filters: {
      get() {
        return this.search.filters;
      },
    },
    timelineData: {
      get() {
        const yearFacets = this.getFacet('year') || {
          buckets: [],
        };
        return yearFacets.buckets.map(d => ({
          t: parseInt(d.val, 10),
          w: d.count,
        })).sort((a, b) => a.t - b.t);
      },
    },
  },
  methods: {
    getFacet(type) {
      return this.$store.getters['search/facets'].find(facet => facet.type === type);
    },
    updateFilter(filter) {
      this.$store.commit('search/UPDATE_FILTER', filter);
      this.$emit('input', filter);
    },
    submitFilter() {
      this.$emit('submit');
    },
    removeFilter(index) {
      this.$store.commit('search/REMOVE_FILTER', index);
      this.$emit('remove');
    },
  },
  components: {
    'filter-string': FilterString,
    'filter-named-entity': FilterNamedEntity,
    'filter-date-range': FilterDateRange,
    'filter-facet-year': FilterFacetYear,
    'filter-facet': FilterFacet,
    Skyline,
    BaseTitleBar,
  },
};
</script>

<style lang="less">
</style>
