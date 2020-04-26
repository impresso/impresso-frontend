<template>
  <b-row v-if="hasRecommendations">
    <b-col>
      <!-- topics -->
      <div>
        <h3>Topics</h3>
        <ul>
          <li v-for="topic in recommendedTopics" :key="topic.name">
            {{ topic.name }} ({{ topic.score }})
          </li>
        </ul>
      </div>
    </b-col>
  </b-row>
</template>

<script>
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
    recommendedTopics() {
      const topicWeights = this.recommendations?.topic_weights ?? []
      return topicWeights.map(([id, name, score]) => ({ name, score, id }))
    }
  }
}
</script>
