<template>
  <i-layout-section main>
    <template v-slot:header>
      <b-navbar type="light" variant="light">
        <section class="pt-2 pb-1 w-100">
          <span class="label small-caps">{{ $t('textReuse').toLowerCase() }}</span>

          <h3 class="mb-1">
            <span v-if="isLoading"> ... (loading) </span>
            <span>{{ $t('routes.' + $route.name) }}</span>
            <small><InfoButton name="text-reuse" class="ml-1"/></small>
          </h3>
          <section class="text-serif TextReuseExplorerPage_summary">
            <div>
              <span v-html="incipit" />
              <SearchQuerySummary
                v-on:updated="summaryUpdatedHandler"
                :search-query="{ filters: supportedFiltersWithItems }"
              />
            </div>
            <div class="ml-2">
              <AddToCollection
                @item:click="handleAddToCollectionClick"
                @create="handleAddToCollectionCreate"
                :title="$t('addTrQueryResultsToCollection')"
              >
                <template slot="empty">
                  <span class="text-muted d-block">{{ $t('no_collections_found') }}</span>
                  <b-button
                    size="sm"
                    class="small-caps rounded shadow-sm mt-3"
                    variant="outline-secondary"
                    v-b-modal.createCollectionFromFilters
                  >
                    <span class="dripicons-archive pr-1"></span>
                    {{ $t('query_add_to_collection') }}
                  </b-button>
                </template>
              </AddToCollection>
            </div>
          </section>
        </section>
      </b-navbar>
      <b-tabs pills class="mx-3">
        <template v-slot:tabs-end>
          <b-nav-item
            :to="goToRoute({ name: 'textReuseOverview', query: { p: 1 } })"
            active-class="active"
            exact
            class="pl-2"
          >
            <span>{{ $t('routeTextReuseOverview') }}</span>
          </b-nav-item>
          <b-nav-item
            :to="goToRoute({ name: 'textReuseStatistics' })"
            active-class="active"
            exact
            class="pl-2"
          >
            <span>{{ $t('routeTextReuseStatistics') }}</span>
          </b-nav-item>
          <b-nav-item
            :to="goToRoute({ name: 'textReuseClusters' })"
            active-class="active"
            class="pl-2"
          >
            <span
              v-html="
                $tc('routeTextReuseClusters', totalClusters, {
                  n: isLoadingClusters ? '...' : $n(totalClusters),
                })
              "
            />
          </b-nav-item>
          <b-nav-item
            :to="goToRoute({ name: 'textReusePassages' })"
            active-class="active"
            class="pl-2"
          >
            <span
              v-html="
                $tc('routeTextReusePassages', totalPassages, {
                  n: isLoadingPassages ? '...' : $n(totalPassages),
                })
              "
            />
          </b-nav-item>

          <b-nav-text class="p-0 d-flex align-items-center ml-3"> </b-nav-text>
        </template>
      </b-tabs>
    </template>
    <TextReuseOverview
      v-if="$route.name === 'textReuseOverview'"
      :filters="supportedFilters"
      :loading="isLoading"
    ></TextReuseOverview>
    <TextReuseStatistics
      v-if="$route.name === 'textReuseStatistics'"
      :filters="supportedFilters"
      :loading="isLoading"
    />
    <List
      v-if="$route.name === 'textReuseClusters' && !isLoadingClusters"
      :items="clusters"
      :pagination-list="clustersPaginationList"
      @change-page="
        page => {
          this.paginationCurrentPage = page
        }
      "
    >
      <template v-slot:header>
        <b-navbar-nav class="d-flex flex-row pt-1">
          <b-nav-text class="ml-3 mr-2 text-muted">
            <label>{{ $t('sortBy') }}</label></b-nav-text
          >
          <b-nav-text class="mr-1">
            <i-dropdown
              v-model="orderBy"
              :options="
                orderByOptions.map(value => ({
                  value,
                  text: $t(`sort_${value}`),
                }))
              "
              class="mr-auto"
              size="sm"
              variant="outline-primary"
            ></i-dropdown
          ></b-nav-text>
        </b-navbar-nav>
      </template>
      <template v-slot:default>
        <div class="d-flex flex-wrap">
          <ClusterItem
            class="m-3 pb-4 border-bottom"
            v-for="item in clusters"
            :item="item"
            :key="item.id"
          />
        </div>
      </template>
    </List>
    <List
      v-if="$route.name === 'textReusePassages' && !isLoadingPassages"
      :items="passages"
      :pagination-list="passagesPaginationList"
      @change-page="
        page => {
          this.paginationCurrentPage = page
        }
      "
    >
      <template v-slot:header>
        <b-navbar-nav class="py-2 pl-3 ml-auto">
          <i-dropdown
            v-model="orderBy"
            :options="
              orderByOptions.map(value => ({
                value,
                text: $t(`sort_${value}`),
              }))
            "
            class="mr-auto"
            size="sm"
            variant="outline-primary"
          ></i-dropdown>
        </b-navbar-nav>
      </template>
      <template v-slot:default>
        <div class="d-flex flex-wrap">
          <TextReusePassageItem
            :item="item"
            class="m-3 pb-4 border-bottom"
            v-for="item in passages"
            :key="item.id"
            @click="handleTextReusePassageClick"
          />
        </div>
      </template>
    </List>
    <CreateCollection
      id="createCollectionFromFilters"
      :filters="supportedFilters"
      index="tr_passages"
      :title="$t('query_add_to_collection')"
      :description="summary"
      :name="newCollectionName"
      @create="handleCreateCollection"
      @collection:created="handleCollectionCreated"
    />
    <ConfirmModal
      id="confirmAddToCollectionFromFilters"
      :title="$t('confirmAddToCollectionFromFilters')"
      :okLabel="$t('saveToTheCollection')"
      @ok="saveArticlesInSelectedCollection"
      @close="
        () => {
          $bvModal.hide('confirmAddToCollectionFromFilters')
        }
      "
    >
      Selected collection:
      <div
        v-if="selectedCollection"
        class="shadow-sm border px-3 mt-2 p-2 rounded"
        style="background-color: rgba(0, 0, 0, 0.025)"
      >
        <ItemLabel :item="selectedCollection" type="collection" />
        <blockquote class="p-2 px-3 mt-2 text-small">
          {{ selectedCollection.description }}
        </blockquote>
      </div>
    </ConfirmModal>
  </i-layout-section>
