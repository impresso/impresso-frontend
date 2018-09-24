<template lang="html">
  <div id="search-filter-wrapper">
      <div v-for="(filter, index) in filters" v-bind:key="index">
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
    <div class="mb-4">
      <base-title-bar>{{$t(`Timeline`)}}</base-title-bar>
      <!--
        TODO load min date and max date from config ?
        Or we always provide an extent from the IML?
      -->
      <skyline :height="80" :data="timelineData" />

    </div>
    <!-- <filter-facet-year v-bind:data="getFacet('year')"></filter-facet-year> -->
  </div>
</template>

<script>
import BaseTitleBar from './base/BaseTitleBar';
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
    filters: {
      get() {
        // TODO: here we can sort the filters in order of type text/entity etc to group them
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
      this.$store.commit('search/REMOVE_FILTER', {
        index,
      });
      this.$emit('remove');
    },
  },
  components: {
    BaseTitleBar,
    'filter-string': FilterString,
    'filter-named-entity': FilterNamedEntity,
    'filter-date-range': FilterDateRange,
    'filter-facet-year': FilterFacetYear,
    Skyline,
  },
};
</script>

<style lang="less">
</style>
