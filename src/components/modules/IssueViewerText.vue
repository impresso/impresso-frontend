<template lang="html">
  <div id="IssueViewerText" class="container-fluid py-3 bg-light">
    <i-layout>
      <i-layout-section>
        <i-spinner v-if="!article.uid" class="text-center p-5" />
        <h3>{{article.title}}</h3>
        <div>
          <router-link :to="{ name: 'newspaper', params: {newspaper_uid: article.newspaper.uid} }">
            {{ article.newspaper.name}}
          </router-link> &mdash; {{ articlePages }}
        </div>
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
        <div class="my-3">
          <span class="label small-caps">{{ $t("topics")}}</span>:
          <span v-for="(rel, i) in topics" v-bind:key="i" class="position-relative">
            <div class="bg-accent-secondary position-absolute"
              :style="`width:${$n(rel.relevance * 100 * 2)}px;
              top:3px; left:0; height:1em; z-index:-1`" />
            <router-link :to="{ name: 'topic', params: { 'topic_uid': rel.topic.uid }}" class="small">
              {{ rel.topic.getHtmlExcerpt() }} <span class="text-muted">({{ $n(rel.relevance * 100) }} %)</span>
            </router-link> &mdash;
          </span>
        </div>
        <div class="alert alert-light" role="alert" v-if="!article.isCC">
          <p>{{ $t('wrongLayout') }} <icon name="image"/></p>
        </div>
        <div v-if="hasValidRegions === false">
          <p>{{article.excerpt}}</p>
        </div>
        <div
          v-else
          class="region-row row mt-3 mb-3 bg-white">
          <div v-for="(region, i) in article.regions" v-bind:key="i"
            class="col"
            :class="{ 'col-sm-7': article.isCC, 'col-sm-12': !article.isCC }">
            <div class='region py-3'>
              <!-- {{ i }} -->
              <p v-for="contents in region.g" >
                <span v-html="contents"></span>
              </p>
            </div>
          </div>
          <div v-if="article.isCC" class="col border-left bg-white p-0">
            <img v-bind:src="region.iiifFragment" width="100%" />
          </div>
        </div>
        <hr class="py-4">
        <b-container fluid class="px-0">
          <h3>Similar Articles</h3>
          <i-spinner v-if="articlesSuggestions.length === 0" class="text-center p-5" />
          <b-row class="pb-5">
            <b-col
              cols="12"
              sm="12"
              md="12"
              lg="6"
              v-for="(searchResult, index) in articlesSuggestions"
              v-bind:key="`${index}_ra`">
              <search-results-similar-item
                v-bind:searchResult="searchResult"
                :topics="commonTopics(searchResult.topics)" />
            </b-col>
          </b-row>
        </b-container>
      </i-layout-section>
    </i-layout>
  </div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon';
import { articlesSuggestions } from '@/services';
import Article from '@/models/Article';
import BaseTitleBar from './../base/BaseTitleBar';
import CollectionAddTo from './CollectionAddTo';
import SearchResultsSimilarItem from './SearchResultsSimilarItem';
import Ellipsis from './Ellipsis';

export default {
  data() {
    return {
      article: new Article(),
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
        this.article = new Article();
        this.articlesSuggestions = [];
        this.article = await this.$store.dispatch('articles/LOAD_ARTICLE', articleUid).then();
        articlesSuggestions.get(articleUid).then((res) => {
          this.articlesSuggestions = res.data;
        });
      },
    },
  },
};
</script>

<style lang="scss">
#IssueViewerText{
  overflow: none;
  height: 100%;

  span.location{
    border-bottom: 1px solid cyan;
  }

  .region-row {
    margin:1px;
  }

  .region{

    p {
      margin-bottom: 0;
    }
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
