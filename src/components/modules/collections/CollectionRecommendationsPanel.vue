<template>
  <div class="collection-recommendation-panel d-flex h-100 flex-column">
    <b-navbar type="light" variant="light" class="flex-shrink-1 p-2 border-bottom">
    <!-- header -->
      <recommender-pill
        v-for="(settings, index) in recommendersSettings"
        :key="settings.type"
        :settings="settings"
        :recommendations="recommendations[index]"
        :loading-recommendations="isLoadingRecommendations"
        @changed="handleSettingsChanged"
        @search-parameters-changed="handleSearchparametersChanged"/>
      <slot name="additional-navbar" />
    </b-navbar>

    <div style="overflow: auto">
      <div v-if="!isLoadingRecommendations && !isLoadingArticles" class=" p-3">
        <div v-if="articlesLoaded && recommendedArticles.length > 0">
          <div>
            <b-row v-if="displayStyle === DisplayStyle.List">
              <b-col cols="12" v-for="(article, idx) in recommendedArticles" :key="article.uid">
                <search-results-list-item v-model="recommendedArticles[idx]">
                  <template v-slot:secondary-action>
                    <b-button
                      variant="outline-primary" size="sm"
                      @click="addToCollection(article)">
                      {{ $t('label.addToCollection') }}
                    </b-button>
                  </template>
                </search-results-list-item>
              </b-col>
            </b-row>
            <b-row v-if="displayStyle === DisplayStyle.Tiles">
              <b-col cols="6" sm="12" md="4" lg="3" v-for="(article, idx) in recommendedArticles" :key="article.uid">
                <search-results-tiles-item
                  v-if="article.type === ArticleType"
                  @click="goToArticle(article)"
                  v-model="recommendedArticles[idx]" />
                <search-results-image-item
                  v-if="article.type !== ArticleType"
                  @click="goToArticle(article)"
                  v-bind:searchResult="article"
                  :article="article" />
              </b-col>
            </b-row>
          </div>
        </div><!-- v-if="articlesLoaded && recommendedArticles.length > 0" -->

        <div v-else-if="articlesLoaded && recommendedArticles.length === 0">
          <span>{{ $t('label.notfound') }}</span>
        </div>

        <div class="fixed-pagination-footer p-1 m-0"  v-if="articlesLoaded && recommendedArticles.length > 0">
          <pagination
            v-if="recommendedArticles.length"
            :current-page="paginationCurrentPage"
            @change="$event => paginationCurrentPage = $event"
            :per-page="paginationPerPage"
            :total-rows="paginationTotalRows"
            class="float-left small-caps" />
        </div>
      </div>
      <spinner v-if="isLoadingRecommendations || isLoadingArticles" />
    </div>
  </div>
</template>

<script>
import RecommenderPill from './RecommenderPill.vue'
import SearchResultsListItem from '@/components/modules/SearchResultsListItem.vue'
import SearchResultsTilesItem from '@/components/modules/SearchResultsTilesItem.vue'
import SearchResultsImageItem from '@/components/modules/SearchResultsImageItem.vue'

import Pagination from '@/components/modules/Pagination.vue'
import Spinner from '@/components/layout/Spinner.vue'

import {
  articlesRecommendations,
  articlesSearch,
  collectionsItems as collectionsItemsService
} from '@/services'
import Article from '@/models/Article'
import {
  recommenderResponseToFilters,
  recommenderResponseToRelevanceContext,
  RecommenderNameMap,
  RecommenderResponseTagMap,
  parametersToApiRequestParameters
} from '@/logic/collectionRecommendations'

const ArticleType =  'ar'
const DisplayStyle = Object.freeze({
  Tiles: 'tiles',
  List: 'list'
})

