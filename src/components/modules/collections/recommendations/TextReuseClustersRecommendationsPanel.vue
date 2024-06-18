<template>
  <b-row v-if="hasRecommendations">
    <b-col>
      <!-- clusters -->
      <div>
        <h3 class="m-0 tb-title small-caps font-weight-bold pb-2">{{ $t('label.clusters') }}</h3>
        <div v-for="cluster in recommendedClusters" :key="cluster.id">
          <item-label type="textReuseCluster" :item="cluster.item"/>
          <item-selector
            :uid="cluster.id"
            :item="cluster.item"
            :default-click-action-disabled="true"
            type="textReuseCluster"
            @click="handleItemClicked" />
        </div>
      </div>
    </b-col>
  </b-row>
</template>

<script>
import ItemLabel from '@/components/modules/lists/ItemLabel.vue'
import ItemSelector from '@/components/modules/ItemSelector.vue'
import { mapStores } from 'pinia'
import { useMonitorStore } from '@/stores/monitor'

const idToName = id => {
  const parts = id.split('-')
  return `#${parts[parts.length - 1]}`
}

export default {
  components: {
    ItemLabel,
    ItemSelector
  },
  props: {
    recommendations: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    ...mapStores(useMonitorStore),
    /** @returns {boolean} */
    hasRecommendations() {
      return Object.keys(this.recommendations).length > 0
    },
    /** @returns {{ name: string, score: number, id: string, item: any }[]} */
    recommendedClusters() {
      const clusterWeights = this.recommendations?.cluster_weights ?? []
      return clusterWeights.map(([id, score]) => ({
        name: idToName(id),
        score,
        id,
        item: {
          name: `${idToName(id)} (${this.$n(score, { maximumFractionDigits: '2' })})`
        }
      }))
    }
  },
  methods: {
    /**
     * Overriding default item click handler to show monitor
     * without filters editing buttons.
     * @param {any} params
     */
    handleItemClicked({ params }) {
      this.monitorStore.activate({
        ...params,
        filters: [],
        disableFilterModification: true
      })
    }
  }
}
</script>

<i18n lang="json">
{
  "en": {
    "label": {
      "clusters": "Text Reuse Clusters"
    }
  }
}
</i18n>
