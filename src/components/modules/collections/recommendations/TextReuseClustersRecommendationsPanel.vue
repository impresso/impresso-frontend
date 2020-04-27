<template>
  <b-row v-if="hasRecommendations">
    <b-col>
      <!-- topics -->
      <div>
        <h3>Topics</h3>
        <ul>
          <li v-for="cluster in recommendedClusters" :key="cluster.id">
            {{ cluster.name }} ({{ cluster.score }})
          </li>
        </ul>
      </div>
    </b-col>
  </b-row>
</template>

<script>

const idToName = id => {
  const parts = id.split('-')
  return `#${parts[parts.length - 1]}`
}

export default {
  props: {
    recommendations: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    /** @returns {boolean} */
    hasRecommendations() {
      return Object.keys(this.recommendations).length > 0
    },
    /** @returns {{ name: string, score: number, id: string }[]} */
    recommendedClusters() {
      const clusterWeights = this.recommendations?.cluster_weights ?? []
      return clusterWeights.map(([id, score]) => ({ name: idToName(id), score, id }))
    }
  }
}
</script>
