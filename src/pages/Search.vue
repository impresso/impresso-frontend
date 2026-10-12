<template>
  <i-layout id="SearchPage">
    <SearchSidebar
      width="380px"
      :filters="enrichedFilters"
      :facets="facets"
      contextTag="search"
      :ignored-filter-types="ignoredFilters.map(({ type }) => type)"
      @changed="handleFiltersChanged"
    >
      <template v-slot:header="{ focusHandler }">
        <Autocomplete
          class="mb-2"
          @submit="onSuggestion"
          @open-explorer="searchExpertToolsRef?.openExplorer($event)"
          @input-focus="focusHandler"
          :filters="filters"
        />
      </template>
      <SearchExpertTools
        class="mx-3 pb-2 border-bottom mb-2"
        ref="searchExpertToolsRef"
        :filters="filters"
        :is-barista-enabled="isBaristaEnabled"
        @semantic-search="handleSemanticSearch"
        @filters-changed="handleFiltersChanged"
      />
      <div>
        <button
          class="float-right mx-3 btn btn-sm btn-outline-secondary"
          @click="showModal('embeddings')"
          data-testid="add-similar-words-button"
        >
          {{ $t('label_embeddings') }}
          <InfoButton
            class="ml-1"
            :offset-options="{ crossAxis: 100, mainAxis: 20 }"
            name="how-are-word-embeddings-generated"
          />
        </button>
        <div class="mx-3 mb-3" data-testid="is-frontpage-toggle">
          <BFormCheckbox v-model="isFront" switch>
            {{ $t('label_isFront') }}
          </BFormCheckbox>
        </div>
      </div>
      <template v-slot:after-facets>
        <div class="p-3">
          <BFormCheckbox v-model="loadCollectionsFlag" switch>
            {{ $t('label_loadCollection') }}
          </BFormCheckbox>
        </div>
      </template>
    </SearchSidebar>

    <i-layout-section main>
      <template v-slot:header>
        <PageNavbarHeading :label="$t('pageLabel')" :title="$t('pageTitle')">
          <template #actions>
            <RouterLink
              class="mr-2 btn btn-sm btn-outline-primary"
              :to="{ name: 'compare', query: { left: searchQueryHash } }"
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
            <BDropdown
              v-if="isLoggedIn"
              :text="$t('query_actions')"
              size="sm"
              variant="outline-primary"
              right
              class="bg-white"
            >
              <BDropdownItem
                v-if="selectedItems.length > 0"
                @click="showModal('nameSelectionCollection')"
              >
                <span class="dripicons-checklist pr-1"></span>
                {{ $t('add_n_to_collection', selectedItems.length) }}
              </BDropdownItem>
              <BDropdownItem v-if="selectedItems.length > 0" @click="exportSelectedCsv">
                <span class="dripicons-export pr-1"></span>
                {{ $t('selected_export_csv') }}
              </BDropdownItem>
              <BDropdownItem @click="showModal('nameCollection')">
                <span class="dripicons-archive pr-1"></span>
                {{ $t('query_add_to_collection') }}
              </BDropdownItem>
              <BDropdownItem @click="exportQueryCsv">
                <span class="dripicons-export pr-1"></span>
                {{ $t('query_export_csv') }}
                <InfoButton
                  placement="left"
                  name="am-i-allowed-to-automatically-mass-download-newspaper-images-and-texts"
                  right
                  class="float-right"
                  :offset-options="{ crossAxis: 100, mainAxis: 20 }"
                />
              </BDropdownItem>
            </BDropdown>
          </template>
          <template #summary>
            <Ellipsis :initialHeight="70" :additional-height="50">
              <SearchResultsSummary
                :isLoading="isLoading"
                @onSummary="msg => onSummary(msg, $t('Based on search query with'))"
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
                :options="orderByOptions.map(o => ({ value: o.value, text: $t(o.labelKey) }))"
                size="sm"
                variant="outline-primary"
                right
                data-testid="order-by-dropdown"
              />
            </div>
          </template>
        </PageNavbarHeading>
      </template>

      <Modal
        id="nameSelectionCollection"
        hide-footer
        body-class="m-0 p-0"
        :title="$t('add_n_to_collection', selectedItems.length)"
        :show="visibleModal === 'nameSelectionCollection'"
        @shown="collectionsStore.loadCollections()"
      >
        <CollectionAddToList :items="selectedCollectableItems" />
      </Modal>

      <CreateCollectionModal
        :show="visibleModal === 'nameCollection'"
        @dismiss="hideModal()"
        @success="
          handleCreateCollectionModalSuccess(
            $t('query_add_to_collection_success_title'),
            $t('query_add_to_collection_success_message')
          )
        "
        :filters="searchServiceQuery.filters"
        :initial-payload="{
          name: inputName,
          description: searchQueryDescription
            ? $t('collectionDescription', { inputDescription: searchQueryDescription })
            : inputDescription
        }"
      />

      <InfoModal
        :modalTitle="$t('label_embeddings')"
        :show="isModalVisible('embeddings')"
        @close="hideModal()"
        hide-footer
      >
        <EmbeddingsSearch
          :withPreview="true"
          :filters="searchServiceQuery.filters"
          @filters-changed="
            (newFilters: Filter[]) => {
              handleFiltersChanged(newFilters)
              hideModal()
            }
          "
        />
      </InfoModal>

      <div class="p-1">
        <div class="container-fluid">
          <div ref="searchResultsFirstElementRef" />
          <LoadingBlock v-if="isLoading && !searchResults.length" />
          <div class="row">
            <div class="col-12" v-for="searchResult in searchResults" :key="searchResult.id">
              <div class="p-3 border rounded my-2 shadow-sm mr-5">
                <AudioContentItem
                  v-if="searchResult.meta?.sourceMedium === 'audio'"
                  :contentItem="searchResult"
                  :enable-player="true"
                  :is-playing="isAudioItemPlaying(searchResult.id)"
                  :current-time="getAudioItemReadingTime(searchResult.id)"
                  @update:is-playing="
                    (isPlaying: boolean) => onAudioItemPlayingChanged(searchResult.id, isPlaying)
                  "
                  @update:current-time="
                    (currentTime: number) =>
                      onAudioItemCurrentTimeChanged(searchResult.id, currentTime)
                  "
                  showCollections
                  showProvider
                  showSpecs
                  showMeta
                  showIcon
                  showLink
                  showTitle
                  showMediaSource
                  showDate
                  showTopics
                  showType
                  showSnippet
                  showMatches
                  showOcrQuality
                  showContentItemAccess
                  showSemanticEnrichments
                  enableAddToCollection
                />
                <ContentItemComponent
                  v-else
                  :contentItem="searchResult"
                  showCollections
                  showProvider
                  showSpecs
                  showMeta
                  showIcon
                  showLink
                  showTitle
                  showMediaSource
                  showDate
                  showTopics
                  showType
                  showSnippet
                  showMatches
                  showContentItemAccess
                  showOcrQuality
                  showIIIFThumbnail
                  showSemanticEnrichments
                  enableAddToCollection
                  contentItemTopicClasses="col-12 col-xxl-6"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="my-5" />
        <div class="fixed-pagination-footer p-1 m-0">
          <Pagination
            v-if="searchResults.length"
            :current-page="paginationCurrentPage"
            @change="(page: number) => (paginationCurrentPage = page)"
            :per-page="paginationPerPage"
            :total-rows="paginationTotalRows"
            class="float-left small-caps"
          />
        </div>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Autocomplete from '@/components/Autocomplete.vue'
