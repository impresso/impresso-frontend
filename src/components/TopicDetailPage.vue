<template lang="html">
  <i-layout-section>

    <b-navbar type="light" variant="light" class="border-bottom">
      <section>
        <span class="label small-caps">
          <router-link v-bind:to="{ name: 'topics' }">&larr; {{$t("topics")}}</router-link>

        </span>
        <h3>{{ topic.language }} "{{ topic.getHtmlExcerpt() }} ..."</h3>
        <span class="label small-caps">
          {{$t("model")}} {{ topic.model }}
        </span>
      </section>
    </b-navbar>


    <!--  -->
    <div class="p-3 pt-2 border-bottom">
      <div class="d-inline-block word" v-for="(word, idx) in topic.words">
        <span :style='{opacity: word.l}'>{{ word.w }}</span>
        <span class="word-probability">{{word.p}}</span>
        <span v-if="idx < topic.words.length - 1">&middot;&nbsp;</span>
      </div>
    </div>
    <div class="p-3 pt-2">
      <div>
        <span class='number'>{{ $n(total) }}</span>
        <span class='text-serif'>{{$t('articles in total')}}</span>
      </div>
      <div class="article border-bottom" v-for="(article, idx) in articles">
        {{article.newspaper.name}}
        <h4>{{article.title}}</h4>
        <blockquote>{{article.excerpt}}</blockquote>
      </div>
      <pagination
        v-bind:perPage="limit"
        v-bind:currentPage="page"
        v-bind:totalRows="total"
        v-on:change="onInputPagination"
         />
    </div>
  </i-layout-section>
</template>

<script>
import Topic from '@/models/Topic';
import Pagination from './modules/Pagination';

export default {
  data: () => ({
    submitted: false,
    topic: new Topic(),
    articles: [],
    total: 0,
    page: 1,
    limit: 10,
    timeline: [],
  }),
  computed: {
    topicModel() {
      return this.$route.params.topic_model;
    },
    topicUid() {
      return this.$route.params.topic_uid;
    },
  },
  methods: {
    async onInputPagination(page) {
      await this.getArticles({
        page,
      });
    },

    async getArticles({
      page = 1,
    } = {}) {
      console.log('getArticles page', page);
      const response = await this.$store.dispatch('topics/LOAD_ARTICLES', {
        topicUid: this.topic.uid,
        limit: this.limit,
        page,
      });
      // sres et articles
      this.articles = response.data;
      // set other data
      this.total = response.total;
      console.log('articles', this.articles, 'page', page);
      return response;
    },
  },
  watch: {
    '$route.params.topic_uid': {
      immediate: true,
      async handler(topicUid) {
        // load single topic data
        this.topic = await this.$store.dispatch('topics/LOAD_TOPIC', topicUid);
        this.$store.commit('SET_HEADER_TITLE', {
          subtitle: this.topic.getHtmlExcerpt(),
          title: 'topics',
        });

        // load articles
        await this.getArticles();
      },
    },
  },
  components: {
    Pagination,
  },
};
</script>

<style scoped lang="scss">
.word-probability {
  color: lightgrey;
}
.word:hover{
  .word-probability {
    color: darkgrey;
  }
  box-shadow: 0 1px black;
}
</style>
