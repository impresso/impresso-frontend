<template lang="html">
  <div id="search-filter-wrapper">
    <div ref="filters" v-for="(filter, index) in filters" v-bind:key="index">
      <div v-if="filter.type.toLowerCase() == 'string'">
        <filter-string
          v-model="filters[index]"
          v-on:input="updateFilter"
          v-on:submit="submitFilter"
          v-on:remove="removeFilter(index)"
        />
      </div>
      <div v-if="filter.type.toLowerCase() == 'namedentity'">
        <filter-named-entity
          v-model="filters[index]"
          v-on:input="updateFilter"
          v-on:remove="removeFilter(index)"
        />
      </div>
    </div>
    <b-button
      id="button-filter"
      class="mb-4"
      block
      variant="success"
      v-on:click="submitFilter">Filter</b-button>
  </div>
</template>

<script>
import FilterString from './modules/FilterString';
import FilterNamedEntity from './modules/FilterNamedEntity';

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
      this.$store.commit('search/UPDATE_PAGINATION_CURRENT_PAGE', {
        paginationCurrentPage: 1,
      });
      this.$store.commit('search/STORE_SEARCH');
      this.$store.dispatch('search/SEARCH');
      this.$router.push({
        name: 'search_results',
      });
    },
    removeFilter(index) {
      this.$store.commit('search/REMOVE_FILTER', {
        index,
      });
    },
  },
  components: {
    'filter-string': FilterString,
    'filter-named-entity': FilterNamedEntity,
  },
};
</script>

<style lang="less">
</style>