import SearchExpertTools from '@/components/SearchExpertTools.vue'
import Pagination from '@/components/modules/Pagination.vue'
import SearchResultsSummary from '@/components/modules/SearchResultsSummary.vue'
import CollectionAddToList, {
  type ItemWithCollections
} from '@/components/modules/CollectionAddToList.vue'
import Ellipsis from '@/components/modules/Ellipsis.vue'
import EmbeddingsSearch from '@/components/modules/EmbeddingsSearch.vue'
import SearchSidebar from '@/components/modules/SearchSidebar.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import InfoModal from '@/components/InfoModal.vue'
import LoadingBlock from '@/components/LoadingBlock.vue'
import PageNavbarHeading from '@/components/PageNavbarHeading.vue'
import CreateCollectionModal from '@/components/CreateCollectionModal.vue'
import CopyToDatalabButton from '@/components/modules/datalab/CopyToDatalabButton.vue'
import AudioContentItem from '@/components/audio/AudioContentItem.vue'
import ContentItemComponent from '@/components/modules/lists/ContentItem.vue'
import Modal from 'impresso-ui-components/components/legacy/BModal.vue'

import SearchQuery, { getFilterQuery } from '@/models/SearchQuery'
import FacetModel from '@/models/Facet'
import FilterFactory from '@/models/FilterFactory'
import { buildEmptyFacets, SearchDynamicFacetTypes, SearchDecimalFacetTypes } from '@/logic/facets'
import { buildExportDescription } from '@/logic/exportDescription'
import { buildExportSignature, isDuplicateExport } from '@/logic/exportGuard'
import { SupportedFiltersByContext, TextContentItemFacets } from '@/logic/filters'
import { searchQueryGetter, searchQuerySetter } from '@/logic/queryParams'
import {
  contentItems as contentItemsService,
  searchFacets as searchFacetsService,
  exporter as exporterService
} from '@/services'
import { useCollectionsStore } from '@/stores/collections'
import { useAudioStore } from '@/stores/audio'
import { useNotificationsStore } from '@/stores/notifications'
import { useSearchQueriesStore } from '@/stores/searchQueries'
import { useUserStore } from '@/stores/user'
import { DatalabPublicApiUrl } from '@/constants'
import { includes } from '@/util/fn'
import type { Features } from '@/init'
import type { ContentItem } from '@/models/generated/canonical/contentItem'
import type { FacetType, Filter, Facet } from '@/models'
import type { FindQuery } from '@/services/types/contentItems'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const AllowedFilterTypes = SupportedFiltersByContext.search
const FacetTypes = TextContentItemFacets
/** Range facets (currently none for search). */
const RangeFacetTypes = [] satisfies FacetType[]
const DynamicFacetTypes = SearchDynamicFacetTypes
/** Facet that has to be fetched to render the timeline slider. */
const TimelineFacetTypes = ['year'] satisfies FacetType[]
/** User-specific facets that require authentication. */
const UserFacetTypes = ['collection'] satisfies FacetType[]

