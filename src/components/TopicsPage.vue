<template lang="html">
  <i-layout id="TopicsPage">
    <list :pagination-list="paginationList" width="350px" v-on:change-page="changePage" :hidePagination="this.tab === 'visualized'">
      <template v-slot:header>
        <b-tabs pills class="mx-2 pt-2">
          <template v-slot:tabs-end>

            <b-nav-item class="pl-2"
              :class="{ active: tab === 'list' }"
              active-class='none'
              :to="goToQuery({ tab: 'list' })"><span v-html="$t('label_list', { total: $n(paginationList.totalRows) })"/></b-nav-item>
            <b-nav-item class="pl-2"
              :class="{ active: tab === 'visualized' }"
              active-class='none'
              :to="goToQuery({ tab: 'visualized' })"><span v-html="$tc('label_visualized_list', visualizedTopics.length, { total: $n(visualizedTopics.length) })"/></b-nav-item>
          </template>
        </b-tabs>
        <div class='pb-2 px-3' v-if="tab === 'list'">
          <b-form-input placeholder="filter topics ..." :modelValue="q" @update:modelValue="changeQ" class="my-3"></b-form-input>
          <b-form-checkbox v-if="countActiveFilters"
            v-model="applyCurrentSearchFilters"
          ><span v-html="$t('label_applyCurrentSearchFilters', { countActiveFilters })" /></b-form-checkbox>
          <!-- <label>{{ $t('select model') }}</label>
          <small><info-button name="how-topic" class="text-muted" /></small>
          <i-dropdown v-model="topicModel" v-bind:options="topicModelOptions" size="sm" variant="outline-primary"></i-dropdown>
          <br/> -->
          <!-- <label>{{ $t('order_by') }}</label> -->
          <!-- <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown> -->
          <!-- <label>{{ $t('max_nodes') }}</label> -->
          <!-- <i-dropdown v-model="limit" v-bind:options="limitOptions" size="sm" variant="outline-primary"></i-dropdown> -->
        </div>
        <div class='pt-3 pb-2 px-3'>
          <label class="mr-1">{{ $t('order_by') }}</label>
          <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
          <b-button class="ml-2" size="sm" variant="outline-primary" v-if="visualizedTopics.length" @click="resetVisualisedItems">
            {{ $t('actions.resetItems') }}
          </b-button>

        </div>
        <div class="pb-2 px-3">
          <b-button size="sm" variant="outline-primary" block :disabled="!visualizedTopics.length" @click="$router.push(searchPageLink)">
            <span v-html="$tc('actions.addToCurrentItemsDetailed', visualizedTopics.length)" />
          </b-button>
        </div>
      </template>

      <template v-slot:default>
        <div v-if="tab === 'list'">
          <div v-if="!topics.length && q.length" class="p-3 mt-1">
            <p class="text-center">
              <em v-html="$t('label_topics_list_empty', { q })"/>
            </p>
            <p style="font-size: .9em" v-if="applyCurrentSearchFilters && countActiveFilters">
              <span v-html="$t('label_uncheck_applyCurrentSearchFilters')"/>
            </p>
          </div>
          <topic-item :item="topic" v-for="(topic, i) in topics" v-bind:key="i" class='p-3 border-bottom' />
        </div>
        <div v-else-if="!visualizedTopics.length" class="d-flex justify-content-center">
          <div class="p-3 mt-1">
            <p class="text-center"><em>This panel will contain the list of visualized topics.</em></p>
            <p style="font-size: .9em">To select the items to visualize, please go to the <router-link :to="{ name: $route.name }">browse topic</router-link> panel and check the corresponding checkbox</p>
          </div>
        </div>
        <div v-else>
          <topic-item :item="topic" v-for="(topic, i) in visualizedTopics" v-bind:key="i" class='p-3 border-bottom' />
        </div>
      </template>
    </list>
    <!-- main page -->
    <router-view :filters="searchQuery.filters"></router-view>
  </i-layout>
</template>

<script>
// import { protobuf } from 'impresso-jscommons';
import List from './modules/lists/List.vue';
// import InfoButton from './base/InfoButton';
import TopicItem from './modules/lists/TopicItem.vue';
import SearchQuery from '@/models/SearchQuery';
import { searchQueryGetter, searchQuerySetter } from '@/logic/queryParams';
import { SupportedFiltersByContext } from '@/logic/filters';
import { mapStores } from 'pinia'
import { useTopicsStore } from '@/stores/topics'

/**
 * @param {import('@/models').Filter} filter
 * @returns {boolean}
 */
const supportedSearchIndexFilters = filter => SupportedFiltersByContext.search.includes(filter.type)

