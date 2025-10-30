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
          <b-form-checkbox v-model="isFront" switch>
            {{ $t('label_isFront') }}
          </b-form-checkbox>
        </b-form-group>
      </div>
      <template v-slot:after-facets>
        <div class="p-3">
          <b-form-checkbox v-model="loadCollectionsFlag" switch>
            {{ $t('label_loadCollection') }}
          </b-form-checkbox>
        </div>
      </template>
    </search-sidebar>

    <i-layout-section main>
      <template v-slot:header>
        <PageNavbarHeading :label="$t('pageLabel')" :title="$t('pageTitle')">
          <template #actions>
            <RouterLink
              class="mr-2 btn btn-sm btn-outline-primary"
              :to="{
                name: 'compare',
                query: {
                  left: searchQueryHash
                }
              }"
            >
              {{ $t('actions.compare') }}
            </RouterLink>
            <CopyToDatalabButton
              class="mr-2"
              :base64Filters="base64Filters"
              resource="search"
              functionName="find"
              :public-api-url="publicApiUrl"
            />
            <b-dropdown
              v-if="isLoggedIn"
              v-bind:text="$t('query_actions')"
              size="sm"
              variant="outline-primary"
              right
              class="bg-white"
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
          </template>
          <template #summary>
            <Ellipsis v-bind:initialHeight="60" :additional-height="50">
              <SearchResultsSummary
                :isLoading="isLoadingResults"
                @onSummary="onSummary"
                :group-by="groupBy"
                :search-query="{ filters: enrichedFilters }"
                :totalRows="paginationTotalRows"
              />
            </Ellipsis>
          </template>
          <template #summaryActions>
            <div class="d-flex align-items-center">
              <label class="mr-2 text-nowrap">{{ $t('label_order') }}</label>
              <i-dropdown
                v-model="orderBy"
                v-bind:options="orderByOptions"
                size="sm"
                variant="outline-primary"
                right
                data-testid="order-by-dropdown"
              ></i-dropdown>
            </div>
          </template>
        </PageNavbarHeading>
      </template>

      <Modal
        id="nameSelectionCollection"
        hide-footer
        body-class="m-0 p-0"
        :title="$tc('add_n_to_collection', selectedItems.length)"
        :show="visibleModal === 'nameSelectionCollection'"
        @shown="nameSelectedCollectionOnShown()"
      >
        <collection-add-to-list :items="selectedCollectableItems" />
      </Modal>

      <CreateCollectionModal
        :show="visibleModal === 'nameCollection'"
        @dismiss="hideModal"
        @success="handleCreateCollectionModalSuccess"
        :filters="searchServiceQuery.filters"
        :initial-payload="{
          name: inputName,
          description: inputDescription
        }"
      />

      <Modal
        hide-footer
        id="embeddings"
        :title="$t('label_embeddings')"
        :show="isModalVisible('embeddings')"
        @close="hideModal()"
      >
        <embeddings-search @embdding-selected="addFilterFromEmbedding" />
      </Modal>

      <div class="p-1">
        <b-container fluid>
          <div ref="searchResultsFirstElementRef" />
          <b-row v-if="displayStyle === 'list'" data-testid="search-results-list-items">
            <b-col
              cols="12"
              v-for="(searchResult, index) in searchResults"
              v-bind:key="searchResult.id"
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
              v-bind:key="searchResult.id"
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

      <AuthGate v-if="isBaristaEnabled">
        <template #authenticated>
          <BaristaButton class="float-right mr-3" @search="updateSearchFromBarista" />
        </template>
      </AuthGate>
    </i-layout-section>
  </i-layout>
</template>

