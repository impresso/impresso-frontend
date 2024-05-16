<template lang="html">
  <i-layout-section main>
    <div slot="header">
      <b-navbar>
        <section>
          <span class="label small-caps">
            <router-link v-bind:to="{ name: 'topics' }">&larr; {{$t("topics")}}</router-link>
          </span>
          <h3><b-badge>{{ topic.language }}</b-badge> "{{ topic.getHtmlExcerpt() }} ..."</h3>
        </section>
      </b-navbar>

      <b-tabs pills class="mx-3">
        <template v-slot:tabs-end>
          <b-nav-item v-for="(tabItem, i) in tabs" :key="i" class="pl-2"
            :class="{ active: tabItem.name === tab.name }"
            active-class='none'
            :to="{ name: 'topic', params: { topic_uid: topic.uid }, query: { tab: tabItem.name }}">
            <span v-html="tabItem.label"/>
          </b-nav-item>
        </template>
      </b-tabs>

      <b-navbar type="light" variant="light" class="px-3 py-0 border-bottom">
        <b-navbar-nav>
          <b-nav-form class="p-2 border-right">
            <b-button size="sm" variant="outline-primary" v-on:click='applyFilter()'>
              {{ $t('actions.addToCurrentFilters') }}
            </b-button>
          </b-nav-form>
          <b-nav-form class="p-2 border-right">
            <router-link class="btn btn-outline-primary btn-sm" :to="searchPageLink">
              {{ $t('actions.searchMore') }}
            </router-link>
          </b-nav-form>
          <b-nav-form v-if="tab.name === TAB_ARTICLES" class="p-2 border-right">
            <label >{{ $t('order by') }}&nbsp;</label>
            <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </b-nav-form>
          <!-- <b-nav-item>
            <b-form-group class="mx-3">
              <b-form-checkbox v-model="applyCurrentSearchFilters">
                {{ $t('labels.applyCurrentSearchFilters') }}
              </b-form-checkbox>
            </b-form-group>
          </b-nav-item> -->
        </b-navbar-nav>

      </b-navbar>
    </div>

    <div v-if="tab.name === TAB_ARTICLES" class="mb-5">
      <div v-for="(article, idx) in articles" :key="idx" class="p-3 mb-2 border-bottom">
        <article-item :item="article"
          show-meta show-topics
          show-excerpt show-entities
          show-matches show-link
        />
      </div>
      <div class="fixed-pagination-footer p-1 mb-2 m-0">
        <pagination
          v-bind:perPage="limit"
          v-bind:currentPage="page"
          v-bind:totalRows="total"
          v-on:change="onInputPagination"
          v-bind:showDescription="false" />
      </div>
    </div>

    <div v-else-if="tab.name === TAB_OVERVIEW" class="p-3 m-3">
      <div class="mb-2">
        <h3 class="m-0 tb-title small-caps font-weight-bold">List of words</h3>
        <p class="description small">Top words ...</p>
      </div>
      <ellipsis >
        <div class="d-inline-block word"  v-for="(word, idx) in topic.words" :key="idx">
          <span :style='{opacity: word.l}'>{{ word.w }}</span>
          <!-- <span :style='{fontSize: (word.l + 0.5) + "em"}'>{{ word.w }}</span> -->
          <!-- <span class="word-probability">{{word.p}}</span> -->
          <span v-if="idx < topic.words.length - 1">&middot;&nbsp;</span>
        </div>

        <span class="label small-caps">
          {{$t("model")}} {{ topic.model }}
        </span>
      </ellipsis>

      <div class="mt-4 border-top pt-3">
        <h3 class="m-0 tb-title small-caps font-weight-bold">articles per year</h3>
        <p class="description small">number of articles where this topic is relevant</p>
      </div>
      <timeline
            :domain="[startYear, endYear]"
            :contrast="false"
            :values="timevalues">
        <div slot-scope="tooltipScope">
          <div v-if="tooltipScope.tooltip.item">
            {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
            <b>{{ tooltipScope.tooltip.item.w }}</b>
          </div>
        </div>
      </timeline>
      <b-container fluid class="my-3">
        <!-- <h2>Facets – top ten buckets</h2> -->
        <b-row>
          <b-col sm="12" md="12" lg="6" xl="4" v-for="(facet, idx) in facets" v-bind:key="idx">
            <stacked-bars-panel
              class=""
              :label="facet.type"
              :buckets="facet.buckets"
              :facet-type="facet.type"/>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </i-layout-section>
</template>

<script>
import SearchQuery from '@/models/SearchQuery';
import Topic from '@/models/Topic';
import Facet from '@/models/Facet';
import Pagination from './modules/Pagination';
import ArticleItem from './modules/lists/ArticleItem';
import Ellipsis from './modules/Ellipsis';
import Timeline from './modules/Timeline';
import StackedBarsPanel from '@/components/modules/vis/StackedBarsPanel';
import { searchQueryHashGetter, mapFilters } from '@/logic/queryParams'
import { containsFilter } from '@/logic/filters'
import { searchFacets as searchFacetsService } from '@/services'

const TAB_ARTICLES = 'articles';
const TAB_OVERVIEW = 'overview';

export default {
  props: {
    facetTypes: {
      type: Array,
      default: () => ['country', 'language', 'type', 'person', 'location', 'topic', 'partner', 'accessRight', 'collection'],
    },
  },
  data: () => ({
    submitted: false,
    topic: new Topic(),
    articles: [],
    timevalues: [],
    tab: {},
    total: 0,
    page: 1,
    limit: 10,
    orderBy: '-relevance',
    timeline: [],
    applyCurrentSearchFilters: false,
    facets: [],
    TAB_ARTICLES,
    TAB_OVERVIEW,
  }),
  computed: {
    filters: mapFilters(),
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
    searchPageLink() {
      if (!this.topic) {
        return { name: 'search' };
      }
      return {
        name: 'search',
        query: SearchQuery.serialize({
          filters: [{ type: 'topic', q: this.topic.uid }],
        }),
      };
    },
    currentSearchHash: searchQueryHashGetter(),
    topicModel() {
      return this.$route.params.topic_model;
    },
    topicUid() {
      return this.$route.params.topic_uid;
    },
    tabs() {
      return [
        {
          label: this.$t('tabs.overview'),
          name: TAB_OVERVIEW,
        },
        {
          label: this.$tc('tabs.relatedArticles', this.total, {
            count: this.$n(this.total),
          }),
          name: TAB_ARTICLES,
        },
      ];
    },
    startYear() {
      return window.impressoDocumentsYearSpan.firstYear;
    },
    endYear() {
      return window.impressoDocumentsYearSpan.lastYear;
    }
  },
  methods: {
    async onInputPagination(page) {
      await this.getArticles({
        page,
      });
    },
    async loadFacets() {
      this.facets = [];
      const query = {
        filters: [{
          type: 'topic',
          q: [ this.topicUid ],
        }],
        // group_by: 'articles',
      };
      for (let facetType of this.facetTypes) {
        const result = await searchFacetsService.get(facetType, {
          query,
        }).then((facetType) => new Facet(facetType));
        this.facets = this.facets.concat(result);
      }
    },
    async loadTimeline() {
      return this.$store.dispatch('search/LOAD_TIMELINE', {
        filters: [
          {
            q: this.$route.params.topic_uid,
            type: 'topic',
          },
        ],
      }).then((values) => {
        this.timevalues = values;
      });
    },

    async getArticles({
      page = 1,
    } = {}) {
      // console.info('getArticles page', page);
      const response = await this.$store.dispatch('search/LOAD_ARTICLES', {
        filters: [
          {
            type: 'topic',
            q: this.$route.params.topic_uid,
          },
        ],
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

    applyFilter() {
      const newFilter = {
        type: 'topic',
        q: this.topic.uid,
      }

      this.filters = this.filters
        .filter(f => !containsFilter(newFilter)(f))
        .concat([newFilter]);
    },
  },
  watch: {
    $route: {
      immediate: true,
      async handler({ params, query }) {
        // always reload entity
        this.topic = await this.$store.dispatch('topics/LOAD_TOPIC', params.topic_uid);
        this.total = +this.topic.countItems;
        // set active tab
        const tabIdx = this.tabs.findIndex(d => d.name === query.tab);
        this.tab = tabIdx !== -1 ? this.tabs[tabIdx] : this.tabs[0];
        // reset item list
        if (this.tab.name === TAB_ARTICLES) {
          await this.getArticles();
        } else {
          await this.loadTimeline();
          await this.loadFacets();
        }
      },
      deep: true,
    },
    orderBy: {
      handler(val) {
        if (val) {
          this.getArticles();
        }
      },
    },
  },
  components: {
    Pagination,
    Ellipsis,
    ArticleItem,
    Timeline,
    StackedBarsPanel,
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
