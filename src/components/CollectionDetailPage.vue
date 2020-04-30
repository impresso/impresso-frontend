<template lang="html">
  <i-layout-section v-if="$route.params.collection_uid">

    <div slot="header">

      <b-navbar type="light" variant="light">

        <section>

          <span class="label small-caps">
            <router-link v-bind:to="{ name: 'collections' }">&larr; {{$t("Collections")}}</router-link>
          </span>

          <h3>{{collection.name}}</h3>

          <p>{{collection.description}}</p>

        </section>


        <section class="ml-auto py-3">

          <router-link :to="{ name: 'compare', query: { left: `c:${$route.params.collection_uid}`} }" class="float-right mb-1">
            <b-button
              variant="outline-info" size="sm"
              v-b-modal.confirmDelete>{{ $t('compare_collection') }}
            </b-button>
          </router-link>

          <b-dropdown size="sm" variant="outline-primary" :text="$t('edit_collection')" class="d-block" ref="edit_collection">
            <div class="modal-edit pt-2 px-3 background-light">
              <label for="collectionName">Name</label>
              <input type="text" name="collectionName" class="form-control mb-3"
                v-on:keyup.enter="save(collection)"
                v-model="collection.name">
              <label for="collectionDesc">Description</label>
              <textarea type="text" name="collectionDesc" class="form-control"
                v-on:keyup.enter="save(collection)"
                v-model="collection.description" />
              <b-button variant="outline-primary" size="sm" class="form-control my-3"
                v-on:click="save(collection)">{{ $t('update_collection') }}
              </b-button>
              <b-button
                class="form-control mb-3"
                variant="outline-danger" size="sm"
                v-on:click.alt="remove(collection)"
                v-on:click.exact="$bvModal.show('confirmDelete')">
                {{ $t('delete_collection') }}
              </b-button>
            </div>
          </b-dropdown>

        </section>

        <b-modal id="confirmDelete" v-on:ok="remove(collection)">
          {{this.$t('confirm_delete', [collection.name])}}
        </b-modal>
      </b-navbar>

      <b-tabs pills class="mx-3">
        <template v-slot:tabs-end>
          <b-nav-item v-for="(tabItem, i) in tabs" :key="i" class="pl-2"
            :class="{ active: tabItem.name === tab.name }"
            active-class='none'
            :to="{ name: 'collection', params: { collection_uid: $route.params.collection_uid }, query: { tab: tabItem.name }}">
            <span v-html="tabItem.label"/>
          </b-nav-item>
        </template>
      </b-tabs>

      <b-navbar type="light" variant="light" class="px-0 py-0 border-bottom">



        <b-navbar-nav class="ml-2">
          <b-nav-form class="p-2">
            <b-button size="sm" variant="outline-primary" v-on:click='applyFilter()'>
              {{ $t('actions.addToCurrentFilters') }}
            </b-button>
          </b-nav-form>
          <b-nav-form class="py-2 pr-2  border-right">
            <router-link class="btn btn-outline-primary btn-sm" :to="searchPageLink">
              {{ $t('actions.searchMore') }}
            </router-link>
          </b-nav-form>
        </b-navbar-nav>



        <b-navbar-nav v-if="tab.name === TAB_ARTICLES" class="ml-auto mr-2">
          <!-- <b-navbar-form class="p-2 border-right">
            <label class="mr-1">{{ $t('label_order') }}</label>
            <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </b-navbar-form> -->
          <ul class="p-2 ml-auto">
            <li class="ml-auto">
              <label class="mr-1">{{ $t('label_display') }}</label>
              <b-form-radio-group v-model="displayStyle" button-variant="outline-primary" size="sm" buttons>
                <b-form-radio value="list">{{$t("display_button_list")}}</b-form-radio>
                <b-form-radio value="tiles">{{$t("display_button_tiles")}}</b-form-radio>
              </b-form-radio-group>
            </li>
          </ul>
        </b-navbar-nav>

      </b-navbar>

    </div>

    <div v-if="tab.name === TAB_ARTICLES" class="collection-group">

      <div v-if="fetching">
        <i-spinner class="text-center m-5 p-5" />
      </div>

      <b-container v-else-if="paginationTotalRows > 0" fluid>
        <b-row v-if="displayStyle === 'list'">
          <b-col cols="12"
            v-for="(article, index) in articles"
            v-bind:key="`${index}-${article.uid}`">
            <search-results-list-item
              v-on:click="gotoArticle(article)"
              v-model="articles[index]" />
          </b-col>
        </b-row>

        <b-row class="pb-5" v-if="displayStyle === 'tiles'">
          <b-col cols="6" sm="12" md="4" lg="3"
            v-for="(article, index) in articles"
            v-bind:key="`${index}-${article.uid}`">
            <!-- {{article}} -->
            <search-results-tiles-item
              v-if="article.type === 'ar'"
              v-on:click="gotoArticle(article)"
              v-model="articles[index]" />
            <search-results-image-item
              v-if="article.type !== 'ar'"
              v-bind:searchResult="article"
              v-on:click="gotoArticle(article)"
              v-model="articles[index]" />
          </b-col>
        </b-row>
      </b-container>

      <div
        v-else
        class="p-4">
        <p class="text-center pt-4"><b>{{ $t('no_articles_in_collection')}}</b></p>
        <p class="text-center">{{ $t('no_articles_in_collection_long')}}</p>
      </div>

      <div class="my-5" />
      <div v-if="!fetching && paginationTotalRows > paginationPerPage" slot="footer" class="fixed-pagination-footer p-1 m-0">
        <pagination
          size="sm"
          v-bind:perPage="paginationPerPage"
          v-bind:currentPage="paginationCurrentPage"
          v-bind:totalRows="paginationTotalRows"
          v-on:change="onInputPagination"
          class="float-left small-caps" />
      </div>
    </div>




    <div v-else-if="tab.name === TAB_OVERVIEW" class="p-3 container">

      <timeline
            :domain="[startYear, endYear]"
            :values="timevalues">
        <div slot-scope="tooltipScope">
          <div v-if="tooltipScope.tooltip.item">
            {{ $d(tooltipScope.tooltip.item.t, 'year') }} &middot;
            <b>{{ tooltipScope.tooltip.item.w }}</b>
          </div>
        </div>
      </timeline>

      <div class="row">
        <div v-for="(facet, idx) in facets" v-bind:key="idx" class="col-6 my-3">
          <stacked-bars-panel
            class=""
            :label="facet.type"
            :buckets="facet.buckets"
            :facet-type="facet.type"/>
        </div>
      </div>

    </div>

    <div v-else-if="tab.name === TAB_RECOMMENDATIONS" class="collection-recommendations h-100">
      <collection-recommendations-panel :collection-id="$route.params.collection_uid"/>
    </div>
