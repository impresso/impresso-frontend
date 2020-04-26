<template>
  <b-row v-if="hasRecommendations">
    <b-col>
      From <b>{{ recommendations.min_year }}</b> to <b>{{ recommendations.max_year }}</b>
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
    }
  }
}
</script>
