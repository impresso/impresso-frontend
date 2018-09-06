<template>
<i-layout id="SearchPage">
  <i-layout-section width="400px" class="border-right">
    <div class="px-2 py-4 border-bottom">
      <search-bar />
    </div>
    <div class="px-2 py-4 pt-0 border-bottom" v-if="filters.length > 0">
      <search-filters class="border-bottom" v-on:remove="search()" v-on:submit="search()" />
    </div>
  </i-layout-section>
  <i-layout-section>
    <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
      <b-navbar-nav class="section px-3 py-3 pr-auto border-right">
        <label class="mr-1">{{$t("label_group")}}</label>
        <i-dropdown v-model="groupBy" v-bind:options="groupByOptions" size="sm" variant="outline-primary"></i-dropdown>
      </b-navbar-nav>
      <b-navbar-nav class="px-3 py-3 section border-right">
        <label class="mr-1">{{$t("label_order")}}</label>
        <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
      </b-navbar-nav>
      <b-navbar-nav class="px-3 py-3 section">
        <label class="mr-1">{{$t("label_display")}}</label>
        <b-nav-form>
          <b-form-radio-group v-model="displayStyle" button-variant="outline-primary" size="sm" buttons>
            <b-form-radio value="list">{{$t("display_button_list")}}</b-form-radio>
            <b-form-radio value="tiles">{{$t("display_button_tiles")}}</b-form-radio>
          </b-form-radio-group>
        </b-nav-form>
      </b-navbar-nav>
    </b-navbar>

    <b-navbar type="light" variant="light" class="border-bottom">
      <search-result-summary v-bind:queryComponents="queryComponents" v-bind:totalRows="paginationTotalRows" />
    </b-navbar>

    <div class="p-2">
      <b-container fluid>
        <b-row v-if="displayStyle === 'list'">
          <b-col cols="12" v-for="(searchResult, index) in searchResults" v-bind:key="searchResult.article_uid">
            <search-results-list-item v-on:click="onClickResult(searchResult)" v-model="searchResults[index]" />
          </b-col>
        </b-row>
        <b-row class="pb-5" v-if="displayStyle === 'tiles'">
          <b-col cols="6" sm="12" md="6" lg="3" v-for="(searchResult, index) in searchResults" v-bind:key="searchResult.article_uid">
            <search-results-tiles-item v-on:click="onClickResult(searchResult)" v-model="searchResults[index]" />
          </b-col>
        </b-row>
      </b-container>
      <hr>
      <pagination
        v-bind:perPage="paginationPerPage"
        v-bind:currentPage="paginationCurrentPage"
        v-bind:totalRows="paginationTotalRows"
        v-on:input="onInputPagination" v-on:change="search" />
    </div>
  </i-layout-section>
</i-layout>
</template>

<script>
import SearchBar from './SearchBar';
import Pagination from './modules/Pagination';
import SearchFilters from './SearchFilters';
import SearchResultsListItem from './modules/SearchResultsListItem';
import SearchResultsTilesItem from './modules/SearchResultsTilesItem';
import SearchResultsSummary from './modules/SearchResultsSummary';

export default {
  computed: {
    groupByOptions: {
      get() {
        return [
          {
            value: 'issues',
            text: this.$t('order_issues'),
          },
          {
            value: 'pages',
            text: this.$t('order_pages'),
          },
          {
            value: 'articles',
            text: this.$t('order_articles'),
          },
          {
            value: 'sentences',
            text: this.$t('order_sentences'),
          },
        ];
      },
    },
    orderByOptions: {
      get() {
        return [
          {
            value: 'relevance',
            text: `${this.$t('sort_relevance')} ${this.$t('sort_asc')}`,
          },
          {
            value: '-relevance',
            text: `${this.$t('sort_relevance')} ${this.$t('sort_desc')}`,
          },
          {
            value: 'date',
            text: `${this.$t('sort_date')} ${this.$t('sort_asc')}`,
          },
          {
            value: '-date',
            text: `${this.$t('sort_date')} ${this.$t('sort_desc')}`,
          },
        ];
      },
    },
    orderBy: {
      get() {
        return this.$store.state.search.orderBy;
      },
      set(val) {
        this.$store.commit('search/UPDATE_SEARCH_ORDER_BY', val);
        this.search();
      },
    },
    groupBy: {
      get() {
        return this.$store.state.search.groupBy;
      },
      set(val) {
        this.$store.commit('search/UPDATE_SEARCH_GROUP_BY', val);
        this.search();
      },
    },
    displayStyle: {
      get() {
        return this.$store.state.search.displayStyle;
      },
      set(displayStyle) {
        this.$store.commit('search/UPDATE_SEARCH_DISPLAY_STYLE', displayStyle);
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
    queryComponents: {
      get() {
        return this.$store.state.search.queryComponents;
      },
    },
    searchResults: {
      get() {
        return this.$store.getters['search/results'];
      },
    },
    filters: {
      get() {
        return this.$store.state.search.search.filters;
      },
    },
  },
  methods: {
    onInputPagination(page = 1) {
      this.search(page);
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
    search(page = 1) {
      this.$store.dispatch('search/SEARCH', page);
    },
    reset() {
      this.$store.commit('search/CLEAR');
      this.search(); // we do a search so we display all results in the corpus
    },
  },
  components: {
    Pagination,
    'search-bar': SearchBar,
    'search-results-list-item': SearchResultsListItem,
    'search-results-tiles-item': SearchResultsTilesItem,
    'search-filters': SearchFilters,
    'search-result-summary': SearchResultsSummary,
  },
  mounted() {
    if (this.uuid !== undefined) {
      this.$store.commit('search/LOAD_SEARCH', this.uuid);
    }
    this.search();
  },
  beforeDestroy() {
    // TODO: need to use the url to reflect the search, this way we can use back
    // button and keep the search AND go to home and start a new search
    // if(nextpage !=== "issue || article"){
    //     this.$store.commit('search/CLEAR');
    // }
  },
};
</script>

<style lang="less">
.navbar-nav {
    flex-direction: row;
    align-items: center;
    label {
      margin-bottom: 0;
      line-height: 1.5;
    }
}
</style>

<i18n>
{
  "en": {
    "label_display": "Display As",
    "label_order": "Order By",
    "label_group": "Group By",
    "sort_asc": "Ascending",
    "sort_desc": "Descending",
    "sort_date": "Date",
    "sort_relevance": "Relevance",
    "display_button_list": "List",
    "display_button_tiles": "Tiles",
    "order_issues": "Issue",
    "order_pages": "Page",
    "order_articles": "Article",
    "order_sentences": "Sentence"
  },
  "nl": {
    "label_display": "Toon Als",
    "label_order": "Sorteer Op",
    "label_group": "Rangschikken Per",
    "sort_asc": "Oplopend",
    "sort_desc": "Aflopend",
    "sort_date": "Datum",
    "sort_relevance": "Relavantie",
    "display_button_list": "Lijst",
    "display_button_tiles": "Tegels",
    "order_issues": "Uitgave",
    "order_pages": "Pagina",
    "order_articles": "Artikel",
    "order_sentences": "Zin"
  }
}
</i18n>
