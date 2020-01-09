<template lang="html">
  <i-layout-section>
    <div slot="header">
      <b-navbar type="light" variant="light" class="border-bottom">
        <section>
          <span class="label small-caps">
            <router-link v-bind:to="{ name: 'topics' }">&larr; {{$t("topics")}}</router-link>

          </span>
          <h3>{{ topic.language }} "{{ topic.getHtmlExcerpt() }} ..."</h3>

          <ellipsis>
            <div class="d-inline-block word"  v-for="(word, idx) in topic.words">
              <span :style='{opacity: word.l}'>{{ word.w }}</span>
              <!-- <span :style='{fontSize: (word.l + 0.5) + "em"}'>{{ word.w }}</span> -->
              <!-- <span class="word-probability">{{word.p}}</span> -->
              <span v-if="idx < topic.words.length - 1">&middot;&nbsp;</span>
            </div>

            <span class="label small-caps">
              {{$t("model")}} {{ topic.model }}
            </span>
          </ellipsis>
        </section>
      </b-navbar>

      <b-navbar type="light" variant="light" class="px-0 py-0 border-bottom border-tertiary">
        <b-navbar-nav class="px-2">
          <li class='p-2 border-right'>
            <b>{{$n(this.total)}}</b>
            <label>{{$t('articles')}}</label>
          </li>

        </b-navbar-nav>
        <b-navbar-nav class="px-1 ">
          <li class="p-2"><label >{{ $t('order by') }}</label>
            <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </li>
        </b-navbar-nav>
      </b-navbar>
    </div>

    <div class='m-3'>
      <div class="article border-bottom" v-for="(article, idx) in articles">
        <search-results-list-item v-model="articles[idx]" />
      </div>

    </div>
    <div class="fixed-pagination-footer p-1 mb-2 m-0">
      <pagination
        v-bind:perPage="limit"
        v-bind:currentPage="page"
        v-bind:totalRows="total"
        v-on:change="onInputPagination"
        v-bind:showDescription="false" />
    </div>

  </i-layout-section>
</template>

<script>
import Topic from '@/models/Topic';
import Pagination from './modules/Pagination';
import SearchResultsListItem from './modules/SearchResultsListItem';
import Ellipsis from './modules/Ellipsis';

export default {
  data: () => ({
    submitted: false,
    topic: new Topic(),
    articles: [],
    total: 0,
    page: 1,
    limit: 10,
    orderBy: '-relevance',
    timeline: [],
  }),
  computed: {
    orderByOptions() {
      return [
        {
          value: '-relevance',
          text: this.$t('topic.relevanceDESC'),
        },
        {
          value: 'relevance',
          text: this.$t('topic.relevanceASC'),
        },
        {
          value: 'date',
          text: this.$t('article.dateASC'),
        },
        {
          value: '-date',
          text: this.$t('article.dateDESC'),
        },
      ];
    },
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
      // console.info('getArticles page', page);
      const response = await this.$store.dispatch('topics/LOAD_ARTICLES', {
        topicUid: this.topic.uid,
        limit: this.limit,
        orderBy: this.orderBy,
        page,
      });
      // sres et articles
      this.articles = response.data;
      // set other data
      this.total = response.total;
      // console.info('articles', this.articles, 'page', page);
      return response;
    },
  },
  watch: {
    '$route.params.topic_uid': {
      immediate: true,
      async handler(topicUid) {
        // load single topic data
        this.topic = await this.$store.dispatch('topics/LOAD_TOPIC', topicUid);
        // this.$store.commit('SET_HEADER_TITLE', {
        //   subtitle: this.topic.getHtmlExcerpt(),
        //   title: 'topics',
        // });

        // load articles
        await this.getArticles();
      },
    },
    orderBy: {
      handler(val) {
        console.info(val);
        this.getArticles();
      },
    },
  },
  components: {
    Pagination,
    Ellipsis,
    SearchResultsListItem,
  },
};
</script>

<style scoped lang="scss">
.word {
  line-height: 1.25em;
}

</style>

<i18n>
  {
    "en": {
      "topic": {
        "relevanceDESC": "topic relevance (highest first)",
        "relevanceASC": "topic relevance (lowest first)"
      },
      "article": {
        "dateASC": "article date",
        "dateDESC": "article date, latest first"
      }
    }
  }
</i18n>
