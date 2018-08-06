<template>
<i-layout id="SearchResultsPage">
  <i-layout-section width="400px" class="p-2 br">
    <search-bar v-on:reset="reset" v-on:add="search(true)" />
    <hr>
    <search-filter-wrapper v-on:remove="search(true)" v-on:submit="search(true)" />
    <hr>
    <div v-for="(group, index) in facets" class="facets">
      <b-table small hover :items="getItems(group)" :fields="getFields(group, index)"></b-table>
    </div>
  </i-layout-section>
  <i-layout-section>
    <b-navbar type="light" variant="light">
      <b-navbar-nav class="ml-auto">
        <b-form-select v-model="orderBy" v-bind:options="orderByOptions" size="sm"></b-form-select>
      </b-navbar-nav>
      <b-navbar-nav class="ml-2">
        <b-nav-form>
          <b-form-radio-group v-model="displayStyle" size="sm" buttons>
            <b-form-radio value="list">{{$t("display_button_list")}}</b-form-radio>
            <b-form-radio value="tiles">{{$t("display_button_tiles")}}</b-form-radio>
          </b-form-radio-group>
        </b-nav-form>
      </b-navbar-nav>
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
    getFields(group, label) {
      return [
        {
          key: 'val',
          label,
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
    getItems(group) {
      return group.map(item => ({
        isActive: true,
        val: item.val,
        count: item.count,
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
      const data = {
        name: 'home',
      };
      this.$router.push(data, this.$store.commit('search/CLEAR'));
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
  watch: {
    filters: {
      handler(val) {
        if (val.length === 0) {
          this.reset();
        }
      },
    },
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
