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
          @filtersEnabledChanged="handleFiltersEnabledChanged"
          :orderBy="orderByValue"
          :value="searchText"
          :filters="searchFilters"
          :filters-enabled="searchFiltersEnabled"/>
      </template>

      <template v-slot:default>
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
import { textReuseClusters } from '@/services';

const isLastItem = (index, total) => total - 1 === index

const serializeFilters = filters => protobuf.searchQuery.serialize({ filters })
const deserializeFilters = serializedFilters => protobuf.searchQuery.deserialize(serializedFilters).filters

const SupportedFilterTypes = ['daterange', 'newspaper']
const supportedFiltersFilter = filter => SupportedFilterTypes.includes(filter.type)

const QueryParameters = Object.freeze({
  ClusterId: 'clusterId',
  SearchText: 'q',
  PageNumber: 'page',
  OrderBy: 'orderBy',
  SearchFiltersEnabled: 'filtersOn',
  SearchFilters: 'filters'
})

export default {
  data: () => ({
    clusterItems: [],
    searchInfo: {
      limit: 20,
      offset: 0,
      total: 0
    },
    paginationList: {
      currentPage: 1,
      totalRows: 0,
      perPage: 20,
    },
    isLoading: false,
    selectedCluster: undefined,
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
          [QueryParameters.SearchFiltersEnabled]: 1
        })
      }
    }
    this.loadClusters({
      query: this.searchApiQueryParameters,
    })
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
      if (searchText === '') return
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
    handleFiltersEnabledChanged(filtersAreEnabled) {
      this.$navigation.updateQueryParameters({
        [QueryParameters.SearchFiltersEnabled]: filtersAreEnabled ? 1 : undefined
      })
    },
    isLastItem,
    async loadClusters({ query }) {
      this.isLoading = true;
      [this.clusterItems, this.searchInfo] = await textReuseClusters
        .find({ query })
        .then(result => [result.clusters, result.info]);
      console.info('loadClusters() success: ', this.searchInfo);
      // updte pagination list.
      this.paginationList = {
        currentPage: query.page,
        totalRows: this.searchInfo.total,
        perPage: this.paginationPerPage,
      };
      this.isLoading = false;
    },
  },
  computed: {
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
    searchFiltersEnabled() {
      return Boolean(this.$route.query[QueryParameters.SearchFiltersEnabled])
    },
    paginationCurrentPage() {
      const { [QueryParameters.PageNumber]: page = 1 } = this.$route.query
      return parseInt(page, 10);
    },
    searchApiQueryParameters() {
      const filters = this.searchFiltersEnabled
        ? serializeFilters(this.searchFilters)
        : undefined;

      return {
        text: this.searchText,
        page: this.paginationCurrentPage,
        skip: this.paginationPerPage * (this.paginationCurrentPage - 1),
        limit: this.paginationPerPage,
        orderBy: this.orderByValue,
        filters,
      };
    },
  },
  watch: {
    searchApiQueryParameters(query) {
      this.loadClusters({ query });
    },
    selectedClusterId: {
      async handler() {
        if (this.selectedClusterId == null) return
        const filteredClusters = this.clusterItems
          .filter(({ cluster }) => cluster.id === this.selectedClusterId)
        if (filteredClusters.length > 0) this.selectedCluster = filteredClusters[0]

        this.selectedCluster = await textReuseClusters.get(this.selectedClusterId)
          .then(({ cluster }) => cluster)
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
