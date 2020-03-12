<template lang="html">
  <i-layout id="SearchClustersPage">
    <list :pagination-list="paginationList" width="350px" v-on:change-page="handlePaginationPageChanged">
      <template v-slot:header>
        <b-tabs pills class="mx-2 pt-2">
          <template v-slot:tabs-end>
            <b-nav-item class="pl-2 active"
              active-class='none'>
              <span v-html="$tc('searchClustersLabel', paginationList.totalRows, {
                n: $n(paginationList.totalRows),
              })"/>
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
          @filtersChanged="handleFiltersChanged"/>
      </template>

      <template v-slot:default>
        <div>
          <div class="d-flex flex-row" :class="{
              loading: isLoading,
              active: isClusterSelected(item.cluster.id),
              'pb-4': isLastItem(index, clusterItems.length),
            }"
            v-for="(item, index) in clusterItems"
            :key="item.cluster.id"
            v-on:click="handleClusterSelected(item.cluster.id)">
              <span class="d-flex align-self-stretch flex-shrink-0 selection-indicator"/>
              <cluster-details-panel
                class="p-3 details-panel border-bottom"
                :class="{ selected: isClusterSelected(item.cluster.id) }"
                :cluster="item.cluster"
                :textSample="item.textSample"/>
          </div>
        </div>
      </template>
    </list>
    <!-- main page -->
    <router-view :cluster="selectedCluster"/>
  </i-layout>
</template>

<script>
import { protobuf } from 'impresso-jscommons';
import ClusterTextSearchPanel from '@/components/modules/textReuse/ClustersSearchPanel'
import ClusterDetailsPanel from '@/components/modules/textReuse/ClusterDetailsPanel'

import List from './modules/lists/List';
import { textReuseClusters, filtersItems } from '@/services';
import { toCanonicalFilter, toSerializedFilters } from '../logic/filters';

const isLastItem = (index, total) => total - 1 === index

const serializeFilters = filters => protobuf.searchQuery.serialize({ filters: filters.map(toCanonicalFilter) })
const deserializeFilters = serializedFilters => protobuf.searchQuery.deserialize(serializedFilters).filters

const SupportedFilterTypes = [
  'daterange',
  'newspaper',
  'textReuseClusterSize',
  'textReuseClusterLexicalOverlap',
  'textReuseClusterDayDelta'
]
const supportedFiltersFilter = filter => SupportedFilterTypes.includes(filter.type)

const QueryParameters = Object.freeze({
  ClusterId: 'clusterId',
  SearchText: 'q',
  PageNumber: 'page',
  OrderBy: 'orderBy',
  SearchFilters: 'filters'
})

const ClusterIdSearchPattern = /^#([\w\d-_@]+)$/

