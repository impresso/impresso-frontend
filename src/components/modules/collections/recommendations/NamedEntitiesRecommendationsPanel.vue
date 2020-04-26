<template>
  <b-row v-if="hasRecommendations">
    <b-col>
      <!-- persons -->
      <div>
        <h3>Persons</h3>
        <ul>
          <li v-for="person in recommendedPersons" :key="person.name">
            {{ person.name }} ({{ person.score }})
          </li>
        </ul>
      </div>

      <!-- locations -->
      <div>
        <h3>Locations</h3>
        <ul>
          <li v-for="location in recommendedLocations" :key="location.name">
            {{ location.name }} ({{ location.score }})
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
    recommendedPersons() {
      const persCounts = this.recommendations?.pers_counts ?? []
      return persCounts.map(([id, name, score]) => ({ name, score, id }))
    },
    /** @returns {{ name: string, score: number, id: string }[]} */
    recommendedLocations() {
      const persCounts = this.recommendations?.loc_counts ?? []
      return persCounts.map(([id, name, score]) => ({ name, score, id }))
    },
  }
}
</script>
