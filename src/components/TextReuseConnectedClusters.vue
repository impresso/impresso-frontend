<template>
  <i-layout-section main>
    <!-- slot:header -->
    <div slot="header">
      <cluster-page-header :cluster="cluster" :resolution="resolution" />
    </div>


    <b-container fluid class="p-4">
      <div class="d-flex flex-wrap">
        <cluster-details-panel
          class="p-3"
          :style="{ 'max-width': '33%' }"
          v-for="clusterContainer in connectedClusters"
          :key="clusterContainer.cluster.id"
          :cluster="clusterContainer.cluster"
          :textSample="clusterContainer.textSample"
        />
      </div>
    </b-container>
  </i-layout-section>
</template>

<script>
import ClusterPageHeader from '@/components/modules/textReuse/ClusterPageHeader'
import ClusterDetailsPanel from '@/components/modules/textReuse/ClusterDetailsPanel'
import { textReuseConnectedClusters as textReuseConnectedClustersService } from '@/services'

/**
 * @typedef {import('@/models').TextReuseCluster} TextReuseCluster
 * @typedef {{ cluster: TextReuseCluster, textSample: string }} TextReuseClusterContainer
 */

export default {
  data: () => ({
    resolution: 'year',
    connectedClusters: /** @type {TextReuseClusterContainer[]} */ ([])
  }),
  props: {
    /** @type {import('vue').PropOptions<TextReuseCluster>} */
    cluster: { type: Object }
  },
  components: {
    ClusterPageHeader,
    ClusterDetailsPanel,
  },
  computed: {
    /** @returns {string} */
    clusterId() {
      return this.cluster?.id
    }
  },
  watch: {
    clusterId: {
      async handler() {
        if (this.clusterId == null) return
        this.connectedClusters = await textReuseConnectedClustersService.find({ query: { clusterId: this.clusterId } })
      },
      immediate: true
    }
  }
}
</script>