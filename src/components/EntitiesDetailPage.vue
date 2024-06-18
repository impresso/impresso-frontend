<template>
  <i-layout-section v-if="entity" main>

    <template v-slot:header>
      <div class="border-bottom bg-light">
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
    </template>

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
                    <div :style="preferredImageStyle"/>
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
                    <b-button variant="outline-primary" size="sm" target="_blank"
                      v-if="entity.wikidata.coordinates"
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
              :domain="[startYear, endYear]"
              :contrast="false"
              :values="timevalues">
          <template v-slot="tooltipScope">
            <div v-if="tooltipScope.tooltip.item">
              {{ $d(tooltipScope.tooltip.item?.t ?? 0, 'year') }} &middot;
              <b>{{ tooltipScope.tooltip.item?.w ?? 0 }}</b>
            </div>
          </template>
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
import Facet from '@/models/Facet';
import SearchQuery from '@/models/SearchQuery';
import Timeline from '@/components/modules/Timeline.vue';
import Pagination from '@/components/modules/Pagination.vue';
import ArticleItem from '@/components/modules/lists/ArticleItem.vue';
import MentionItem from '@/components/modules/lists/MentionItem.vue';
import StackedBarsPanel from '@/components/modules/vis/StackedBarsPanel.vue';
import { searchFacets as searchFacetsService } from '@/services';
import { mapStores } from 'pinia'
import { useEntitiesStore } from '@/stores/entities'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const TAB_ARTICLES = 'articles';
const TAB_MENTIONS = 'mentions';
const TAB_OVERVIEW = 'overview';

export default {
  props: {
    facetTypes: {
      type: Array,
      default: () => ['country', 'language', 'type', 'person', 'location', 'topic', 'partner', 'accessRight', 'collection'],
    },
  },
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
    facets: [],
  }),
  components: {
    Timeline,
    Pagination,
    ArticleItem,
    MentionItem,
    StackedBarsPanel,
  },
  computed: {
    ...mapStores(useEntitiesStore, useSettingsStore, useUserStore),
    startYear() {
      return window.impressoDocumentsYearSpan.firstYear;
    },
    endYear() {
      return window.impressoDocumentsYearSpan.lastYear;
    },
    preferredImageStyle() {
      return {
        backgroundColor: 'black',
        backgroundSize: 'cover',
        width:'120px',
        height: '120px',
        backgroundImage: `url('http://commons.wikimedia.org/wiki/Special:FilePath/${this.preferredImage.value}?height=120px')`,
      };
    },
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
      return this.settingsStore.language_code
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
      return this.entitiesStore.loadDetail(this.$route.params.entity_id);
    },
    async loadFacets() {
      this.entitiesStore.loadTimeline(this.$route.params.entity_id).then((values) => {
        this.timevalues = values;
      });
      this.facets = [];
      const query = {
        facets: this.facetTypes,
        filters: [{
          type: 'entity',
          q: [ this.$route.params.entity_id ],
        }],
        // group_by: 'articles',
      };

      this.facets = await searchFacetsService.find({ query })
        .then(response => response.data.map(item => new Facet(item)))
    },
    loadItems(page = 1) {
      if (this.tab.name === TAB_ARTICLES) {
        return this.loadArticles(page);
      } else if (this.tab.name === TAB_MENTIONS) {
        return this.loadMentions(page);
      }
      return this.loadFacets();
    },
    loadArticles(page = 1) {
      return this.entitiesStore.loadEntityArticles({
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
      return this.entitiesStore.loadEntityMentions({
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
      return this.userStore.userData
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

<i18n lang="json">
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
