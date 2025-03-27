<template>
  <i-layout id="SearchClustersPage">
    <list
      :pagination-list="paginationList"
      width="350px"
      v-on:change-page="handlePaginationPageChanged"
    >
      <template v-slot:header>
        <b-tabs pills class="mx-2 pt-2">
          <template v-slot:tabs-end>
            <b-nav-item class="pl-2 active" active-class="none">
              <span
                v-html="
                  $tc('searchClustersLabel', paginationList.totalRows, {
                    n: $n(paginationList.totalRows)
                  })
                "
              />
              <span v-if="isLoading" class=""> &mdash; {{ $t('actions.loading') }}</span>
            </b-nav-item>
          </template>
        </b-tabs>
        <cluster-text-search-panel
          class="pb-2 px-3"
          @submit="handleSearchInputSubmitted"
          @orderByChanged="handleOrderByChanged"
          :orderBy="orderByValue"
          :value="searchText"
          :filters="enrichedFilters"
          :supported-filter-types="supportedFilterTypes"
          @filtersChanged="handleFiltersChanged"
        />
      </template>

      <template v-slot:default>
        <div>
          <div
            class="d-flex flex-row"
            :class="{
              loading: isLoading,
              active: isClusterSelected(item.cluster.id),
              'pb-4': isLastItem(index, clusterItems.length)
            }"
            v-for="(item, index) in clusterItems"
            :key="item.cluster.id"
            v-on:click="handleClusterSelected(item.cluster.id)"
          >
            <span class="d-flex align-self-stretch flex-shrink-0 selection-indicator" />
            <cluster-details-panel
              class="p-3 details-panel border-bottom"
              :class="{ selected: isClusterSelected(item.cluster.id) }"
              :cluster="item.cluster"
              :textSample="item.textSample"
            />
          </div>
        </div>
      </template>
    </list>
    <!-- main page -->
    <router-view :cluster="selectedCluster" />
  </i-layout>
</template>

<script>
import { protobuf } from 'impresso-jscommons'
import ClusterTextSearchPanel from '@/components/modules/textReuse/ClustersSearchPanel.vue'
import ClusterDetailsPanel from '@/components/modules/textReuse/ClusterDetailsPanel.vue'

import List from '@/components/modules/lists/List.vue'
import { textReuseClusters, filtersItems } from '@/services'
import { toCanonicalFilter, toSerializedFilters, SupportedFiltersByContext } from '@/logic/filters'
import { CommonQueryParameters } from '@/router/util'
import { mapFilters } from '@/logic/queryParams'
import { Navigation } from '@/plugins/Navigation'

/**
 * @typedef {import('@/models').TextReuseCluster} TextReuseCluster
 * @typedef {import('@/models').Filter} Filter
 * @typedef {{ cluster: TextReuseCluster, textSample: string }} TextReuseClusterItem
 */

const isLastItem = (index, total) => total - 1 === index

const serializeFilters = filters =>
  protobuf.searchQuery.serialize({ filters: filters.map(toCanonicalFilter) })

const SupportedFilterTypes = SupportedFiltersByContext.textReuse
const supportedFiltersFilter = filter => SupportedFilterTypes.includes(filter.type)

const QueryParameters = Object.freeze({
  ClusterId: 'clusterId',
  SearchText: 'q',
  PageNumber: 'page',
  OrderBy: 'orderBy',
  SearchFilters: CommonQueryParameters.SearchFilters
})

const ClusterIdSearchPattern = /^#([\w\d-_@]+)$/

