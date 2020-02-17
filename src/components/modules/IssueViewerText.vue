<template lang="html">
  <div id="IssueViewerText" class="px-3 bg-light">
        <i-spinner v-if="!article" class="text-center p-5" />
        <div v-if="article">
          <article-item :item="article" show-entities show-excerpt show-topics/>
          <div class="my-2" />
          <collection-add-to :item="article" :text="$t('add_to_collection')" />
          <b-badge
            v-for="(collection, i) in article.collections"
            v-bind:key="`co_${i}`"
            variant="info"
            class="mt-1 mr-1">
            <router-link
              class="text-white"
              v-bind:to="{name: 'collection', params: {collection_uid: collection.uid}}">
              {{ collection.name }}
            </router-link>
            <a class="dripicons dripicons-cross" v-on:click="onRemoveCollection(collection, article)" />
          </b-badge>
          <div class="alert alert-light" role="alert" v-if="!article.isCC">
            <p>{{ $t('wrongLayout') }} <icon name="image"/></p>
          </div>
          <div v-if="hasValidRegions === false">
            <p>{{article.excerpt}}</p>
          </div>
          <b-container fluid
            v-else
            class="region-row mt-3 mb-3">
            <b-row class="mt-1" v-for="(region, i) in article.regions" v-bind:key="i"
              v-b-tooltip.top.hover :title="regionTitle">
              <div v-if="article.isCC" class="col col-sm-5 bg-white border">
                <div class="py-3">
                  <img v-bind:src="region.iiifFragment" style="width: 100%" />
                </div>
              </div>
              <div
                class="col"
                :class="{ 'col-sm-7': article.isCC, 'col-sm-12': !article.isCC }">
                <div class='region py-3'>
                  <annotated-text
                    :children="regionsAnnotationTree[i].children"
                    :cluster-colours="clusterColourMap"
                    :selected-cluster-id="selectedClusterId"
                    @onClusterSelected="clusterSelectedHandler"/>
                  </div>
              </div>
            </b-row>
          </b-container>
        </div>
        <hr class="py-4">
        <b-container fluid class="similar-items px-0">
          <h3>Similar Articles</h3>
          <i-spinner v-if="!articlesSuggestions.length" class="text-center p-5" />
          <b-row>
            <b-col
              cols="12"
              sm="12"
              md="12"
              lg="6"
              xl="4"
              v-for="(searchResult, index) in articlesSuggestions"
              v-bind:key="`${index}_ra`">
              <search-results-similar-item
                :searchResult="searchResult"
                :topics="commonTopics(searchResult.topics)" />
            </b-col>
          </b-row>
        </b-container>
  </div>
</template>

<script>
import { schemeSet3 as colourScheme } from 'd3'
import Icon from 'vue-awesome/components/Icon';
import { articlesSuggestions, articleTextReusePassages } from '@/services';
import CollectionAddTo from './CollectionAddTo';
import SearchResultsSimilarItem from './SearchResultsSimilarItem';
import ArticleItem from './lists/ArticleItem';
import AnnotatedText from './AnnotatedText'

import {
  getNamedEntitiesFromArticleResponse,
  getAnnotateTextTree,
  passageToPassageEntity,
} from '@/logic/articleAnnotations';

