<template lang="html">
  <i-layout-section>

    <b-navbar type="light" variant="light" class="border-bottom">
      <section>
        <span class="label">{{$t("topic")}} {{ topic.model }} - {{ topic.language }}</span>
        <h3>"{{ topic.getHtmlExcerpt() }} ..."</h3>
      </section>
    </b-navbar>


    <!--  -->
    <div class="p-3 pt-2">
      <div class="d-inline-block word" v-for="(word, idx) in topic.words">
        <span :style='{opacity: word.l}'>{{ word.w }}</span>
        <span class="word-probability">{{word.p}}</span>
        <span v-if="idx < topic.words.length - 1">&middot;&nbsp;</span>
      </div>
    </div>
    <div>
      <div class="article" v-for="(article, idx) in articles">
        {{idx}} {{article.title}}
      </div>
    </div>
  </i-layout-section>
</template>

<script>
import Topic from '@/models/Topic';

export default {
  data: () => ({
    submitted: false,
    topic: new Topic(),
    articles: [],
  }),
  computed: {
    topicModel() {
      return this.$route.params.topic_model;
    },
    topicUid() {
      return this.$route.params.topic_uid;
    },
  },
  watch: {
    '$route.params.topic_uid': {
      immediate: true,
      async handler(topicUid) {
        // load single topic data
        this.topic = await this.$store.dispatch('topics/LOAD_TOPIC', topicUid);

        // load articles
        this.articles = await this.$store.dispatch('topics/LOAD_ARTICLES', topicUid);

        this.$store.commit('SET_HEADER_TITLE', {
          subtitle: this.topic.getHtmlExcerpt(),
          title: 'topics',
        });
      },
    },
  },
};
</script>

<style scoped lang="scss">
.word-probability{
  color: lightgrey;
}
.word:hover{
  .word-probability{
    color: darkgrey;
  }
  box-shadow: 0 1px black;
}
</style>
