<template>
<i-layout id="SearchPage">
  <i-layout-section width="400px" class="border-right border-top mt-1px">
    <!--  header -->
    <div slot="header" class="border-bottom border-tertiary bg-light">
      <b-tabs pills class="mx-2 pt-2">
        <template v-slot:tabs-end>
          <b-nav-item class="pl-2 active"
            active-class='none'
            :to="{ name:'search'}"><span v-html="$t('tabs.text')"/></b-nav-item>
          <b-nav-item
            active-class='none'
            :to="{ name:'searchImages'}"><span v-html="$t('tabs.images')"/></b-nav-item>
        </template>
      </b-tabs>
      <div class="py-3 px-3">
        <search-pills
          v-on:remove="onRemoveFilter"
          v-on:add="onAddFilter"
          :search-filters="filters"
        />
        <autocomplete v-on:submit="onSuggestion" />
      </div>
    </div>

    <!--  body -->
    <div class="pt-3">

      <b-button v-b-modal.embeddings class="float-right mx-3 btn-sm">Embeddings</b-button>

      <b-form-group class="mx-3">
        <b-form-checkbox v-model="isFront" switch v-bind:value="true">
          {{$t('label_isFront')}}
        </b-form-checkbox>
      </b-form-group>

      <!-- <search-filters v-on:remove-filter="search(1)" v-on:submit-filter="search(1)" /> -->
      <search-facets @submit-facet="onFacet" @update-filter="onUpdateFilter" @reset-filter="onResetFilter"/>
    </div>
    <!-- <div slot="footer">
      <b-button-group class="d-flex bg-white p-3 border-top border-tertiary">
        <b-button class="small-caps mr-2 w-75" variant="outline-primary" size="md" v-on:click="search(1)">Search</b-button>
        <b-button class="small-caps w-25" variant="outline-danger" size="md" v-on:click="reset">Clear</b-button>
      </b-button-group>
    </div> -->
  </i-layout-section>
  <i-layout-section class="border-left border-top ml-1px mt-1px">
    <div slot="header">
      <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
        <b-navbar-nav class="px-3 py-3 flex-grow-1 border-right">
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

      <b-navbar variant="tertiary" v-if="selectedItems.length > 0" class="d-flex border-bottom">
        <div class="flex-grow-1">
          <span class="small-caps">
            {{ $tc('items_selected', selectedItems.length) }}
          </span>
          <b-button variant="danger" class="ml-2" size="sm" v-on:click="onClearSelection()">
            {{ $t('Clear Selection') }}
          </b-button>
          <collection-add-to
            :items="selectedItems"
            :text="$tc('add_n_to_collection', selectedItems.length)"
            class="addbulk bg-white float-right" />
        </div>
      </b-navbar>

      <b-navbar class="d-flex p-0 border-bottom bg-light">
        <b-navbar-nav class="p-2 border-right flex-grow-1">
          <ellipsis v-bind:initialHeight="60">
            <search-result-summary
              @onSummary="onSummary"
              :group-by="groupBy"
              :queryComponents="queryComponents"
              :totalRows="paginationTotalRows" />
          </ellipsis>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto pl-3" v-if="isLoggedIn()">
          <b-dropdown v-bind:text="$t('query_actions')" size="sm" variant="outline-primary" class="bg-white mr-3">
            <b-dropdown-item
              v-if="selectedItems.length > 0"
              class="p-2 small-caps"
              v-b-modal.nameSelectionCollection>
              <span class="dripicons-checklist pr-1"></span>
              {{$tc('add_n_to_collection', selectedItems.length)}}
            </b-dropdown-item>
            <b-dropdown-item v-on:click="exportSelectedCsv"
              v-if="selectedItems.length > 0"
              class="p-2 small-caps">
              <span class="dripicons-export pr-1"></span>
              {{$t("selected_export_csv")}}
            </b-dropdown-item>
            <b-dropdown-item
              class="p-2 small-caps"
              v-b-modal.nameCollection>
              <span class="dripicons-archive pr-1"></span>
              {{$t("query_add_to_collection")}}
            </b-dropdown-item>
            <b-dropdown-item v-on:click="exportQueryCsv"
              class="p-2 small-caps">
              <span class="dripicons-export pr-1"></span>
              {{$t("query_export_csv")}}
            </b-dropdown-item>
          </b-dropdown>
          <b-form-checkbox
          class="mx-1"
            v-b-tooltip.hover.topleft.html.o100.d500 v-bind:title="$t('select_all')"
            v-bind:indeterminate="this.allIndeterminate"
            v-bind:checked.native="this.allSelected"
            v-on:change="toggleSelectAll">
          </b-form-checkbox>
        </b-navbar-nav>
      </b-navbar>
    </div>

    <b-modal hide-footer scrollable
      body-class="m-0 p-0"
      id="nameSelectionCollection"
      ref="nameSelectionCollection"
      v-on:shown="nameSelectedCollectionOnShown()"
      v-bind:title="$tc('add_n_to_collection', selectedItems.length)">
      <collection-add-to-list :items="selectedItems" />
    </b-modal>

    <b-modal
      id="nameCollection"
      ref="nameCollection"
      v-bind:title="$t('query_add_to_collection')"
      v-on:shown="nameCollectionOnShown()"
      v-bind:ok-disabled="nameCollectionOkDisabled"
      v-on:ok="createQueryCollection()">
      <form v-on:submit.stop.prevent="createQueryCollection()">
        <label for="inputName">Name</label>
        <b-form-input
          v-on:input="nameCollectionOnInput"
          type="text"
          v-bind:placeholder="$t('Collection_Name')"
          name="inputName" ref="inputName" v-model="inputName" />
        <label for="inputDescription" class="mt-3">Description</label>
        <textarea
          type="text" name="inputDescription" class="form-control"
          v-model="inputDescription" />
      </form>
      <div class="mt-3 small-caps">
        <p>Please note: Collections are currently limited to 10.000 items.</p>
        <p class="mb-0">If your search returned more results, only the 10.000 most relevant
        items will be stored.</p>
      </div>
    </b-modal>

    <b-modal hide-footer id="embeddings" ref="embeddings"
      v-bind:title="$t('Find words similar to ...')">
      <embeddings-search @embdding-selected="addFilterFromEmbedding" />
    </b-modal>


    <div class="p-1">
      <b-container fluid>
        <b-row v-if="displayStyle === 'list'">
          <b-col cols="12" v-for="(searchResult, index) in searchResults" v-bind:key="searchResult.article_uid">
            <search-results-list-item
              v-bind:checkbox=true
              v-on:toggleSelected="toggleSelected(searchResult)"
              v-bind:checked="isChecked(searchResult)"
              v-on:click="onClickResult(searchResult)"
              v-model="searchResults[index]" />
          </b-col>
        </b-row>
        <b-row class="pb-5" v-if="displayStyle === 'tiles'">
          <b-col cols="6" sm="12" md="6" lg="4" v-for="(searchResult, index) in searchResults" v-bind:key="searchResult.article_uid">
            <search-results-tiles-item
              checkbox=true
              v-on:toggleSelected="toggleSelected(searchResult)"
              v-bind:checked="isChecked(searchResult)"
              v-on:click="onClickResult(searchResult)"
              v-model="searchResults[index]" />
          </b-col>
        </b-row>
      </b-container>
      <div class="my-5" />
      <div class="fixed-pagination-footer p-1 m-0" slot="footer">
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
import Autocomplete from './Autocomplete';
import Pagination from './modules/Pagination';
import SearchFacets from './SearchFacets';
import SearchResultsListItem from './modules/SearchResultsListItem';
import SearchResultsTilesItem from './modules/SearchResultsTilesItem';
import SearchResultsSummary from './modules/SearchResultsSummary';
import CollectionAddTo from './modules/CollectionAddTo';
import CollectionAddToList from './modules/CollectionAddToList';
import Ellipsis from './modules/Ellipsis';
import SearchPills from './SearchPills';
import EmbeddingsSearch from './modules/EmbeddingsSearch';
// const uuid = require('uuid');

