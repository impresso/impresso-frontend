<template>
<main id="SearchResultsPage">
  <div class="toolbar bb">
    <div class="toolbox bl br">
      <label for="displayGroup">{{$t("label_group")}}</label>
      <b-form-radio-group v-model="displayGroup" button-variant="outline-primary" size="sm" id="displayGroup" buttons>
        <b-form-radio value="issue">{{$t("group_issue")}}</b-form-radio>
        <b-form-radio value="page">{{$t("group_page")}}</b-form-radio>
        <b-form-radio value="article">{{$t("group_article")}}</b-form-radio>
        <b-form-radio value="sentence">{{$t("group_sentence")}}</b-form-radio>
      </b-form-radio-group>
    </div>
    <div class="toolbox br">
      <label for="displaySortOrder">{{$t("label_sort")}}</label>
      <b-dropdown :text="getSortByLabel(displaySortBy, displaySortOrder)" size="sm" variant="outline-primary" id="displaySortOrder">
        <b-dropdown-item @click="setSort('relevance', 'asc')" :active="displaySortBy === 'relevance' && displaySortOrder === 'asc'" v-html="getSortByLabel('relevance', 'asc')"></b-dropdown-item>
        <b-dropdown-item @click="setSort('relevance', 'desc')" :active="displaySortBy === 'relevance' && displaySortOrder === 'desc'" v-html="getSortByLabel('relevance', 'desc')"></b-dropdown-item>
        <b-dropdown-divider></b-dropdown-divider>
        <b-dropdown-item @click="setSort('date', 'asc')" :active="displaySortBy === 'date' && displaySortOrder === 'asc'" v-html="getSortByLabel('date', 'asc')"></b-dropdown-item>
        <b-dropdown-item @click="setSort('date', 'desc')" :active="displaySortBy === 'date' && displaySortOrder === 'desc'" v-html="getSortByLabel('date', 'desc')"></b-dropdown-item>
      </b-dropdown>
    </div>
    <div class="toolbox">
      <label for="displayStyle">{{$t("label_display")}}</label>
      <b-form-radio-group v-model="displayStyle" button-variant="outline-primary" size="sm" buttons id="displayStyle" name="radioSubComponent">
        <b-form-radio value="list">{{$t("display_button_list")}}</b-form-radio>
        <b-form-radio value="tiles">{{$t("display_button_tiles")}}</b-form-radio>
      </b-form-radio-group>
    </div>
  </div>

  <div class="filters br">
    <search-bar v-on:reset="reset" v-on:add="search(true)" />
    <hr>
    <search-filter-wrapper v-on:remove="search(true)" v-on:submit="search(true)" />
    <hr>
    <div v-for="(group, index) in facets" class="facets">
      <b-table small hover :items="getItems(group)" :fields="getFields(group, index)"></b-table>
    </div>
  </div>


    <div class="results bl">
      <div class="results-summary bb">
        <search-result-summary v-bind:components="queryComponents" v-bind:totalRows="paginationTotalRows"/>
      </div>
      <b-container class="results-items bt">
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
      </b-container>
      <hr>
      <pagination v-bind:perPage="paginationPerPage" v-bind:currentPage="paginationCurrentPage" v-bind:totalRows="paginationTotalRows" v-on:input="onInputPagination" v-on:change="search" />
    </div>
</main>
</template>

<script>
import SearchBar from './SearchInputQueryWrapper';
import Pagination from './modules/Pagination';
import SearchFilterWrapper from './SearchFilterWrapper';
import SearchResultsListItem from './SearchResultsListItem';
import SearchResultsTilesItem from './SearchResultsTilesItem';
import SearchResultsSummary from './modules/SearchResultsSummary';

export default {
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
    queryComponents: {
      get() {
        return this.$store.state.search.queryComponents;
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
    'search-result-summary': SearchResultsSummary,
  },
  mounted() {
    if (this.uuid !== undefined) {
      this.$store.commit('search/LOAD_SEARCH', this.uuid);
    }
    this.$store.commit('SET_HEADER_TITLE', {
      title: this.$t('header_search'),
    });
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
@import "./../assets/less/components/dropdown.less";

#SearchResultsPage {
    height: 100%;
    width: 100%;
    display: grid;
    grid-template-columns: 400px auto;
    grid-template-rows: 50px auto;
    grid-template-areas: "filters toolbar" "filters results";

    .filters {
        grid-area: filters;
        padding: 20px 10px;
        overflow-y: auto;

        &.br{
          margin-right: 2px;
          // border-right-color: red;
        }
    }

    .results {
        grid-area: results;
        padding: 0px;
        overflow-y: auto;

        background: @clr-white;

    }
    .results-summary{
      background: @clr-grey-200;
      padding: 10px;
      margin-bottom: 1px;
    }

    .results-items{
      padding: 10px;
      margin-top: 1px;
    }

    .toolbar {
        grid-area: toolbar;
        background: @clr-grey-200;
        display: grid;
        grid-template-columns: auto max-content max-content;
        .toolbox {
            height: 50px;
            padding: 10px;
            > label {
              position: relative;
              top: 1px;
              margin-right: 0.8em;
              font-variant: small-caps;
              letter-spacing: 0.05em;
              color: @clr-grey-700;
            }
        }
    }

    .facets{
      tr{
        td, th{
          text-transform: capitalize;
          &:last-child{
              width:100%;
          }
        }
      }
    }
}
</style>

<i18n>
{
  "en": {
    "label_display": "display",
    "sort_asc": "ascending",
    "sort_desc": "descending",
    "sort_date": "date",
    "sort_relevance": "relevance",
    "label_sort": "sort",
    "label_group": "group results by",
    "group_issue": "issue",
    "group_page": "page",
    "group_article": "article",
    "group_sentence": "sentence",
    "display_button_list": "list",
    "display_button_tiles": "tiles",
    "header_search": "Search Results"
  },
  "nl": {
    "label_display": "Toon",
    "sort_asc": "Oplopend",
    "sort_desc": "Aflopend",
    "sort_date": "Datum",
    "sort_relevance": "Relevantie",
    "label_sort": "Sorteer",
    "display_button_list": "Lijst",
    "display_button_tiles": "Tegels"
  }
}
</i18n>
