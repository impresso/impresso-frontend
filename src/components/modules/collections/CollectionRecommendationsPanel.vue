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

    <b-row>
      <b-col v-for="article in recommendedArticles" :key="article.uid">
        <search-results-list-item :article="article" />
      </b-col>
    </b-row>

    <!-- <div>
      <pre :style="{ 'font-size': '0.6em' }">
        {{ JSON.stringify(response, null, 2) }}
      </pre>
    </div> -->
  </div>
</template>

<script>
import RecommenderPill from './RecommenderPill'
import SearchResultsListItem from '@/components/modules/SearchResultsListItem'
import { articlesRecommendations, articlesSearch } from '@/services'
import Article from '@/models/Article'
import {
  recommenderResponseToFilters,
  recommenderResponseToRelevanceContext
} from '@/logic/collectionRecommendations'

const RecommenderNames = Object.freeze({
  TimeRange: 'TimeRangeRecommender',
  NamedEntitiesBag: 'NamedEntitiesRecommender',
  TopicsBag: 'TopicsRecommender',
  TextReuseClusterBag: 'TextReuseRecommender'
})

export default {
  components: {
    RecommenderPill,
    SearchResultsListItem
  },
  data: () => ({
    recommendersSettings: [
      { enabled: true, type: 'TimeRange', parameters: {} },
      { enabled: true, type: 'NamedEntitiesBag', parameters: {} },
      { enabled: true, type: 'TopicsBag', parameters: {} },
      // { enabled: true, type: 'TextReuseClusterBag', parameters: {} },
    ],
    /** @type {any | undefined} */
    response: undefined,
    /** @type {any | undefined} */
    articlesResponse: undefined
  }),
  props: {
    collectionId: {
      type: String,
      required: true
    }
  },
  watch: {
    collectionId: {
      async handler() {
        await this.reloadRecommendations()
        await this.reloadRecommendedArticles()
      },
      immediate: true
    }
  },
  computed: {
    /** @return {object | undefined} */
    recommendations() {
      return this.recommendersSettings
        .map(({ type }) => type)
        .map(type => {
          return this.response?.results?.find(({ name }) => name === type)?.params
        })
    },
    /** @returns {any[]} */
    recommendedArticles() {
      return (this.articlesResponse?.data ?? []).map(v => new Article(v))
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
    async reloadRecommendedArticles() {
      const collectionExlusionFilter = {
        type: 'collection',
        q: this.collectionId,
        context: 'exclude'
      }
      const request = {
        filters: recommenderResponseToFilters(this.response).concat(collectionExlusionFilter),
        relevanceContext: recommenderResponseToRelevanceContext(this.response, this.recommendersSettings)
      }
      this.articlesResponse = await articlesSearch.create(request)
    },
    async handleSettingsChanged(settings) {
      const index = this.recommendersSettings.map(({ type }) => type).indexOf(settings.type)
      this.$set(this.recommendersSettings, index, settings)
      console.info('Settings updated', settings, index)
      await this.reloadRecommendations()
      await this.reloadRecommendedArticles()
    },
    async handleSearchparametersChanged(settings) {
      const index = this.recommendersSettings.map(({ type }) => type).indexOf(settings.type)
      this.$set(this.recommendersSettings, index, settings)
      console.info('Search parameters settings changed', settings)
      this.reloadRecommendedArticles()
    }
  }
}
</script>