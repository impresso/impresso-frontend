<template>
<i-layout id="SearchPage">
  <i-layout-section width="400px" class="border-right">
    <div slot="header" class="px-4 py-4 border-bottom">
      <search-bar />
    </div>
    <div class="py-4">
      <search-filters v-on:remove-filter="search" v-on:submit-filter="search" />
    </div>
    <div slot="footer">
      <b-button-group class="d-flex bg-white">
        <b-button class="w-100" v-on:click="search()">Search</b-button>
        <b-button class="w-100" v-on:click="reset">Clear</b-button>
      </b-button-group>
    </div>
  </i-layout-section>
  <i-layout-section>
    <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
      <b-navbar-nav class="px-3 py-3 pr-auto border-right">
        <label class="mr-1">{{$t("label_group")}}</label>
        <i-dropdown v-model="groupBy" v-bind:options="groupByOptions" size="sm" variant="outline-primary"></i-dropdown>
      </b-navbar-nav>
      <b-navbar-nav class="px-3 py-3 border-right">
        <label class="mr-1">{{$t("label_order")}}</label>
        <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
      </b-navbar-nav>
      <b-navbar-nav class="px-3 py-3">
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
      <b-dropdown v-bind:text="$t('query_actions')" size="sm" variant="outline-primary">
        <b-dropdown-item><span class="dripicons-archive pr-3"></span>{{$t("query_add_to_collection")}}</b-dropdown-item>
        <b-dropdown-item><span class="dripicons-export pr-3"></span>{{$t("query_export_csv")}}</b-dropdown-item>
      </b-dropdown>
    </b-navbar>

    <b-container fluid class="p-1">
      <b-row v-if="displayStyle === 'list'">
        <b-col cols="12" v-for="(searchResult, index) in searchResults" v-bind:key="searchResult.article_uid">
          <search-results-list-item v-on:click="onClickResult(searchResult)" v-model="searchResults[index]" />
        </b-col>
      </b-row>
      <b-row class="pb-5" v-if="displayStyle === 'tiles'">
        <b-col cols="6" sm="12" md="6" lg="4" v-for="(searchResult, index) in searchResults" v-bind:key="searchResult.article_uid">
          <search-results-tiles-item v-on:click="onClickResult(searchResult)" v-model="searchResults[index]" />
        </b-col>
      </b-row>
    </b-container>

    <div slot="footer" class="border-top p-3 bg-light">
      <pagination
        class="float-left"
        size="sm"
        v-bind:perPage="paginationPerPage"
        v-bind:currentPage="paginationCurrentPage"
        v-bind:totalRows="paginationTotalRows"
        v-on:change="onInputPagination"
        v-bind:showDescription="true" />
      <div class="float-right">
        <!-- <b-button variant="outline-primary" size="sm">
          <div class="dripicons-archive pt-1"></div>
        </b-button> -->
        <b-dropdown size="sm" variant="outline-primary" no-caret>
          <template slot="button-content">
            <div class="dripicons-archive pt-1" v-bind:title="$t('query_add_to_collection')"></div>
            <span class="sr-only">{{$t("query_add_to_collection")}}</span>
          </template>
          <b-dropdown-item>
            [add to collection module]
          </b-dropdown-item>
        </b-dropdown>
        <b-dropdown size="sm" variant="outline-primary" no-caret>
          <template slot="button-content">
            <div class="dripicons-export pt-1" v-bind:title="$t('query_export')"></div>
            <span class="sr-only">{{$t("query_export")}}</span>
          </template>
          <b-dropdown-item>
            {{$t("query_export_csv")}}
          </b-dropdown-item>
        </b-dropdown>
      </div>
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
            disabled: true,
          },
          {
            value: 'pages',
            text: this.$t('order_pages'),
            disabled: true,
          },
          {
            value: 'articles',
            text: this.$t('order_articles'),
          },
          {
            value: 'sentences',
            text: this.$t('order_sentences'),
            disabled: true,
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

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.navbar-nav {
    flex-direction: row;
    align-items: center;
    label {
      margin-bottom: 0;
      line-height: 1.5;
    }
}

// TODO: we have this classblock twice, also on IssuePage.vue
// block is not scoped so these two interfere with eachother so they interfere
// to be the exact same
/// Maybe we can move this to bootpresso?
div.overlay-region{
  background: $clr-accent-secondary;
  opacity: 0;
  transition: opacity 300ms;
  &.selected{
    opacity: 0.25;
  }
}

.overlay-match{
  background: $clr-accent;
  outline: 2px solid $clr-accent;
  opacity: 0.5;
}

.navigator{
  border-width: 0 0 1px 1px !important;

  .displayregion{
    border: 1px solid rgb(255, 225, 49) !important;
    background-color: rgba(255, 225, 49, 0.3) !important;
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
    "order_sentences": "Sentence",
    "query_actions": "Save / Export",
    "query_add_to_collection": "Add query to collection",
    "query_export": "Export result list as ...",
    "query_export_csv": "Export result list as CSV"
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
    "order_sentences": "Zin",
    "query_actions": "Opslaan / exporteren",
    "query_add_to_collection": "Add query to collection NL",
    "query_export_csv": "Export results as CSV NL"
  }
}
</i18n>