export default {
  data: () => ({
    selectedItems: [],
    allIndeterminate: false,
    allSelected: false,
    inputName: '',
    inputDescription: 'All of Impresso',
    nameCollectionOkDisabled: true,
    inputEmbeddings: '',
  }),
  computed: {
    isFront: {
      get() {
        return this.getBooleanFilter({ type: 'isFront' });
      },
      set(val) {
        this.toggleBooleanFilter({ type: 'isFront' }, val);
      },
    },
    hasTextContents: {
      get() {
        return this.getBooleanFilter({ type: 'hasTextContents' });
      },
      set(val) {
        this.toggleBooleanFilter({ type: 'hasTextContents' }, val);
      },
    },
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
        return this.$store.state.search.orderByOptions.map((value) => {
          const label = value.replace(/^-/, '');
          const direction = value.indexOf('-') === 0 ? 'desc' : 'asc';
          return {
            value,
            text: this.$t(`sort.${label}.${direction}`),
          };
        });
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
    filtersIndex: {
      get() {
        return this.$store.state.search.search.filtersIndex;
      },
    },
  },
  methods: {
    nameSelectedCollectionOnShown() {
      return this.$store.dispatch('collections/LOAD_COLLECTIONS');
    },
    getBooleanFilter(filter) {
      return !!this.$store.state.search.search.getFilter(filter);
    },
    toggleBooleanFilter(filter, value = true) {
      if (!value) {
        this.$store.commit('search/REMOVE_FILTER', filter);
      } else {
        this.$store.commit('search/ADD_FILTER', filter);
      }
      this.search(1);
    },
    onSummary(msg) {
      this.inputDescription = msg
        .replace(/<(?:.|\n)*?>/gm, '') // strip html tags
        .replace('Found', this.$t('Based on search query with'));
    },
    onSuggestion(suggestion) {
      this.$store.commit('search/ADD_FILTER', suggestion);
      this.search(1);
    },
    onFacet(facet) {
      console.info('@onFacet', facet);
      this.$store.commit('search/ADD_FILTER', facet);
      this.search(1);
    },
    onResetFilter(type) {
      this.$store.commit('search/RESET_FILTER', type);
      this.search(1);
    },
    onUpdateFilter(filter) {
      this.$store.commit('search/UPDATE_FILTER', filter);
      this.search(1);
    },
    onInputPagination(page = 1) {
      this.search(page);
    },
    onRemoveFilter(filter) {
      this.$store.commit('search/REMOVE_FILTER', filter);
      this.search(1);
    },
    onAddFilter(filter) {
      this.$store.commit('search/ADD_FILTER', filter);
      this.search(1);
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
    createQueryCollection() {
      if (!this.nameCollectionOkDisabled) {
        this.$refs.nameCollection.hide();
        this.$store.dispatch('collections/ADD_COLLECTION', {
          name: this.inputName,
          description: this.inputDescription,
        }).then((collection) => {
          this.$store.dispatch('search/CREATE_COLLECTION_FROM_QUERY', collection.uid);
        });
      }
    },
    exportQueryCsv() {
      this.$store.dispatch('search/EXPORT_FROM_QUERY', {
        description: this.inputDescription,
      }).then((res) => {
        console.info(res);
      });
    },
    exportSelectedCsv() {
      const uids = this.selectedItems.map(a => a.uid);
      this.$store.dispatch('search/EXPORT_FROM_UIDS', {
        filters: [
          {
            type: 'uid',
            q: uids,
          },
        ],
      }).then((res) => {
        console.info(res);
      });
    },
    nameCollectionOnShown() {
      this.inputName = '';
      this.$refs.inputName.focus();
    },
    nameCollectionOnInput() {
      this.inputName.trim();
      this.nameCollectionOkDisabled = (this.inputName.length < 3 || this.inputName.length > 50);
    },
    search(page) {
      if (page !== undefined) {
        this.$store.commit('search/UPDATE_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      }
      this.$store.dispatch('search/PUSH_SEARCH_PARAMS');
    },
    reset() {
      this.$store.commit('search/CLEAR');
      this.search(); // we do a search so we display all results in the corpus
    },
    isLoggedIn() {
      return this.$store.state.user.userData;
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
    addFilterFromEmbedding(embedding) {
      console.info('AE', embedding);
      const filter = { query: embedding, type: 'string', context: 'include' };
      this.$store.dispatch('search/ADD_FILTER', { filter });
      this.$store.dispatch('search/PUSH_SEARCH_PARAMS');
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
        this.$store.dispatch('search/PULL_SEARCH_PARAMS', val);
      },
      deep: true,
      immediate: true,
    },
  },
  components: {
    Autocomplete,
    Pagination,
    'search-results-list-item': SearchResultsListItem,
    'search-results-tiles-item': SearchResultsTilesItem,
    'search-facets': SearchFacets,
    'search-result-summary': SearchResultsSummary,
    CollectionAddTo,
    CollectionAddToList,
    Ellipsis,
    SearchPills,
    EmbeddingsSearch,
  },
  mounted() {
    if (this.uuid !== undefined) {
      this.$store.commit('search/LOAD_SEARCH', this.uuid);
    }
    // this.search();
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
    .custom-control-label,
    .custom-control-label::before {
      position: inherit;
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
    "tabs": {
      "text": "search articles",
      "images": "search images"
    },
    "label_display": "Display As",
    "label_order": "Order By",
    "label_group": "Group By",
    "label_isFront": "Frontpage",
    "label_hasTextContents": "Contains Text",
    "display_button_list": "List",
    "display_button_tiles": "Tiles",
    "order_issues": "Issue",
    "order_pages": "Page",
    "order_articles": "Article",
    "order_sentences": "Sentence",
    "select_all": "Select all items on this page",
    "items_selected": "One item selected | {count} items selected",
    "Clear Selection": "Clear Selection",
    "add_n_to_collection": "Add selected item to collection ... | Add {count} selected items to collection ...",
    "query_actions": "Save / Export",
    "query_add_to_collection": "Create Collection from Search Results",
    "Collection_Name" : "Collection Name",
    "Collection_Description" : "Collection Description",
    "query_export": "Export result list as ...",
    "query_export_csv": "Export result list as CSV",
    "selected_export_csv": "Export selected items as CSV",
    "Based on search query with": "Based on search query with"
  },
  "nl": {
    "label_display": "Toon Als",
    "label_order": "Sorteer Op",
    "label_group": "Rangschikken Per",
    "label_isFront": "Voorpagina",
    "label_hasTextContents": "Bevat tekst",
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
