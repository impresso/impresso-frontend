<template lang="html">
  <i-layout id="ConnectedTextReuseClustersPage">
    <i-layout-section width="400px" class="border-right">
      <div slot="header" class="border-bottom p-2 pb-4">
	<cluster-text-search-panel
	  @submit="handleSearchInputSubmitted"
	  @orderByChanged="handleOrderByChanged"
	  :orderBy="orderByValue"
	  :value="searchText"/>
      </div>
      <div :class="`pl-1 pr-2 mt-2 mb-2 d-flex flex-row \
		  ${isClusterSelected(item.cluster.id) ? 'active' : ''} \
		  ${isLastItem(index, clusterItems.length) ? 'pb-4' : ''}`"
	    v-for="(item, index) in clusterItems"
	    :key="item.cluster.id"
	    v-on:click="handleClusterSelected(item.cluster.id)">
	<span class="d-flex align-self-stretch flex-shrink-0 selection-indicator"/>
	<cluster-details-panel
	  class="pl-2 pt-1 pr-3 pb-2 details-panel"
	  :cluster="item.cluster"
	  :textSample="item.textSample"/>
      </div>
      <div class="fixed-pagination-footer p-1 m-0">
	<pagination
	  :perPage="paginationPerPage"
	  :currentPage="paginationCurrentPage"
	  :totalRows="paginationTotalRows"
	  v-on:change="handlePaginationPageChanged"
	  class="float-left small-caps" />
      </div>
    </i-layout-section>
    <i-layout-section class="pt-2">
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
import ClusterTextSearchPanel from '@/components/modules/textReuse/ClustersSearchPanel'
import ClusterDetailsPanel from '@/components/modules/textReuse/ClusterDetailsPanel'
import Pagination from './modules/Pagination';
import { textReuseClusters } from '@/services';

const isLastItem = (index, total) => total - 1 === index

const QueryParameters = Object.freeze({
  ClusterId: 'clusterId',
  SearchText: 'q',
  PageNumber: 'page',
  OrderBy: 'orderBy'
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
    paginationPerPage: {
      type: Number,
      default: 20
    }
  },
  components: {
    ClusterTextSearchPanel,
    ClusterDetailsPanel,
    Pagination,
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
    async executeSearch() {
      const pageNumber = this.paginationCurrentPage - 1;
      const orderBy = this.orderByValue;

      [this.clusterItems, this.searchInfo] = await textReuseClusters
	.find({ query: {
	  text: this.searchText,
	  skip: this.paginationPerPage * pageNumber,
	  limit: this.paginationPerPage,
	  orderBy
	}})
	.then(result => {
	  return [result.clusters, result.info]
	})
    },
    isLastItem
  },
  computed: {
    selectedClusterId() {
      return this.$route.query[QueryParameters.ClusterId]
    },
    searchText() {
      return this.$route.query[QueryParameters.SearchText]
    },
    paginationCurrentPage() {
      const { [QueryParameters.PageNumber]: page = 0 } = this.$route.query
      return parseInt(page, 10) + 1
    },
    paginationTotalRows() {
      const { total } = this.searchInfo
      return total
    },
    orderByValue() {
      return this.$route.query[QueryParameters.OrderBy]
    }
  },
  watch: {
    searchText: {
      async handler() {
	return this.executeSearch()
      },
      immediate: true
    },
    paginationCurrentPage: {
      async handler() {
	return this.executeSearch()
      }
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
    },
    orderByValue: {
      async handler() { return this.executeSearch() }
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
    "clustersLabel": "Text Reuse Clusters",
    "clusterLabel": "Text Reuse Cluster"
  }
}
</i18n>