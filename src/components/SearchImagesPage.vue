<template lang="html">
  <i-layout id="SearchPage">
    <i-layout-section width="400px" class="border-right border-tertiary">
      <!--  header -->
      <div slot="header" class="border-bottom border-tertiary bg-light">
        <b-tabs pills class="border-bottom mx-2 pt-2">
          <template slot="tabs">
            <b-nav-item class="pl-2"
              active-class='none'
              :to="{ name:'search'}">
                <span v-html="$t('tabs.text')"/>
              </b-nav-item>
            <b-nav-item
              class="active"
              active-class='none'
              :to="{ name:'searchImages'}">
                <span v-html="$t('tabs.images')"/>
            </b-nav-item>
          </template>
        </b-tabs>
        <div class="py-3 px-3">
          <search-pills v-on:remove="onRemoveFilter"/>
        </div>
      </div>

        <div class="p-3">

          <b-form-group class="px-3 py-1">
            <b-form-checkbox v-model="isFront" switch v-bind:value="true">
              {{$t('label_isFront')}}
            </b-form-checkbox>
          </b-form-group>
          <search-facets @submit-facet="onFacet" @update-filter="onUpdateFilter" @reset-filter="onResetFilter"/>

        </div>
      </div>
    </i-layout-section>
    <i-layout-section>

      <b-navbar slot="header" variant="tertiary" v-if="selectedItems.length > 0" class="d-flex border-bottom">
        <div class="flex-grow-1">
          <span class="small-caps">
            {{ $tc('items_selected', selectedItems.length) }}
          </span>
          <b-button variant="danger" class="ml-2" size="sm" v-on:click="onClearSelection()">
            {{ $t('clear_selection') }}
          </b-button>
          <collection-add-to
            :items="selectedItems"
            :text="$tc('add_n_to_collection', selectedItems.length)"
            class="addbulk bg-white float-right" />
        </div>
      </b-navbar>

      <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">

        <b-navbar-nav class="px-3 pt-1 pb-3 border-right" style="flex:1">
          <ellipsis v-bind:initialHeight="88">
            <search-result-summary
              v-on:onSummary="onSummary"
              v-bind:queryComponents="queryComponents"
              v-bind:totalRows="paginationTotalRows" />
          </ellipsis>
        </b-navbar-nav>

        <b-navbar-nav class="p-3 pt-4 border-right">
          <label class="mr-1">{{$t("label_order")}}
            <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary" class="pl-1"></i-dropdown>
          </label>
        </b-navbar-nav>

        <b-navbar-nav v-if="isLoggedIn" class="pl-4">
          <b-form-checkbox
            v-b-tooltip.hover.topleft.html.o100.d500 v-bind:title="$t('select_all')"
            v-bind:indeterminate="this.allIndeterminate"
            v-bind:checked.native="this.allSelected"
            v-on:change="toggleSelectAll">
          </b-form-checkbox>
        </b-navbar-nav>

      </b-navbar>

      <div class="p-1">
        <b-container fluid>
          <b-row class="pb-5">
            <b-col cols="6" sm="12" md="6" lg="4" v-for="(searchResult, index) in searchResults" v-bind:key="searchResult.uid">
              <search-results-image-item
              v-bind:searchResult="searchResult"
              v-bind:checkbox=true
              v-on:toggleSelected="toggleSelected(searchResult)"
              v-bind:checked="isChecked(searchResult)"
              v-on:click="onClickResult(searchResult)"
              />
            </b-col>
          </b-row>
        </b-container>
        <div class="fixed-pagination-footer p-1 m-0">
          <pagination
            v-bind:perPage="paginationPerPage"
            v-bind:currentPage="paginationCurrentPage"
            v-bind:totalRows="paginationTotalRows"
            v-on:change="onInputPagination"
            class="float-left small-caps"
            />

        </div>
      </div>

    </i-layout-section>
  </i-layout>
</template>

<script>
import Autocomplete from './Autocomplete';
import SearchResultsImageItem from './modules/SearchResultsImageItem';
import CollectionAddTo from './modules/CollectionAddTo';
import Pagination from './modules/Pagination';
import SearchFacets from './SearchFacets';
import SearchResultsSummary from './modules/SearchResultsSummary';
import Ellipsis from './modules/Ellipsis';
import SearchPills from './SearchPills';


