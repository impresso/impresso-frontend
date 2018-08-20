<template>
<i-layout id="SearchResultsPage">
  <i-layout-section width="400px" class="br">
    <div class="px-2 py-4 bb">
      <search-bar v-on:reset="reset" v-on:search="search(true)" action="add" />
    </div>
    <div class="px-2 py-4 bb">
      <search-filter-wrapper v-on:remove="search(true)" v-on:submit="search(true)" />
    </div>
    <div class="px-2 py-4 bb">
      <skyline :date-start="1949" :date-end="1960" :height="100" :data="skylineData" />
    </div>
    <div class="p-2">
      <div v-for="facet in facets" class="facets">
        <b-table small hover :items="getItems(facet)" :fields="getFields(facet)"></b-table>
      </div>
    </div>
  </i-layout-section>
  <i-layout-section>
    <b-navbar type="light" variant="light" class="bb">
      <b-navbar-nav class="pr-3 section">
        <label>{{$t("label_group")}}</label>
        <i-dropdown v-model="groupBy" v-bind:options="groupByOptions" size="sm"></i-dropdown>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto px-3 section br bl">
        <label>{{$t("label_order")}}</label>
        <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm"></i-dropdown>
      </b-navbar-nav>
      <b-navbar-nav class="pl-3 section">
        <label>{{$t("label_display")}}</label>
        <b-nav-form>
          <b-form-radio-group v-model="displayStyle" size="sm" buttons>
            <b-form-radio value="list">{{$t("display_button_list")}}</b-form-radio>
            <b-form-radio value="tiles">{{$t("display_button_tiles")}}</b-form-radio>
          </b-form-radio-group>
        </b-nav-form>
      </b-navbar-nav>
    </b-navbar>

    <b-navbar type="light" variant="light" class="bb">
      <search-result-summary v-bind:queryComponents="queryComponents" v-bind:totalRows="paginationTotalRows" />
    </b-navbar>

    <div class="p-2">
      <b-container fluid>
        <b-row v-if="displayStyle === 'list'">
          <b-col class="pb-5" cols="12" v-for="(searchResult, index) in searchResults" v-bind:key="searchResult.article_uid">
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
      <pagination v-bind:perPage="paginationPerPage" v-bind:currentPage="paginationCurrentPage" v-bind:totalRows="paginationTotalRows" v-on:input="onInputPagination" v-on:change="search" />
    </div>
  </i-layout-section>
</i-layout>
</template>

<script>
import SearchBar from './SearchInputQueryWrapper';
import Pagination from './modules/Pagination';
import SearchFilterWrapper from './SearchFilterWrapper';
import SearchResultsListItem from './SearchResultsListItem';
import SearchResultsTilesItem from './SearchResultsTilesItem';
import SearchResultsSummary from './SearchResultsSummary';
import Skyline from './d3/Skyline';

export default {
  data: () => ({
    orderByOptions: [
      {
        value: 'relevance',
        text: 'Relevance Ascending',
      },
      {
        value: '-relevance',
        text: 'Relevance Descending',
      },
      {
        value: 'date',
        text: 'Date Ascending',
      },
      {
        value: '-date',
        text: 'Date Descending',
      },
    ],
    groupByOptions: [
      {
        value: 'issues',
        text: 'Issue',
      },
      {
        value: 'pages',
        text: 'Page',
      },
      {
        value: 'articles',
        text: 'Article',
      },
      {
        value: 'sentences',
        text: 'Sentence',
      },
    ],
  }),
  computed: {
    orderBy: {
      get() {
        return this.$store.state.search.orderBy;
      },
      set(val) {
        this.$store.commit('search/UPDATE_SEARCH_ORDER_BY', val);
        this.search(true);
      },
    },
    groupBy: {
      get() {
        return this.$store.state.search.groupBy;
      },
      set(val) {
        this.$store.commit('search/UPDATE_SEARCH_GROUP_BY', val);
        this.search(true);
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
    skylineData: {
      get() {
        const yearFacets = this.$store.getters['search/facets'].filter(d => d.type === 'year');
        if (yearFacets.length === 0) {
          return [];
        }
        return yearFacets[0].buckets.map(d => ({
          t: parseInt(d.val, 10),
          w: d.count,
        })).sort((a, b) => a.t - b.t);
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
    facets: {
      get() {
        return this.$store.getters['search/facets'];
      },
    },
  },
  methods: {
    getFields(facet) {
      return [
        {
          key: 'val',
          label: facet.type,
          sortable: true,
          class: 'text-left',
        },
        {
          key: 'count',
          sortable: true,
          class: 'text-right',
        },
      ];
    },
    getItems(facet) {
      return facet.buckets.map(bucket => ({
        isActive: true,
        val: bucket.val,
        count: bucket.count,
      }));
    },
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
      this.search(true);
    },
    loadSearch(uuid) {
      this.$store.commit('search/LOAD_SEARCH', uuid);
      this.search(true);
    },
    onInputPagination(pageNumber) {
      this.$store.commit('search/UPDATE_PAGINATION_CURRENT_PAGE', {
        paginationCurrentPage: pageNumber,
      });
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
    search(startAtPageOne = false) {
      if (startAtPageOne === true) {
        this.$store.commit('search/UPDATE_PAGINATION_CURRENT_PAGE', {});
      }
      this.$store.dispatch('search/SEARCH');
    },
    reset() {
      this.$store.commit('search/CLEAR');
      this.search(true); // we do a search so we display all results in the corpus
    },
  },
  components: {
    Pagination,
    'search-bar': SearchBar,
    'search-results-list-item': SearchResultsListItem,
    'search-results-tiles-item': SearchResultsTilesItem,
    'search-filter-wrapper': SearchFilterWrapper,
    'search-result-summary': SearchResultsSummary,
    Skyline,
  },
  mounted() {
    if (this.uuid !== undefined) {
      this.$store.commit('search/LOAD_SEARCH', this.uuid);
    }
    this.search(true);
  },
};
</script>

<style lang="less">
@import "./../assets/less/style.less";

#SearchResultsPage {
    .facets {
        tr {
            td,
            th {
                text-transform: capitalize;
                &:last-child {
                    width: 100%;
                }
            }
        }
    }
}

.navbar-nav {
    &.section {
        margin: -0.5rem 0;
        padding: 0.5rem 0;
        > label {
            font-size: smaller;
            padding: 0;
            margin: 0 0 0.25em;
            opacity: 0.5;
        }
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
    "label_sort": "Sort",
    "display_button_list": "List",
    "display_button_tiles": "Tiles"
  },
  "nl": {
    "label_display": "Toon Als",
    "label_order": "Sorteer Op",
    "label_group": "Rangschikken Per",
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
