<template>
  <div>
    <!-- header -->
    <div class="border-bottom pb-2">
      <recommender-pill
        v-for="(settings, index) in recommendersSettings"
        :key="settings.type"
        :settings="settings"
        :recommendations="recommendations[index]"
        @changed="handleSettingsChanged"
        @search-parameters-changed="handleSearchparametersChanged"/>
    </div>

    <div>
      <pre :style="{ 'font-size': '0.6em' }">
        {{ JSON.stringify(response, null, 2) }}
      </pre>
    </div>
  </div>
</template>

<script>
import RecommenderPill from './RecommenderPill'
import { articlesRecommendations } from '@/services'

const RecommenderNames = Object.freeze({
  TimeRange: 'TimeRangeRecommender',
  NamedEntitiesBag: 'NamedEntitiesRecommender',
  TopicsBag: 'TopicsRecommender',
  TextReuseClusterBag: 'TextReuseRecommender'
})

export default {
  components: {
    RecommenderPill
  },
  data: () => ({
    recommendersSettings: [
      { enabled: true, type: 'TimeRange', parameters: {} },
      { enabled: true, type: 'NamedEntitiesBag', parameters: {} },
      { enabled: true, type: 'TopicsBag', parameters: {} }
    ],
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
      async handler() { await this.reloadRecommendations() },
      immediate: true
    }
  },
  computed: {
    /** @return {object | undefined} */
    recommendations() {
      return ['TimeRange', 'NamedEntitiesBag', 'TopicsBag'].map(type => {
        return this.response?.results?.find(({ name }) => name === type)?.params
      })
    }
  },
  methods: {
    async reloadRecommendations() {
      const recommenders = this.recommendersSettings
        .filter(({ enabled }) => enabled)
        .map(({ type, parameters }) => ({
          name: RecommenderNames[type],
          params: Object.keys(parameters).length > 0 ? parameters : {}
        }))
      this.response = await articlesRecommendations.create({ coll_id: this.collectionId, recommenders })
    },
    handleSettingsChanged(settings) {
      const index = this.recommendersSettings.map(({ type }) => type).indexOf(settings.type)
      this.$set(this.recommendersSettings, index, settings)
      console.info('Settings updated', settings, index)
      this.reloadRecommendations()
    },
    handleSearchparametersChanged(settings) {
      const index = this.recommendersSettings.map(({ type }) => type).indexOf(settings.type)
      this.$set(this.recommendersSettings, index, settings)
      console.info('Search parameters settings changed', settings)
    }
  }
}
</script>