<template>
<i-layout id="SearchPage">
  <i-layout-section width="400px" class="border-right border-tertiary">
    <div slot="header" class="pt-3 px-3">
      <autocomplete v-on:submit="onSuggestion" />
    </div>
    <div class="pt-2">
      <search-filters v-on:remove-filter="search(1)" v-on:submit-filter="search(1)" />
      <search-facets v-on:submit-facet="onFacet" />
    </div>
    <div slot="footer">
      <b-button-group class="d-flex bg-white p-3 border-top border-tertiary">
        <b-button class="small-caps mr-2 w-75" variant="outline-primary" size="md" v-on:click="search(1)">Search</b-button>
        <b-button class="small-caps w-25" variant="outline-danger" size="md" v-on:click="reset">Clear</b-button>
      </b-button-group>
    </div>
  </i-layout-section>
  <i-layout-section>
    <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
      <b-navbar-nav class="px-3 py-3 flex-grow-1 border-right">
        <label class="mr-1">{{$t("label_group")}}</label>
        <i-dropdown v-model="groupBy" v-bind:options="groupByOptions" size="sm" variant="outline-primary"></i-dropdown>
      </b-navbar-nav>
      <b-navbar-nav class="px-3 py-3 border-right">
        <label class="mr-1">{{$t("label_order")}}</label>
        <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
      </b-navbar-nav>
      <b-navbar-nav class="px-3 py-3 border-right">
        <label class="mr-1">{{$t("label_display")}}</label>
        <b-nav-form>
          <b-form-radio-group v-model="displayStyle" button-variant="outline-primary" size="sm" buttons>
            <b-form-radio value="list">{{$t("display_button_list")}}</b-form-radio>
            <b-form-radio value="tiles">{{$t("display_button_tiles")}}</b-form-radio>
          </b-form-radio-group>
        </b-nav-form>
      </b-navbar-nav>
      <div class="flex-shrink-1">
        <b-navbar-nav v-if="isLoggedIn()" class="pl-4">
          <b-form-checkbox
            v-b-tooltip.hover.topleft.html.o100.d250 v-bind:title="$t('select_all')"
            v-bind:indeterminate="isIndeterminate()"
            v-on:change="onSelectAll">
          </b-form-checkbox>
        </b-navbar-nav>
      </div>
    </b-navbar>

    <b-navbar slot="header" variant="tertiary" v-if="selectedItems.length > 0" class="d-flex border-bottom">
      <div class="flex-grow-1">
        <span class="small-caps">
          {{ $tc('items_selected', selectedItems.length) }}
        </span>
        <collection-add-to
          :items="selectedItems"
          :text="$tc('add_n_to_collection', selectedItems.length)"
          class="addbulk float-right bg-light" />
      </div>
    </b-navbar>

    <b-navbar class="d-flex p-0 border-bottom bg-light">
      <b-navbar-nav class="flex-grow-1 px-3 py-2 border-right">
          <search-result-summary v-bind:queryComponents="queryComponents" v-bind:totalRows="paginationTotalRows" />
      </b-navbar-nav>
      <b-navbar-nav class="flex-shrink-1 pl-3 pr-3">
        <b-dropdown v-bind:text="$t('query_actions')" size="sm" variant="outline-primary" class="bg-white">
          <b-dropdown-item disabled><span class="dripicons-archive pr-3"></span>{{$t("query_add_to_collection")}}</b-dropdown-item>
          <b-dropdown-item disabled><span class="dripicons-export pr-3"></span>{{$t("query_export_csv")}}</b-dropdown-item>
        </b-dropdown>
      </b-navbar-nav>
    </b-navbar>

    <div class="p-1">
      <b-container fluid>
        <b-row v-if="displayStyle === 'list'">
          <b-col cols="12" v-for="(searchResult, index) in searchResults" v-bind:key="searchResult.article_uid">
            <search-results-list-item
              checkbox=true
              v-on:selected="onSelectResult(searchResult)"
              v-on:click="onClickResult(searchResult)"
              v-model="searchResults[index]" />
          </b-col>
        </b-row>
        <b-row class="pb-5" v-if="displayStyle === 'tiles'">
          <b-col cols="6" sm="12" md="6" lg="4" v-for="(searchResult, index) in searchResults" v-bind:key="searchResult.article_uid">
            <search-results-tiles-item
              checkbox=true
              v-on:selected="onSelectResult(searchResult)"
              v-on:click="onClickResult(searchResult)"
              v-model="searchResults[index]" />
          </b-col>
        </b-row>
      </b-container>
      <div class="fixed-pagination-footer p-1 m-0">
        <pagination
          v-bind:perPage="paginationPerPage"
          v-bind:currentPage="paginationCurrentPage"
          v-bind:totalRows="paginationTotalRows"
          v-on:change="onInputPagination"
          class="float-left small-caps" />
      </div>
    </div>
  </i-layout-section>
