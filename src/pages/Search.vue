<template>
  <i-layout id="SearchPage">
    <search-sidebar
      width="400px"
      :filters="enrichedFilters"
      :facets="facets"
      contextTag="search"
      @changed="handleFiltersChanged"
    >
      <template v-slot:header="{ focusHandler }">
        <autocomplete @submit="onSuggestion" @input-focus="focusHandler" :filters="filters" />
      </template>
      <div>
        <button
          class="float-right mx-3 btn btn-sm btn-outline-secondary"
          @click="showModal('embeddings')"
          data-testid="add-similar-words-button"
        >
          {{ $t('label_embeddings') }}
          <info-button
            class="ml-1"
            :offset-options="{
              crossAxis: 100,
              mainAxis: 20
            }"
            name="how-are-word-embeddings-generated"
          />
        </button>
        <b-form-group class="mx-3" data-testid="is-frontpage-toggle">
          <b-form-checkbox v-model="isFront" switch v-bind:modelValue="true">
            {{ $t('label_isFront') }}
          </b-form-checkbox>
        </b-form-group>
      </div>
    </search-sidebar>

    <i-layout-section main>
      <template v-slot:header>
        <b-navbar type="light" variant="light" class="border-bottom px-0 py-0">
          <b-navbar-nav class="px-3 py-3 flex-grow-1 border-right">
            <label class="mr-1">{{ $t('label_group') }}</label>
            <i-dropdown
              v-model="groupBy"
              v-bind:options="groupByOptions"
              size="sm"
              variant="outline-primary"
              data-testid="group-by-dropdown"
            ></i-dropdown>
          </b-navbar-nav>
          <b-navbar-nav class="px-3 py-3 border-right">
            <label class="mr-1">{{ $t('label_order') }}</label>
            <i-dropdown
              v-model="orderBy"
              v-bind:options="orderByOptions"
              size="sm"
              variant="outline-primary"
              right
              data-testid="order-by-dropdown"
            ></i-dropdown>
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
              class="addbulk bg-white float-right"
            />
          </div>
        </b-navbar>

        <b-navbar class="d-flex p-0 border-bottom bg-light">
          <b-navbar-nav class="px-2 pl-3 py-2 border-right flex-grow-1">
            <ellipsis v-bind:initialHeight="60">
              <search-results-summary
                :isLoading="isLoadingResults"
                @onSummary="onSummary"
                :group-by="groupBy"
                :search-query="{ filters: enrichedFilters }"
                :totalRows="paginationTotalRows"
              />
            </ellipsis>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto pl-3">
            <RouterLink
              class="mr-1 btn btn-sm btn-outline-primary"
              :to="{
                name: 'compare',
                query: {
                  left: searchQueryHash
                }
              }"
            >
              {{ $t('actions.compare') }}
            </RouterLink>
            <b-dropdown
              v-if="isLoggedIn"
              v-bind:text="$t('query_actions')"
              size="sm"
              variant="outline-primary"
              right
              class="bg-white mr-3"
            >
              <b-dropdown-item
                v-if="selectedItems.length > 0"
                @click="showModal('nameSelectionCollection')"
              >
                <span class="dripicons-checklist pr-1"></span>
                {{ $tc('add_n_to_collection', selectedItems.length) }}
              </b-dropdown-item>
              <b-dropdown-item v-on:click="exportSelectedCsv" v-if="selectedItems.length > 0">
                <span class="dripicons-export pr-1"></span>
                {{ $t('selected_export_csv') }}
              </b-dropdown-item>
              <b-dropdown-item @click="showModal('nameCollection')">
                <span class="dripicons-archive pr-1"></span>
                {{ $t('query_add_to_collection') }}
              </b-dropdown-item>
              <b-dropdown-item v-on:click="exportQueryCsv">
                <span class="dripicons-export pr-1"></span>
                {{ $t('query_export_csv') }}
                <info-button
                  placement="left"
                  name="am-i-allowed-to-automatically-mass-download-newspaper-images-and-texts"
                  right
                  class="float-right"
                  :offset-options="{
                    crossAxis: 100,
                    mainAxis: 20
                  }"
                />
              </b-dropdown-item>
            </b-dropdown>
            <!-- <b-form-checkbox
              v-if="isLoggedIn"
              class="mx-1"
              v-bind:title="$t('select_all')"
              v-bind:indeterminate="this.allIndeterminate"
              v-bind:modelValue="this.allSelected"
              @update:modelValue="toggleSelectAll"
            >
            </b-form-checkbox> -->
          </b-navbar-nav>
        </b-navbar>
      </template>

      <Modal
        id="nameSelectionCollection"
        hide-footer
        body-class="m-0 p-0"
        :title="$tc('add_n_to_collection', selectedItems.length)"
        :show="isModalVisible('nameSelectionCollection')"
        @shown="nameSelectedCollectionOnShown()"
      >
        <collection-add-to-list :items="selectedItems" />
      </Modal>

      <Modal
        id="nameCollection"
        :title="$t('query_add_to_collection')"
        :show="isModalVisible('nameCollection')"
        :okDisabled="nameCollectionOkDisabled"
        @close="hideModal('nameCollection')"
        @ok="createQueryCollection()"
        @shown="nameCollectionOnShown()"
      >
        <form v-on:submit.stop.prevent="createQueryCollection()">
          <label for="inputName">Name</label>
          <b-form-input
            @update:modelValue="nameCollectionOnInput"
            type="text"
            v-bind:placeholder="$t('Collection_Name')"
            name="inputName"
            ref="inputName"
            v-model="inputName"
          />
          <label for="inputDescription" class="mt-3">Description</label>
          <textarea
            type="text"
            name="inputDescription"
            class="form-control"
            v-model="inputDescription"
          />
        </form>
        <div class="mt-3 small-caps">
          <p>Please note: Collections are currently limited to 10.000 items.</p>
          <p class="mb-0">
            If your search returned more results, only the 10.000 most relevant items will be
            stored.
          </p>
        </div>
      </Modal>

      <Modal
        hide-footer
        id="embeddings"
        :title="$t('label_embeddings')"
        :show="isModalVisible('embeddings')"
        @close="hideModal('embeddings')"
      >
        <embeddings-search @embdding-selected="addFilterFromEmbedding" />
      </Modal>

      <div class="p-1">
        <b-container fluid>
          <div ref="searchResultsFirstElement" />
          <b-row v-if="displayStyle === 'list'" data-testid="search-results-list-items">
            <b-col
              cols="12"
              v-for="(searchResult, index) in searchResults"
              v-bind:key="searchResult.uid"
            >
              <search-results-list-item
                v-bind:checkbox="false"
                v-on:toggleSelected="toggleSelected(searchResult)"
                v-bind:checked="isChecked(searchResult)"
                v-model="searchResults[index]"
              />
            </b-col>
          </b-row>
          <b-row class="pb-5" v-if="displayStyle === 'tiles'">
            <b-col
              cols="6"
              sm="12"
              md="6"
              lg="4"
              v-for="(searchResult, index) in searchResults"
              v-bind:key="searchResult.article_uid"
            >
              <search-results-tiles-item
                checkbox="true"
                v-on:toggleSelected="toggleSelected(searchResult)"
                v-bind:checked="isChecked(searchResult)"
                v-on:click="onClickResult(searchResult)"
                v-model="searchResults[index]"
              />
            </b-col>
          </b-row>
        </b-container>
        <div class="my-5" />
        <div class="fixed-pagination-footer p-1 m-0">
          <pagination
            v-if="searchResults.length"
            :current-page="paginationCurrentPage"
            @change="$event => (paginationCurrentPage = $event)"
            :per-page="paginationPerPage"
            :total-rows="paginationTotalRows"
            class="float-left small-caps"
          />
        </div>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
