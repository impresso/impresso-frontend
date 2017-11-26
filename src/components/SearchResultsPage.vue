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
        {{$t("label_sort")}}
        <b-dropdown :text="getSortByLabel(displaySortBy, displaySortOrder)" size="sm" variant="outline-primary">
          <b-dropdown-item @click="setSort('relevance', 'asc')" :active="displaySortBy === 'relevance' && displaySortOrder === 'asc'" v-html="getSortByLabel('relevance', 'asc')"></b-dropdown-item>
          <b-dropdown-item @click="setSort('relevance', 'desc')" :active="displaySortBy === 'relevance' && displaySortOrder === 'desc'" v-html="getSortByLabel('relevance', 'desc')"></b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item @click="setSort('date', 'asc')" :active="displaySortBy === 'date' && displaySortOrder === 'asc'" v-html="getSortByLabel('date', 'asc')"></b-dropdown-item>
          <b-dropdown-item @click="setSort('date', 'desc')" :active="displaySortBy === 'date' && displaySortOrder === 'desc'" v-html="getSortByLabel('date', 'desc')"></b-dropdown-item>
        </b-dropdown>
      </b-col>
      <b-col xs="6" class="text-right">
        {{$t("label_display")}}
        <b-form-radio-group v-model="displayStyle" button-variant="outline-primary" size="sm" buttons id="radios2" name="radioSubComponent">
          <b-form-radio value="list">{{$t("display_button_list")}}</b-form-radio>
          <b-form-radio value="tiles">{{$t("display_button_tiles")}}</b-form-radio>
        </b-form-radio-group>
      </b-col>
    </b-row>
    <hr>
    <h1>Search History</h1>
    <div class="" v-for="search in searchesReversed">
      <ul>
        <li>query: {{search.query}}</li>
        <li>uuid: {{search.uuid}}</li>
        <li>display sort by: {{search.displaySortBy}}</li>
        <li>display sort order: {{search.displaySortOrder}}</li>
        <li>display style: {{search.displayStyle}}</li>
      </ul>
      <b-button variant="primary" @click="loadSearch(search.uuid)">Load</b-button>
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
    searchesReversed: {
      get() {
        return this.$store.getters['search/getSearchesReversed'];
      },
    },
  },
  methods: {
    getSortByLabel(sortBy, sortOrder) {
      let label = '';
      if (sortBy === 'date') {
        label += this.$t('sort_date');
      } else if (sortBy === 'relevance') {
        label += this.$t('sort_relevance');
      }

      label += ' ';

      if (sortOrder === 'asc') {
        label += this.$t('sort_asc');
      } else if (sortOrder === 'desc') {
        label += this.$t('sort_desc');
      }

      return label;
    },
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
    if (this.uuid !== undefined) {
      this.$store.commit('search/LOAD_SEARCH', this.uuid);
    }
  },
};
</script>

<style scoped lang="less">
.search_wrapper {
    margin: 15px 0;
}
</style>

<i18n>
{
  "en": {
    "label_display": "Display",
    "sort_asc": "Ascending",
    "sort_desc": "Descending",
    "sort_date": "Date",
    "sort_relevance": "Relevance",
    "label_sort": "Sort",
    "display_button_list": "List",
    "display_button_tiles": "Tiles"
  },
  "nl": {
    "label_display": "Toon",
    "sort_asc": "Oplopend",
    "sort_desc": "Aflopend",
    "sort_date": "Datum",
    "sort_relevance": "Relavantie",
    "label_sort": "Sorteer",
    "display_button_list": "Lijst",
    "display_button_tiles": "Tegels"
  }
}
</i18n>
