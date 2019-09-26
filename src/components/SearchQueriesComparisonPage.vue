<template lang="html">
  <i-layout id="SearchQueriesComparisonPage">
    <i-layout-section>
      <div slot="header" class="header container-fluid row border-bottom">
        <query-header-panel title="query one" type="query" class="col border-right"/>
        <query-header-panel icon="cross" class="col border-right"/>
        <query-header-panel title="collection blah" type="collection" class="col"/>
      </div>
      <div class="body container-fluid row">
        <query-overview-panel class="col border-right"/>
        <query-overview-panel class="col border-right"/>
        <query-overview-panel class="col"/>
      </div>
    </i-layout-section>
  </i-layout>
    <!-- intersection section -->
    <!-- <section class="p-3">
      <span class="label small-caps">{{$t('label_intersection')}}</span>
      <b-row>
        <b-col sm="4" v-for="(article, idx) in articles" v-bind:key="idx">
          <search-results-tiles-item v-on:click="() => ({})" v-model="articles[idx]" />
        </b-col>
      </b-row>
    </section> -->
</template>

<script>
import { searchQueriesComparison } from '@/services';
import SearchResultsTilesItem from './modules/SearchResultsTilesItem';
import QueryOverviewPanel from './modules/searchQueriesComparison/QueryOverviewPanel';
import QueryHeaderPanel from './modules/searchQueriesComparison/QueryHeaderPanel';

export default {
  data: () => ({
    ids: [],
    articles: [],
  }),
  watch: {
    '$route.params.ids': {
      handler(ids) {
        this.ids = ids;
        this.loadIntersectedArticles(ids);
      },
      immediate: true,
    },
  },
  components: {
    SearchResultsTilesItem,
    QueryOverviewPanel,
    QueryHeaderPanel,
  },
  methods: {
    async loadIntersectedArticles(ids) {
      const payload = {
        queries: ids.map(id => ({
          filters: [
            {
              type: 'collection',
              q: id,
            },
          ],
        })),
      };
      this.articles = await searchQueriesComparison.create(payload, { query: { method: 'intersection' } });
    },
  },
};
</script>

<style>

</style>

<i18n>
{
  "en": {
    "label_intersection": "Intersection"
  },
  "nl": {
    "label_intersection": "Overlap"
  }
}
</i18n>