import { mapStores } from 'pinia'
import Autocomplete from '@/components/Autocomplete.vue'
import Pagination from '@/components/modules/Pagination.vue'
import SearchResultsListItem from '@/components/modules/SearchResultsListItem.vue'
import SearchResultsTilesItem from '@/components/modules/SearchResultsTilesItem.vue'
import SearchResultsSummary from '@/components/modules/SearchResultsSummary.vue'
import CollectionAddTo from '@/components/modules/CollectionAddTo.vue'
import CollectionAddToList from '@/components/modules/CollectionAddToList.vue'
import Ellipsis from '@/components/modules/Ellipsis.vue'
import EmbeddingsSearch from '@/components/modules/EmbeddingsSearch.vue'
import SearchSidebar from '@/components/modules/SearchSidebar.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import SearchQuery, { getFilterQuery } from '@/models/SearchQuery'
import Article from '@/models/Article'
import FacetModel from '@/models/Facet'
import FilterFactory from '@/models/FilterFactory'
import Modal from '@/components/base/Modal.vue'
import { searchResponseToFacetsExtractor, buildEmptyFacets } from '@/logic/facets'
import { joinFiltersWithItems, SupportedFiltersByContext } from '@/logic/filters'
import { searchQueryGetter, searchQuerySetter } from '@/logic/queryParams'
import {
  search as searchService,
  searchFacets as searchFacetsService,
  filtersItems as filtersItemsService,
  exporter as exporterService,
  collectionsItems as collectionsItemsService
} from '@/services'
import { useCollectionsStore } from '@/stores/collections'
import { useUserStore } from '@/stores/user'
import { Navigation } from '@/plugins/Navigation'
import { RouterLink } from 'vue-router'