const publicApiUrl = DatalabPublicApiUrl

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
const props = withDefaults(defineProps<{ filtersWithItems?: Filter[] }>(), {
  filtersWithItems: () => []
})

// ---------------------------------------------------------------------------
// Router, stores
// ---------------------------------------------------------------------------
const route = useRoute()
const router = useRouter()
const collectionsStore = useCollectionsStore()
const audioStore = useAudioStore()
const notificationsStore = useNotificationsStore()
const searchQueriesStore = useSearchQueriesStore()
const userStore = useUserStore()

/** Replacement for `$navigation.updateQueryParametersWithHistory`. */
const updateQueryParametersWithHistory = (params: Record<string, string | number | undefined>) => {
  const query: Record<string, any> = { ...route.query }
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) delete query[key]
    else query[key] = String(value)
  })
  router.push({ query })
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const selectedItems = ref<ContentItem[]>([])
const inputName = ref('')
const inputDescription = 'All of Impresso'
const searchQueryDescription = ref<string | null>(null)
const searchResults = ref<ContentItem[]>([])
const paginationTotalRows = ref(0)
const visibleModal = ref<string | undefined>(undefined)
const isLoading = ref(false)

const timelineFacets = ref<Facet[]>(buildEmptyFacets(TimelineFacetTypes))
/** Common facets are expected to be loaded first. */
const commonFacets = ref<Facet[]>(buildEmptyFacets(FacetTypes))
/** User specific facets may take time to load. */
const userFacets = ref<Facet[]>([])
const rangeFacets = ref<Facet[]>(buildEmptyFacets(RangeFacetTypes))
const dynamicFacets = ref<Facet[]>(buildEmptyFacets(DynamicFacetTypes))
const decimalRangeFacets = ref<Facet[]>(buildEmptyFacets(SearchDecimalFacetTypes))

