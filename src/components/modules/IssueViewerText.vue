<template lang="html">
  <div id="IssueViewerText" class="container-fluid py-3">
    <i-layout>
      <i-layout-section>
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
          v-bind:key="i"
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
          <span v-for="(rel, i) in topics" v-bind:key="i">
            <router-link :to="{ name: 'topic', params: { 'topic_uid': rel.topic.uid }}">
              {{ rel.topic.getHtmlExcerpt() }} ({{ $n(rel.relevance * 100) }} %)
            </router-link> &mdash;
          </span>
        </div>
        <div v-if="hasValidRegions === false">
          <p>{{article.excerpt}}</p>
        </div>
        <div
          v-else
          class="row mt-3 mb-3"
          v-for="(region, i) in article.regions"
          v-bind:key="i">
          <div class="col col-sm-7">
            <div class='region p-2'>
              <p v-for="contents in region.g" >
                <span v-html="contents"></span>
              </p>
            </div>
          </div>
          <div class="col">
            <img v-bind:src="region.iiifFragment" width="100%" />
          </div>
        </div>
        <hr>
        <b-container fluid class="px-2">
          <h3>Similar Articles</h3>
          <b-row class="pb-5">
              <b-col
                cols="12"
                sm="12"
                md="12"
                lg="6"
                v-for="(searchResult, index) in articlesSuggestions"
                v-bind:key="searchResult.article_uid">
                <div class="display-block w-100 h-100 border-top pt-2 my-2">
                  <div class="small-caps mb-1 float-left w-100">
                    <router-link style="opacity:0.7" :to="{ name: 'issue', params: { issue_uid: searchResult.issue.uid }}">
                      <div style="float:left; max-width:60%; text-overflow:ellipsis; overflow:hidden; white-space: nowrap;">
                        {{ searchResult.newspaper.name}}
                      </div>
                      <div style="float:right; max-width: 40%; white-space: nowrap; text-overflow:ellipsis; overflow:hidden;">
                         &mdash; {{$d(new Date(searchResult.date), 'compact')}}
                      </div>
                    </router-link>
                  </div>

                  <div class="mb-2">
                    <b v-html="searchResult.title" />
                    <small v-html="searchResult.excerpt" />
                  </div>
                <!-- {{searchResult}} -->

                <b-button variant="outline-secondary" size="sm"
                  v-on:click="onClickArticleSuggestion(searchResult)">
                  {{$t('view')}}
                </b-button>

                <!-- collections -->
                <collection-add-to :item="searchResult" :text="$t('add_to_collection')" />
                <b-badge
                  v-for="(collection, i) in searchResult.collections"
                  v-bind:key="i"
                  variant="info"
                  class="mt-1 mr-1">
                  <router-link
                    class="text-white"
                    v-bind:to="{name: 'collection', params: {collection_uid: collection.uid}}">
                    {{ collection.name }}
                  </router-link>
                  <a class="dripicons dripicons-cross" v-on:click="onRemoveCollection(collection, searchResult)" />
                </b-badge>

                <!-- common topics start -->
                <div>
                  <div class="label small-caps mt-3">{{ $t("common_topics") }}</div>
                  <b-badge variant="none" class="p-0" v-for="(rel, i) in commonTopics(searchResult.topics)" v-bind:key="i">
                    <router-link class="" style="padding:1px 3px;" :to="{ name: 'topic', params: { 'topic_uid': rel.topicUid }}">
                      {{ rel.topic.getHtmlExcerpt() }} ({{ $n(searchResult.topics[searchResult.topics.findIndex(c => (c.topicUid === rel.topicUid))].relevance * 100) }}%)
                    </router-link> &mdash;
                  </b-badge>
                </div>
                <!-- common topics end -->

                </div>
              </b-col>
          </b-row>
        </b-container>
      </i-layout-section>
    </i-layout>
  </div>
</template>

<script>
import { articlesSuggestions } from '@/services';
import Article from '@/models/Article';
import BaseTitleBar from './../base/BaseTitleBar';
import CollectionAddTo from './CollectionAddTo';
import SearchResultsTilesItem from './SearchResultsTilesItem';
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
    SearchResultsTilesItem,
  },
  methods: {
    commonTopics(suggestionTopics) {
      // console.log(t);
      // console.log(this.topics);
      const intersection =
        this.topics.filter(a => suggestionTopics.some(b => a.topicUid === b.topicUid));

      // const common = arrA.filter(x => (arrB.includes(el)));
      // console.log(intersection);
      return intersection;
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
    onClickArticleSuggestion(searchResult) {
      this.$router.push({
        name: 'article',
        params: {
          issue_uid: searchResult.issue.uid,
          page_number: searchResult.pages[0].num,
          page_uid: searchResult.pages[0].uid,
          article_uid: searchResult.uid,
        },
      });
    },
  },
  watch: {
    article_uid: {
      immediate: true,
      async handler(articleUid) {
        this.article = new Article();
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

<style lang="less">
#IssueViewerText{
  overflow: none;
  height: 100%;

  span.location{
    border-bottom: 1px solid cyan;
  }

  .region{
    padding: 0.125rem 0.25rem;
    background: white;

    p {
      margin-bottom: 0;
    }
  }
}
</style>

<i18n>
{
  "en": {
    "page": "pag. {num}",
    "pages": "pp. {nums}",
    "add_to_collection": "Add to Collection ...",
    "common_topics": "Topics in common"
  }
}
</i18n>
