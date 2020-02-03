<template lang="html">
  <i-layout-section>
    <b-navbar type="light" variant="light" class="py-0 border-bottom">
      <b-navbar-nav class="py-3 pr-auto" v-html="$t('collected_items_title')">
      </b-navbar-nav>
    </b-navbar>

    <b-navbar type="light" variant="light" class="px-0 py-0 border-bottom">
      <b-navbar-nav class="p-3 border-right">
        <li>
          <label v-html="$tc('items', collectionsMerged.countItems) "></label>
        </li>
      </b-navbar-nav>
      <b-navbar-nav class="p-3">
        <label class="mr-1">{{$t("label_display")}}</label>
        <b-form-radio-group v-model="displayStyle" button-variant="outline-primary" size="sm" buttons>
          <b-form-radio value="list">{{$t("display_button_list")}}</b-form-radio>
          <b-form-radio value="tiles">{{$t("display_button_tiles")}}</b-form-radio>
        </b-form-radio-group>
      </b-navbar-nav>
    </b-navbar>
    <div class="collection-group">
      <b-container fluid>
        <b-row v-if="displayStyle === 'list-not-implemented-because-buggy'">
          <b-col
            cols="12"
            v-for="(article, i) in articles"
            v-bind:key="i">
            <search-results-list-item v-on:click="gotoArticle(article)" v-model="articles[i]" />
          </b-col>
        </b-row>

        <b-row class="pb-5">
          <b-col
            cols="6"
            sm="12"
            md="4"
            lg="3"
            v-for="(article, i) in articles"
            v-bind:key="i">
            <search-results-tiles-item v-on:click="gotoArticle(article)" v-model="articles[i]" />
            <!-- {{ article }} -->
          </b-col>
        </b-row>
      </b-container>
    </div>

    <pre>{{ collectionsMerged }}</pre>

  </i-layout-section>
</template>

<script>
import Collection from '@/models/Collection';
import SearchResultsListItem from './modules/SearchResultsListItem';
import SearchResultsTilesItem from './modules/SearchResultsTilesItem';

export default {
  components: {
    SearchResultsListItem,
    SearchResultsTilesItem,
  },
  data: () => ({
    collectionsMerged: new Collection(),
  }),
  computed: {
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
    // collectionAll: {
    //   get() {
    //     let articles = 0;
    //     let entities = 0;
    //     let issues = 0;
    //     let pages = 0;
    //
    //     this.collections.forEach((item) => {
    //
    //       articles += item.countArticles;
    //       entities += item.countEntities;
    //       issues += item.countIssues;
    //       pages += item.countPages;
    //     });
    //
    //     return new Collection({
    //       uid: 'all',
    //       name: 'All Collections',
    //       description: 'This shows a combination of all your custom collections',
    //       countArticles: articles,
    //       countEntities: entities,
    //       countPages: pages,
    //       countIssues: issues,
    //     });
    //   },
    // },
    articles: {
      get() {
        return this.collectionsMerged.items.filter(item => (item.labels && item.labels[0] === 'article'));
      },
    },
  },
  watch: {
    $route: {
      immediate: true,
      async handler() {
        await this.getCollectionItems();
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
    async getCollectionItems() {
      this.collections.forEach((c) => {

        this.collectionsMerged.countItems += c.countItems;

        // const res = this.$store.dispatch('collections/LOAD_COLLECTION', c);
        // this.collectionsMerged.items.push(res.items);

        this.$store.dispatch('collections/LOAD_COLLECTION', c).then((res) => {
          // console.log('res', res);
          this.collectionsMerged.items.push(res.items);
        });

      });
    }
  },
};
</script>

<style lang="scss">
</style>

<i18n>
{
  "en": {
    "collections": "collections",
    "collected_items_title": "<strong>Collected items</strong> – List all items in personal collections.",
    "label_display": "Display As",
    "display_button_list": "List",
    "display_button_tiles": "Tiles",
    "items": "No item | <b>1</b> item | <b>{n}</b> items"
  }
}
</i18n>