const searchResultsFirstElementRef = ref<HTMLElement | null>(null)
const searchExpertToolsRef = ref<{
  openExplorer(options?: { initialQ?: string; initialType?: FacetType }): void
} | null>(null)

// Non-reactive request bookkeeping
let activeSearchRequestId = 0
let isUnmounted = false

// ---------------------------------------------------------------------------
// Search query (route <-> SearchQuery)
// ---------------------------------------------------------------------------
// The legacy getter/setter helpers rely on `this.$route` / `this.$navigation`.
// They are bound to a minimal context here until they are rewritten as composables.
const legacyContext = {
  get $route() {
    return route
  },
  $router: router,
  $navigation: { updateQueryParametersWithHistory }
}
const legacyGetter = searchQueryGetter()
const legacySetter = searchQuerySetter({ additionalQueryParams: { p: '1' } })

const searchQuery = computed<SearchQuery>({
  get: () => (legacyGetter as any).get.call(legacyContext),
  set: (value: SearchQuery) => (legacySetter as any).set.call(legacyContext, value)
})

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const isLoggedIn = computed(() => !!userStore.userData)
const loadCollectionsFlag = computed({
  get: () => (route.query.c as string) === '1',
  set: (value: boolean) => updateQueryParametersWithHistory({ c: value ? '1' : undefined })
})
const shouldLoadCollections = computed(() => isLoggedIn.value && loadCollectionsFlag.value)

const selectedCollectableItems = computed<ItemWithCollections[]>(() =>
  selectedItems.value.map(item => ({
    itemId: item.id,
    collectionIds: item.semanticEnrichments?.collections?.map(c => c.id)
  }))
)

const orderByOptions = computed(() =>
  ['-ocrQuality', '-relevance', 'date', '-date'].map(value => {
    const label = value.replace(/^-/, '')
    const direction = value.startsWith('-') ? 'desc' : 'asc'
    return { value, labelKey: `sort.${label}.${direction}` }
  })
)

const orderBy = computed<FindQuery['order_by']>({
  get: () => {
    // Explicit user choice wins.
    if (route.query.orderBy != null) return route.query.orderBy as FindQuery['order_by']
    // Without filters relevance is constant, so show higher OCR quality first.
    return searchQuery.value.filters.length === 0 ? '-ocrQuality' : '-relevance'
  },
  set: (value: FindQuery['order_by']) => updateQueryParametersWithHistory({ orderBy: value })
})

const groupBy = computed(() => (route.query.groupBy as string) ?? 'articles')

const paginationCurrentPage = computed({
  get: () => parseInt((route.query.p as string) ?? '1', 10),
  set: (p: number) => updateQueryParametersWithHistory({ p })
})

// NOTE: behaviour preserved from the original (always resolves to 25).
const paginationPerPage = computed(() => {
  const limit = parseInt((route.query.limit as string) ?? '1')
  return Math.min(25, Math.max(limit, 50))
})

const allowedFiltersWithItems = computed(() =>
  props.filtersWithItems.filter(({ type }) => includes(AllowedFilterTypes, type))
)

const filters = computed<Filter[]>(() =>
  searchQuery.value.filters
    .filter(({ type }) => AllowedFilterTypes.includes(type))
    // implicit filter
    .concat([FilterFactory.create({ type: 'hasTextContents' })])
)

const enrichedFilters = computed(() =>
  allowedFiltersWithItems.value.length ? allowedFiltersWithItems.value : filters.value
)