export default {
  components: {
    Autocomplete,
    SearchResultsImageItem,
    CollectionAddTo,
    Pagination,
    SearchFacets,
    'search-result-summary': SearchResultsSummary,
    Ellipsis,
    SearchPills,
  },
  data: () => ({
    selectedItems: [],
    allIndeterminate: false,
    allSelected: false,
  }),
  mounted() {
    // testing URL
    // fetch('https://impresso-project.ch/api/images/')
    //   .then(response => response.text())
    //   .then((data) => {
    //     this.searchResults = JSON.parse(data).data;
    //   });
    // if (this.uuid !== undefined) {
    //   this.$store.commit('searchImages/LOAD_SEARCH', this.uuid);
    //   console.log('search');
    // }
    this.search();
  },
  computed: {
    isFront: {
      get() {
        return this.getBooleanFilter({ type: 'isFront' });
      },
      set(val) {
        this.toggleBooleanFilter({ type: 'isFront' }, val);
      },
    },
    searchResults: {
      get() {
        return this.$store.getters['searchImages/results'];
      },
    },
    queryComponents: {
      get() {
        return this.$store.state.searchImages.queryComponents;
      },
    },
    orderByOptions: {
      get() {
        return [
          {
            value: '-date',
            text: `${this.$t('sort_date')} ${this.$t('sort_desc')}`,
          },
          {
            value: 'date',
            text: `${this.$t('sort_date')} ${this.$t('sort_asc')}`,
          },
          {
            value: 'relevance',
            text: `${this.$t('sort_relevance')} ${this.$t('sort_asc')}`,
          },
        ];
      },
    },
    orderBy: {
      get() {
        return this.$store.state.searchImages.orderBy;
      },
      set(val) {
        this.$store.commit('searchImages/UPDATE_SEARCH_ORDER_BY', val);
        this.search(1);
      },
    },
    paginationPerPage: {
      get() {
        return this.$store.state.searchImages.paginationPerPage;
      },
    },
    paginationCurrentPage: {
      get() {
        return this.$store.state.searchImages.paginationCurrentPage;
      },
    },
    paginationTotalRows: {
      get() {
        return this.$store.state.searchImages.paginationTotalRows;
      },
    },
  },
  methods: {
    search(page) {
      if (page !== undefined) {
        this.$store.commit('searchImages/UPDATE_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      }
      this.$store.dispatch('searchImages/PUSH_SEARCH_PARAMS');
    },
    reset() {
      this.$store.commit('searchImages/CLEAR');
      this.search(); // we do a search so we display all results in the corpus
    },
    isLoggedIn() {
      return this.$store.state.user.userData;
    },
    getBooleanFilter(filter) {
      return !!this.$store.state.search.search.getFilter(filter);
    },
    toggleBooleanFilter(filter, value = true) {
      if (!value) {
        this.$store.commit('searchImages/REMOVE_FILTER', filter);
      } else {
        this.$store.commit('searchImages/ADD_FILTER', filter);
      }
      this.search(1);
    },
    onSummary(msg) {
      this.inputDescription = msg
        .replace(/<(?:.|\n)*?>/gm, '') // strip html tags
        .replace('Found', this.$t('Based on search query with'));
    },
    onSuggestion(suggestion) {
      this.$store.commit('searchImages/ADD_FILTER', suggestion);
      this.search(1);
    },
    onFacet(facet) {
      console.log('@onFacet', facet);
      this.$store.commit('searchImages/ADD_FILTER', facet);
      this.search(1);
    },
    onResetFilter(type) {
      this.$store.commit('searchImages/RESET_FILTER', type);
      this.search(1);
    },
    onUpdateFilter(filter) {
      this.$store.commit('searchImages/UPDATE_FILTER', filter);
      this.search(1);
    },
    onRemoveFilter(filter) {
      this.$store.commit('searchImages/REMOVE_FILTER', filter);
      this.search(1);
    },
    updateselectAll() {
      let count = 0;
      this.searchResults.forEach((item) => {
        if (this.itemSelected(item)) {
          count += 1;
        }
      });
      if (count === 0) {
        this.allSelected = false;
        this.allIndeterminate = false;
      } else if (count < this.searchResults.length) {
        this.allSelected = false;
        this.allIndeterminate = true;
      } else {
        this.allSelected = true;
        this.allIndeterminate = false;
      }
      // console.log('selected items : ', this.selectedItems);
    },
    itemSelected(item) {
      return this.selectedItems.findIndex(c => (c.uid === item.uid)) !== -1;
    },
    addSelectedItem(item) {
      if (!this.itemSelected(item)) {
        this.selectedItems.push(item);
      }
    },
    removeSelectedItem(item) {
      if (this.itemSelected(item)) {
        const idx = this.selectedItems.findIndex(c => (c.uid === item.uid));
        this.selectedItems.splice(idx, 1);
      }
    },
    toggleSelected(item) {
      if (!this.itemSelected(item)) {
        this.selectedItems.push(item);
      } else {
        const idx = this.selectedItems.findIndex(c => (c.uid === item.uid));
        this.selectedItems.splice(idx, 1);
      }
    },
    toggleSelectAll(checked) {
      if (checked) {
        this.searchResults.forEach((item) => {
          this.addSelectedItem(item);
        });
      } else {
        this.searchResults.forEach((item) => {
          this.removeSelectedItem(item);
        });
      }
    },
    isChecked(item) {
      return (this.selectedItems.findIndex(c => (c.uid === item.uid)) !== -1);
    },
    onInputPagination(page = 1) {
      this.search(page);
    },
    onClearSelection() {
      this.selectedItems = [];
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
  watch: {
    searchResults() {
      this.updateselectAll();
    },
    selectedItems() {
      this.updateselectAll();
    },
    '$route.query': {
      handler(val) {
        console.log('@$route.query changed', val);
        this.$store.dispatch('searchImages/PULL_SEARCH_PARAMS', val);
      },
      deep: true,
      immediate: true,
    },
  },
};
</script>

<style lang="scss">
</style>

<i18n>
  {
    "en": {
      "tabs": {
        "text": "search articles",
        "images": "search images"
      },
      "label_order": "Order By",
      "label_isFront": "Frontpage",
      "sort_asc": "Ascending",
      "sort_desc": "Descending",
      "sort_date": "Date",
      "sort_relevance": "Relevance",
      "items_selected": "One item selected | {count} items selected",
      "clear_selection": "Clear Selection",
      "add_n_to_collection": "Add item to collection | Add {count} items to collection",
      "select_all": "Select all items on this page"
    }
  }
</i18n>