export default {
  data: () => ({
    submitted: false,
    topicModels: [],
    q: '',
    tab: 'list',
  }),
  computed: {
    ...mapStores(useTopicsStore),
    isLoading() {
      return this.topicsStore.isLoading
    },
    applyCurrentSearchFilters: {
      get() {
        return this.topicsStore.applyCurrentSearchFilters === true;
      },
      set(value) {
        this.topicsStore.updateApplyCurrentSearchFilters(value);
        this.loadTopics();
      },
    },
    searchPageLink() {
      return {
        name: 'search',
        query: {
          sq: SearchQuery.serialize({
            filters: [{ type: 'topic', q: this.visualizedTopics.map(d => d.uid) }],
          }, 'protobuf'),
        },
      };
    },
    searchQuery: {
      get() {
        const searchQuery = searchQueryGetter().get.bind(this)()
        return new SearchQuery({
          filters: searchQuery.filters.filter(supportedSearchIndexFilters)
        })
      },
      ...searchQuerySetter(),
    },
    countActiveFilters() {
      return this.searchQuery.countActiveFilters();
    },
    countActiveItems() {
      return this.searchQuery.countActiveItems();
    },
    visualizedTopics() {
      // list of visualized topics;
      return this.topicsStore.visualizedItems;
    },
    topics() {
      return this.topicsStore.items;
    },
    limit: {
      get() {
        return this.topicsStore.pagination.perPage;
      },
      set(v) {
        this.topicsStore.loadTopics({
          limit: v,
        })
      },
    },
    paginationList() {
      return this.topicsStore.pagination;
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
      const total = Math.max(this.topicsStore.pagination.totalRows, 50);
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
        return this.topicsStore.topicModel;
      },
      set(val) {
        this.topicsStore.updateTopicModel(val);
      },
    },

    orderBy: {
      get() {
        return this.topicsStore.orderBy;
      },
      set(val) {
        this.topicsStore.updateOrderBy(val);
      },
    },

  },
  methods: {
    resetVisualisedItems() {
      this.topicsStore.resetVisualizedItem();
    },
    changeQ(value) {
      if (value.trim().length > 1) {
        this.$router.push(this.goToQuery({ q: value.trim() }));
      } else {
        this.$router.push({
          name:  this.$route.name,
          params: this.$route.params,
          query: {
            tab: this.tab,
          },
        });
      }
    },
    changePage(page) {
      return this.loadTopics({
        page,
      });
    },
    goToQuery(query) {
      return {
        name:  this.$route.name,
        params: this.$route.params,
        query: {
          ... this.$route.query,
          ... query,
        },
      };
    },
    loadTopics({
      page = 1,
      facets = 'topicmodel',
      filters = [],
    } = {}) {
      const params = {
        limit: 300,
        page,
        facets,
        filters,
      };
      // add current search query filters if applicable.
      if (this.applyCurrentSearchFilters && this.countActiveFilters) {
        params.filters = params.filters.concat(this.searchQuery.getFilters());
      }
      if (this.q && this.q.length > 1) {
        params.q = this.q;
      }
      this.topicsStore.loadTopics(params).then((response) => {
        if (response.info.facets && response.info.facets.topicmodel) {
          this.topicModels = response.info.facets.topicmodel.buckets || [];
        } else {
          this.topicModels = [];
        }
      });
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
        this.topicsStore.addVisualizedItem(item);
      } else {
        this.topicsStore.removeVisualizedItem(item);
      }
    },
    initQ(q) {
      this.q = String(q || '').trim();
    },
  },
  mounted() {
    this.initQ(this.$route.query.q);
    this.activateTab(this.$route.query.tab);
    this.loadTopics();
  },
  watch: {
    $route: {
      handler({ query }) {
        this.activateTab(query.tab);
        this.initQ(query.q);
        this.loadTopics();
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
        await this.loadTopics(query);
      },
    },
  },
  components: {
    List,
    // InfoButton,
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

<i18n lang="json">
{
  "en": {
    "label_list": "browse {total} topics",
    "label_topics_list_empty": "There is no word in any topic containing <b>{q}</b>",
    "label_visualized_list": "observing list (<span style='color: blue'>{n}</span>)",
    "label_uncheck_applyCurrentSearchFilters": "Try to uncheck the mention <em>[...]if matches current search</em>",
    "label_applyCurrentSearchFilters": "filter list of topics if matches current search <br/>(<b>{countActiveFilters}</b> filters)",
    "order_by": "order by",
    "sort_name_asc": "Main word, A-Z",
    "sort_name_desc": "Main word, Z-A",
    "sort_count_desc": "Number of articles, highest first",
    "sort_count_asc": "Number of articles, lowest first",
    "max_nodes": "visualized topics"
  }
}
</i18n>