</i-layout>
</template>

<script>
import FilterFactory from '@/models/FilterFactory';

import Autocomplete from './Autocomplete';
import Pagination from './modules/Pagination';
import SearchFilters from './SearchFilters';
import SearchFacets from './SearchFacets';
import SearchResultsListItem from './modules/SearchResultsListItem';
import SearchResultsTilesItem from './modules/SearchResultsTilesItem';
import SearchResultsSummary from './modules/SearchResultsSummary';
import CollectionAddTo from './modules/CollectionAddTo';

export default {
  data: () => ({
    selectedItems: [],
  }),
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
        this.search(1);
      },
    },
    groupBy: {
      get() {
        return this.$store.state.search.groupBy;
      },
      set(val) {
        this.$store.commit('search/UPDATE_SEARCH_GROUP_BY', val);
        this.search(1);
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
    onSuggestion(suggestion) {
      this.$store.commit('search/ADD_FILTER', FilterFactory.create(suggestion));
      this.search(1);
    },
    onFacet(facet) {
      this.$store.commit('search/ADD_FILTER', FilterFactory.create(facet));
      this.search(1);
    },
    onInputPagination(page = 1) {
      this.search(page);
    },
    isIndeterminate() {
      if (this.selectedItems.length > 0 && this.selectedItems.length < this.searchResults.length) {
        return true;
      }
      return false;
    },
    onSelectAll(e) {
      this.selectedItems = [];
      this.searchResults.forEach((item) => {
        if (e) {
          this.selectedItems.push(item);
          document.querySelector(`input[value='${item.uid}']`).checked = true;
        } else {
          document.querySelector(`input[value='${item.uid}']`).checked = false;
        }
      });
    },
    onSelectResult(e) {
      if (e && this.selectedItems) {
        const idx = this.selectedItems.findIndex(c => (c.uid === e.uid));
        if (idx === -1) this.selectedItems.push(e);
        else this.selectedItems.splice(idx, 1);
      }
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
    search(page) {
      if (page !== undefined) {
        this.$store.commit('search/UPDATE_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      }

      this.$store.dispatch('search/SEARCH');
    },
    reset() {
      this.$store.commit('search/CLEAR');
      this.search(); // we do a search so we display all results in the corpus
    },
    isLoggedIn() {
      return this.$store.state.user.userData;
    },
  },
  components: {
    Autocomplete,
    Pagination,
    'search-results-list-item': SearchResultsListItem,
    'search-results-tiles-item': SearchResultsTilesItem,
    'search-filters': SearchFilters,
    'search-facets': SearchFacets,
    'search-result-summary': SearchResultsSummary,
    CollectionAddTo,
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
    "select_all": "Select all items on this page",
    "items_selected": "One item selected | {count} items selected",
    "add_n_to_collection": "Add item to collection | Add {count} items to collection",
    "query_actions": "Save / Export",
    "query_add_to_collection": "Create Collection from Search Results",
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
    "order_sentences": "Zin"
  }
}
</i18n>
