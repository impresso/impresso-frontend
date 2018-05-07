<template lang="html">
    <search-bar
    v-bind:query="query"
    v-bind:results="results"
    v-on:search="onSearch"
    v-on:reset="onReset"
    v-on:changeSearchQuery="onChangeSearchQuery"
    v-on:clickResult="onClickResult"
    />
</template>

<script>
import SearchBar from './modules/SearchInputQuery';

export default {
  data: () => ({
    query: '',
  }),
  computed: {
    filters: {
      get() {
        return this.$store.state.search.search.filters;
      },
    },
    results: {
      get() {
        return this.$store.state.autocomplete.results;
      },
    },
  },
  methods: {
    onSearch() {
      if (this.$store.state.search.search.filters.length) {
        this.query = '';

        this.$store.commit('search/UPDATE_PAGINATION_CURRENT_PAGE', {
          paginationCurrentPage: 1,
        });

        this.$store.commit('search/STORE_SEARCH');
        this.$store.dispatch('search/SEARCH');

        this.$router.push({
          name: 'search_results',
        });
      }
    },
    onChangeSearchQuery(query) {
      if (query.length > 1) {
        this.query = query;
        this.$store.dispatch('autocomplete/SEARCH', {
          query: query.trim(),
        });
      }
    },
    onReset() {
      this.$store.commit('search/CLEAR');
      this.$store.commit('autocomplete/CLEAR_RESULTS');
      this.query = '';
    },
    onClickResult(result) {
      this.query = '';
      this.$store.commit('autocomplete/CLEAR_RESULTS');
      this.$store.commit('search/ADD_FILTER', result.filter);
    },
  },
  components: {
    'search-bar': SearchBar,
  },
};
</script>

<style scoped lang="less">
</style>
