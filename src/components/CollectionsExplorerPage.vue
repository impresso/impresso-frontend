<template lang="html">
  <i-layout-section>
    <b-navbar type="light" variant="light" class="border-bottom py-0">
      <b-navbar-nav class="py-3 pr-auto">
        <strong>Collected items</strong> – List all items in all collections. (Currently limited to articles)
      </b-navbar-nav>
    </b-navbar>

    <b-navbar type="light" variant="light" class="border-bottom py-0">
      <b-navbar-nav class="pr-auto">
        <span>{{ $tc('articles', articles.length) }}</span>
      </b-navbar-nav>
      <b-navbar-nav class="pl-3 py-3 border-left flex-row">
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
  watch: {
    collections() {
      this.collections.forEach((item) => {
        this.$store.dispatch('collections/LOAD_COLLECTION', item).then((res) => {
          res.items.forEach((item_) => {
            this.collectionsMerged.items.push(item_);
          });
        });
      });
    }
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

<style lang="scss">
.navbar-nav.flex-row {
    flex-direction: row;
    align-items: center;
    label {
      margin-bottom: 0;
      line-height: 1.5;
    }
}
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
