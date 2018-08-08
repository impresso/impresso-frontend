<template lang="html">
  <div id="search-filter-wrapper">
      <div ref="filters" v-for="(filter, index) in filters" v-bind:key="index">
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
          v-on:input="updateFilter"
          v-on:remove="removeFilter(index)"
        />
        <filter-date-range
          v-if="filter.type.toLowerCase() === 'daterange'"
          v-model="filters[index]"
          v-on:input="updateFilter"
          v-on:remove="removeFilter(index)"
        />
    </div>
  </div>
</template>

<script>
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
    filters: {
      get() {
        // TODO: here we can sort the filters in order of type text/entity etc to group them
        return this.search.filters;
      },
    },
  },
  methods: {
    updateFilter() {
      this.$emit('update');
      this.$store.commit('search/UPDATE_FILTER', {});
    },
    submitFilter() {
      this.$emit('submit');
    },
    removeFilter(index) {
      this.$emit('remove');
      this.$store.commit('search/REMOVE_FILTER', {
        index,
      });
    },
  },
  components: {
    'filter-string': FilterString,
    'filter-named-entity': FilterNamedEntity,
    'filter-date-range': FilterDateRange,
  },
};
</script>

<style lang="less">
</style>
