<template lang="html">
  <!-- newspaper - issue date -->
  <div class="similar-item display-block w-100 h-100 border-top my-2 px-1 py-2">

    <article-item :item="searchResult"
      show-meta
      show-excerpt
      show-link
      show-entities
      show-size
      show-newspaper
      show-pages
      show-matches
      show-type
      />

    <!-- common topics start -->
    <div v-if="topics.length > 0">
      <div class="label small-caps mt-3">{{ $t("common_topics") }}
        <info-button :target="searchResult.uid" name="topics-in-common" />
      </div>
      <div
        v-for="(rel, i) in topics"
        class="position-relative pb-1 small"
        v-bind:key="`${searchResult.article_uid}_ct${i}`">
        <viz-bar
          :percent="searchResult.topics[searchResult.topics.findIndex(c => (c.topicUid === rel.topicUid))].relevance * 100"
          :uid="rel.topic.uid"
          :item="rel.topic"
          type="topic"
          />
      </div>
    </div>

  </div>

</template>

<script>
import ArticleItem from './lists/ArticleItem.vue';
import VizBar from '../base/VizBar.vue';
import InfoButton from '../base/InfoButton.vue';

export default {
  props: ['searchResult', 'topics'],
  components: {
    ArticleItem,
    VizBar,
    InfoButton,
  },
  methods: {
    onClickArticleSuggestion(searchResult) {
      this.$router.push({
        name: 'article',
        params: {
          issue_uid: searchResult.issue.uid,
          page_number: searchResult.pages[0]?.num,
          page_uid: searchResult.pages[0]?.uid,
          article_uid: searchResult.uid,
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "impresso-theme/src/scss/variables.sass";

h2 {
  font-size: 1rem !important;
}
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
</style>

<i18n lang="json">
{
  "en": {
    "add_to_collection": "Add to Collection ...",
    "common_topics": "Topics in common"
  }
}
</i18n>