<script lang="ts">
import { mapStores } from 'pinia'
import Autocomplete from '@/components/Autocomplete.vue'
import Pagination from '@/components/modules/Pagination.vue'
import SearchResultsListItem from '@/components/modules/SearchResultsListItem.vue'
import SearchResultsTilesItem from '@/components/modules/SearchResultsTilesItem.vue'
import SearchResultsSummary from '@/components/modules/SearchResultsSummary.vue'
import CollectionAddToList, {
  ItemWithCollections
} from '@/components/modules/CollectionAddToList.vue'
import Ellipsis from '@/components/modules/Ellipsis.vue'
import EmbeddingsSearch from '@/components/modules/EmbeddingsSearch.vue'
import SearchSidebar from '@/components/modules/SearchSidebar.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import SearchQuery, { getFilterQuery } from '@/models/SearchQuery'
import FacetModel, { FacetType } from '@/models/Facet'
import FilterFactory from '@/models/FilterFactory'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'
import PageNavbarHeading from '@/components/PageNavbarHeading.vue'
import { buildEmptyFacets } from '@/logic/facets'
import { SupportedFiltersByContext } from '@/logic/filters'
import { searchQueryGetter, searchQuerySetter } from '@/logic/queryParams'
import {
  contentItems as contentItemsService,
  searchFacets as searchFacetsService,
  exporter as exporterService
} from '@/services'
import { useCollectionsStore } from '@/stores/collections'
import { useNotificationsStore } from '@/stores/notifications'
import { useUserStore } from '@/stores/user'
import { Navigation } from '@/plugins/Navigation'
import CopyToDatalabButton from '@/components/modules/datalab/CopyToDatalabButton.vue'
import BaristaButton from '@/components/barista/BaristaButton.vue'
import AuthGate from '@/components/AuthGate.vue'
import { ContentItem } from '@/models/generated/schemas/contentItem'
import { Facet, Filter } from '@/models'
import { ComponentPublicInstance, defineComponent, PropType, ref } from 'vue'
import { Features } from '@/init'
import CreateCollectionModal from '@/components/CreateCollectionModal.vue'
import { DatalabPublicApiUrl } from '@/constants'

const AllowedFilterTypes = SupportedFiltersByContext.search

export const FacetTypes = [
  'language',
  'newspaper',
  'type',
  'country',
  'partner',
  // 'year',
  'contentLength',
  'copyright',
  'sourceType',
  'sourceMedium',
  // DPFS facets
  'person',
  'location',
  'nag',
  'organisation',
  'topic'
] satisfies FacetType[]

const UserFacetTypes = ['collection'] satisfies FacetType[]

export interface IData {
  selectedItems: ContentItem[]
  allIndeterminate: boolean
  allSelected: boolean
  inputName: string
  inputDescription: string
  nameCollectionOkDisabled: boolean
  inputEmbeddings: string
  searchResults: ContentItem[]
  paginationTotalRows: number
  timelineFacets: Facet[]
  /**
   * Common facets are expected to be loaded first.
   */
  commonFacets: Facet[]
  /**
   * User specific facets may take time to load and are not expected to be available immediately.
   */
  userFacets: Facet[]
  visibleModal?: string
  isLoadingResults: boolean
}