export default {
  data() {
    return {
      article: null,
      articlesSuggestions: [],
      textReusePassages: [],
      selectedPassageId: undefined,
      hoverPassageLineTopOffset: undefined,
      viewerTopOffset: 0
    };
  },
  updated() {
    const { height } = document.querySelector('#TheHeader').getBoundingClientRect();
    this.viewerTopOffset = height;

    [...document.querySelectorAll('.tr-passage')].map(element => {
      element.removeEventListener('mouseenter', this.mouseenterPassageHandler)
      element.addEventListener('mouseenter', this.mouseenterPassageHandler)
      element.removeEventListener('mouseleave', this.mouseleavePassageHandler)
      element.addEventListener('mouseleave', this.mouseleavePassageHandler)
    })
  },
  computed: {
    articlePages() {
      if (!this.article.pages || !this.article.pages.length) {
        return this.$t('no_page_info');
      }
      if (this.article.pages.length === 1) {
        return this.$t('page', { num: this.article.pages[0].num });
      }
      return this.$t('pages', { nums: this.article.pages.map(d => d.num).join(', ') });
    },
    topics() {
      return this.article.topics.filter(rel => rel.topic);
    },
    hasValidRegions() {
      return !!this.article.regions.filter(({ isEmpty }) => !isEmpty).length;
    },
    clusterColourMap() {
      const clusterIds = [...new Set(this.textReusePassages.map(({ clusterId }) => clusterId))]
      return clusterIds.reduce((map, id, idx) => {
        map[id] = colourScheme[idx + 1] // ignore first color, too little contrast
        return map
      }, {})
    },
    regionsAnnotationTree() {
      if (!this.article) return [];

      const entities = getNamedEntitiesFromArticleResponse(this.article);
      const passageEntities = this.textReusePassages.map(passageToPassageEntity)

      const lineBreaks = this.article.contentLineBreaks;
      const regionBreaks = this.article.regionBreaks;

      return getAnnotateTextTree(
        this.article.content,
        entities.concat(passageEntities),
        lineBreaks,
        regionBreaks
      ).children;
    },
    regionTitle() {
      if (this.selectedPassage) {
        return this.$t('cluster_tooltip', { size: this.selectedPassage.clusterSize })
      }
      return false
    },
    selectedPassage() {
      if (this.selectedPassageId) {
        return this.textReusePassages.filter(({ id }) => id === this.selectedPassageId)[0]
      }
      return undefined
    },
    selectedClusterId() {
      return this.$route.query.trClusterId
    }
  },
  props: ['article_uid'],
  components: {
    ArticleItem,
    CollectionAddTo,
    SearchResultsSimilarItem,
    Icon,
    AnnotatedText,
  },
  methods: {
    commonTopics(suggestionTopics) {
      return this.topics.filter(a => suggestionTopics.some(b => a.topicUid === b.topicUid));
      // sort by master topics relevance
      // .sort((a, b) => b.relevance - a.relevance);
    },
    onRemoveCollection(collection, item) {
      const idx = item.collections.findIndex(c => (c.uid === collection.uid));
      if (idx !== -1) {
        this.$store.dispatch('collections/REMOVE_COLLECTION_ITEM', {
          collection,
          item,
        }).then(() => {
          item.collections.splice(idx, 1);
          this.$forceUpdate();
        });
      }
    },
    mouseenterPassageHandler(e) {
      const { id } = e.target.dataset
      const { top } = e.target.getBoundingClientRect()
      const peerElements = [...document.querySelectorAll(`.tr-passage[data-id="${id}"]`)]
      const siblingElements = [...document.querySelectorAll(`.tr-passage`)]

      siblingElements.map(element => {
        element.classList.remove('active')
        element.removeEventListener('click', this.passageClickHandler)
      })
      peerElements.map(element => element.classList.add('active'))

      e.target.addEventListener('click', this.passageClickHandler)

      this.selectedPassageId = id
      this.hoverPassageLineTopOffset =  top - this.viewerTopOffset
    },
    mouseleavePassageHandler(e) {
      const { id } = e.target.dataset
      const peerElements = [...document.querySelectorAll(`.tr-passage[data-id="${id}"]`)]

      peerElements.map(element => element.classList.remove('active'))

      e.target.removeEventListener('click', this.passageClickHandler)

      this.selectedPassageId = null
    },
    passageClickHandler() {
      this.$router.push({
        name: 'text-reuse-clusters-passages',
        query: {
          clusterId: this.selectedClusterId
        }
      })
    },
    clusterSelectedHandler(trClusterId) {
      const { query } = this.$route
      const updatedQuery = Object.assign({}, query, { trClusterId })
      if (query.trClusterId === updatedQuery.trClusterId) {
        this.$router.replace({ query: '' }).catch(() => {})
      } else {
        this.$router.replace({ query: updatedQuery }).catch(() => {})
      }
    }
  },
  watch: {
    article_uid: {
      immediate: true,
      async handler(articleUid) {
        this.articlesSuggestions = [];
        [this.article, this.textReusePassages] = await Promise.all([
          this.$store.dispatch('articles/LOAD_ARTICLE', articleUid),
          articleTextReusePassages.find({ query: { id: articleUid }})
            .then(({ passages }) => passages)
        ])
        articlesSuggestions.get(articleUid).then((res) => {
          this.articlesSuggestions = res.data;
        });
      },
    },
  },
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

#IssueViewerText{
  overflow: none;
  height: 100%;

  article h2{
    font-size: 3.5rem;
  }

  article .article-excerpt{
    font-size: inherit;
  }

  .line {
    margin-top: 2px;
  }

  span.location,
  span.person{
    box-shadow:inset 0px -2px 0px 0px transparentize($clr-tertiary, 0.5);
    transition: box-shadow 0.2s;
    cursor: pointer;

    &::before {
      font-family: "dripicons-v2";
      font-size: 75%;
      opacity: 0.6;
      padding-right: 2px;
    }

    &:hover {
      box-shadow:inset 0px -24px 0px 0px transparentize($clr-tertiary, 0.5);
    }
  }

  .tr-passage {
    // padding: 0 2px 0 2px;
    opacity: 0.8;
    transition: opacity 0.2s ease;
    cursor: pointer;

    &.active {
      opacity: 1;
    }
  }

  span.location::before {
    content: '\e012';
  }
  span.location.continuation::before {
    content: '';
  }

  span.person::before {
    content: '\e056';
  }
  span.person.continuation::before {
    content: '';
  }

  .region-row {
    margin:1px;
  }

  .region{

    p {
      margin-bottom: 0;
    }
  }

  .similar-items h2 {
    font-size: 1em;
  }
}
</style>

<i18n>
{
  "en": {
    "wrongLayout": "Note: Facsimile could not be retrieve for this specific article. To read it in its digitized version, switch to \"Facsimile view\"",
    "page": "pag. {num}",
    "pages": "pp. {nums}",
    "add_to_collection": "Add to Collection ...",
    "cluster_tooltip": "View all {size} articles containing this passage"
  }
}
</i18n>
