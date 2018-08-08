<template lang="html">
  <div id="search-filter-wrapper">
    <div class="filters pb-2">
      <div ref="filters" v-for="(filter, index) in search.filters" v-bind:key="index">
          <filter-string
            v-if="filter.type.toLowerCase() === 'string'"
            v-model="search.filters[index]"
            v-on:input="updateFilter"
            v-on:submit="submitFilter"
            v-on:remove="removeFilter(index)"
          />
          <filter-named-entity
            v-if="filter.type.toLowerCase() === 'entity'"
            v-model="search.filters[index]"
            v-on:input="updateFilter"
            v-on:remove="removeFilter(index)"
          />
          <filter-date-range
            v-if="filter.type.toLowerCase() === 'daterange'"
            v-model="search.filters[index]"
            v-on:input="updateFilter"
            v-on:remove="removeFilter(index)"
          />
      </div>
    </div>
    <b-button
      id="button-filter"
      block
      variant="success"
      v-on:click="submitFilter">Filter</b-button>
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
