<template lang="html">
  <i-layout id="SearchPage">
    <i-layout-section width="400px">
      <!--  header -->
      <div slot="header" class="border-bottom bg-light">
        <search-tabs />
        <div class="py-3 px-3">
          <search-pills :filters="filters"
              @changed="handleFiltersChanged" />
          <span v-if="filtersRemoved">
            <em class="small" v-html="$tc('numbers.filtersRemoved', filtersRemoved, {
              n: filtersRemoved,
            })"/>
            &nbsp;
            <info-button name="how-searchImages-work-availble-filters"  />
          </span>
          <b-media v-if="similarToImage" class="pb-3">
            <div style="width:128px;" slot="aside">
              <b-img v-if="similarToImage.regions.length"
                fluid-grow
                v-bind:src="similarToImage.regions[0].iiifFragment" />
            </div>
            <h4>{{similarToImage.newspaper.name}}</h4>
            <p>{{$d(new Date(similarToImage.date), 'long')}}</p>
            <b-button variant="danger" size="sm" v-on:click.prevent="onRemoveSimilarTo">Remove</b-button>
          </b-media>
          <filter-image-upload
            v-if="enableUpload"
            v-on:load="search(1)"
            v-on:remove="search(1)" />

          <search-input @submit="onSearchQuery"></search-input>
        </div>
      </div>
      <!--  body -->
      <div class="pt-3">
        <b-form-group class="px-3 py-1">
          <b-form-checkbox v-model="isFront" switch v-bind:value="true">
            {{$t('label_isFront')}}
          </b-form-checkbox>
        </b-form-group>
        <search-facets store="searchImages" @submit-facet="onFacet" @update-filter="onUpdateFilter" @reset-filter="onResetFilter" percent-prop="m"/>
      </div>
    </i-layout-section>
    <i-layout-section main>
      <!-- header -->
      <div slot="header">
        <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
          <b-navbar-nav class="p-2 border-right">
            <b-nav-form>
              <b-form-group class="ml-2 mr-3">
              <b-form-checkbox v-model="applyRandomPage" switch>
                {{ $t('label_applyRandomPage') }}
              </b-form-checkbox>
              </b-form-group>
              <b-button size="sm" variant="outline-primary" v-on:click='loadRandomPage'>reload</b-button>
            </b-nav-form>
          </b-navbar-nav>
        </b-navbar>
        <b-navbar type="light" variant="light" class="border-bottom py-0 px-3">
          <b-navbar-nav class="border-right flex-grow-1  py-2 ">
            <ellipsis v-bind:initialHeight="60">
              <search-results-summary
                group-by="images"
                :searchQuery="{ filters }"
                :totalRows="paginationTotalRows" />
            </ellipsis>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto pl-2">
            <label class="mr-1">{{$t("label_order")}}
              <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary" class="pl-1"></i-dropdown>
            </label>
          </b-navbar-nav>
        </b-navbar>
     </div>

     <!--  body -->
      <div class="p-1">
        <b-container fluid>
          <b-row class="pb-5">
            <b-col cols="6" sm="12" md="6" lg="4" v-for="searchResult in searchResults" v-bind:key="searchResult.uid">
              <search-results-image-item
                v-bind:searchResult="searchResult"
                v-bind:checkbox="true"
                v-on:toggleSelected="toggleSelected"
                v-bind:checked="isChecked(searchResult)"
                v-on:click:search="onClickSearch" />
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
import * as services from '@/services';
import FilterImageUpload from './modules/FilterImageUpload';
import SearchResultsImageItem from './modules/SearchResultsImageItem';
import Pagination from './modules/Pagination';
import SearchFacets from './SearchFacets';
import SearchResultsSummary from './modules/SearchResultsSummary';
import Ellipsis from './modules/Ellipsis';
import SearchInput from './modules/SearchInput';
import SearchPills from './SearchPills';
import SearchTabs from './modules/SearchTabs';
import InfoButton from '@/components/base/InfoButton';

export default {
  props: {
    enableUpload: {
      type: Boolean,
    },
  },
  components: {
    SearchResultsImageItem,
    Pagination,
    SearchFacets,
    SearchInput,
    SearchResultsSummary,
    Ellipsis,
    SearchPills,
    FilterImageUpload,
    SearchTabs,
    InfoButton,
  },
  data: () => ({
    q: '',
    selectedItems: [],
    allIndeterminate: false,
    allSelected: false,
    similarToImage: false,
  }),
  computed: {
    applyRandomPage: {
      get() {
        return this.$store.state.searchImages.applyRandomPage;
      },
      set(val) {
        this.$store.dispatch('searchImages/SET_RANDOM_PAGE', val);
      },
    },
    searchQuery() {
      return this.$store.state.searchImages.search;
    },
    filters() {
      return this.searchQuery.filters.filter(({ type }) => [
        'newspaper',
        'isFront',
        'daterange',
      ].includes(type));
    },
    filtersRemoved() {
      return this.searchQuery.filters.length - this.filters.length;
    },
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
    handleFiltersChanged(filters) {
      this.$store.dispatch('searchImages/UPDATE_SEARCH_QUERY_FILTERS', filters);
      this.$store.dispatch('searchImages/PUSH_SEARCH_PARAMS');
    },
    search(page) {
      this.$store.state.searchImages.results = [];
      this.$store.dispatch('searchImages/UPDATE_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      this.$store.dispatch('searchImages/PUSH_SEARCH_PARAMS');
    },
    loadRandomPage() {
      this.$store.dispatch('searchImages/SET_RANDOM_PAGE', true);
      this.$store.dispatch('searchImages/SEARCH');
    },
    reset() {
      this.$store.commit('searchImages/CLEAR');
      this.search(); // we do a search so we display all results in the corpus
    },
    isLoggedIn() {
      return this.$store.state.user.userData;
    },
    getBooleanFilter(filter) {
      return !!this.$store.state.searchImages.search.getFilter(filter);
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
    onSearchQuery({ q }) {
      console.info('@onSearchQuery', q);
      this.$store.commit('searchImages/ADD_FILTER', {
        type: 'title',
        q,
      });
      this.search(1);
    },
    onSuggestion(suggestion) {
      this.$store.commit('searchImages/ADD_FILTER', suggestion);
      this.search(1);
    },
    onFacet(facet) {
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
    onRemoveSimilarTo() {
      this.$store.commit('searchImages/UPDATE_SIMILAR_TO', false);
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
      this.$store.dispatch('searchImages/SET_RANDOM_PAGE', false);
      this.search(page);
    },
    onClearSelection() {
      this.selectedItems = [];
    },
    onClickSearch(image) {
      this.$store.commit('searchImages/UPDATE_SIMILAR_TO_UPLOADED', false);
      this.similarToImage = image;
      this.$store.commit('searchImages/UPDATE_SIMILAR_TO', image.uid);
      this.search(1);
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
        console.info('@$route.query changed', val);
        this.$store.dispatch('searchImages/PULL_SEARCH_PARAMS', val);
      },
      deep: true,
      immediate: true,
    },
    '$route.query.i': {
      handler(val) {
        if (val) {
          services.images.get(val).then((res) => {
            this.similarToImage = res;
          });
        } else {
          this.similarToImage = false;
        }
      },
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
      "label_order": "Order By",
      "label_isFront": "Frontpage",
      "label_applyRandomPage": "start with random results page",
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
