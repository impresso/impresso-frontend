<template lang="html">
  <i-layout id="TopicsPage">
    <list :pagination-list="paginationList" width="350px" v-on:change-page="changePage" :hidePagination="this.tab === 'visualized'">
      <template v-slot:header>
        <b-tabs pills class="mx-2 pt-2">
          <template v-slot:tabs-end>

            <b-nav-item class="pl-2"
              :class="{ active: tab === 'list' }"
              active-class='none'
              :to="{ name:'topics'}"><span v-html="$t('label_list', { total: $n(paginationList.totalRows) })"/></b-nav-item>
            <b-nav-item class="pl-2"
              :class="{ active: tab === 'visualized' }"
              active-class='none'
              :to="{ name:'topics', query: { tab: 'visualized' }}"><span v-html="$t('label_visualized_list', { total: $n(visualizedTopics.length) })"/></b-nav-item>
          </template>
        </b-tabs>
        <div class='pb-2 px-3' v-if="tab === 'list'">
          <b-input placeholder="filter topics ..." v-model.trim="q" class="my-3"></b-input>
          <label>{{ $t('select model') }}</label>
          <small><info-button name="how-topic" class="text-muted" /></small>
          <i-dropdown v-model="topicModel" v-bind:options="topicModelOptions" size="sm" variant="outline-primary"></i-dropdown>
          <br/>
          <!-- <label>{{ $t('order_by') }}</label> -->
          <!-- <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown> -->
          <label>{{ $t('max_nodes') }}</label>
          <i-dropdown v-model="limit" v-bind:options="limitOptions" size="sm" variant="outline-primary"></i-dropdown>
        </div>
        <div class='pt-3 pb-2 px-3' v-else>
          <label>{{ $t('order_by') }}</label>
          <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
        </div>
      </template>

      <template v-slot:default>
        <div v-if="tab === 'list'">
          <topic-item :item="topic" v-for="(topic, i) in topics" v-bind:key="i" class='p-2 border-bottom' />
        </div>
        <div v-else-if="!visualizedTopics.length" class="d-flex justify-content-center">
          <div class="p-3 mt-1">
            <p class="text-center"><em>This panel will contain the list of visualized topics.</em></p>
            <p style="font-size: .9em">To select the items to visualize, please go to the <router-link :to="{ name: $route.name }">browse topic</router-link> panel and check the corresponding checkbox</p>
          </div>
        </div>
        <div v-else>
          <topic-item :item="topic" v-for="(topic, i) in visualizedTopics" v-bind:key="i" class='p-2 border-bottom' />
        </div>
      </template>
    </list>
    <!-- main page -->
    <router-view></router-view>
  </i-layout>
</template>

<script>
import List from './modules/lists/List';
import InfoButton from './base/InfoButton';
import TopicItem from './modules/lists/TopicItem';

export default {
  data: () => ({
    submitted: false,
    topicModels: [],
    q: '',
    tab: 'list',
  }),
  computed: {
    visualizedTopics() {
      // list of visualized topics;
      return this.$store.state.topics.visualizedItems;
    },
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
    activateTab(t) {
      if(t === 'visualized') {
        this.tab = 'visualized';
      } else {
        this.tab = 'list';
      }
    },
    toggleVisualized(item, checked) {
      if (checked) {
        this.$store.dispatch('topics/ADD_VISUALIZED_ITEM', item)
      } else {
        this.$store.dispatch('topics/REMOVE_VISUALIZED_ITEM', item)
      }
    },
  },
  mounted() {

    this.getTopics();
    this.activateTab(this.$route.query.tab);
  },
  watch: {
    $route: {
      handler({ query }) {
        this.activateTab(query.tab);
      },
    },
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
    InfoButton,
    TopicItem,
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
    "label_list": "browse {total} topics",
    "label_visualized_list": "{total} visualized",
    "order_by": "order by",
    "sort_name_asc": "Main word, A-Z",
    "sort_name_desc": "Main word, Z-A",
    "sort_count_desc": "Number of articles, highest first",
    "sort_count_asc": "Number of articles, lowest first",
    "max_nodes": "visualized topics"
  }
}
</i18n>
