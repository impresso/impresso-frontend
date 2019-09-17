<template>
  <main>
    <!-- intersection section -->
    <section class="p-3">
      <span class="label small-caps">{{$t('label_intersection')}}</span>
      <b-row>
        <b-col sm="4" v-for="(article, idx) in articles" v-bind:key="idx">
          <search-results-tiles-item v-on:click="() => ({})" v-model="articles[idx]" />
        </b-col>
      </b-row>
    </section>
  </main>  
</template>

<script>
import { searchQueriesComparison } from '@/services';
import SearchResultsTilesItem from './modules/SearchResultsTilesItem';

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