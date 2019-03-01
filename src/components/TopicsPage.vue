<template lang="html">
  <i-layout id="TopicsPage">
    <i-layout-section width="300px" class="border-right">
      <div slot="header">
        <div class='p-3 border-bottom bg-light'>
          <b-input placeholder="filter topics ..." v-model.trim="q" class="my-3"></b-input>
          <label>{{ $t('select model') }}</label>
          <i-dropdown v-model="topicModel" v-bind:options="topicModelOptions" size="sm" variant="outline-primary"></i-dropdown>
          <br/>
          <label>{{ $t('order_by') }}</label>
          <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
        </div>
      </div>
      <div>
        <div class='topic p-2 border-bottom' v-for="topic in topics">
          <div class='badge small-caps'>{{topic.language}}</div>
          <router-link :to="{ name: 'topic', params: { topic_uid: topic.uid }}" v-html="topic.getHtmlExcerpt({ token: q })" />
          <div class='small-caps'>{{topic.model}}</div>
        </div>

      </div>
      <div slot="footer">
        <pagination
          v-bind:perPage="limit"
          v-bind:currentPage="page"
          v-bind:totalRows="total"
          v-on:change="onInputPagination" />
      </div>
    </i-layout-section>
    <router-view></router-view>
  </i-layout>
</template>

<script>
// import Topic from '@/models/Topic';
import Pagination from './modules/Pagination';


export default {
  data: () => ({
    submitted: false,
    topics: [],
    topicModels: [],
    total: 0,
    page: 1,
    limit: 50,
    q: '',
  }),
  computed: {
    topicModelOptions() {
      return [{
        value: '*',
        text: this.$t('all topic models'),
      }].concat(this.topicModels.map(d => ({
        value: d.val,
        text: d.val, // `${d.val} (${d.count})`,
      })));
    },
    orderByOptions() {
      return [
        {
          value: 'name',
          text: this.$t('sort_name_asc'),
        },
        {
          value: '-name',
          text: this.$t('sort_name_desc'),
        },
        {
          value: 'count',
          text: this.$t('sort_count_asc'),
        },
        {
          value: '-count',
          text: this.$t('sort_count_desc'),
        },
      ];
    },

    topicModel: {
      get() {
        return this.$store.state.topics.topicModel;
      },
      set(val) {
        this.$store.commit('topics/UPDATE_TOPIC_MODEL', val);
      },
    },

    orderBy: {
      get() {
        return this.$store.state.topics.orderBy;
      },
      set(val) {
        this.$store.commit('topics/UPDATE_ORDER_BY', val);
      },
    },

  },
  methods: {
    async onInputPagination(page) {
      await this.getTopics({
        page,
      });
    },
    async getTopics({
      page = 1,
      q = null,
      facets = 'topicmodel',
      filters = [],
    } = {}) {
      const response = await this.$store.dispatch('topics/LOAD_TOPICS', {
        limit: this.limit,
        page,
        q,
        facets,
        filters,
      });
      this.topics = response.data;
      this.total = response.total;

      if (response.info.facets && response.info.facets.topicmodel) {
        this.topicModels = response.info.facets.topicmodel.buckets || [];
      } else {
        this.topicModels = [];
      }
    },
  },
  mounted() {
    this.getTopics();
  },
  watch: {
    q: {
      async handler(val) {
        await this.getTopics({
          page: 1,
          q: val,
        });
      },
    },
    topicModel: {
      async handler() {
        const query = {
          page: 1,
          q: this.q,
        };

        if (this.topicModel !== '*') {
          query.filters = [
            {
              type: 'topicmodel',
              q: this.topicModel,
            },
          ];
        }
        // console.log('query', query);
        await this.getTopics(query);
      },
    },
  },
  // watch: {
  //   '$route.params.topic_uid': {
  //     immediate: true,
  //     async handler() {
  //       await this.getTopics();
  //       // it there is a topic uid, show only topics from this model
  //       // if model changed.
  //       // this.$store.commit('SET_HEADER_TITLE', {
  //       //   subtitle: 'topic',
  //       //   title: 'topics',
  //       // });
  //       // console.log('TOPICI', this.topics);
  //       // load all topic given a
  //       // console.log('topic changed!', topicUid);
  //     },
  //   },
  // },
//   methods: {
//     // fetch() {
//     //   // return this.$store.dispatch('topics/LOAD_TOPICS');
//     // },
//   },
  components: {
    Pagination,
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
.badge {
  background: #e0e0e0;
  line-height: .5rem;
  padding-bottom: .4rem;
  display: inline-block;
}
a >>> .h{
  background: red;
}
</style>

<i18n>
{
  "en": {
    "order_by": "order by",
    "sort_name_asc": "Main word, A-Z",
    "sort_name_desc": "Main word, Z-A",
    "sort_count_desc": "Number of articles, highest first",
    "sort_count_asc": "Number of articles, lowest first"
  }
}
</i18n>
