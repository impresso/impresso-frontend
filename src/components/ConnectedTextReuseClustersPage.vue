<template lang="html">
  <i-layout id="ConnectedTextReuseClustersPage">
    <i-layout-section width="400px" class="border-right">
      <div slot="header" class="border-bottom p-2 pb-4">
        <cluster-text-search-panel
          @submit="handleSearchInputSubmitted"
          :value="searchText"/>
      </div>
      <div :class="`pl-1 pr-2 mt-2 mb-2 d-flex flex-row ${isClusterSelected(item.cluster.id) ? 'active' : ''}`"
           v-for="item in clusterItems"
           :key="item.cluster.id"
           v-on:click="handleClusterSelected(item.cluster.id)">
        <span class="d-flex align-self-stretch flex-shrink-0 selection-indicator"/>
        <cluster-details-panel
          class="pl-2 pt-1 pr-3 pb-2 details-panel"
          :cluster="item.cluster"
          :textSample="item.textSample"/>
      </div>
    </i-layout-section>
    <i-layout-section class="pt-2">
        [connected clusters placeholder]
    </i-layout-section>
  </i-layout>
</template>

<script>
import ClusterTextSearchPanel from '@/components/modules/textReuse/ClustersSearchPanel'
import ClusterDetailsPanel from '@/components/modules/textReuse/ClusterDetailsPanel'
import { textReuseClusters } from '@/services';

export default {
  data: () => ({
    clusterItems: []
  }),
  components: {
    ClusterTextSearchPanel,
    ClusterDetailsPanel,
  },
  methods: {
    isClusterSelected(clusterId) {
      return clusterId === this.selectedClusterId;
    },
    handleClusterSelected(clusterId) {
      const { query } = this.$route
      this.$router.replace({ params: { id: clusterId }, query }).catch(() => {})
    },
    handleSearchInputSubmitted(searchText) {
      if (searchText !== '') this.$router.push({ query: { q: searchText } }).catch(() => {})
    }
  },
  computed: {
    selectedClusterId() {
      return this.$route.params.id
    },
    searchText() {
      return this.$route.query.q
    }
  },
  watch: {
    searchText: {
      async handler(text) {
        if (!text) {
          this.clusterItems = []
        } else {
          this.clusterItems = await textReuseClusters
            .find({ query: { text } })
            .then(result => {
              console.info('CI', result)
              return result.clusters
            })
        }
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