<template lang="html">
  <div id="search-filters" class="px-4">
    <div v-for="(filter, index) in filters">
      <filter-facet-year
        v-if="filter.type === 'year'"
        v-model="filters[index]"
        v-on:input="updateFilter"
        v-on:remove="submitFilter" />
    </div>
    <div v-for="(filter, index) in filters">
      <filter-string
        v-if="filter.type.toLowerCase() === 'string'"
        v-model="filters[index]"
        v-on:input="updateFilter"
        v-on:submit="submitFilter"
        v-on:remove="removeFilter(index)" />
      <filter-named-entity
        v-if="filter.type.toLowerCase() === 'entity'"
        v-model="filters[index]"
        v-on:submit="submitFilter"
        v-on:remove="removeFilter(index)" />
      <filter-date-range
        v-if="filter.type.toLowerCase() === 'daterange'"
        v-model="filters[index]"
        v-on:submit="submitFilter"
        v-on:remove="removeFilter(index)" />
    </div>
    <div v-for="(filter, index) in filters">
      <filter-facet
        v-if="facetTypes.includes(filter.type.toLowerCase()) && filter.type !== 'year'"
        v-model="filters[index]"
        v-on:input="updateFilter"
        v-on:remove="submitFilter" />
    </div>
  </div>
</template>

<script>
import FilterFacet from './modules/FilterFacet';
import FilterFacetYear from './modules/FilterFacetYear';
import FilterDateRange from './modules/FilterDateRange';
import FilterNamedEntity from './modules/FilterNamedEntity';
import FilterString from './modules/FilterString';

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
  },
  methods: {
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
    'filter-facet': FilterFacet,
    'filter-facet-year': FilterFacetYear,
  },
};
</script>

<style lang="less">
</style>
