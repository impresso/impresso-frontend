<template lang="html">
  <i-layout id="TopicsPage">
    <list :pagination-list="paginationList" v-on:change-page="changePage">
      <template v-slot:header>
        <div class='p-3 border-bottom bg-light'>
          <b-input placeholder="filter topics ..." v-model.trim="q" class="my-3"></b-input>
          <label>{{ $t('select model') }}</label>
          <i-dropdown v-model="topicModel" v-bind:options="topicModelOptions" size="sm" variant="outline-primary"></i-dropdown>
          <br/>
          <!-- <label>{{ $t('order_by') }}</label> -->
          <!-- <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown> -->
          <label>{{ $t('max_nodes') }}</label>
          <i-dropdown v-model="limit" v-bind:options="limitOptions" size="sm" variant="outline-primary"></i-dropdown>
        </div>
      </template>

      <template v-slot:default>
        <div>
          <div class='topic item p-2 border-bottom' v-for="topic in topics" v-bind:key="topic.uid">
            <div class='badge small-caps'>{{topic.language}}</div>
            <router-link :to="{ name: 'topic', params: { topic_uid: topic.uid }}" v-html="topic.getHtmlExcerpt({ token: q })" />
            <item-selector :uid="topic.uid" :item="topic" type="topic"/>
            <div class='small-caps'>{{topic.model}}</div>
          </div>
        </div>
      </template>
    </list>
    <!-- main page -->
    <router-view></router-view>
  </i-layout>
</template>

<script>
import List from './modules/lists/List';
import ItemSelector from './modules/ItemSelector';

export default {
  data: () => ({
    submitted: false,
    topicModels: [],
    q: '',
  }),
  computed: {
    topics() {
      return this.$store.state.topics.items;
    },
    limit: {
      get() {
        return this.$store.state.topics.pagination.perPage;
      },
      set(v) {
        this.$store.dispatch('topics/LOAD_TOPICS', {
          limit: v,
        });
      },
    },
    paginationList() {
      return this.$store.state.topics.pagination;
    },
    topicModelOptions() {
      return [{
        value: '*',
        text: this.$t('all topic models'),
      }].concat(this.topicModels.map(d => ({
        value: d.val,
        text: d.val, // `${d.val} (${d.count})`,
      })));
    },
    limitOptions() {
      const total = Math.max(this.$store.state.topics.pagination.totalRows, 50);
      return [
        50, 100, 150, 200, 250, 300, 350, 400,
      ].filter(d => d <= total).map(d => ({
        value: d,
        text: this.$n(d),
      }));
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
    changePage(page) {
      return this.getTopics({
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
        // console.info('query', query);
        await this.getTopics(query);
      },
    },
  },
  components: {
    List,
    ItemSelector,
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
</style>

<i18n>
{
  "en": {
    "order_by": "order by",
    "sort_name_asc": "Main word, A-Z",
    "sort_name_desc": "Main word, Z-A",
    "sort_count_desc": "Number of articles, highest first",
    "sort_count_asc": "Number of articles, lowest first",
    "max_nodes": "visualized topics"
  }
}
</i18n>
