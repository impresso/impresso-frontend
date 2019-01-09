<template lang="html">
  <i-layout-section class="p-3">
    <h3>Collections Explorer Page</h3>
    <pre>{{ this.collectionsMerged }}</pre>
    <!-- <pre>{{ this.collectionAll }}</pre> -->

    <div v-if="articles.length > 0" class="collection-group">
      <h4 class="p-3">{{ articles.length }} articles in <em>all collections</em></h4>
      <b-container fluid>
        <b-row class="pb-5">
          <b-col cols="6" sm="12" md="4" lg="3" v-for="(article, index) in articles" v-bind:key="article.uid">
            <search-results-tiles-item v-on:click="gotoArticle(article)" v-model="articles[index]" />
            <!-- {{ article }} -->
          </b-col>
        </b-row>
      </b-container>
    </div>

  </i-layout-section>
</template>

<script>
import Collection from '@/models/Collection';
import SearchResultsTilesItem from './modules/SearchResultsTilesItem';

export default {
  components: {
    SearchResultsTilesItem,
  },
  data: () => ({
    collectionsMerged: new Collection(),
  }),
  computed: {
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