<!--

    <div v-if="issues.length > 0" class="collection-group">
      <h4>Issues</h4>
      <div class="grid">
        <div class="item" v-for="(issue, index) in issues" v-bind:key="index">
          {{issue}}
        </div>
      </div>
    </div>

    <div v-if="pages.length > 0" class="collection-group">
      <h4>Pages</h4>
      <div class="grid">
        <div class="item" v-for="(page, index) in pages" v-bind:key="index">
          <open-seadragon-viewer v-model="page.iiif" />
        </div>
      </div>
    </div> -->

  </i-layout-section>
</template>

<script>
import Collection from '@/models/Collection';
import SearchResultsListItem from './modules/SearchResultsListItem';
import SearchResultsTilesItem from './modules/SearchResultsTilesItem';
import SearchResultsImageItem from './modules/SearchResultsImageItem';
import Pagination from './modules/Pagination';
import SearchQuery from '@/models/SearchQuery';
import Timeline from './modules/Timeline';
import StackedBarsPanel from './modules/vis/StackedBarsPanel';
import { mapFilters } from '@/logic/queryParams'
import { containsFilter } from '@/logic/filters'
import CollectionRecommendationsPanel from '@/components/modules/collections/CollectionRecommendationsPanel'


const TAB_ARTICLES = 'articles';
const TAB_OVERVIEW = 'overview';
const TAB_RECOMMENDATIONS = 'recommendations';

