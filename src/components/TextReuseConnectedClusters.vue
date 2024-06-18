<template>
  <i-layout-section main>
    <!-- slot:header -->
    <template v-slot:header>
      <cluster-page-header :cluster="cluster" :resolution="resolution" />
    </template>


    <b-container fluid class="p-4">
      <div class="d-flex flex-wrap">
        <div
          class="connected-cluster-container"
          :style="{ 'max-width': '33%' }"
          v-for="clusterContainer in connectedClusters"
          :key="clusterContainer.cluster.id"
          v-on:click="() => handleClusterSelected(clusterContainer.cluster.id)">
          <cluster-details-panel
            class="p-3"
            :cluster="clusterContainer.cluster"
            :textSample="clusterContainer.textSample"
          />
        </div>
      </div>
    </b-container>
    <template v-slot:footer >
    <div class="fixed-pagination-footer p-1 m-0" v-if="totalClusters > 0">
      <pagination
        size="sm"
        v-bind:perPage="perPage"
        :current-page="pageNumber"
        @change="$event => pageNumber = $event"
        v-bind:totalRows="totalClusters"
        class="float-left small-caps" />
    </div>
    </template>
  </i-layout-section>
</template>

<script>
import ClusterPageHeader from '@/components/modules/textReuse/ClusterPageHeader.vue'
import ClusterDetailsPanel from '@/components/modules/textReuse/ClusterDetailsPanel.vue'
import Pagination from '@/components/modules/Pagination.vue'
import { textReuseConnectedClusters as textReuseConnectedClustersService } from '@/services'
import { getQueryParameter } from '@/router/util'
import { Navigation } from '@/plugins/Navigation'

const QueryParameters = Object.freeze({
  ClusterId: 'clusterId',
  PageNumber: 'connectedClustersPage',
  SearchText: 'q',
})

const ClustersPerPage = 9

/**
 * @typedef {import('@/models').TextReuseCluster} TextReuseCluster
 * @typedef {{ cluster: TextReuseCluster, textSample: string }} TextReuseClusterContainer
 */

export default {
  data: () => ({
    resolution: 'year',
    connectedClusters: /** @type {TextReuseClusterContainer[]} */ ([]),
    totalClusters: 0,
    perPage: ClustersPerPage
  }),
  props: {
    /** @type {import('vue').PropOptions<TextReuseCluster>} */
    cluster: { type: Object }
  },
  components: {
    ClusterPageHeader,
    ClusterDetailsPanel,
    Pagination
  },
  methods: {
    handleClusterSelected(id) {
      this.$navigation.updateQueryParameters({
        [QueryParameters.ClusterId]: id,
        [QueryParameters.SearchText]: `#${id}`
      })
    },
  },
  computed: {
    $navigation() {
      return new Navigation(this)
    },
    /** @returns {string} */
    clusterId() {
      return this.cluster?.id
    },
    pageNumber: {
      /** @returns {number} */
      get() {
        return parseInt(getQueryParameter(this, QueryParameters.PageNumber) ?? '1', 10)
      },
      /** @param {number} n */
      set(n) {
        this.$navigation.updateQueryParameters({
          [QueryParameters.PageNumber]: n
        })
      }
    },
    /** @returns {{ clusterId: string, offset: number, limit: number } | undefined} */
    clustersQuery() {
      if (this.clusterId == null) return undefined
      return {
        clusterId: this.clusterId,
        offset: (this.pageNumber - 1) * this.perPage,
        limit: this.perPage
      }
    }
  },
  watch: {
    clustersQuery: {
      async handler() {
        if (this.clustersQuery == null) return
        const { total, clusters } = await textReuseConnectedClustersService.find({ query: this.clustersQuery })
        this.connectedClusters = clusters
        this.totalClusters = total
      },
      immediate: true,
      deep: true
    },
    clusterId(currentId, previousId) {
      if (previousId != null) {
        this.pageNumber = 1
      }
    }
  }
}
</script>

<style lang="scss">
  .connected-cluster-container {
    cursor: pointer;
  }
</style>
