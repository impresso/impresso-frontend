<template lang="html">
  <search-bar
  :query="query"
  @changeSearchQuery="onChangeSearchQuery"
  @search="onSearch"
  @clear="onClear"
  />
</template>

<script>
import SearchBar from './modules/SearchInputQuery';

export default {
  computed: {
    query: {
      get() {
        return this.$store.state.search.search.query;
      },
    },
  },
  methods: {
    onChangeSearchQuery(val) {
      this.$store.commit('search/UPDATE_SEARCH_QUERY', {
        query: val,
      });
    },
    onSearch(val) {
      this.$store.commit('search/STORE_SEARCH', {
        query: val,
      });

      this.$store.dispatch('search/SEARCH');

      this.$router.push({
        name: 'search_results',
      });
    },
    onClear() {
      this.$store.commit('search/CLEAR_QUERY');
    },
  },
  components: {
    'search-bar': SearchBar,
  },
};
</script>

<style lang="css">
</style>
