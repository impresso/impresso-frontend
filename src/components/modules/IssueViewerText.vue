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
            <b-row class="mt-1" v-for="(region, i) in article.regions" v-bind:key="i">
              <div v-if="article.isCC" class="col col-sm-5 bg-white border">
                <div class="py-3">
                  <img v-bind:src="region.iiifFragment" style="width: 100%" />
                </div>
              </div>
              <div
                class="col"
                :class="{ 'col-sm-7': article.isCC, 'col-sm-12': !article.isCC }">
                <div class='region py-3'>
                  <!-- {{ i }} -->
                  <p v-for="contents in region.g" >
                    <span v-html="contents"></span>
                  </p>
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
import Icon from 'vue-awesome/components/Icon';
import { articlesSuggestions } from '@/services';
import BaseTitleBar from './../base/BaseTitleBar';
import CollectionAddTo from './CollectionAddTo';
import SearchResultsSimilarItem from './SearchResultsSimilarItem';
import Ellipsis from './Ellipsis';
import ArticleItem from './lists/ArticleItem';

export default {
  data() {
    return {
      article: null,
      articlesSuggestions: [],
    };
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
      return !!this.article.regions.filter(region => region.g.length).length;
    },
  },
  props: ['article_uid'],
  components: {
    ArticleItem,
    BaseTitleBar,
    CollectionAddTo,
    Ellipsis,
    SearchResultsSimilarItem,
    Icon,
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
  },
  watch: {
    article_uid: {
      immediate: true,
      async handler(articleUid) {
        this.articlesSuggestions = [];
        this.article = await this.$store.dispatch('articles/LOAD_ARTICLE', articleUid);
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

  span.location::before {
    content: '\e012';
  }
  span.person::before {
    content: '\e056';
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
    "wrongLayout": "Note: Facsimile could not be retrieve for this specific article. To read it in its digitized version, switch to \"image mode\"",
    "page": "pag. {num}",
    "pages": "pp. {nums}",
    "add_to_collection": "Add to Collection ..."
  }
}
</i18n>
