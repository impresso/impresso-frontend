<template>
  <div>

    <!-- year range -->
    <div>
      <h3>Time range</h3>
      <div v-if="recommendedTimeRange">
        From <em>{{ recommendedTimeRange.from }}</em> to <em>{{ recommendedTimeRange.to }}</em>
      </div>
    </div>

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

    <!-- topics -->
    <div>
      <h3>Topics</h3>
      <ul>
        <li v-for="topic in recommendedTopics" :key="topic.name">
          {{ topic.name }} ({{ topic.score }})
        </li>
      </ul>
    </div>

    <div>
      <pre :style="{ 'font-size': '0.6em' }">
        {{ JSON.stringify(response, null, 2) }}
      </pre>
    </div>
  </div>
</template>

<script>
import { articlesRecommendations } from '@/services'

export default {
  data: () => ({
    /** @type {any | undefined} */
    response: undefined
  }),
  props: {
    collectionId: {
      type: String,
      required: true
    }
  },
  watch: {
    collectionId: {
      async handler(collectionId) {
        this.response = await articlesRecommendations.create({ coll_id: collectionId })
      },
      immediate: true
    }
  },
  computed: {
    /** @returns {{ from: number, to: number} | undefined} */
    recommendedTimeRange() {
      const { min_year, max_year } = this.response?.results
        ?.find(({ name }) => name === 'TimeRange')
        ?.params ?? {}

      return !isNaN(min_year) && !isNaN(max_year)
        ? { from: min_year, to: max_year }
        : undefined
    },
    /** @returns {{ name: string, score: number, id: string }[]} */
    recommendedPersons() {
      const persCounts = this.response?.results
        ?.find(({ name }) => name === 'NamedEntitiesBag')
        ?.params?.pers_counts ?? []
      return persCounts.map(([id, name, score]) => ({ name, score, id }))
    },
    /** @returns {{ name: string, score: number, id: string }[]} */
    recommendedLocations() {
      const persCounts = this.response?.results
        ?.find(({ name }) => name === 'NamedEntitiesBag')
        ?.params?.loc_counts ?? []
      return persCounts.map(([id, name, score]) => ({ name, score, id }))
    },
    /** @returns {{ name: string, score: number, id: string }[]} */
    recommendedTopics() {
      const topicWeights = this.response?.results
        ?.find(({ name }) => name === 'TopicsBag')
        ?.params?.topic_weights ?? []
      return topicWeights.map(([id, name, score]) => ({ name, score, id }))
    }
  }
}
</script>