export default {
  props: {
    startYear: {
      type: Number,
      default: 1740,
    },
    endYear: {
      type: Number,
      default: 2020,
    },
  },
  data: () => ({
    tab: {},
    collection: new Collection(),
    fetching: false,
    TAB_ARTICLES,
    TAB_OVERVIEW,
    TAB_RECOMMENDATIONS,
    timevalues: [],
    facets: [],
    facetTypes: ['newspaper', 'country', 'type', 'language', 'person', 'location', 'topic', 'partner', 'accessRight'],
  }),
  components: {
    SearchResultsListItem,
    SearchResultsTilesItem,
    SearchResultsImageItem,
    Pagination,
    Timeline,
    StackedBarsPanel,
    CollectionRecommendationsPanel,
  },
  computed: {
    filters: mapFilters(),
    searchPageLink() {
      if (!this.collection) {
        return { name: 'search' };
      }
      return {
        name: 'search',
        query: SearchQuery.serialize({
          filters: [{ type: 'collection', q: this.collection.uid }],
        }),
      };
    },
    collections: {
      get() {
        return this.$store.getters['collections/collections'];
      },
    },
    displayStyle: {
      get() {
        return this.$store.state.search.displayStyle;
      },
      set(displayStyle) {
        this.$store.commit('search/UPDATE_SEARCH_DISPLAY_STYLE', displayStyle);
      },
    },
    // pages: {
    //   get() {
    //     return this.collection.items.filter(item => (item.labels && item.labels[0] === 'page'));
    //   },
    // },
    articles: {
      get() {
        return this.$store.getters['collections/collectionItems'];
      },
    },
    // issues: {
    //   get() {
    //     return this.collection.items.filter(item => (item.labels && item.labels[0] === 'issue'));
    //   },
    // },
    paginationPerPage: {
      get() {
        return this.$store.state.collections.paginationPerPage;
      },
    },
    paginationCurrentPage: {
      get() {
        return this.$store.state.collections.paginationCurrentPage;
      },
      set(val) {
        this.$store.commit('collections/UPDATE_PAGINATION_CURRENT_PAGE', val);
      },
    },
    paginationTotalRows: {
      get() {
        return this.$store.state.collections.paginationTotalRows;
      },
    },
    // orderByOptions: {
    //   get() {
    //     return [
    //       {
    //         value: 'dateAdded',
    //         text: `${this.$t('sort_dateAdded')} ${this.$t('sort_asc')}`,
    //         disabled: true,
    //       },
    //       {
    //         value: '-dateAdded',
    //         text: `${this.$t('sort_dateAdded')} ${this.$t('sort_desc')}`,
    //         disabled: true,
    //       },
    //       {
    //         value: 'itemDate',
    //         text: `${this.$t('sort_date')} ${this.$t('sort_asc')}`,
    //         disabled: true,
    //       },
    //       {
    //         value: '-itemDate',
    //         text: `${this.$t('sort_date')} ${this.$t('sort_desc')}`,
    //         disabled: true,
    //       },
    //     ];
    //   },
    // },
    // orderBy: {
    //   get() {
    //     return this.$store.state.collections.orderBy;
    //   },
    //   set(val) {
    //     this.$store.commit('collections/UPDATE_ITEMS_ORDER_BY', val);
    //     this.getCollectionItems(1);
    //   },
    // },
    tabs() {
      return [
        {
          label: this.$t('tabs.overview'),
          name: TAB_OVERVIEW,
        },
        {
          label: this.$tc('tabs.articles', this.collection.countItems, {
            count: this.$n(this.collection.countItems),
          }),
          name: TAB_ARTICLES,
        },
        {
          label: this.$t('tabs.recommendations'),
          name: TAB_RECOMMENDATIONS,
        }
      ];
    },
  },
  watch: {
    $route: {
      immediate: true,
      async handler({ query }) {
        if (this.collection.uid !== this.$route.params.collection_uid) {
          this.timevalues = [];
          this.facets = [];
          this.paginationCurrentPage = 1;
          this.getCollection();
          await this.getCollectionItems();
          await this.loadTimeline();
          this.facetTypes.forEach((type) => {
            this.loadFacets(type);
          });
          //
          // await this.loadFacets('newspaper');
          // await this.loadFacets('topic');
          // await this.loadFacets('location');
          // await this.loadFacets('person');
        }
        // set active tab
        const tabIdx = this.tabs.findIndex(d => d.name === query.tab);
        this.tab = tabIdx !== -1 ? this.tabs[tabIdx] : this.tabs[0];
        // reset item list
        // if (this.tab.name === TAB_ARTICLES && this.collection.items === []) {
        // }
        // if (this.tab.name === TAB_OVERVIEW && this.timevalues === []) {
        // }
      },
    },
  },
  methods: {
    getCollectionItems(page) {
      this.fetching = true;
      if (page !== undefined) {
        this.$store.commit('collections/UPDATE_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      }
      this.$store.dispatch('collections/LOAD_COLLECTION', this.collection).then((res) => {
        this.collection = res;
        this.fetching = false;
      });
    },
    getCollection() {
      this.collection = {
        uid: this.$route.params.collection_uid,
        items: [],
      };
    },
    gotoArticle(article) {
      this.$router.push({
        name: 'article',
        params: {
          issue_uid: article.issue.uid,
          page_number: article.pages[0].num,
          page_uid: article.pages[0].uid,
          article_uid: article.uid,
        },
      });
    },
    remove(collection) {
      this.$store.dispatch('collections/DELETE_COLLECTION', collection.uid).then(() => {
        this.$store.dispatch('collections/LOAD_COLLECTIONS').then(() => {
          this.$router.push({
            name: 'collections',
          });
        });
      });
    },
    save(collection) {
      if (collection.uid) {
        this.$store.dispatch('collections/EDIT_COLLECTION', {
          uid: collection.uid,
          name: collection.name,
          description: collection.description,
        }).then((res) => {
          const idx = this.collections.findIndex(c => c.uid === res.uid);
          this.collections[idx].name = res.name;
          this.collections[idx].description = res.description;
        });
      } else {
        this.$store.dispatch('collections/ADD_COLLECTION', {
          name: collection.name,
          description: collection.description,
        }).then((res) => {
          this.fetch().then(() => {
            this.select(new Collection(res.data)); // select the newly created item
          });
        });
      }
      this.$refs.edit_collection.hide(true);
    },
    sortBy(data, field) {
      data.sort((a, b) => {
        if (a[field] < b[field]) {
          return 1;
        } else if (a[field] > b[field]) {
          return -1;
        }
        return 0;
      });
      return data;
    },
    onInputPagination(page = 1) {
      this.getCollectionItems(page);
    },
    applyFilter() {
      const newFilter = {
        type: 'collection',
        q: this.collection.uid,
      }

      this.filters = this.filters
        .filter(f => !containsFilter(newFilter)(f))
        .concat([newFilter]);
    },
    loadTimeline() {
      return this.$store.dispatch('collections/LOAD_TIMELINE', this.$route.params.collection_uid).then((values) => {
        this.timevalues = values;
      });
    },
    // loadFacets(type) {
    //   return this.$store.dispatch('collections/LOAD_FACETS',
    //     {
    //       q: this.$route.params.collection_uid,
    //       type: type,
    //     }).then((r) => {
    //     this.facets.push(r);
    //     console.log(r);
    //   });
    // },
    // loadTopics() {
    //   return this.$store.dispatch('collections/LOAD_TOPICS', this.$route.params.collection_uid).then((topics) => {
    //     this.facets.push(topics);
    //   });
    // },
    // loadEntities() {
    //   return this.$store.dispatch('collections/LOAD_ENTITIES', this.$route.params.collection_uid).then(([locationFacet, personFacet]) => {
    //     this.facets.push(locationFacet, personFacet);
    //     // console.log(this.facets);
    //   });
    // },
    loadFacets(facetType) {
      return this.$store.dispatch('collections/LOAD_FACETS', {q: this.$route.params.collection_uid, type: facetType})
        .then((r) => {
          this.facets.push(r);
          // console.log(this.facets);
        });
    },
  },
};
</script>

<style lang="scss">
.modal-edit {
  min-width: 400px;
}
.collection-recommendation{
  overflow:hidden;
}
</style>

<i18n>
{
  "en": {
    "collections": "collections",
    "label_order": "Order By",
    "sort_date": "Item Date",
    "sort_dateAdded": "Date Added",
    "sort_asc": "Ascending",
    "sort_desc": "Descending",
    "label_display": "Display As",
    "display_button_list": "List",
    "display_button_tiles": "Tiles",
    "articles": "No article | <b>1</b> article | <b>{n}</b> articles",
    "edit_collection": "Collection Settings",
    "update_collection": "Update Collection Note",
    "delete_collection": "Delete Collection [alt/option to bypass confirmation]",
    "compare_collection": "Compare with ...",
    "confirm_delete": "Are you sure you want to delete collection '{0}'?",
    "no_articles_in_collection": "No items in collection yet.",
    "no_articles_in_collection_long": "Articles you add to collection will be listed here."
  },
  "nl": {
    "collections": "Sammelingen",
    "confirm_delete": "Weet je zeker dat je wilt verwijderen?"
  }
}
</i18n>