export default {
  components: {
    RecommenderPill,
    SearchResultsListItem,
    SearchResultsTilesItem,
    SearchResultsImageItem,
    Pagination,
    Spinner
  },
  data: () => ({
    /** @type {any | undefined} */
    response: undefined,
    /** @type {any | undefined} */
    articlesResponse: undefined,
    paginationCurrentPage: 1,
    paginationPerPage: 20,
    isLoadingRecommendations: false,
    isLoadingArticles: false,
    ArticleType,
    DisplayStyle,
    /**
     * A list of articles added to collection manually.
     * This list is used to render temporary state of the collection list
     * and is reset every time articles list is reloaded.
     * @type {Article[]}
     */
    articlesAddedToCollection: []
  }),
  props: {
    collectionId: {
      type: String,
      required: true
    },
    displayStyle: {
      type: String,
      default: DisplayStyle.List
    },
    collection: {
      /* Optional collection object. */
      type: Object,
      default: () => ({})
    },
    /** @type {import('vue').PropOptions<import('impresso-jscommons').CollectionRecommendersSettings>} */
    collectionRecommendersSettings: {
      type: Object,
      default: () => ({ recommenders: [] }),
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
          // reset all articles that have been added to collection before reload.
          this.articlesAddedToCollection = []
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
     * @typedef {{ enabled: boolean, type: string, weight?: number, parameters: {} }} RecommenderSettings
     */
    recommendersSettings: {
      /** @returns {RecommenderSettings[]} */
      get() {
        return ['timeRange', 'entities', 'topics', 'textReuseClusters'].map(t => {
          const recommender = (this.collectionRecommendersSettings.recommenders ?? []).find(({ type }) => type === t)
          if (recommender == null) return { enabled: t !== 'textReuseClusters', type: t, parameters: {} }

          return {
            enabled: recommender.enabled,
            type: recommender.type,
            weight: recommender.weight,
            parameters: (recommender.parameters ?? []).reduce((acc, param) => {
              return { ...acc, [param.key]: param.value };
            }, {})
          }
        });
      },
      /** @param {RecommenderSettings[]} val */
      set(val) {
        const recommenders = val
          .map(({ type, weight, parameters, enabled }) => {
            const o = { type, enabled }
            if (weight != null && weight !== 1.0) o.weight = weight
            o.parameters = Object.entries(parameters)
              .map(([key, value]) => ({ key, value }))
              .filter(({ value }) => value != null)
            return o
          });
        this.$emit('settings-updated', { recommenders })
      }
    },
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
      return (this.articlesResponse?.data ?? []).map(article => {
        // If this article has been added to current collection manually, add current collection
        // to the list of collections of this article.
        const extraCollections = this.articlesAddedToCollection.map(({ uid }) => uid).includes(article.uid)
          ? [this.collection]
          : []

        const articleData = {
          ...article,
          collections: article.collections.concat(extraCollections)
        }
        return new Article(articleData)
      })
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
          params: Object.keys(parameters).length > 0 ? parametersToApiRequestParameters(parameters) : {}
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
          offset: (this.paginationCurrentPage - 1) * this.paginationPerPage,
          limit: this.paginationPerPage
        }
      }

      return request
    }
  },
  methods: {
    handleSettingsChanged(settings) {
      const index = this.recommendersSettings.map(({ type }) => type).indexOf(settings.type)
      const rs = this.recommendersSettings
      rs[index] = settings
      this.recommendersSettings = rs
      // this.recommendersSettings[index] =settings
      this.paginationCurrentPage = 1
    },
    handleSearchparametersChanged(settings) {
      const index = this.recommendersSettings.map(({ type }) => type).indexOf(settings.type)
      const rs = this.recommendersSettings
      rs[index] = settings
      this.recommendersSettings = rs
      // this.recommendersSettings[index] = settings
      this.paginationCurrentPage = 1
    },
    goToArticle(article) {
      this.$router.push({
        name: 'article',
        params: {
          issue_uid: article.issue.uid,
          page_number: article.pages[0]?.num,
          page_uid: article.pages[0]?.uid,
          article_uid: article.uid,
        },
      });
    },
    async addToCollection(article) {
      try {
        await collectionsItemsService.create({
          collection_uid: this.collectionId,
          items: [{
            content_type: 'article',
            uid: article.uid,
          }],
        })
      } catch (e) {
        // Ignore "Conflict" (409) error which means the item
        // has already been added to collection but has not been synchronised yet.
        if (e.className !== 'conflict') throw e
      }

      this.articlesAddedToCollection.push(article)
    }
  }
}
</script>

<i18n lang="json">
{
  "en": {
    "label": {
      "notfound": "No articles found",
      "addToCollection": "Add to collection"
    }
  }
}
</i18n>