export default {
  data: () => ({
    /** @type {TextReuseClusterItem[]} */
    clusterItems: [],
    searchInfo: {
      limit: 20,
      offset: 0,
      total: 0
    },
    /** @type {boolean} */
    isLoading: false,
    // cluster selected in the search panel
    /** @type {TextReuseClusterItem | undefined} */
    selectedCluster: undefined,
    // filters enriched with items once they are fetched
    /** @type {Filter[] | undefined} */
    filtersWithItems: undefined
  }),
  props: {
    /** @type {import('vue').PropOptions<Number>} */
    paginationPerPage: {
      type: Number,
      default: 20
    }
  },
  components: {
    ClusterTextSearchPanel,
    ClusterDetailsPanel,
    List
  },
  mounted() {
    // If cluster Id is provided but search query is not, we cannot guarantee
    // that this cluster will be highlighted in the clusters search sidebar.
    // Therefore we set the formatted cluster Id as a query which will trigger
    // search for this cluster only (see searchApiQueryParameters)
    if (
      this.$route.query[QueryParameters.ClusterId] != null &&
      this.$route.query[QueryParameters.SearchText] == null
    ) {
      this.$navigation.updateQueryParameters({
        [QueryParameters.SearchText]: `#${this.$route.query[QueryParameters.ClusterId]}`
      })
    }
  },
  methods: {
    /**
     * @param {string} clusterId
     * @returns {boolean}
     */
    isClusterSelected(clusterId) {
      return clusterId === this.selectedClusterId
    },
    /**
     * @param {string} clusterId
     */
    handleClusterSelected(clusterId) {
      this.$navigation.updateQueryParameters({
        [QueryParameters.ClusterId]: clusterId
      })
    },
    /**
     * @param {string} searchText
     */
    handleSearchInputSubmitted(searchText) {
      this.$navigation.updateQueryParametersWithHistory({
        [QueryParameters.SearchText]: searchText,
        [QueryParameters.PageNumber]: 1
      })
    },
    /**
     * @param {string|number} page
     */
    handlePaginationPageChanged(page) {
      this.$navigation.updateQueryParameters({
        [QueryParameters.PageNumber]: page
      })
    },
    /**
     * @param {string} orderByValue
     */
    handleOrderByChanged(orderByValue) {
      this.$navigation.updateQueryParameters({
        [QueryParameters.OrderBy]: orderByValue,
        [QueryParameters.PageNumber]: 1
      })
    },
    /**
     * @param {Filter[]} filters
     */
    handleFiltersChanged(filters) {
      this.filters = filters
    },
    isLastItem,
    /**
     * Load clusters that match the query constraints.
     * @param {{ query: any }} param
     */
    async loadClusters({ query }) {
      this.isLoading = true
      try {
        ;[this.clusterItems, this.searchInfo] = await textReuseClusters
          .find({ query })
          .then(result => {
            return [result.clusters, result.info]
          })
        if (this.selectedClusterId == null && this.clusterItems.length > 0) {
          this.selectedClusterId = this.clusterItems[0].cluster.id
        }
      } finally {
        this.isLoading = false
      }
    },
    /**
     * Load single cluster item by cluster ID and treat it as a list of
     * cluster item with 0 or 1 element.
     * @param {string} id
     */
    async loadSingleCluster(id) {
      this.isLoading = true
      try {
        const cluster = await textReuseClusters.get(id)
        this.clusterItems = [cluster]
        if (this.selectedClusterId == null) {
          this.selectedClusterId = cluster.cluster.id
        }

        this.searchInfo = { limit: this.paginationPerPage, offset: 0, total: 1 }
      } catch (error) {
        if (error.name !== 'NotFound') throw error

        this.clusterItems = []
        this.searchInfo = { limit: this.paginationPerPage, offset: 0, total: 0 }
      } finally {
        this.isLoading = false
      }
    }
  },
  computed: {
    $navigation() {
      return new Navigation(this)
    },
    /** @returns {string[]} */
    supportedFilterTypes() {
      return SupportedFilterTypes
    },
    /** @returns {{ currentPage: number, totalRows: number, perPage: number }} */
    paginationList() {
      return {
        currentPage: this.paginationCurrentPage,
        totalRows: this.searchInfo.total,
        perPage: this.paginationPerPage
      }
    },
    selectedClusterId: {
      /** @returns {string | undefined} */
      get() {
        return /** @type {string|undefined} */ (this.$route.query[QueryParameters.ClusterId])
      },
      /** @param {string} clusterId */
      set(clusterId) {
        this.$navigation.updateQueryParameters({
          [QueryParameters.ClusterId]: clusterId
        })
      }
    },
    /** @returns {string} */
    searchText() {
      return /** @type {string} */ (this.$route.query[QueryParameters.SearchText])
    },
    /** @returns {string} */
    orderByValue() {
      return /** @type {string} */ (this.$route.query[QueryParameters.OrderBy])
    },
    /**
     * Global filters
     *
     */
    filters: mapFilters(),
    /**
     * Filters excluding not supported filters.
     * @returns {Filter[]}
     */
    searchFilters() {
      return this.filters.filter(supportedFiltersFilter)
    },
    /**
     * @returns {Filter[]}
     */
    enrichedFilters() {
      return this.filtersWithItems != null ? this.filtersWithItems : this.searchFilters
    },
    /** @returns {number} */
    paginationCurrentPage() {
      const { [QueryParameters.PageNumber]: page = 1 } = this.$route.query
      return parseInt(/** @type {string} */ (page), 10)
    },
    /** @returns {any} */
    searchApiQueryParameters() {
      // If search text is a specially formatted Cluster Id, then
      // skip full search and instead retrieve only this cluster.
      const matches = this?.searchText?.trim()?.match(ClusterIdSearchPattern)
      if (matches != null) {
        const clusterId = matches[1]
        return {
          method: 'singleCluster',
          clusterId
        }
      }

      const filters = serializeFilters(this.searchFilters)

      return {
        method: 'searchClusters',
        query: {
          text: this.searchText,
          page: this.paginationCurrentPage,
          offset: this.paginationPerPage * (this.paginationCurrentPage - 1),
          limit: this.paginationPerPage,
          orderBy: this.orderByValue,
          filters
        }
      }
    }
  },
  watch: {
    searchApiQueryParameters: {
      /**
       * @param {{ method: string, clusterId: string, query: any }} param
       */
      async handler({ method, clusterId, query }) {
        if (method === 'singleCluster') await this.loadSingleCluster(clusterId)
        else await this.loadClusters({ query })
      },
      immediate: true
    },
    selectedClusterId: {
      /** @param {string} selectedClusterId */
      async handler(selectedClusterId) {
        if (selectedClusterId == null) return
        const filteredClusters = this.clusterItems.filter(
          ({ cluster }) => cluster.id === selectedClusterId
        )
        if (filteredClusters.length > 0) this.selectedCluster = filteredClusters[0]

        this.selectedCluster = await textReuseClusters
          .get(selectedClusterId)
          .then(({ cluster }) => cluster)
          .catch(error => {
            if (error.name !== 'NotFound') throw error
            return undefined
          })
      },
      immediate: true
    },
    searchFilters: {
      /** @param {Filter[]} filters */
      async handler(filters) {
        this.filtersWithItems = undefined
        const serializedFilters = toSerializedFilters(filters || [])
        const { filtersWithItems } = await filtersItems.find({
          query: { filters: serializedFilters }
        })
        this.filtersWithItems = filtersWithItems.map(({ filter, items }) => ({ ...filter, items }))
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/legacy/bootstrap-impresso-theme-variables.scss';

.active {
  .selection-indicator {
    background-color: $clr-accent-secondary;
  }
  .details-panel {
    background-color: $clr-bg-secondary;
  }
}

.selection-indicator {
  width: 0.25em;
}

.details-panel {
  cursor: pointer;
}
</style>

<i18n lang="json">
{
  "en": {
    "searchClustersLabel": "browse clusters | browse clusters (1) | browse {n} clusters",
    "clustersLabel": "Text Reuse Clusters",
    "clusterLabel": "Text Reuse Cluster"
  }
}
</i18n>
