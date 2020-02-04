<template lang="html">
  <i-layout-section>
    <div slot="header">
      <b-navbar type="light" variant="light" class="border-bottom">
        <b-navbar-nav class="py-3 pr-auto" v-html="$t('collected_articles_title')">
        </b-navbar-nav>
      </b-navbar>

      <b-navbar type="light" variant="light" class="px-0 py-0 border-bottom">
        <b-navbar-nav class="p-3 border-right">
          <li>
            <label v-html="$tc('items', paginationTotalRows) "></label>
          </li>
        </b-navbar-nav>
        <b-navbar-nav class="p-3">
          <li><label class="mr-1">{{ $t('label_order') }}</label>
            <i-dropdown v-model="orderBy" v-bind:options="orderByOptions" size="sm" variant="outline-primary"></i-dropdown>
          </li>
        </b-navbar-nav>
        <b-navbar-nav class="p-3 border-left ml-auto">
          <label class="mr-1">{{$t("label_display")}}</label>
          <b-form-radio-group v-model="displayStyle" button-variant="outline-primary" size="sm" buttons>
            <b-form-radio value="list">{{$t("display_button_list")}}</b-form-radio>
            <b-form-radio value="tiles">{{$t("display_button_tiles")}}</b-form-radio>
          </b-form-radio-group>
        </b-navbar-nav>
      </b-navbar>
    </div>
    <div class="collection-group">
      <b-container fluid>
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
      <div class="my-5" />
      <div v-if="paginationTotalRows > paginationPerPage" slot="footer" class="fixed-pagination-footer p-1 m-0">
        <pagination
          size="sm"
          v-bind:perPage="paginationPerPage"
          v-bind:currentPage="paginationCurrentPage"
          v-bind:totalRows="paginationTotalRows"
          v-on:change="onInputPagination"
          class="float-left small-caps" />
      </div>
    </div>

  </i-layout-section>
</template>

<script>
import Collection from '@/models/Collection';
import SearchResultsListItem from './modules/SearchResultsListItem';
import SearchResultsTilesItem from './modules/SearchResultsTilesItem';
import SearchResultsImageItem from './modules/SearchResultsImageItem';
import Pagination from './modules/Pagination';

export default {
  components: {
    SearchResultsListItem,
    SearchResultsTilesItem,
    SearchResultsImageItem,
    Pagination,
  },
  data: () => ({
    collectionsMerged: new Collection(),
  }),
  computed: {
    articles: {
      get() {
        return this.collectionsMerged.items.filter(item => (item.labels && item.labels[0] === 'article'));
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
    collections: {
      get() {
        return this.$store.getters['collections/collections'];
      },
    },
    paginationPerPage: {
      get() {
        return this.$store.state.collections.paginationPerPage;
      },
    },
    paginationCurrentPage: {
      get() {
        return this.$store.state.collections.paginationCurrentPage;
      },
    },
    paginationTotalRows: {
      get() {
        return this.$store.state.collections.paginationTotalRows;
      },
    },
    orderByOptions: {
      get() {
        return [
          {
            value: 'dateAdded',
            text: `${this.$t('sort_dateAdded')} ${this.$t('sort_asc')}`,
            disabled: true,
          },
          {
            value: '-dateAdded',
            text: `${this.$t('sort_dateAdded')} ${this.$t('sort_desc')}`,
            disabled: true,
          },
          {
            value: 'itemDate',
            text: `${this.$t('sort_date')} ${this.$t('sort_asc')}`,
            disabled: true,
          },
          {
            value: '-itemDate',
            text: `${this.$t('sort_date')} ${this.$t('sort_desc')}`,
            disabled: true,
          },
        ];
      },
    },
    orderBy: {
      get() {
        return this.$store.state.collections.orderBy;
      },
      set(val) {
        this.$store.commit('collections/UPDATE_ITEMS_ORDER_BY', val);
        this.getCollectionItems(1);
      },
    },
  },
  watch: {
    $route: {
      immediate: true,
      async handler() {
        await this.getCollectionsItems();
      },
    },
  },
  methods: {
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
    getCollectionsItems(page) {
      if (page !== undefined) {
        this.$store.commit('collections/UPDATE_PAGINATION_CURRENT_PAGE', parseInt(page, 10));
      }
      this.$store.dispatch('collections/LOAD_COLLECTIONS_ITEMS').then((res) => {
        this.collectionsMerged.items = res;
      });
    },
    onInputPagination(page = 1) {
      this.getCollectionsItems(page);
    },
  },
};
</script>

<style lang="scss">
</style>

<i18n>
{
  "en": {
    "collections": "collections",
    "collected_articles_title": "<strong>Collected articles</strong> – List all articles in your personal collections.",
    "label_order": "Order By",
    "sort_date": "Item Date",
    "sort_dateAdded": "Date Added",
    "sort_asc": "Ascending",
    "sort_desc": "Descending",
    "label_display": "Display As",
    "display_button_list": "List",
    "display_button_tiles": "Tiles",
    "items": "No item | <b>1</b> item | <b>{n}</b> items"
  }
}
</i18n>
