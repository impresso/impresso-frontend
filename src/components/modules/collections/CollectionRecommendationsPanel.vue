<template>
  <div>
    <!-- header -->
    <div class="border-bottom pl-3 pr-3 pt-3 pb-2">
      <recommender-pill
        v-for="(settings, index) in recommendersSettings"
        :key="settings.type"
        :settings="settings"
        :recommendations="recommendations[index]"
        :loading-recommendations="isLoadingRecommendations"
        @changed="handleSettingsChanged"
        @search-parameters-changed="handleSearchparametersChanged"/>
    </div>

    <div v-if="!isLoadingRecommendations && !isLoadingArticles" class=" p-3">
      <b-row v-if="articlesLoaded && recommendedArticles.length > 0">
        <b-col v-for="article in recommendedArticles" :key="article.uid">
          <search-results-list-item :article="article" />
        </b-col>
      </b-row>

      <div class="fixed-pagination-footer p-1 m-0" slot="footer"  v-if="articlesLoaded && recommendedArticles.length > 0">
        <pagination
          v-if="recommendedArticles.length"
          v-model="paginationCurrentPage"
          :per-page="paginationPerPage"
          :total-rows="paginationTotalRows"
          class="float-left small-caps" />
      </div>

      <div v-if="articlesLoaded && recommendedArticles.length === 0">
        <span>{{ $t('label.notfound') }}</span>
      </div>
    </div>

    <spinner v-if="isLoadingRecommendations || isLoadingArticles" />

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
  recommenderResponseToRelevanceContext,
  RecommenderNameMap,
  RecommenderResponseTagMap
} from '@/logic/collectionRecommendations'

export default {
  components: {
    RecommenderPill,
    SearchResultsListItem,
    Pagination,
    Spinner
  },
  data: () => ({
    recommendersSettings: [
      { enabled: true, type: 'timeRange', parameters: {} },
      { enabled: true, type: 'entities', parameters: {} },
      { enabled: true, type: 'topics', parameters: {} },
      { enabled: false, type: 'textReuseClusters', parameters: {} },
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
    /**
     * Reload recommendations when recommendation request changes
     */
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
    /**
     * Reload articles when article request changes. It depends on recommendations
     * fetched in the method above.
     */
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
    /**
     * Recommendations for every recommender
     * @return {object | undefined}
     */
    recommendations() {
      return this.recommendersSettings
        .map(({ type }) => type)
        .map(type => {
          return this.response?.results?.find(({ name }) => name === RecommenderResponseTagMap[type])?.params
        })
    },
    /** @returns {any[]} */
    recommendedArticles() {
      return (this.articlesResponse?.data ?? []).map(v => new Article(v))
    },
    /** @returns {boolean} */
    articlesLoaded() {
      return this.articlesResponse != null
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
          name: RecommenderNameMap[type],
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
    handleSettingsChanged(settings) {
      const index = this.recommendersSettings.map(({ type }) => type).indexOf(settings.type)
      this.$set(this.recommendersSettings, index, settings)
      this.paginationCurrentPage = 1
    },
    handleSearchparametersChanged(settings) {
      const index = this.recommendersSettings.map(({ type }) => type).indexOf(settings.type)
      this.$set(this.recommendersSettings, index, settings)
      this.paginationCurrentPage = 1
    }
  }
}
</script>

<i18n>
{
  "en": {
    "label": {
      "notfound": "No articles found"
    }
  }
}
</i18n>