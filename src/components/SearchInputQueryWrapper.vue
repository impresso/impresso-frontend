<template lang="html">
  <div>
    <search-bar
    v-bind:query="query"
    v-bind:results="results"
    v-on:search="onSearch"
    v-on:clear="onClear"
    v-on:changeSearchQuery="onChangeSearchQuery"
    v-on:clickFilter="onClickFilter"
    />
    <b-button-group class="filter" size="sm" v-for="(filter, key) in filters">
      <b-button variant="primary">{{filter.type}}: {{filter.query}}</b-button>
      <b-button variant="danger" v-on:click="removeFilter(key)">x</b-button>
    </b-button-group>
  </div>
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
      this.$store.commit('search/STORE_SEARCH');
      this.$store.dispatch('search/SEARCH');
      this.$router.push({
        name: 'search_results',
      });
    },
    onChangeSearchQuery(query) {
      this.query = query;
      this.$store.dispatch('autocomplete/SEARCH', {
        query: query.trim(),
      });
    },
    onClear() {
      this.$store.commit('search/CLEAR');
      this.$store.commit('autocomplete/CLEAR_RESULTS');
      this.query = '';
    },
    onClickFilter(filter) {
      this.$store.commit('search/ADD_FILTER', filter.filter);
    },
    removeFilter(key) {
      this.$store.commit('search/REMOVE_FILTER', {
        index: key,
      });
    },
  },
  components: {
    'search-bar': SearchBar,
  },
};
</script>

<style scoped lang="less">
.filter {
    margin-right: 5px;
    margin-bottom: 5px;
}
</style>
