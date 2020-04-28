<template>
  <div>
    <!-- header -->
    <div class="border-bottom pb-2">
      <recommender-pill
        v-for="(settings, index) in recommendersSettings"
        :key="settings.type"
        :settings="settings"
        :recommendations="recommendations[index]"
        :loading-recommendations="isLoadingRecommendations"
        @changed="handleSettingsChanged"
        @search-parameters-changed="handleSearchparametersChanged"/>
    </div>

    <div v-if="!isLoadingRecommendations && !isLoadingArticles">
      <b-row>
        <b-col v-for="article in recommendedArticles" :key="article.uid">
          <search-results-list-item :article="article" />
        </b-col>
      </b-row>

      <div class="fixed-pagination-footer p-1 m-0" slot="footer">
        <pagination
          v-if="recommendedArticles.length"
          v-model="paginationCurrentPage"
          :per-page="paginationPerPage"
          :total-rows="paginationTotalRows"
          class="float-left small-caps" />
      </div>
    </div>

    <spinner v-if="isLoadingRecommendations || isLoadingArticles" />

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
import Pagination from '@/components/modules/Pagination'
import Spinner from '@/components/layout/Spinner'

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
    SearchResultsListItem,
    Pagination,
    Spinner
  },
  data: () => ({
    recommendersSettings: [
      { enabled: true, type: 'TimeRange', parameters: {} },
      { enabled: true, type: 'NamedEntitiesBag', parameters: {} },
      { enabled: true, type: 'TopicsBag', parameters: {} },
      { enabled: false, type: 'TextReuseClusterBag', parameters: {} },
    ],
    /** @type {any | undefined} */
    response: undefined,
    /** @type {any | undefined} */
    articlesResponse: undefined,
    paginationCurrentPage: 1,
    paginationPerPage: 20,
    isLoadingRecommendations: false,
    isLoadingArticles: false
  }),
  props: {
    collectionId: {
      type: String,
      required: true
    }
  },
  watch: {
    recommendationRequest: {
      async handler(request, oldRequest) {
        if (JSON.stringify(request) === JSON.stringify(oldRequest)) return
        try {
          this.isLoadingRecommendations = true
          this.response = await articlesRecommendations.create(request)
        } finally {
          this.isLoadingRecommendations = false
        }
      },
      immediate: true,
      deep: true
    },
    recommendedArticlesRequest: {
      async handler(request, oldRequest) {
        if (request == null) return
        if (JSON.stringify(request) === JSON.stringify(oldRequest)) return
        try {
          this.isLoadingArticles = true
          this.articlesResponse = await articlesSearch.create(request)
        } finally {
          this.isLoadingArticles = false
        }
      },
      immediate: true,
      deep: true
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
    },
    /** @returns {number} */
    paginationTotalRows() {
      return this.articlesResponse?.total ?? 0;
    },
    /** @returns {any} */
    recommendationRequest() {
      const recommenders = this.recommendersSettings
        .filter(({ enabled }) => enabled)
        .map(({ type, parameters }) => ({
          name: RecommenderNames[type],
          params: Object.keys(parameters).length > 0 ? parameters : {}
        }))
      return { coll_id: this.collectionId, recommenders }
    },
    /** @returns {any} */
    recommendedArticlesRequest() {
      if (this.response == null) return
      const collectionExlusionFilter = {
        type: 'collection',
        q: this.collectionId,
        context: 'exclude'
      }
      const request = {
        filters: recommenderResponseToFilters(this.response, this.recommendersSettings).concat(collectionExlusionFilter),
        relevanceContext: recommenderResponseToRelevanceContext(this.response, this.recommendersSettings),
        pagination: {
          skip: (this.paginationCurrentPage - 1) * this.paginationPerPage,
          limit: this.paginationPerPage
        }
      }

      return request
    }
  },
  methods: {
    async handleSettingsChanged(settings) {
      const index = this.recommendersSettings.map(({ type }) => type).indexOf(settings.type)
      this.$set(this.recommendersSettings, index, settings)
      this.paginationCurrentPage = 1
      console.info('Settings updated', settings, index)
    },
    async handleSearchparametersChanged(settings) {
      const index = this.recommendersSettings.map(({ type }) => type).indexOf(settings.type)
      this.$set(this.recommendersSettings, index, settings)
      this.paginationCurrentPage = 1
      console.info('Search parameters settings changed', settings)
    }
  }
}
</script>