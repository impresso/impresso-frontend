<template>
<main id="SearchResultsPage">
  <div class="top mb-4 py-2">
    <b-container>
      <b-row>
        <b-col md="6" offset-md="3">
          <search-bar v-bind:showAddButton="true" />
        </b-col>
      </b-row>
    </b-container>
  </div>
  <b-container v-if="filters.length == 0">
    <b-row>
      <b-col>
        <h1>No results</h1>
      </b-col>
    </b-row>
  </b-container>
  <b-container v-if="filters.length > 0">
    <b-row>
      <b-col md="3">
        <search-filter-wrapper />
      </b-col>
      <b-col>
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
        <b-row v-if="displayStyle === 'list'">
          <b-col class="pb-5" cols="12" v-for="(searchResult, index) in searchResults" v-bind:key="searchResult.article_uid">
            <search-results-list-item v-on:click="onClickResult(searchResult)" v-model="searchResults[index]" />
          </b-col>
        </b-row>
        <b-row class="pb-5" v-if="displayStyle === 'tiles'">
          <b-col cols="6" sm="6" md="4" lg="4" v-for="(searchResult, index) in searchResults" v-bind:key="searchResult.article_uid">
            <search-results-tiles-item v-on:click="onClickResult(searchResult)" v-model="searchResults[index]" />
          </b-col>
        </b-row>
        <hr>
        <pagination v-bind:perPage="paginationPerPage" v-bind:currentPage="paginationCurrentPage" v-bind:totalRows="paginationTotalRows" v-on:input="onInputPagination" />
      </b-col>
    </b-row>
  </b-container>
</main>
</template>

<script>
import SearchBar from './SearchInputQueryWrapper';
import Pagination from './modules/Pagination';
import SearchFilterWrapper from './SearchFilterWrapper';
import SearchResultsListItem from './modules/SearchResultsListItem';
import SearchResultsTilesItem from './modules/SearchResultsTilesItem';

export default {
  props: {
    // uid and query are passed down from the router
    uid: { // uid of a named entity
      default: false,
    },
    query: { // string search
      default: false,
    },
  },
  computed: {
    displaySortOrder: {
      get() {
        return this.$store.state.search.displaySortOrder;
      },
    },
    displaySortBy: {
      get() {
        return this.$store.state.search.displaySortBy;
      },
    },
    paginationPerPage: {
      get() {
        return this.$store.state.search.paginationPerPage;
      },
    },
    paginationCurrentPage: {
      get() {
        return this.$store.state.search.paginationCurrentPage;
      },
    },
    paginationTotalRows: {
      get() {
        return this.$store.state.search.paginationTotalRows;
      },
    },
    displayStyle: {
      get() {
        return this.$store.state.search.displayStyle;
      },
      set(val) {
        this.$store.commit('search/UPDATE_SEARCH_DISPLAY_STYLE', {
          displayStyle: val,
        });
      },
    },
    searchResults: {
      get() {
        return this.$store.state.search.results;
      },
    },
    filters: {
      get() {
        return this.$store.state.search.search.filters;
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
    setSort(sortBy, sortOrder) {
      this.$store.commit('search/UPDATE_SEARCH_DISPLAY_SORT', {
        displaySortBy: sortBy,
        displaySortOrder: sortOrder,
      });
      this.$store.commit('search/UPDATE_PAGINATION_CURRENT_PAGE', {
        paginationCurrentPage: 1,
      });
      this.$store.dispatch('search/SEARCH');
    },
    loadSearch(uuid) {
      this.$store.commit('search/LOAD_SEARCH', uuid);
      this.$store.dispatch('search/SEARCH');
    },
    onInputPagination(pageNumber) {
      this.$store.commit('search/UPDATE_PAGINATION_CURRENT_PAGE', {
        paginationCurrentPage: pageNumber,
      });
      this.$store.dispatch('search/SEARCH');
    },
    onClickResult(searchResult) {
      this.$router.push({
        name: 'article',
        params: {
          issue_uid: searchResult.issue.uid,
          page_number: searchResult.pages[0].num,
          page_uid: searchResult.pages[0].uid,
          article_uid: searchResult.uid,
        },
      });
    },
  },
  components: {
    Pagination,
    'search-bar': SearchBar,
    'search-results-list-item': SearchResultsListItem,
    'search-results-tiles-item': SearchResultsTilesItem,
    'search-filter-wrapper': SearchFilterWrapper,
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

.top {
    background: #f4f5f6;
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
