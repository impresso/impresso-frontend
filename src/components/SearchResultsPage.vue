<template>
<main id="HomePage">
  <b-container>
    <b-row>
      <b-col md="6" offset-md="3">
        <SearchBar api="http://localhost:8000/api/" :query="query" @changeSearchQuery="onChangeSearchQuery" @search="onSearch" @clear="onClear" />
      </b-col>
    </b-row>
    <b-row>
      <b-col xs="6">
        Sort
        <b-dropdown :text="displaySortBy + ' ' + displaySortOrder" size="sm" variant="outline-primary">
          <b-dropdown-item @click="setSort('relevance', 'asc')" :active="displaySortBy === 'relevance' && displaySortOrder === 'asc'">Relevance ASC</b-dropdown-item>
          <b-dropdown-item @click="setSort('relevance', 'desc')" :active="displaySortBy === 'relevance' && displaySortOrder === 'desc'">Relevance DESC</b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item @click="setSort('date', 'asc')" :active="displaySortBy === 'date' && displaySortOrder === 'asc'">Date ASC</b-dropdown-item>
          <b-dropdown-item @click="setSort('date', 'desc')" :active="displaySortBy === 'date' && displaySortOrder === 'desc'">Date DESC</b-dropdown-item>
        </b-dropdown>
      </b-col>
      <b-col xs="6" class="text-right">
        Display
        <b-form-radio-group v-model="displayStyle" button-variant="outline-primary" size="sm" buttons id="radios2" name="radioSubComponent">
          <b-form-radio value="list">List</b-form-radio>
          <b-form-radio value="tiles">Tiles</b-form-radio>
        </b-form-radio-group>
      </b-col>
    </b-row>
    <hr> query: {{query}}
    <br>displaySortBy: {{displaySortBy}}
    <br>displaySortOrder: {{displaySortOrder}}
    <br>displayStyle: {{displayStyle}}
    <br>uuid: {{uuid}}
    <hr>
    <div class="" v-for="search in searches">
      <ul>
        <li>query: {{search.query}}</li>
        <li>uuid: {{search.uuid}}</li>
        <li>display sort by: {{search.displaySortBy}}</li>
        <li>display sort order: {{search.displaySortOrder}}</li>
        <li>display style: {{search.displayStyle}}</li>
      </ul>
      <b-button :disabled="search.uuid === uuid" variant="primary" @click="loadSearch(search.uuid)">Load</b-button>
      <hr>
    </div>
  </b-container>
</main>
</template>

<script>
import SearchBar from './modules/SearchInputQuery';

export default {
  name: 'HelloWorld',
  props: ['uuid'],
  computed: {
    displaySortOrder: {
      get() {
        return this.$store.state.search.search.displaySortOrder;
      },
    },
    displaySortBy: {
      get() {
        return this.$store.state.search.search.displaySortBy;
      },
    },
    query: {
      get() {
        return this.$store.state.search.search.query;
      },
    },
    displayStyle: {
      get() {
        return this.$store.state.search.search.displayStyle;
      },
      set(val) {
        this.$store.commit('search/UPDATE_SEARCH_DISPLAY_STYLE', {
          displayStyle: val,
        });
      },
    },
    searches: {
      get() {
        return this.$store.state.search.searches;
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
      this.$router.push({
        name: 'search_results',
      });
    },
    onClear() {
      this.$store.commit('search/CLEAR_QUERY');
    },
    setSort(sortBy, sortOrder) {
      this.$store.commit('search/UPDATE_SEARCH_DISPLAY_SORT', {
        displaySortBy: sortBy,
        displaySortOrder: sortOrder,
      });
    },
    loadSearch(uuid) {
      this.$store.commit('search/LOAD_SEARCH', uuid);
    },
  },
  components: {
    SearchBar,
  },
  mounted() {
    this.$store.commit('search/LOAD_SEARCH', this.uuid);
  },
};
</script>

<style scoped lang="less">
.search_wrapper {
    margin: 15px 0;
}
</style>