const ignoredFilters = computed(() =>
  searchQuery.value.filters.filter(({ type }) => !AllowedFilterTypes.includes(type))
)

const isFront = computed({
  get: () => filters.value.some(({ type }) => type === 'isFront'),
  set: (value: boolean) =>
    handleFiltersChanged(
      filters.value
        .filter(d => d.type !== 'isFront')
        .concat(value ? [FilterFactory.create({ type: 'isFront' })] : [])
    )
})

const searchServiceQuery = computed<FindQuery>(() => ({
  filters: filters.value.map(getFilterQuery),
  limit: paginationPerPage.value,
  offset: (paginationCurrentPage.value - 1) * paginationPerPage.value,
  order_by: orderBy.value
}))

const paginationData = computed(() => ({
  perPage: paginationPerPage.value,
  currentPage: paginationCurrentPage.value,
  total: paginationTotalRows.value
}))

const searchQueryHash = computed(
  () =>
    new SearchQuery({ filters: filters.value }).getSerialized({ serializer: 'protobuf' }) as string
)
const base64Filters = computed(() => searchQueryHash.value)

const isBaristaEnabled = computed(
  () => (window as unknown as { impressoFeatures: Features }).impressoFeatures?.barista?.enabled
)

const facets = computed(() => [
  ...timelineFacets.value,
  ...commonFacets.value,
  ...dynamicFacets.value,
  ...decimalRangeFacets.value,
  ...rangeFacets.value,
  ...userFacets.value
])

// ---------------------------------------------------------------------------
// Modals
// ---------------------------------------------------------------------------
const isModalVisible = (name: string) => visibleModal.value === name
const showModal = (name: string) => {
  visibleModal.value = name
}
const hideModal = (name: string | undefined = undefined) => {
  visibleModal.value = name
}