</template>

<script>
import InfoButton from '@/components/base/InfoButton'
import List from '@/components/modules/lists/List'
import ClusterItem from '@/components/modules/lists/ClusterItem'
import SearchQuerySummary from '@/components/modules/SearchQuerySummary'
import TextReusePassageItem from '@/components/modules/lists/TextReusePassageItem'
import TextReuseStatistics from '@/components/modules/textReuse/TextReuseStatistics'
import TextReuseOverview from '@/components/modules/textReuse/TextReuseOverview'
import { mapPagination, mapOrderBy } from '@/logic/queryParams'
import { textReusePassages, search as searchService, collections } from '@/services'
import { CommonQueryParameters } from '@/router/util'
import { optimizeFilters, serializeFilters, SupportedFiltersByContext } from '@/logic/filters'
import FilterFactory from '@/models/FilterFactory'
import TextReuseCluster from '@/models/TextReuseCluster'
import CreateCollection from './modules/collections/CreateCollection'
import AddToCollection from './modules/collections/AddToCollection'
import ConfirmModal from './modules/collections/ConfirmModal.vue'
import ItemLabel from './modules/lists/ItemLabel.vue'

const supportedSearchIndexFilters = filter =>
  SupportedFiltersByContext.textReusePassages.includes(filter.type)

