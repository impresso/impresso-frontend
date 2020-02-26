<template lang="html">
  <i-layout id="ConnectedTextReuseClustersPage">
    <list :pagination-list="paginationList" width="350px" v-on:change-page="handlePaginationPageChanged">
      <template v-slot:header>
        <b-tabs pills class="mx-2 pt-2">
          <template v-slot:tabs-end>
            <b-nav-item class="pl-2 active"
              active-class='none'>
              <span v-html="$tc('searchClustersLabel', paginationList.totalRows, {
                n: $n(paginationList.totalRows),
              })"/>
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
    <i-layout-section class="pt-2" main>
      <div v-if="selectedCluster !== undefined">
        <!-- main header -->
        <b-navbar>
          <section>
            <span class="label small-caps">
              <span>&larr; {{$t("clustersLabel")}}</span>
            </span>
            <h3>{{$t('clusterLabel')}} #{{selectedCluster.id}}</h3>
          </section>
        </b-navbar>
        <!-- main page -->
        <router-view />
      </div>

      <div v-if="selectedCluster === undefined" style="height: 100%">
        <div class="d-flex flex-row justify-content-center" style="height: 100%">
          <div class="d-flex flex-column justify-content-center">
            <span>[no cluster selected placeholder]</span>
          </div>
        </div>
      </div>
    </i-layout-section>
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
    selectedCluster: undefined
  }),
  props: {
    paginationPerPage: Number,
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
        [QueryParameters.SearchText]: searchText
      })
    },
    handlePaginationPageChanged(page) {
      this.$navigation.updateQueryParameters({
        [QueryParameters.PageNumber]: page - 1
      })
    },
    handleOrderByChanged(orderByValue) {
      this.$navigation.updateQueryParameters({
        [QueryParameters.OrderBy]: orderByValue
      })
    },
    handleFiltersEnabledChanged(filtersAreEnabled) {
      this.$navigation.updateQueryParameters({
        [QueryParameters.SearchFiltersEnabled]: filtersAreEnabled ? 1 : undefined
      })
    },
    isLastItem
  },
  computed: {
    paginationList() {
      const { [QueryParameters.PageNumber]: page = 0 } = this.$route.query
      return {
        currentPage: parseInt(page, 10) + 1,
        totalRows: this.searchInfo.total,
        perPage: this.paginationPerPage || 20,
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
    searchFiltersEnabled() {
      return Boolean(this.$route.query[QueryParameters.SearchFiltersEnabled])
    },
    searchApiQueryParameters() {
      const pageNumber = this.paginationCurrentPage - 1;
      const orderBy = this.orderByValue;
      const filters = this.searchFiltersEnabled
        ? serializeFilters(this.searchFilters)
        : undefined;
      return {
        text: this.searchText,
        skip: this.paginationPerPage * pageNumber,
        limit: this.paginationPerPage,
        orderBy,
        filters
      }
    }
  },
  watch: {
    searchApiQueryParameters: {
      async handler(query) {
        [this.clusterItems, this.searchInfo] = await textReuseClusters
          .find({ query })
          .then(result => {
            return [result.clusters, result.info]
          })
      },
      immediate: true
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
    "searchClustersLabel": "browse clusters | browse clusters (1) | browse clusters ({n})",
    "clustersLabel": "Text Reuse Clusters",
    "clusterLabel": "Text Reuse Cluster"
  }
}
</i18n>
