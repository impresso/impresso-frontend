<template lang="html">
  <div>
    <div v-for="(filter, index) in filters" v-bind:key="index">
      <filter-abstract-wrapper v-model="filters[index]" v-on:input="updateFilter(filter, index)" />
      <hr>
    </div>
    <b-button v-on:click="submitFilter" id="button-filter" variant="primary" block>Filter</b-button>
  </div>
</template>

<script>
import FilterAbstractWrapper from './modules/FilterAbstractWrapper';

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
    'filter-abstract-wrapper': FilterAbstractWrapper,
  },
};
</script>

<style scoped lang="less">
</style>
