<template>
  <i-layout-section main>
    <template v-slot:header>
      <b-navbar type="light" variant="light">
        <section class="pt-2 pb-1">
          <span class="label small-caps">{{ $t('textReuse') }}</span>
          <small><info-button name="which-text-reuse" class="text-muted"/></small>
          <h3 class="mb-1">
            <span v-if="isLoading">
              ... (loading)
            </span>
            <span v-if="$route.name === 'textReuseOverview'">
              Overview of text reuse
            </span>
            <span v-if="$route.name === 'textReusePassages'">
              List of text reuse passages
            </span>
          </h3>
          <section class="text-serif TextReuseExplorerPage_summary">
            <span v-html="incipit" />
            <SearchQuerySummary
              v-on:updated="summaryUpdatedHandler"
              :search-query="{ filters: supportedFiltersWithItems }"
            />
          </section>
        </section>
      </b-navbar>
      <b-tabs pills class="mr-3">
        <template v-slot:tabs-end>
          <b-nav-item
            :to="goToRoute({ name: 'textReuseOverview' })"
            active-class="active"
            exact
            class="pl-2"
          >
            <span>{{ $t('routeTextReuseOverview') }}</span>
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

          <!-- <b-button class="p-2 small-caps" v-b-modal.createCollectionFromFilters>
            <span class="dripicons-archive pr-1"></span>
            {{ $t('query_add_to_collection') }}
          </b-button> -->
          <b-nav-text class="p-0 d-flex align-items-center ml-3">
            <AddToCollection
              @item:click="handleAddToCollectionClick"
              @create="handleCreateCollection"
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
          </b-nav-text>
        </template>
      </b-tabs>
    </template>
    <TextReuseOverview
      v-if="$route.name === 'textReuseOverview'"
      :filters="supportedFilters"
      :loading="isLoading"
    />
    <List
      v-if="$route.name === 'textReuseClusters'"
      :items="clusters"
      :pagination-list="clustersPaginationList"
      @change-page="
        page => {
          this.paginationCurrentPage = page
        }
      "
    >
      <template v-slot:header>
        <b-navbar-nav class="p-2 ml-auto">
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
          <ClusterItem v-for="item in clusters" :item="item" :key="item.id" />
        </div>
      </template>
    </List>
    <List
      v-if="$route.name === 'textReusePassages'"
      :items="passages"
      :pagination-list="passagesPaginationList"
      @change-page="
        page => {
          this.paginationCurrentPage = page
        }
      "
    >
      <template v-slot:header>
        <b-navbar-nav class="p-2 ml-auto">
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
      @create="handleCreateCollection"
    />
  </i-layout-section>
</template>

<script>
import InfoButton from '@/components/base/InfoButton'
import List from '@/components/modules/lists/List'
import ClusterItem from '@/components/modules/lists/ClusterItem'
import SearchQuerySummary from '@/components/modules/SearchQuerySummary'
import TextReusePassageItem from '@/components/modules/lists/TextReusePassageItem'
import TextReuseOverview from '@/components/modules/textReuse/TextReuseOverview'
import { mapPagination, mapOrderBy } from '@/logic/queryParams'
import { textReusePassages, search as searchService } from '@/services'
import { CommonQueryParameters } from '@/router/util'
import { optimizeFilters, serializeFilters, SupportedFiltersByContext } from '@/logic/filters'
import FilterFactory from '@/models/FilterFactory'
import TextReuseCluster from '@/models/TextReuseCluster'
import CreateCollection from './modules/collections/CreateCollection'
import AddToCollection from './modules/collections/AddToCollection'

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
    TextReuseOverview,
    SearchQuerySummary,
    CreateCollection,
    AddToCollection,
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
      this.totalPassages = 0
      // eslint-disable-next-line
      console.debug('[TextReuseExplorer] loadPassages() \n loading...')

      try {
        const [passages, total] = await textReusePassages
          .find({ query })
          .then(result => [result.data, result.total])
        this.passages = passages
        this.totalPassages = total
        // eslint-disable-next-line
        console.debug(
          '[TextReuseExplorer] loadPassages() \n - total: ',
          this.totalPassages,
          passages,
        )
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
      searchService
        .create(
          {
            taskname: 'add_to_collection_from_tr_passages_query',
            group_by: 'articles',
            index: 'tr_passages',
            collection_uid: item.uid,
            filters: optimizeFilters(this.supportedFilters),
          },
          { ignoreErrors: true },
        )
        .then(() => {
          console.debug('[TextReuseExplorer]  success', item)
        })
        .catch(err => {
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
          // eslint-disable-next-line
          console.error('[TextReuseExplorer] handleAddToCollectionClick', err)
        })
    },
    handleCreateCollection(name, description) {
      // eslint-disable-next-line
      console.debug(
        '[TextReuseExplorer] handleCreateCollection \n - name: ',
        name,
        '\n - description: ',
        description,
      )
      searchService
        .create(
          {
            taskname: 'create_collection_from',
            group_by: 'articles',
            index: 'tr_passages',
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
        })
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
      "textReuse": "text reuse",
      "textReuseSummaryIncipit": "{passages} in {clusters}",
      "textReuseSummaryIncipitWithoutClusters": "{passages}",
      "routeTextReuseClusters": "no clusters | <span class='number'>1</span> cluster | <span class='number'>{n}</span> clusters",
      "routeTextReusePassages": "no passages | <span class='number'>1</span> passage | <span class='number'>{n}</span> passages",
      "routeTextReuseOverview": "overview",
      "query_add_to_collection": "Create new collection",
      "no_collections_found": "No collections found",
      "addTrQueryResultsToCollection": "Add results to collection"
    }
  }
  </i18n>
<style lang="css">
.TextReuseExplorerPage_summary .number {
  font-weight: bold;
}
.TextReuseExplorerPage_summary p {
  margin: 0;
  display: inline;
}
</style>
