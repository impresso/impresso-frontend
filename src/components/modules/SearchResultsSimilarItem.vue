<template lang="html">
  <!-- newspaper - issue date -->
  <div class="similar-item display-block w-100 h-100 border-top my-2 p-1">
    <div class="small-caps mb-0 float-left w-100">
      <router-link class="text-muted" :to="{ name: 'issue', params: { issue_uid: searchResult.issue.uid }}">
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
      <!-- <pre class="small">{{searchResult}}</pre> -->
    </div>

    <b-button variant="outline-secondary" size="sm" class="showOnHover"
      v-on:click="onClickArticleSuggestion(searchResult)">
      {{$t('view')}}
    </b-button>

    <!-- collections -->
    <collection-add-to :item="searchResult" :text="$t('add_to_collection')" class="showOnHover" />
    <div class="mt-1" />
    <b-badge
      v-for="(collection, i) in searchResult.collections"
      v-bind:key="`${searchResult.article_uid}_co${i}`"
      variant="info"
      class="mt-1 mr-1">
      <router-link
        class="text-white"
        v-bind:to="{name: 'collection', params: {collection_uid: collection.uid}}">
        {{ collection.name }}
      </router-link>
    </b-badge>

    <!-- common topics start -->
    <div v-if="topics.length > 0">
      <div class="label small-caps mt-3">{{ $t("common_topics") }}</div>
      <div
        v-for="(rel, i) in topics"
        class="position-relative"
        v-bind:key="`${searchResult.article_uid}_ct${i}`">
        <div class="bg-accent-secondary viz-bar"
          :style="`width:${$n(searchResult.topics[topics.findIndex(c => (c.topicUid === rel.topicUid))].relevance * 100)}%;`" />
        <b-badge variant="none" class="p-0 showOnHover position-absolute"
          <router-link class="small" style="padding:1px 3px;" :to="{ name: 'topic', params: { 'topic_uid': rel.topicUid }}">
            {{ rel.topic.getHtmlExcerpt() }}
            <span class="text-muted">({{ $n(searchResult.topics[topics.findIndex(c => (c.topicUid === rel.topicUid))].relevance * 100) }}%)</span>
          </router-link>
        </b-badge>
      </div>
    </div>

  </div>

</template>

<script>
// import Article from '@/models/Article';
import CollectionAddTo from './CollectionAddTo';

export default {
  // data() {
  //   return {
  //     article: new Article(),
  //   };
  // },
  model: {
    prop: 'article',
  },
  props: ['searchResult', 'topics'],
  components: {
    CollectionAddTo,
  },
  methods: {
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
};
</script>

<style lang="scss" scoped>
@import "impresso-theme/src/scss/variables.sass";

.similar-item {
  transition: background-color 0.2s;
  background-color: rgba(0,0,0,0);
  .showOnHover {
    transition: opacity 0.2s;
    opacity: 0;
  }
}
.similar-item:hover {
  background-color: rgba(0,0,0,0.04);
  .showOnHover {
    opacity: 1;
  }
}
.viz-bar {
  position: absolute;
  left: 0;
  top:3px;
  height:calc( 100% - 5px);
  mix-blend-mode: multiply;
}
</style>

<i18n>
{
  "en": {
    "add_to_collection": "Add to Collection ...",
    "common_topics": "Topics in common"
  }
}
</i18n>