export default defineComponent({
  data(): IData {
    return {
      selectedItems: [],
      allIndeterminate: false,
      allSelected: false,
      inputName: '',
      inputDescription: 'All of Impresso',
      nameCollectionOkDisabled: true,
      inputEmbeddings: '',
      searchResults: [],
      paginationTotalRows: 0,
      commonFacets: [],
      userFacets: [],
      timelineFacets: [],
      visibleModal: null,
      isLoadingResults: false
    } satisfies IData
  },
  props: {
    filtersWithItems: {
      type: Array as PropType<Filter[]>,
      default: () => []
    }
  },
  setup() {
    const inputNameRef = ref<ComponentPublicInstance | undefined>()
    const searchResultsFirstElementRef = ref<ComponentPublicInstance | undefined>()
    return { inputNameRef, searchResultsFirstElementRef }
  },
  computed: {
    ...mapStores(useCollectionsStore, useNotificationsStore, useUserStore),
    $navigation() {
      return new Navigation(this)
    },
    selectedCollectableItems(): ItemWithCollections[] {
      return this.selectedItems.map(item => ({
        itemId: item.id,
        collectionIds: item.semanticEnrichments?.collections?.map(c => c.uid)
      }))
    },
    searchQuery: {
      ...searchQueryGetter(),
      ...searchQuerySetter({
        additionalQueryParams: {
          p: '1'
        }
      })
    },
    publicApiUrl() {
      return DatalabPublicApiUrl
    },
    groupByOptions() {
      return ['issues', 'pages', 'articles'].map(value => ({
        value,
        text: this.$t(`order_${value}`),
        disabled: value !== 'articles'
      }))
    },
    orderByOptions() {
      return ['-ocrQuality', '-relevance', 'date', '-date'].map(value => {
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
      set(val: boolean) {
        this.handleFiltersChanged(
          this.filters
            .filter(d => d.type !== 'isFront')
            .concat(val ? [FilterFactory.create({ type: 'isFront' })] : [])
        )
      }
    },
    isLoggedIn() {
      return !!this.userStore.userData
    },
    shouldLoadCollections() {
      return this.isLoggedIn && this.loadCollectionsFlag
    },
    orderBy: {
      get() {
        // If the user explicitly set an orderBy parameter, we use that.
        if (this.$route.query.orderBy != null) {
          return this.$route.query.orderBy as string
        }

        // We want to use ocrQuality as default order to show higher quality content
        // because without filters the relevance is always the same.
        // But if there are filters, we assume the user wants relevance sorting.
        return this.searchQuery.filters.length === 0 ? '-ocrQuality' : '-relevance'
      },
      set(orderBy: string) {
        this.$navigation.updateQueryParametersWithHistory({
          orderBy
        })
      }
    },
    groupBy: {
      get() {
        return (this.$route.query.groupBy as string) ?? 'articles'
      },
      set(groupBy: string) {
        this.$navigation.updateQueryParametersWithHistory({
          groupBy
        })
      }
    },
    displayStyle: {
      get() {
        return (this.$route.query.displayStyle as string) ?? 'list'
      },
      set(displayStyle: string) {
        this.$navigation.updateQueryParametersWithHistory({
          displayStyle
        })
      }
    },
    loadCollectionsFlag: {
      get() {
        return (this.$route.query.c as string) === '1'
      },
      set(loadCollections: boolean) {
        this.$navigation.updateQueryParametersWithHistory({
          c: loadCollections ? '1' : undefined
        })
      }
    },
    paginationCurrentPage: {
      get() {
        return parseInt((this.$route.query.p as string) ?? '1', 10)
      },
      set(p: number) {
        this.$navigation.updateQueryParametersWithHistory({
          p
        })
      }
    },
    paginationPerPage: {
      get() {
        const limit = parseInt((this.$route.query.limit as string) ?? '1')
        return Math.min(25, Math.max(limit, 50))
      },
      set(limit: number) {
        this.$navigation.updateQueryParametersWithHistory({
          limit
        })
      }
    },
    allowedFiltersWithItems() {
      return this.filtersWithItems.filter(({ type }) => AllowedFilterTypes.includes(type))
    },
    enrichedFilters() {
      return this.allowedFiltersWithItems.length ? this.allowedFiltersWithItems : this.filters
    },
    ignoredFilters() {
      return this.searchQuery.filters.filter(({ type }) => !AllowedFilterTypes.includes(type))
    },
    filters(): Filter[] {
      // filter by type
      return (
        this.searchQuery.filters
          .filter(({ type }) => AllowedFilterTypes.includes(type))
          // add impliit filters
          .concat([FilterFactory.create({ type: 'hasTextContents' })])
      )
    },
    filtersIndex() {
      return this.searchQuery.filtersIndex
    },
    searchServiceQuery() {
      const query = {
        filters: this.filters.map(getFilterQuery),
        groupBy: this.groupBy,
        orderBy: this.orderBy,
        limit: this.paginationPerPage,
        page: this.paginationCurrentPage,
        loadCollections: this.loadCollectionsFlag
      }
      return query
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
      }).getSerialized({ serializer: 'protobuf' }) as string
    },
    base64Filters() {
      return this.searchQueryHash
    },
    isBaristaEnabled() {
      return (window as any as { impressoFeatures: Features }).impressoFeatures?.barista?.enabled
    },
    facets() {
      // return this.timelineFacets.concat(this.commonFacets, this.userFacets)
      return [...this.timelineFacets, ...this.commonFacets, ...this.userFacets]
    }
  },
  mounted() {
    console.info('[Search]@mounted. \n - FacetTypes:', FacetTypes)
    this.facets = buildEmptyFacets(FacetTypes)
    this.timelineFacets = buildEmptyFacets(['year'])
  },
  methods: {
    toggleLoadCollections() {
      this.loadCollectionsFlag = !this.loadCollectionsFlag
    },
    isModalVisible(name) {
      return this.visibleModal === name
    },
    showModal(name) {
      this.visibleModal = name
    },
    hideModal(name = undefined) {
      this.visibleModal = name
    },
    handleCreateCollectionModalSuccess() {
      this.notificationsStore.addNotification({
        title: this.$t('query_add_to_collection_success_title') as string,
        message: this.$t('query_add_to_collection_success_message') as string,
        type: 'info'
      })
      this.hideModal()
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
      const searchQueryDescription = msg
        .replace(/<(?:.|\n)*?>/gm, '') // strip html tags
        .replace('Found', this.$t('Based on search query with'))
      this.inputDescription = this.$tc('collectionDescription', this.paginationTotalRows, {
        total: this.paginationTotalRows,
        inputDescription: searchQueryDescription
      })
    },
    onSuggestion(filter) {
      this.handleFiltersChanged(this.filters.concat([filter]))
    },
    itemSelected(item: ContentItem) {
      return this.selectedItems.findIndex(c => c.id === item.id) !== -1
    },
    addSelectedItem(item) {
      if (!this.itemSelected(item)) {
        this.selectedItems.push(item)
      }
    },
    removeSelectedItem(item: ContentItem) {
      if (this.itemSelected(item)) {
        const idx = this.selectedItems.findIndex(c => c.id === item.id)
        this.selectedItems.splice(idx, 1)
      }
    },
    toggleSelected(item: ContentItem) {
      if (!this.itemSelected(item)) {
        this.selectedItems.push(item)
      } else {
        const idx = this.selectedItems.findIndex(c => c.id === item.id)
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
    isChecked(item: ContentItem) {
      return this.selectedItems.findIndex(c => c.id === item.id) !== -1
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
      const uids = this.selectedItems.map(a => a.id)
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
    reset() {
      this.searchQuery = new SearchQuery({
        filters: this.ignoredFilters
      })
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
    },
    updateSearchFromBarista(filters) {
      console.log('Barista suggests', filters)
      this.$router.push({
        name: 'search',
        query: {
          ...this.$route.query,
          sq: filters
        }
      })
    }
  },
  watch: {
    searchServiceQuery: {
      async handler({ page, limit, filters, orderBy }) {
        console.debug('[Search] @searchServiceQuery')
        const startTime = new Date()
        this.isLoadingResults = true
        const { data, total } = await contentItemsService
          .find({
            query: {
              offset: (page - 1) * limit,
              limit,
              filters,
              // facets: FacetTypesWithMultipleValues,
              order_by: orderBy
              // group_by: groupBy
            }
          })
          .then(response => {
            return response
          })
        this.paginationTotalRows = total
        this.searchResults = data
        this.isLoadingResults = false
        // this.searchInfo = info
        console.info(
          '[Search] @searchServiceQuery: took',
          new Date().getTime() - startTime.getTime(),
          'ms. Total results:',
          total
        )
        // @todo next tick
        this.$nextTick(() => {
          this.searchResultsFirstElementRef?.$el?.scrollIntoView({ behavior: 'smooth' })
        })
        this.timelineFacets = await searchFacetsService
          .find({
            query: {
              facets: ['year'],
              filters: this.searchServiceQuery.filters,
              limit: 300 // get all values
            }
          })
          .then(response => response.data.map(f => new FacetModel(f as any)))
        // load facets
        this.commonFacets = await searchFacetsService
          .find({
            query: {
              facets: FacetTypes,
              filters: this.searchServiceQuery.filters
            }
          })
          .then(response => response.data.map(f => new FacetModel(f as any)))

        this.userFacets = this.shouldLoadCollections
          ? await searchFacetsService
              .find({
                query: {
                  facets: UserFacetTypes,
                  filters: this.searchServiceQuery.filters
                }
              })
              .then(response => response.data.map(f => new FacetModel(f as any)))
          : []
      },
      deep: true,
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
    CreateCollectionModal,
    Pagination,
    SearchResultsListItem,
    SearchResultsTilesItem,
    SearchResultsSummary,
    CollectionAddToList,
    Ellipsis,
    EmbeddingsSearch,
    SearchSidebar,
    InfoButton,
    Modal,
    CopyToDatalabButton,
    BaristaButton,
    AuthGate,
    PageNavbarHeading
  }
})
</script>

<style lang="scss">
@import '@/assets/legacy/bootstrap-impresso-theme-variables.scss';

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
    "pageTitle": "Search Text",
    "pageLabel": "Search ",
    "label_display": "Display As",
    "label_order": "Order By",
    "label_group": "Group By",
    "label_isFront": "Frontpage",
    "label_embeddings": "add similar words",
    "label_hasTextContents": "Contains Text",
    "label_loadCollection": "Enable Collections",
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
    "query_add_to_collection_success_title": "Collection Created",
    "query_add_to_collection_success_message": "The collection has been created and the items are being added.",
    "Collection_Name": "Collection Name",
    "Collection_Description": "Collection Description",
    "query_export": "Export result list as ...",
    "query_export_csv": "Export result list as CSV",
    "selected_export_csv": "Export selected items as CSV",
    "Based on search query with": "Based on search query with",
    "collectionDescription": "1 content item{inputDescription} | {total} content items{inputDescription}"
  }
}
</i18n>
