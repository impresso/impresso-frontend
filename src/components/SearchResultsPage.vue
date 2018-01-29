<template>
<main id="SearchResultsPage">
  <div class="top mb-4 py-2">
    <b-container>
      <b-row>
        <b-col md="6" offset-md="3">
          <search-bar />
        </b-col>
      </b-row>
    </b-container>
  </div>
  <b-container>
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
        <search-results-list-item
          v-if="displayStyle === 'list'"
          v-for="searchResult in searchResults"
          v-bind:value="searchResult"
          v-on:click="onClickResult(searchResult)" />
        <b-row v-if="displayStyle === 'tiles'">
          <b-col cols="6" sm="4" md="3" lg="2" v-for="searchResult in searchResults">
            <search-results-tiles-item
            v-on:click="onClickResult(searchResult)"
            v-bind:value="searchResult"
            />
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
  name: 'HelloWorld',
  props: ['uuid'],
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
          article_id: searchResult.uid,
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
      this.$store.dispatch('search/SEARCH');
    }
  },
};
</script>

<style scoped lang="less">
.search_wrapper {
    margin: 15px 0;
}

.top{
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
