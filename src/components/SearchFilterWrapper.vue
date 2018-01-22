<template lang="html">
  <div id="search-filter-wrapper">
    <div ref="filters" v-for="(filter, index) in filters" v-bind:key="index">
      <div v-if="filter.type.toLowerCase() == 'string'">
        <filter-string v-model="filters[index]" v-on:input="updateFilter" v-on:submit="submitFilter" />
      </div>
      <div v-if="filter.type.toLowerCase() == 'namedentity'">
        <filter-named-entity v-model="filters[index]" v-on:input="updateFilter" />
      </div>

    </div>
    <b-button v-on:click="submitFilter" id="button-filter" variant="primary" block>Filter</b-button>
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
      this.$store.commit('search/STORE_SEARCH');
      this.$store.dispatch('search/SEARCH');
      this.$router.push({
        name: 'search_results',
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