const AllowedFilterTypes = SupportedFiltersByContext.search

const FACET_TYPES_DPFS = ['person', 'location', 'topic']

const FACET_TYPES_S = [
  'language',
  'newspaper',
  'type',
  'country',
  'accessRight',
  'partner',
  'year',
  'contentLength'
]

const FACET_TYPES = FACET_TYPES_S.concat(FACET_TYPES_DPFS)

export default {
  data: () => ({
    selectedItems: [],
    allIndeterminate: false,
    allSelected: false,
    inputName: '',
    inputDescription: 'All of Impresso',
    nameCollectionOkDisabled: true,
    inputEmbeddings: '',
    searchResults: [],
    paginationTotalRows: 0,
    /** @type {Facet[]} */
    facets: [],
    /** @type {Filter[]} */
    // filtersWithItems: [],
    visibleModal: null,
    isLoadingResults: false
  }),
  props: {
    filtersWithItems: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapStores(useCollectionsStore, useUserStore),
    $navigation() {
      return new Navigation(this)
    },
    searchQuery: {
      ...searchQueryGetter(),
      ...searchQuerySetter({
        additionalQueryParams: {
          p: '1'
        }
      })
    },
    groupByOptions() {
      return ['issues', 'pages', 'articles'].map(value => ({
        value,
        text: this.$t(`order_${value}`),
        disabled: value !== 'articles'
      }))
    },
    orderByOptions() {
      return ['-relevance', 'date', '-date'].map(value => {
        const label = value.replace(/^-/, '')
        const direction = value.indexOf('-') === 0 ? 'desc' : 'asc'
        return {
          value,
          text: this.$t(`sort.${label}.${direction}`)
        }
      })
    },
    isFront: {
      get() {
        return this.filters.some(({ type }) => type === 'isFront')
      },
      set(val) {
        this.handleFiltersChanged(
          this.filters
            .filter(d => d.type !== 'isFront')
            .concat(val ? [FilterFactory.create({ type: 'isFront' })] : [])
        )
      }
    },
    isLoggedIn() {
      return this.userStore.userData
    },
    orderBy: {
      get() {
        return this.$route.query.orderBy ?? '-relevance'
      },
      set(orderBy) {
        this.$navigation.updateQueryParametersWithHistory({
          orderBy
        })
      }
    },
    groupBy: {
      get() {
        return this.$route.query.groupBy ?? 'articles'
      },
      set(groupBy) {
        this.$navigation.updateQueryParametersWithHistory({
          groupBy
        })
      }
    },
    displayStyle: {
      get() {
        return this.$route.query.displayStyle ?? 'list'
      },
      set(displayStyle) {
        this.$navigation.updateQueryParametersWithHistory({
          displayStyle
        })
      }
    },
    paginationCurrentPage: {
      get() {
        return parseInt(this.$route.query.p ?? 1, 10)
      },
      set(p) {
        this.$navigation.updateQueryParametersWithHistory({
          p
        })
      }
    },
    paginationPerPage: {
      get() {
        return Math.min(25, Math.max(this.$route.query.limit ?? 1, 50))
      },
      set(limit) {
        this.$navigation.updateQueryParametersWithHistory({
          limit
        })
      }
    },
    allowedFiltersWithItems() {
      return this.filtersWithItems.filter(({ type }) => AllowedFilterTypes.includes(type))
    },
    /** @returns {Filter[]} */
    enrichedFilters() {
      return this.allowedFiltersWithItems.length ? this.allowedFiltersWithItems : this.filters
    },
    /** @returns {Filter[]} */
    ignoredFilters() {
      return this.searchQuery.filters.filter(({ type }) => !AllowedFilterTypes.includes(type))
    },
    /** @returns {Filter[]} */
    filters() {
      // filter by type
      return (
        this.searchQuery.filters
          .filter(({ type }) => AllowedFilterTypes.includes(type))
          // add impliit filters
          .concat([FilterFactory.create({ type: 'hasTextContents' })])
      )
    },
    filtersIndex: {
      get() {
        return this.searchQuery.filtersIndex
      }
    },
    searchServiceQuery: {
      get() {
        const query = {
          filters: this.filters.map(getFilterQuery),
          groupBy: this.groupBy,
          orderBy: this.orderBy,
          limit: this.paginationPerPage,
          page: this.paginationCurrentPage
        }
        return query
      }
    },
    paginationData() {
      return {
        perPage: this.paginationPerPage,
        currentPage: this.paginationCurrentPage,
        total: this.paginationTotalRows
      }
    },
    searchQueryHash() {
      return new SearchQuery({
        filters: this.filters
      }).getSerialized({ serializer: 'protobuf' })
    }
  },
  mounted() {
    this.facets = buildEmptyFacets(FACET_TYPES)
  },
  methods: {
    isModalVisible(name) {
      return this.visibleModal === name
    },
    showModal(name) {
      this.visibleModal = name
    },
    hideModal() {
      this.visibleModal = null
    },
    handleFiltersChanged(filters) {
      // add back ignored filters so that we can reuse them in other views
      this.searchQuery = new SearchQuery({
        filters: filters.concat(this.ignoredFilters)
      })
    },
    nameSelectedCollectionOnShown() {
      return this.collectionsStore.loadCollections()
    },
    onSummary(msg) {
      this.inputDescription = msg
        .replace(/<(?:.|\n)*?>/gm, '') // strip html tags
        .replace('Found', this.$t('Based on search query with'))
    },
    onSuggestion(filter) {
      this.handleFiltersChanged(this.filters.concat([filter]))
    },
    itemSelected(item) {
      return this.selectedItems.findIndex(c => c.uid === item.uid) !== -1
    },
    addSelectedItem(item) {
      if (!this.itemSelected(item)) {
        this.selectedItems.push(item)
      }
    },
    removeSelectedItem(item) {
      if (this.itemSelected(item)) {
        const idx = this.selectedItems.findIndex(c => c.uid === item.uid)
        this.selectedItems.splice(idx, 1)
      }
    },
    toggleSelected(item) {
      if (!this.itemSelected(item)) {
        this.selectedItems.push(item)
      } else {
        const idx = this.selectedItems.findIndex(c => c.uid === item.uid)
        this.selectedItems.splice(idx, 1)
      }
    },
    toggleSelectAll(checked) {
      if (checked) {
        this.searchResults.forEach(item => {
          this.addSelectedItem(item)
        })
      } else {
        this.searchResults.forEach(item => {
          this.removeSelectedItem(item)
        })
      }
    },
    isChecked(item) {
      return this.selectedItems.findIndex(c => c.uid === item.uid) !== -1
    },
    onClearSelection() {
      this.selectedItems = []
    },
    onClickResult(searchResult) {
      this.$router.push({
        name: 'article',
        params: {
          issue_uid: searchResult.issue.uid,
          page_number: searchResult.pages[0]?.num,
          page_uid: searchResult.pages[0]?.uid,
          article_uid: searchResult.uid
        }
      })
    },
    createQueryCollection() {
      if (!this.nameCollectionOkDisabled) {
        this.hideModal('nameCollection')
        return this.collectionsStore
          .addCollection({
            name: this.inputName,
            description: this.inputDescription
          })
          .then(collection => {
            return searchService.create({
              group_by: 'articles',
              filters: this.filters.map(getFilterQuery),
              collection_uid: collection.uid
            })
          })
      }
    },
    exportQueryCsv() {
      exporterService.create(
        {
          description: this.inputDescription
        },
        {
          query: {
            group_by: 'articles',
            filters: this.filters.map(getFilterQuery),
            format: 'csv'
          }
        }
      )
    },
    exportSelectedCsv() {
      const uids = this.selectedItems.map(a => a.uid)
      exporterService.create(
        {},
        {
          query: {
            group_by: 'articles',
            filters: [
              {
                type: 'uid',
                q: uids
              }
            ],
            format: 'csv'
          }
        }
      )
    },
    nameCollectionOnShown() {
      this.inputName = ''
      this.$refs.inputName.$el.focus()
    },
    nameCollectionOnInput() {
      this.inputName.trim()
      this.nameCollectionOkDisabled = this.inputName.length < 3 || this.inputName.length > 50
    },
    reset() {
      this.searchQuery = new SearchQuery({
        filters: this.ignoredFilters
      })
    },
    updateselectAll() {
      let count = 0
      this.searchResults.forEach(item => {
        if (this.itemSelected(item)) {
          count += 1
        }
      })
      if (count === 0) {
        this.allSelected = false
        this.allIndeterminate = false
      } else if (count < this.searchResults.length) {
        this.allSelected = false
        this.allIndeterminate = true
      } else {
        this.allSelected = true
        this.allIndeterminate = false
      }
    },
    addFilterFromEmbedding(embedding) {
      this.handleFiltersChanged(
        this.filters.concat([
          FilterFactory.create({
            q: [embedding],
            type: 'string'
          })
        ])
      )
    }
  },
  watch: {
    searchResults() {
      this.updateselectAll()
    },
    selectedItems() {
      this.updateselectAll()
    },
    searchServiceQuery: {
      async handler({ page, limit, filters, orderBy, groupBy }) {
        this.isLoadingResults = true
        const { total, data, info } = await searchService
          .find({
            query: {
              page,
              limit,
              filters,
              facets: FACET_TYPES_S,
              order_by: orderBy,
              group_by: groupBy
            }
          })
          .then(response => {
            console.log('[Search] data:', response.data)
            return response
          })
        this.paginationTotalRows = total
        this.searchResults = data.map(d => new Article(d))
        this.isLoadingResults = false

        this.$refs.searchResultsFirstElement?.scrollIntoView({ behavior: 'smooth' })

        let facets = searchResponseToFacetsExtractor(FACET_TYPES_S)({ info })

        // get remaining facets and enriched filters.
        const facetTypes = [
          ...['person', 'location', 'topic', 'partner'],
          ...(this.isLoggedIn ? ['collection'] : [])
        ]

        const [extraFacets, collectionsItemsIndex] = await Promise.all([
          searchFacetsService
            .find({
              query: {
                facets: facetTypes,
                filters
                // group_by: groupBy,
              }
            })
            .then(response => response.data),
          // filtersItemsService
          //   .find({
          //     query: {
          //       filters: this.searchQueryHash,
          //     },
          //   })
          //   .then(joinFiltersWithItems),
          this.isLoggedIn
            ? collectionsItemsService
                .find({
                  query: {
                    item_uids: this.searchResults.map(d => d.uid),
                    limit: 100
                  }
                })
                .then(({ data }) =>
                  data.reduce((acc, d) => {
                    acc[d.itemId] = d
                    return acc
                  }, {})
                )
            : {}
        ])
        facets = facets.concat(extraFacets)
        // TODO sort facets based on the right order
        this.facets = facets.map(f => new FacetModel(f))
        if (this.isLoggedIn) {
          // add collections.
          this.searchResults = this.searchResults.map(article => {
            if (collectionsItemsIndex[article.uid]) {
              article.collections = collectionsItemsIndex[article.uid].collections
            }
            return article
          })
        }
      },
      immediate: true
    },
    paginationData({ perPage, currentPage = 1, total }) {
      if (total == null) return
      if (perPage * currentPage > total) {
        this.paginationCurrentPage = Math.ceil(total / perPage)
      }
    }
  },
  components: {
    Autocomplete,
    Pagination,
    SearchResultsListItem,
    SearchResultsTilesItem,
    SearchResultsSummary,
    CollectionAddTo,
    CollectionAddToList,
    Ellipsis,
    EmbeddingsSearch,
    SearchSidebar,
    InfoButton,
    Modal
  }
}
</script>

<style lang="scss">
@import 'src/assets/legacy/bootstrap-impresso-theme-variables.scss';

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

.navigator {
  border-width: 0 0 1px 1px !important;

  .displayregion {
    border: 1px solid rgb(255, 225, 49) !important;
    background-color: rgba(255, 225, 49, 0.3) !important;
  }
}

.search-bar.search-box {
  border-left: 1px solid #111;
  background-color: white;
}

.bg-dark .search-bar.search-box {
  border-left: 1px solid #aaa;
  background-color: transparent;
}
</style>

<i18n lang="json">
{
  "en": {
    "label_display": "Display As",
    "label_order": "Order By",
    "label_group": "Group By",
    "label_isFront": "Frontpage",
    "label_embeddings": "add similar words",
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
    "Collection_Name": "Collection Name",
    "Collection_Description": "Collection Description",
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
