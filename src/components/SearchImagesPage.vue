<template lang="html">
  <i-layout id="SearchPage">
    <search-sidebar width="400px"
      :filters="enrichedFilters"
      :ignored-filters="ignoredFilters"
      :facets="facets"
      :excludedTypes="excludedTypes"
      contextTag="searchImages"
      @changed="handleFiltersChanged">
      <div slot="header">
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
          v-if="enableUpload" />
        <search-input @submit="onSearchQuery"></search-input>
      </div>
      <b-form-group class="mx-3">
        <b-form-checkbox v-model="isFront" switch v-bind:value="true">
          {{$t('label.isFront')}}
        </b-form-checkbox>
      </b-form-group>
    </search-sidebar>

    <i-layout-section main>
      <!-- header -->
      <div slot="header">
        <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
          <b-navbar-nav class="p-2 border-right">
            <b-nav-form>
              <!-- <b-form-group class="ml-2 mr-3">
              <b-form-checkbox v-model="applyRandomPage" switch>
                {{ $t('label_applyRandomPage') }}
              </b-form-checkbox>
              </b-form-group> -->
              <b-button size="sm" variant="outline-primary" v-on:click='loadRandomPage'>{{ $t('actions.loadRandomPage') }}</b-button>
            </b-nav-form>
          </b-navbar-nav>
        </b-navbar>
        <b-navbar type="light" variant="light" class="border-bottom py-0 px-3">
          <b-navbar-nav class="border-right flex-grow-1  py-2 ">
            <ellipsis v-if="!isLoading" v-bind:initialHeight="60">
              <search-results-summary
                group-by="images"
                :searchQuery="{ filters: enrichedFilters }"
                :totalRows="paginationTotalRows" />
            </ellipsis>
            <span v-else>{{ $t('actions.loading') }}</span>
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
        <div v-if="paginationTotalRows && paginationCurrentPage > 0" class="fixed-pagination-footer p-1 m-0">
          <pagination
            v-bind:perPage="paginationPerPage"
            v-model="paginationCurrentPage"
            v-bind:totalRows="paginationTotalRows"
            class="float-left small-caps"
            />

        </div>
      </div>

    </i-layout-section>
  </i-layout>
</template>

<script>
import {
  searchQueryGetter,
  searchQuerySetter,
} from '@/logic/queryParams';
import {
  optimizeFilters,
  serializeFilters,
  joinFiltersWithItems,
} from '@/logic/filters';
import {
  searchResponseToFacetsExtractor,
  buildEmptyFacets,
} from '@/logic/facets';
import {
  images as imagesService,
  filtersItems as filtersItemsService,
} from '@/services';
import FilterImageUpload from './modules/FilterImageUpload';
import SearchResultsImageItem from './modules/SearchResultsImageItem';
import Pagination from './modules/Pagination';
import SearchSidebar from '@/components/modules/SearchSidebar';
import SearchResultsSummary from './modules/SearchResultsSummary';
import Ellipsis from './modules/Ellipsis';
import SearchInput from './modules/SearchInput';
import FilterFactory from '@/models/FilterFactory';
import Image from '@/models/Image';
import SearchQuery from '@/models/SearchQuery';
import FacetModel from '@/models/Facet';

const AllowedFilterTypes = [
  'newspaper',
  'isFront',
  'daterange',
  'title'
];

const AllowedFacetTypes = [
  'newspaper', 'year'
];

