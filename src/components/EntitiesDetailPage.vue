<template lang="html">
  <i-layout-section v-if="entity" main>
    <div slot="header" class="border-bottom bg-light">
      <b-navbar type="light" variant="light">
        <section>
          <h3 v-if="entity">
            <span v-html="entity.name" />
            <span class="badge small-caps ml-1 bg-medium badge-light">
              {{ $t(`types.${entity.type}`) }}
            </span>
          </h3>

        </section>
      </b-navbar>

      <b-tabs pills>
        <template v-slot:tabs-end>
          <b-nav-item v-for="(tabItem, i) in tabs" :key="i" class="pl-2"
            :class="{ active: tabItem.name === tab.name }"
            active-class='none'
            :to="{ name: 'entity', params: { entity_id: entity.uid }, query: { tab: tabItem.name }}">
            <span v-html="tabItem.label"/>
          </b-nav-item>
        </template>
      </b-tabs>
      <!-- navbars below the pills tabs -->
      <b-navbar>
        <b-navbar-nav class="pr-2 border-right">
          <li>
            <router-link class="btn btn-outline-primary btn-sm" :to="searchPageLink">
              {{ $t('actions.searchMore') }}
            </router-link>
          </li>
        </b-navbar-nav>
        <b-navbar v-if="tab.name === 'overview'">
          <div v-if="description">
            "<span v-html="description" />" (wikidata)
          </div>
        </b-navbar>
        <b-navbar-nav v-if="tab.name === 'articles' || tab.name === 'mentions'" class="px-2 ">
          <li>
            <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </li>
        </b-navbar-nav>
      </b-navbar>
    </div>

    <!-- BODY ILayout-->
    <div class="items p-3">
      <div v-if="tab.name === 'articles'">
        <div v-for="(item, index) in items" :key="index">
          <article-item :item="item" show-meta show-excerpt show-entities show-matches show-link class="mb-2 pb-2 border-bottom"/>
        </div>
      </div>

      <div v-if="tab.name === 'overview'">
        <b-navbar class="wikibox border-bottom py-3">
          <section class="d-flex flex-row w-100" v-if="entity.wikidata">
                  <div class="w-25" v-if="preferredImage">
                    <!-- <iframe
                      v-if="entity.wikidata.coordinates"
                      width="300" height="250"
                      :src="`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&marker=${entity.wikidata.coordinates.latitude},${entity.wikidata.coordinates.longitude}`"
                      class="border mb-2">
                    </iframe> -->
                    <img
                      :title="preferredImage.value"
                      :src="`http://commons.wikimedia.org/wiki/Special:FilePath/${preferredImage.value}?width=300px`" width="98%">
                  </div>

                  <div class="w-75 pl-2">
                    <p v-if="entity.wikidata.descriptions">
                      <span class="text-serif px-1 mr-1 bg-white border">W</span>
                      <br>
                      <strong>{{ entity.wikidata.labels[activeLanguageCode] }}</strong>
                      <br>
                      <em>{{ entity.wikidata.descriptions[activeLanguageCode] }}</em>
                    </p>
                    <p>
                      <a
                        v-if="entity.wikidata.birthPlace"
                        :href="`https://www.wikidata.org/wiki/${this.entity.wikidata.birthPlace.id}`"
                        target="_blank">
                        {{ entity.wikidata.birthPlace.labels[activeLanguageCode] }},</a>
                      <span v-if="entity.wikidata.birthDate">
                        {{ parseWkDate(entity.wikidata.birthDate) }} -
                      </span>
                      <a
                        v-if="entity.wikidata.deathPlace"
                        :href="`https://www.wikidata.org/wiki/${this.entity.wikidata.deathPlace.id}`"
                        target="_blank">
                        {{ entity.wikidata.deathPlace.labels[activeLanguageCode] }},</a>
                      <span v-if="entity.wikidata.deathDate">
                      {{ parseWkDate(entity.wikidata.deathDate) }}
                      </span>
                    </p>
                    <b-button
                      v-if="entity.wikidata.coordinates"
                      variant="outline-primary" size="sm" target="_blank"
                      :href="`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&marker=${entity.wikidata.coordinates.latitude},${entity.wikidata.coordinates.longitude}`">
                      OpenStreetMaps
                    </b-button>
                    <a class="position-absolute border-top border-left px-2 small-caps bg-white"
                      style="right:0; bottom:0"
                        :href="`https://www.wikidata.org/wiki/${this.entity.wikidata.id}`"
                        target="_blank">
                        Source: <span class="text-serif">W</span>/{{entity.wikidata.id}}</a>
                    <!-- <pre class="small">{{mention}}</pre> -->
                  </div>


                  <!-- <pre class="small">{{ entity}}</pre> -->

          </section>
        </b-navbar>
        <timeline
              :contrast="false"
              :values="timevalues">
          <div slot-scope="tooltipScope">
            <div v-if="tooltipScope.tooltip.item">
              {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
              <b>{{ tooltipScope.tooltip.item.w }}</b>
            </div>
          </div>
        </timeline>
      </div>

      <div v-if="tab.name === 'mentions'">
        <div v-for="(item, index) in items" :key="index" class="border-bottom mb-3 pb-3">
          <mention-item :item="item" />
          <article-item :item="item.article" show-meta show-excerpt show-link as-reference class="bg-light p-2"/>
        </div>
      </div>
    </div>

    <template v-slot:footer>
      <div class="fixed-pagination-footer p-1 m-0 mb-2">
        <pagination
          v-bind:perPage="paginationList.perPage"
          v-bind:currentPage="paginationList.currentPage"
          v-bind:totalRows="paginationList.totalRows"
          v-on:change="onInputPagination"
          class="float-left small-caps" />
      </div>
    </template>

  </i-layout-section>

</template>

<script>
import SearchQuery from '@/models/SearchQuery';
import Timeline from './modules/Timeline';
import Pagination from './modules/Pagination';
import BaseTabs from './base/BaseTabs';
import ArticleItem from './modules/lists/ArticleItem';
import MentionItem from './modules/lists/MentionItem';


const TAB_ARTICLES = 'articles';
const TAB_MENTIONS = 'mentions';
const TAB_OVERVIEW = 'overview';

export default {
  data: () => ({
    entity: null,
    mentions: [],
    timevalues: [],
    tab: {},
    paginationList: {
      perPage: 10,
      currentPage: 1,
      totalRows: 0,
    },
    currentOrderBy: '-relevance',
    items: [],
  }),
  components: {
    Timeline,
    Pagination,
    BaseTabs,
    ArticleItem,
    MentionItem,
  },
  computed: {
    searchPageLink() {
      if (!this.entity) {
        return { name: 'search' };
      }
      return {
        name: 'search',
        query: SearchQuery.serialize({
          filters: [{ type: this.entity.type, q: this.entity.uid }],
        }),
      };
    },
    description() {
      if (!this.entity || !this.entity.wikidata || !this.entity.wikidata.descriptions) {
        return null;
      }
      return this.entity.wikidata.descriptions.en;
    },
    orderBy: {
      get() {
        return this.currentOrderBy;
      },
      set(value) {
        this.currentOrderBy = value;
        this.loadItems();
      },
    },
    orderByOptions() {
      const common = [
        {
          value: 'date',
          text: this.$t('sort.publicationDate.asc'),
        },
        {
          value: '-date',
          text: this.$t('sort.publicationDate.desc'),
        },
      ];

      if (this.tab.name === TAB_ARTICLES) {
        return [
          {
            value: 'relevance',
            text: this.$t('sort.relevanceArticles.asc'),
          },
          {
            value: '-relevance',
            text: this.$t('sort.relevanceArticles.desc'),
          },
          ...common,
        ];
      }
      return [
        {
          value: 'id',
          text: this.$t('sort.idMentions.asc'),
        },
        {
          value: '-id',
          text: this.$t('sort.idMentions.desc'),
        },
        ...common,
      ];
    },
    countMentions() {
      return this.$store.state.mentions.pagination.totalRows;
    },
    tabs() {
      return [
        {
          label: this.$t('tabs.overview'),
          name: TAB_OVERVIEW,
        },
        {
          label: this.$tc('tabs.articles', this.entity.countItems, {
            count: this.$n(this.entity.countItems),
          }),
          name: TAB_ARTICLES,
        },
        {
          label: this.$tc('tabs.mentions', this.entity.countMentions, {
            count: this.$n(this.entity.countMentions),
          }),
          name: TAB_MENTIONS,
        },
      ];
    },
    preferredImage() {
      if (this.entity.wikidata.images) {
        const el = this.entity.wikidata.images.find(im => im.rank === 'preferred');
        return el || this.entity.wikidata.images[0];
      }
      return null;
    },
    activeLanguageCode() {
      return this.$store.state.settings.language_code;
    },
    bbox() {
      if (!this.entity.wikidata) {
        return '';
      }
      const coords = this.entity.wikidata.coordinates;
      const bbox = `${coords.longitude - 2},${coords.latitude - 1},${coords.longitude + 2},${coords.latitude + 1}`;
      return bbox;
    },
  },
  methods: {
    getEntity() {
      return this.$store.dispatch('entities/LOAD_DETAIL', this.$route.params.entity_id);
    },
    loadItems(page = 1) {
      if (this.tab.name === TAB_ARTICLES) {
        return this.loadArticles(page);
      } else if (this.tab.name === TAB_MENTIONS) {
        return this.loadMentions(page);
      }
      return this.loadFacets();
    },
    loadFacets() {
      return this.$store.dispatch('entities/LOAD_TIMELINE', this.$route.params.entity_id).then((values) => {
        this.timevalues = values;
      });
    },
    loadArticles(page = 1) {
      return this.$store.dispatch('entities/LOAD_ENTITY_ARTICLES', {
        page,
        orderBy: this.currentOrderBy,
        filters: [
          {
            q: this.$route.params.entity_id,
            type: this.entity.type,
          },
        ],
      }).then((res) => {
        this.paginationList = {
          perPage: this.paginationList.perPage,
          currentPage: page,
          totalRows: res.total,
        };
        this.items = res.data;
      });
    },
    loadMentions(page = 1) {
      return this.$store.dispatch('entities/LOAD_ENTITY_MENTIONS', {
        page,
        orderBy: this.currentOrderBy,
        filters: [
          {
            q: this.$route.params.entity_id,
            type: 'entity',
          },
        ],
      }).then((res) => {
        this.paginationList = {
          perPage: this.paginationList.perPage,
          currentPage: page,
          totalRows: this.entity.countMentions,
        };
        console.info('RECEIVED', res);
        this.items = res.data;
      });
    },
    onInputPagination(page = 1) {
      return this.loadItems(page);
    },
    onHighlight(event, origin) {
      this.highlights.forEach((vis) => {
        if (vis !== origin) {
          this[`highlight${vis}`] = event.datum;
        }
      });
    },
    parseWkDate(wkDate) {
      let numYear = parseInt(wkDate.split('-')[0], 10);
      // console.info(numYear);
      if (isNaN(numYear)) {
        numYear = parseInt(wkDate.split('-')[1], 10) * -1;
        // console.info(numYear);
      }
      return numYear;
    },
    isLoggedIn() {
      return this.$store.state.user.userData;
    },
  },
  watch: {
    $route: {
      immediate: true,
      async handler({ query }) {
        // always reload entity
        this.entity = await this.getEntity();
        // set active tab
        const tabIdx = this.tabs.findIndex(d => d.name === query.tab);
        this.tab = tabIdx !== -1 ? this.tabs[tabIdx] : this.tabs[0];

        if (this.tab.name === TAB_ARTICLES) {
          this.currentOrderBy = '-relevance';
        } else if (this.tab.name === TAB_MENTIONS) {
          this.currentOrderBy = 'id';
        }
        // reset item list
        this.items = [];
        await this.loadItems();
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import "impresso-theme/src/scss/variables.sass";
.wikibox {
  background: $clr-bg-secondary;
}
a:hover {
  text-decoration: none;
}
</style>

<i18n>
{
  "en": {
    "count": "Mentioned only once {n} | Mentioned {n} times",
    "view": "View in context",
    "confidence": {
      "l": "low"
    },
    "tabs": {
        "mentions": "... mentions | mentioned only once | mentioned {count} times",
        "cooccurrences": "Cooccurrences",
        "articles": "... related articles | 1 related article | {count} related articles"
    }
  }
}
</i18n>