const handleCreateCollectionModalSuccess = (title: string, message: string) => {
  notificationsStore.addNotification({ title, message, type: 'info' })
  hideModal()
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------
function handleFiltersChanged(newFilters: Filter[]) {
  // add back ignored filters so that they can be reused in other views
  searchQuery.value = new SearchQuery({
    filters: newFilters.concat(ignoredFilters.value)
  })
}

function onSuggestion(filter: Filter) {
  handleFiltersChanged(filters.value.concat([filter]))
}

function handleSemanticSearch({ text, embedding }: { text: string; embedding: string }) {
  if (text && embedding) {
    onSuggestion(FilterFactory.create({ type: 'embedding', q: [embedding] }))
  }
}

function onSummary(msg: string, basedOnLabel: string) {
  const description = msg
    .replace(/<(?:.|\n)*?>/gm, '') // strip html tags
    .replace('Found', basedOnLabel)
  searchQueriesStore.recordHash(searchQueryHash.value, description)
  searchQueryDescription.value = description
}

// ---------------------------------------------------------------------------
// Audio
// ---------------------------------------------------------------------------
const isAudioItemPlaying = (id: string) => audioStore.contentItemId === id && audioStore.isPlaying
const getAudioItemReadingTime = (id: string) => audioStore.getReadingTimeByContentItemId(id)
const onAudioItemCurrentTimeChanged = (id: string, currentTime: number) =>
  audioStore.setReadingTime(id, currentTime)
const onAudioItemPlayingChanged = (id: string, isPlaying: boolean) => {
  if (isPlaying) {
    audioStore.setContentItemId(id)
    audioStore.setIsPlaying(true)
    return
  }
  if (audioStore.contentItemId === id) audioStore.setIsPlaying(false)
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
function notifyExportPreparing() {
  notificationsStore.addNotification({
    type: 'success',
    title: 'Export is being prepared',
    message: 'You can track its progress in Tasks.'
  })
}

function requestCsvExport(description: string, queryFilters: unknown[]) {
  const payload = { description: description.slice(0, 1000) }
  const params = {
    query: { group_by: 'articles', filters: queryFilters, format: 'csv' }
  }
  // The service hook is the authority that blocks the real create; this
  // only skips a second toast if we already claimed the same export.
  if (isDuplicateExport(buildExportSignature(payload, params))) return
  exporterService.create(payload, params)
  notifyExportPreparing()
}

function exportQueryCsv() {
  requestCsvExport(
    buildExportDescription({
      filters: filters.value,
      totalRows: paginationTotalRows.value,
      groupBy: 'articles'
    }),
    filters.value.map(getFilterQuery)
  )
}

function exportSelectedCsv() {
  const ids = selectedItems.value.map(a => a.id)
  requestCsvExport(buildExportDescription({ selectedCount: ids.length, groupBy: 'articles' }), [
    { type: 'uid', q: ids }
  ])
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------
const toFacetModels = (data: unknown[]) => data.map(f => new FacetModel(f as any))

async function fetchSearchResults({
  offset = 0,
  limit,
  filters: queryFilters = [],
  order_by
}: FindQuery) {
  const requestId = ++activeSearchRequestId
  const isStale = () => isUnmounted || requestId !== activeSearchRequestId
  const startTime = Date.now()
  isLoading.value = true

  try {
    const response = await contentItemsService.find({
      query: {
        offset,
        limit,
        filters: queryFilters,
        order_by
      }
    })
    if (isStale()) return

    const total = response.pagination.total
    paginationTotalRows.value = total
    searchResults.value = response.data

    const [timeline, range, common, user] = await Promise.all([
      searchFacetsService
        .find({ query: { facets: TimelineFacetTypes, filters: queryFilters, limit: 300 } })
        .then(r => toFacetModels(r.data)),
      searchFacetsService
        .find({ query: { facets: RangeFacetTypes, filters: queryFilters, limit: 50 } })
        .then(r =>
          r.data.map(f => {
            // sort buckets by key (numerical order)
            const buckets = (f.buckets as { value: number }[]).sort((a, b) => a.value - b.value)
            return new FacetModel({ ...f, buckets } as any)
          })
        ),
      searchFacetsService
        .find({ query: { facets: FacetTypes, filters: queryFilters } })
        .then(r => toFacetModels(r.data)),
      shouldLoadCollections.value
        ? searchFacetsService
            .find({ query: { facets: UserFacetTypes, filters: queryFilters } })
            .then(r => toFacetModels(r.data))
        : Promise.resolve([] as Facet[])
    ])
    if (isStale()) return

    console.info('[Search] took', Date.now() - startTime, 'ms. Total results:', total)

    nextTick(() => {
      if (!isStale()) {
        searchResultsFirstElementRef.value?.scrollIntoView({ behavior: 'smooth' })
      }
    })

    timelineFacets.value = timeline
    rangeFacets.value = range
    commonFacets.value = common
    userFacets.value = shouldLoadCollections.value ? user : []
  } catch (error) {
    if (!isStale()) console.error('[Search] fetchSearchResults failed:', error)
  } finally {
    if (!isStale()) isLoading.value = false
  }
}

// ---------------------------------------------------------------------------
// Watchers & lifecycle
// ---------------------------------------------------------------------------
watch(
  [searchServiceQuery, shouldLoadCollections],
  () => fetchSearchResults(searchServiceQuery.value),
  { deep: true, immediate: true }
)

watch(searchResults, results => {
  if (
    audioStore.contentItemId != null &&
    !results.some(item => item.id === audioStore.contentItemId)
  ) {
    audioStore.setIsPlaying(false)
    audioStore.setContentItemId(null)
  }
})

watch(paginationData, ({ perPage, currentPage = 1, total }) => {
  if (total == null) return
  if (perPage * currentPage > total) {
    paginationCurrentPage.value = Math.ceil(total / perPage)
  }
})

audioStore.pruneReadingProgress()

onBeforeUnmount(() => {
  isUnmounted = true
  audioStore.setIsPlaying(false)
  audioStore.setContentItemId(null)
})
</script>

<style lang="scss">
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
    "collectionDescription": "Based on search query: {inputDescription}"
  }
}
</i18n>