export default {
  data: () => ({
    clusterItems: [],
    searchInfo: {
      limit: 20,
      offset: 0,
      total: 0
    },
    isLoading: false,
    // cluster selected in the search panel
    selectedCluster: undefined,
    // filters enriched with items once they are fetched
    filtersWithItems: undefined
  }),
  props: {
    paginationPerPage: {
      type: Number,
      default: 20,
    },
  },
  components: {
    ClusterTextSearchPanel,
    ClusterDetailsPanel,
    List,
  },
  mounted() {
    // On page load see if there are any filters present in the query parameters
    // If not, set them from the current search filters from the store
    if (this.$route.query[QueryParameters.SearchFilters] == null) {
      const searchQuery = this.$store.getters['search/getSearch'];
      const filters = searchQuery
        ? searchQuery.filters
          .map(filter => filter.getQuery())
          .filter(supportedFiltersFilter)
        : [];
      if (filters.length > 0) {
        this.$navigation.updateQueryParameters({
          [QueryParameters.SearchFilters]: serializeFilters(filters),
        })
      }
    }

    // If cluster Id is provided but search query is not, we cannot guarantee
    // that this cluster will be highlighted in the clusters search sidebar.
    // Therefore we set the formatted cluster Id as a query which will trigger
    // search for this cluster only (see searchApiQueryParameters)
    if (this.$route.query[QueryParameters.ClusterId] != null && this.$route.query[QueryParameters.SearchText] == null) {
      this.$navigation.updateQueryParameters({
        [QueryParameters.SearchText]: `#${this.$route.query[QueryParameters.ClusterId]}`
      })
    }
  },
  methods: {
    isClusterSelected(clusterId) {
      return clusterId === this.selectedClusterId;
    },
    handleClusterSelected(clusterId) {
      this.$navigation.updateQueryParameters({
        [QueryParameters.ClusterId]: clusterId
      })
    },
    handleSearchInputSubmitted(searchText) {
      this.$navigation.updateQueryParametersWithHistory({
        [QueryParameters.SearchText]: searchText,
        [QueryParameters.PageNumber]: 1,
      })
    },
    handlePaginationPageChanged(page) {
      this.$navigation.updateQueryParameters({
        [QueryParameters.PageNumber]: page,
      })
    },
    handleOrderByChanged(orderByValue) {
      this.$navigation.updateQueryParameters({
        [QueryParameters.OrderBy]: orderByValue,
        [QueryParameters.PageNumber]: 1,
      })
    },
    handleFiltersChanged(filters) {
      this.$navigation.updateQueryParameters({
        [QueryParameters.SearchFilters]: serializeFilters(filters)
      })
    },
    isLastItem,
    /**
     * Load clusters that match the query constraints.
     */
    async loadClusters({ query }) {
      this.isLoading = true;
      try {
        [this.clusterItems, this.searchInfo] = await textReuseClusters
          .find({ query })
          .then(result => [result.clusters, result.info])
      } finally {
        this.isLoading = false
      }
    },
    /**
     * Load single cluster item by cluster ID and treat it as a list of
     * cluster item with 0 or 1 element.
     */
    async loadSingleCluster(id) {
      this.isLoading = true;
      try {
        const cluster = await textReuseClusters.get(id)
        this.clusterItems = [cluster]
        this.searchInfo = { limit: this.paginationPerPage, offset: 0, total: 1 }
      } catch (error) {
        if (error.name !== 'NotFound') throw error

        this.clusterItems = []
        this.searchInfo = { limit: this.paginationPerPage, offset: 0, total: 0 }
      } finally {
        this.isLoading = false;
      }
    }
  },
  computed: {
    supportedFilterTypes() { return SupportedFilterTypes },
    paginationList() {
      return {
        currentPage: this.paginationCurrentPage,
        totalRows: this.searchInfo.total,
        perPage: this.paginationPerPage,
      };
    },
    selectedClusterId() {
      return this.$route.query[QueryParameters.ClusterId]
    },
    searchText() {
      return this.$route.query[QueryParameters.SearchText]
    },
    orderByValue() {
      return this.$route.query[QueryParameters.OrderBy]
    },
    searchFilters() {
      const serializedFilters = this.$route.query[QueryParameters.SearchFilters]
      return serializedFilters
        ? deserializeFilters(serializedFilters)
        : []
    },
    enrichedFilters() {
      return this.filtersWithItems != null
        ? this.filtersWithItems
        : this.searchFilters
    },
    paginationCurrentPage() {
      const { [QueryParameters.PageNumber]: page = 1 } = this.$route.query
      return parseInt(page, 10);
    },
    searchApiQueryParameters() {
      // If search text is a specially formatted Cluster Id, then
      // skip full search and instead retrieve only this cluster.
      if (this.searchText && this.searchText.trim().match(ClusterIdSearchPattern)) {
        const clusterId = this.searchText.trim().match(ClusterIdSearchPattern)[1]
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
          skip: this.paginationPerPage * (this.paginationCurrentPage - 1),
          limit: this.paginationPerPage,
          orderBy: this.orderByValue,
          filters,
        }
      };
    }
  },
  watch: {
    searchApiQueryParameters: {
      handler({ method, clusterId, query }) {
        if (method === 'singleCluster') return this.loadSingleCluster(clusterId)
        return this.loadClusters({ query });
      },
      immediate: true,
    },
    selectedClusterId: {
      async handler(selectedClusterId) {
        if (selectedClusterId == null) return
        const filteredClusters = this.clusterItems
          .filter(({ cluster }) => cluster.id === selectedClusterId)
        if (filteredClusters.length > 0) this.selectedCluster = filteredClusters[0]

        this.selectedCluster = await textReuseClusters.get(selectedClusterId)
          .then(({ cluster }) => cluster)
          .catch(error => {
            if (error.name !== 'NotFound') throw error
            return undefined
          })
      },
      immediate: true
    },
    searchFilters: {
      async handler(filters) {
        this.filtersWithItems = undefined
        const serializedFilters = toSerializedFilters(filters || [])
        const { filtersWithItems } = await filtersItems.find({ query: { filters: serializedFilters }})
        this.filtersWithItems = filtersWithItems.map(({ filter, items }) => ({ ...filter, items }))
      },
      immediate: true
    }
  }
};
</script>

<style lang="scss" scoped>
  @import "impresso-theme/src/scss/variables.sass";

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

<i18n>
{
  "en": {
    "searchClustersLabel": "browse clusters | browse clusters (1) | browse {n} clusters",
    "clustersLabel": "Text Reuse Clusters",
    "clusterLabel": "Text Reuse Cluster"
  }
}
</i18n>