const OrderByOptions = [
  'date',
  '-date',
  'clusterSize',
  '-clusterSize',
  'timeDifferenceDay',
  '-timeDifferenceDay',
  'lexicalOverlap',
  '-lexicalOverlap',
  'size',
  '-size',
]

export default {
  components: {
    ClusterItem,
    TextReusePassageItem,
    InfoButton,
    List,
    TextReuseStatistics,
    TextReuseOverview,
    SearchQuerySummary,
    CreateCollection,
    AddToCollection,
    ConfirmModal,
    ItemLabel,
  },
  props: {
    /** @type {import('vue').PropOptions<Number>} */
    paginationPerPage: {
      type: Number,
      default: 20,
    },
    filtersWithItems: {
      type: Array,
      default: () => [],
    },
    filters: {
      type: Array,
      default: () => [],
    },
    withClusters: {
      type: Boolean,
      default: true,
    },
  },
  data: () => ({
    summary: '',
    clusters: [],
    totalClusters: -1,
    passages: [],
    totalPassages: -1,
    isLoading: false,
    isLoadingPassages: false,
    isLoadingClusters: false,
    orderByOptions: OrderByOptions,
    // this is sent to createcollection modal to prefill the input field
    newCollectionName: '',
    // this is the collection being selected to contains the articles
    selectedCollection: null,
  }),
  methods: {
    summaryUpdatedHandler(summary) {
      this.summary = summary
    },
    goToRoute(route) {
      return {
        ...route,
        query: {
          ...this.$route.query,
          ...route.query,
          // reset page n when switching route
          [CommonQueryParameters.PageNumber]: 1,
        },
      }
    },
    async loadClusters({ query }) {
      if (this.isLoadingClusters) {
        // eslint-disable-next-line
        console.debug('[TextReuseExplorer] loadClusters() \n busy.')
        return
      }
      this.isLoadingClusters = true
      // eslint-disable-next-line
      console.debug('[TextReuseExplorer] loadClusters() \n loading...')

      try {
        const [clusters, total] = await textReusePassages
          .find({ query: { ...query, groupby: 'textReuseClusterId' } })
          .then(result => [result.data, result.total])
        this.clusters = clusters.map(d => TextReuseCluster.fromTextReusePassage(d))
        this.totalClusters = total
        // eslint-disable-next-line
        console.debug('[TextReuseExplorer] loadClusters() \n - total: ', this.totalClusters)
      } finally {
        this.isLoadingClusters = false
      }
    },
    async loadPassages({ query }) {
      if (this.isLoadingPassages) {
        // eslint-disable-next-line
        console.debug('[TextReuseExplorer] loadPassages() \n busy.')
        return
      }
      this.isLoadingPassages = true
      this.passages = []
      // eslint-disable-next-line
      console.debug('[TextReuseExplorer] loadPassages() \n loading...', query)

      try {
        const [passages, total] = await textReusePassages
          .find({ query })
          .then(result => [result.data, result.total])
        this.passages = passages
        this.totalPassages = total
        // eslint-disable-next-line
        console.debug('[TextReuseExplorer] loadPassages() \n - total: ', this.totalPassages)
      } finally {
        this.isLoadingPassages = false
      }
    },
    /** @param {Filter[]} filters */
    handleFiltersChanged(filters) {
      // eslint-disable-next-line
      console.debug('[TextReuseExplorer] handleFiltersChanged', filters)
      this.$navigation.updateQueryParameters({
        [CommonQueryParameters.SearchFilters]: serializeFilters(optimizeFilters(filters)),
      })
    },
    handleTextReusePassageClick(passage) {
      // eslint-disable-next-line
      console.debug('[TextReuseExplorer] handleTextReusePassageClick', passage)
      // filter exists, update it
      const filterExists = this.filters.some(({ type }) => type === 'textReuseCluster')
      const trcFilter = FilterFactory.create({
        type: 'textReuseCluster',
        q: passage.textReuseCluster.id,
      })
      if (filterExists) {
        this.handleFiltersChanged(
          this.filters.map(filter => {
            if (filter.type === 'textReuseCluster') {
              return trcFilter
            }
            return filter
          }),
        )
        return
      } else {
        this.handleFiltersChanged([...this.filters, trcFilter])
      }
    },
    handleAddToCollectionClick(item) {
      // eslint-disable-next-line
      console.debug('[TextReuseExplorer] handleAddToCollectionClick', item)
      this.selectedCollection = item
      // open up confimation modal...?
      this.$bvModal.show('confirmAddToCollectionFromFilters')
    },
    // opens up create Collection modal
    handleAddToCollectionCreate({ name = '' }) {
      // eslint-disable-next-line
      console.debug('[TextReuseExplorer] handleAddToCollectionCreate name:', name)
      this.newCollectionName = name
      this.$bvModal.show('createCollectionFromFilters')
    },
    handleCollectionCreated(collection) {
      // eslint-disable-next-line
      console.debug('[TextReuseExplorer] handleCollectionCreated', collection)
      this.$bvModal.hide('createCollectionFromFilters')
      this.$bvToast.toast('Collection created', {
        title: 'Success',
        variant: 'success',
        solid: true,
      })
      this.selectedCollection = collection
      this.saveArticlesInSelectedCollection()
    },
    saveArticlesInSelectedCollection() {
      if (!this.selectedCollection) {
        console.warn(
          '[TextReuseExplorer] saveArticlesInSelectedCollection() \n no collection selected... nothing to do.',
        )
        return
      }
      searchService
        .create(
          {
            taskname: 'add_to_collection_from_tr_passages_query',
            group_by: 'articles',
            index: 'tr_passages',
            collection_uid: this.selectedCollection.uid,
            filters: optimizeFilters(this.supportedFilters),
          },
          { ignoreErrors: true },
        )
        .then(() => {
          console.debug('[TextReuseExplorer]  success')
        })
        .catch(err => {
          // eslint-disable-next-line
          console.error('[TextReuseExplorer] handleCreateCollection', err)
          if (err.code === 400) {
            // eslint-disable-next-line
            console.warn('[TextReuseExplorer] handleAddToCollectionClick', err.data)
            this.$bvToast.toast('You cannot add to this collection', {
              title: 'Error',
              variant: 'danger',
              solid: true,
            })
            return
          } else if ((err.code = 501)) {
            // too many jobs...
            this.$bvToast.toast(
              'Please wait, you already have a job running. Check its completion in the running tabs.',
              {
                title: 'Please wait...',
                variant: 'danger',
                solid: true,
              },
            )
          }
        })
      this.$bvModal.hide('confirmAddToCollectionFromFilters')
    },
    async handleCreateCollection(name, description) {
      const collection = await collections.create({ name, description })
      // eslint-disable-next-line
      console.debug(
        '[TextReuseExplorer] handleCreateCollection \n - name: ',
        name,
        '\n - description: ',
        description,
        collection,
      )

      this.$bvModal.hide('createCollectionFromFilters')
    },
  },
  computed: {
    isLoggedIn() {
      return this.$store.state.user.userData
    },
    paginationCurrentPage: mapPagination(),
    supportedFilters() {
      return this.filters.filter(supportedSearchIndexFilters)
    },
    supportedFiltersWithItems() {
      return this.filtersWithItems.filter(supportedSearchIndexFilters)
    },
    orderBy: mapOrderBy(OrderByOptions, '-date'),
    /** @returns {{ currentPage: number, totalRows: number, perPage: number }} */
    clustersPaginationList() {
      return {
        currentPage: this.paginationCurrentPage,
        totalRows: this.totalClusters,
        perPage: this.paginationPerPage,
      }
    },
    /** @returns {{ currentPage: number, totalRows: number, perPage: number }} */
    passagesPaginationList() {
      console.debug('[TextReuseExplorer] passagesPaginationList()', {
        currentPage: this.paginationCurrentPage,
        totalRows: this.totalPassages,
        perPage: this.paginationPerPage,
      })
      return {
        currentPage: this.paginationCurrentPage,
        totalRows: this.totalPassages,
        perPage: this.paginationPerPage,
      }
    },
    /** @returns {{ query: any, hash: string }} */
    searchApiQueryParameters() {
      const query = {
        skip: this.paginationPerPage * (this.paginationCurrentPage - 1),
        page: this.paginationCurrentPage,
        limit: this.paginationPerPage,
        orderBy: this.orderBy,
        filters: optimizeFilters(this.supportedFilters),
        addons: { newspaper: 'text' },
      }
      return {
        query,
        hash: JSON.stringify(query)
          .split('')
          .sort()
          .join(''),
      }
    },
    incipit() {
      if (!this.withClusters) {
        return this.$t('textReuseSummaryIncipitWithoutClusters', {
          passages: this.$tc('routeTextReusePassages', this.totalPassages, {
            n: this.$n(this.totalPassages),
          }),
        })
      }
      const passagesLabel = this.$tc('routeTextReusePassages', this.totalPassages, {
        n: this.$n(this.totalPassages),
      })
      const clustersLabel = this.$tc('routeTextReuseClusters', this.totalClusters, {
        n: this.$n(this.totalClusters),
      })
      return this.$t('textReuseSummaryIncipit', {
        passages: passagesLabel,
        clusters: clustersLabel,
      })
    },
  },
  watch: {
    searchApiQueryParameters: {
      async handler({ query, hash }, previousValue) {
        if (previousValue && previousValue.hash === hash) {
          return false
        }
        // eslint-disable-next-line
        console.debug('[TextReuseExplorer] @searchApiQueryParameters \n query:', query)

        await this.loadPassages({ query })
        await this.loadClusters({ query })
      },
      immediate: true,
    },
  },
}
</script>
<i18n>
  {
    "en": {
      "textReuse": "Text Reuse",
      "textReuseSummaryIncipit": "{passages} in {clusters}",
      "textReuseSummaryIncipitWithoutClusters": "{passages}",
      "routeTextReuseClusters": "no clusters | <span class='number'>1</span> cluster | <span class='number'>{n}</span> clusters",
      "routeTextReusePassages": "no passages | view <span class='number'>1</span> passage | view <span class='number'>{n}</span> passages",
      "routeTextReuseOverview": "overview",
      "routeTextReuseStatistics": "statistics",
      "query_add_to_collection": "Create new collection",
      "no_collections_found": "No collections found",
      "addTrQueryResultsToCollection": "Save articles to collection",
      "sort_-date": "Date (newest first)",
      "sort_date": "Date (oldest first)",
      "sort_-clusterSize": "Cluster size (largest first)",
      "sort_clusterSize": "Cluster size (smallest first)",
      "sort_-timeDifferenceDay": "Time difference (largest first)",
      "sort_timeDifferenceDay": "Time difference (smallest first)",
      "sort_-size": "Passage size, number of tokens (largest first)",
      "sort_size": "Passage size, number of tokens (smallest first)",
      "sort_-lexicalOverlap": "Lexical overlap (largest first)",
      "sort_lexicalOverlap": "Lexical overlap (smallest first)",
      "routes": {
        "textReuse": "Text Reuse",
        "textReuseStatistics": "Statistics",
        "textReuseOverview": "Overview of Text Reuse Distribution",
        "textReusePassages": "List of Text Reuse Passages",
        "textReuseClusters": "List of Text Reuse Clusters"
      },
      "confirmAddToCollectionFromFilters": "Add all filtered articles to a collection",
      "saveToTheCollection": "Save to my collection"
    }
  }
  </i18n>
<style lang="css">
.TextReuseExplorerPage_summary .number {
  font-weight: bold;
}
.TextReuseExplorerPage_summary {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.TextReuseExplorerPage_summary p {
  margin: 0;
  display: inline;
}
</style>