export default {
  props: {
    enableUpload: Boolean,
  },
  components: {
    SearchResultsImageItem,
    Pagination,
    SearchInput,
    SearchResultsSummary,
    Ellipsis,
    FilterImageUpload,
    SearchSidebar,
  },
  data: () => ({
    q: '',
    isLoading: false,
    selectedItems: [],
    allIndeterminate: false,
    allSelected: false,
    similarToImage: null,
    searchResults: [],
    paginationTotalRows: 0,
    /** @type {Facet[]} */
    facets: [],
    /** @type {Filter[]} */
    filtersWithItems: [],
  }),
  mounted() {
    this.facets = buildEmptyFacets(AllowedFacetTypes);
  },
  computed: {
    searchQuery: {
      ...searchQueryGetter(),
      ...searchQuerySetter({
        additionalQueryParams: {
          p: 1,
        },
      }),
    },
    seed() {
      return this.$route.query.seed || 0;
    },
    /** @returns {Filter[]} */
    enrichedFilters() {
      return this.filtersWithItems.length
        ? this.filtersWithItems
        : this.filters
    },
    /** @returns {Filter[]} */
    ignoredFilters() {
      return this.searchQuery.filters
        .filter(({ type }) => !AllowedFilterTypes.includes(type))
    },
    /** @returns {Filter[]} */
    filters() {
      // filter by type
      return this.searchQuery.filters
        .filter(({ type }) => AllowedFilterTypes.includes(type));
    },
    /** @returns {string[]} */
    excludedTypes() {
      return this.filters
        .map(d => d.type);
    },
    similarToImageUid() {
      return this.$route.query.i;
    },
    isFront: {
      get() {
        return this.filters.some(({type}) => type === 'isFront');
      },
      set(val) {
        this.handleFiltersChanged(this.filters
          .filter((d) => d.type !== 'isFront' )
          .concat(val
            ? [ FilterFactory.create({ type: 'isFront' }) ]
            : []
          )
        );
      },
    },
    // searchResults: {
    //   get() {
    //     return this.$store.getters['searchImages/results'];
    //   },
    // },
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
        return this.$route.query.orderBy ?? '-date';
      },
      set(orderBy) {
        this.$navigation.updateQueryParametersWithHistory({
          orderBy,
        });
      },
    },
    paginationCurrentPage: {
      get() {
        return parseInt(this.$route.query.p ?? 0, 10);
      },
      set(p) {
        this.$navigation.updateQueryParametersWithHistory({
          p,
        });
      },
    },
    paginationPerPage: {
      get() {
        return Math.min(12, Math.max(this.$route.query.limit ?? 1, 50));
      },
      set(limit) {
        this.$navigation.updateQueryParametersWithHistory({
          limit,
        });
      },
    },
    isLoggedIn() {
      return this.$store.state.user.userData;
    },
    serviceQuery: {
      get() {
        return {
          seed: this.seed,
          similarToImage: this.similarToImage,
          filters: this.filters.map(d => d.getQuery()),
          groupBy: this.groupBy,
          orderBy: this.orderBy,
          limit: this.paginationPerPage,
          page: this.paginationCurrentPage,
        };
      },
    },
  },
  methods: {
    handleFiltersChanged(filters) {
      // add back ignored filters so that we can reuse them in other views
      this.searchQuery = new SearchQuery({
        filters: optimizeFilters(filters).concat(this.ignoredFilters),
      });
    },
    reset() {
      this.searchQuery = new SearchQuery({
        filters: this.ignoredFilters,
      });
    },
    onSummary(msg) {
      this.inputDescription = msg
        .replace(/<(?:.|\n)*?>/gm, '') // strip html tags
        .replace('Found', this.$t('Based on search query with'));
    },
    onSuggestion(filter) {
      this.handleFiltersChanged(this.filters.concat([ filter ]));
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
    // onInputPagination(page = 1) {
    //   this.$store.dispatch('searchImages/SET_RANDOM_PAGE', false);
    //   this.search(page);
    // },
    onClearSelection() {
      this.selectedItems = [];
    },
    onClickSearch(image) {
      console.info('.onClickSearch, image:', image);
    //   this.$store.commit('searchImages/UPDATE_SIMILAR_TO_UPLOADED', false);
    //   this.similarToImage = image;
    //   this.$store.commit('searchImages/UPDATE_SIMILAR_TO', image.uid);
    //   this.search(1);
    },
    onSearchQuery(q) {
      console.info('onSearchQuery:', q);
    },
    loadRandomPage() {
      console.info('loadRandomPage');
      this.$navigation.updateQueryParametersWithHistory({
        p: 0,
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
    similarToImageUid: {
      handler(uid) {
        console.info('similarToImage', uid);
        if (uid) {
          imagesService.get(uid).then((res) => {
            this.similarToImage = res;
          });
        } else {
          this.similarToImage = null;
        }
      },
      immediate: true,
    },
    serviceQuery: {
      async handler({ page, limit, filters, orderBy }) {
        if (this.isLoading) {
          console.warn('loading already... please try again later on');
          return;
        }
        this.isLoading = true;
        const query = {
          filters,
          order_by: orderBy,
          facets: AllowedFacetTypes,
          limit,
        };
        if (page > 0) {
          query.page = page;
        } else {
          query.randomPage = 'true';
        }
        console.info('@serviceQuery query:', query);
        const [
          res, // { skip, limit, total, data, info },
          filtersWithItems,
        ] = await Promise.all([
          imagesService.find({
            query,
          }),
          filtersItemsService.find({
            query: {
              filters: serializeFilters(filters),
            },
          }).then(joinFiltersWithItems),
        ]);
        this.paginationTotalRows = res.total;
        this.searchResults = res.data.map(d => new Image(d));
        this.filtersWithItems = filtersWithItems;
        this.paginationCurrentPage = Math.round(res.skip / res.limit) + 1;

        const facets = searchResponseToFacetsExtractor(AllowedFacetTypes)(res);
        this.facets = facets.map(f => new FacetModel(f));

        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
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
