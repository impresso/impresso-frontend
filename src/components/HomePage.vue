<template>
<main id="HomePage">
  <div class="search_wrapper">
    <b-container>
      <b-row>
        <b-col md="6" offset-md="3">
          <SearchBar api="http://localhost:8000/api/" @changeSearchQuery="onChangeSearchQuery" @search="onSearch" />
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <h1>This is the homepage</h1>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
            irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </b-col>
      </b-row>
    </b-container>
  </div>
</main>
</template>

<script>
import SearchBar from './modules/SearchInputQuery';

export default {
  name: 'HelloWorld',
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
      this.$router.push({
        name: 'search_results',
      });
    },
  },
  components: {
    SearchBar,
  },
};
</script>

<style scoped lang="less">
.search_wrapper {
    margin: 15px 0;
}
</style>
