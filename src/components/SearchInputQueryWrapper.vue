<template lang="html">
  <div>
    <search-bar
    v-bind:query="query"
    v-on:search="onSearch"
    v-on:clear="onClear"
    v-on:click_add="onClickAdd"
    v-on:changeSearchQuery="onChangeSearchQuery"
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
  },
  methods: {
    onSearch() {
      this.onClickAdd();
      this.$store.commit('search/STORE_SEARCH');
      this.$store.dispatch('search/SEARCH');
      this.$router.push({
        name: 'search_results',
      });
    },
    onChangeSearchQuery(query) {
      this.query = query;
    },
    onClear() {
      this.$store.commit('search/CLEAR');
      this.query = '';
    },
    onClickAdd() {
      const operators = [
        'and',
        'or',
        '(',
        ')',
      ];

      if (this.query !== '') {
        this.$store.commit('search/ADD_FILTER', {
          type: operators.indexOf(this.query.toLowerCase()) >= 0 ? 'Operator' : 'String',
          query: this.query,
          context: 'include',
        });
      }
      this.query = '';
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
