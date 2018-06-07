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
  },
};
</script>

<style lang="less">
</style>
