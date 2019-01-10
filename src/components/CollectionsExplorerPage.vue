<template lang="html">
  <i-layout-section class="p-3">
    <div class="mx-3">
      <h1>Collected items</h1>
      <p>List all items in all collections. (Currently limited to articles)</p>
      <!-- <pre>{{ this.collectionAll.items.filter(item => (item.labels && item.labels[0] === 'article')) }}</pre> -->
    </div>

    <div class="collection-group">
      <b-container class="px-3 py-2 border-bottom border-top">
        <b-row>
          <b-col class="text-muted">
            <b>{{ $tc('articles', articles.length) }}</b>
          </b-col>
          <b-col class="text-right">
            <label class="mr-2">{{$t("label_display")}}</label>
            <b-form-radio-group v-model="displayStyle" button-variant="outline-primary" size="sm" buttons>
              <b-form-radio value="list">{{$t("display_button_list")}}</b-form-radio>
              <b-form-radio value="tiles">{{$t("display_button_tiles")}}</b-form-radio>
            </b-form-radio-group>
          </b-col>
        </b-row>
      </b-container>

      <b-container fluid>
        <b-row v-if="displayStyle === 'list'">
          <b-col cols="12" v-for="(article, index) in articles">
            <search-results-list-item v-on:click="gotoArticle(article)" v-model="articles[index]" />
          </b-col>
        </b-row>

        <b-row class="pb-5" v-if="displayStyle === 'tiles'">
          <b-col cols="6" sm="12" md="4" lg="3" v-for="(article, index) in articles">
            <search-results-tiles-item v-on:click="gotoArticle(article)" v-model="articles[index]" />
            <!-- {{ article }} -->
          </b-col>
        </b-row>
      </b-container>
    </div>

    <pre>{{ this.collectionAll.items }}</pre>

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
    // collections: {
    //   get() {
    //     return this.$store.getters['collections/collections'].filter(
    //       c => c.name.toLowerCase().indexOf(this.search.toLowerCase()) !== -1);
    //   },
    // },
    collectionAll: {
      get() {
        let articles = 0;
        let entities = 0;
        let issues = 0;
        let pages = 0;

        this.collections.forEach((item) => {
          articles += item.countArticles;
          entities += item.countEntities;
          issues += item.countIssues;
          pages += item.countPages;

          this.$store.dispatch('collections/LOAD_COLLECTION', item).then((res) => {
            res.items.forEach((item_) => {
              this.collectionsMerged.items.push(item_);
            });
          });
        });

        return new Collection({
          uid: 'all',
          name: 'All Collections',
          description: 'This shows a combination of all your custom collections',
          countArticles: articles,
          countEntities: entities,
          countPages: pages,
          countIssues: issues,
        });
      },
    },
    articles: {
      get() {
        return this.collectionsMerged.items.filter(item => (item.labels && item.labels[0] === 'article'));
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
  },
};
</script>

<style lang="css">
</style>

<i18n>
{
  "en": {
    "collections": "collections",
    "label_display": "Display As",
    "display_button_list": "List",
    "display_button_tiles": "Tiles",
    "articles": "No articles | One article | {n} articles"
  }
}
</i18n>
