<template lang="html">
  <div class="search-query-explorer monitor drop-shadow p-2" v-if="isActive">
    <label>{{ $t('currentSearch') }}
      <span v-if="paginationTotalRows > -1">&mdash; {{ $tc('numbers.resultsParenthesis', paginationTotalRows) }}</span>
      <span v-else>{{ $t('loading') }}</span>
    </label>
    <search-query-summary :search-query='searchQuery'/>
    results {{ offset }}
    <div v-if="results.previous">
      previous
    </div>
    <div v-if="results.current">
      <article-item :item="results.current" show-link show-meta/>
    </div>
    <div v-if="results.next">
      next
      {{ results.next.title }}
    </div>
  </div>
</template>

<script>
import SearchQuerySummary from './../modules/SearchQuerySummary';
import ArticleItem from './../modules/lists/ArticleItem';

export default {
  computed: {
    offset() {
      return this.$store.state.searchQueryExplorer.offset;
    },
    additionalFilters() {
      return [];
    },
    searchQuery() {
      return this.$store.getters['search/getSearch'];
    },
    paginationTotalRows() {
      return this.$store.state.searchQueryExplorer.totalRows;
    },
    isActive() {
      return this.$store.state.searchQueryExplorer.isActive;
    },
    results() {
      const results = this.$store.state.searchQueryExplorer.results;
      const pagination = {
        next: null,
        current: null,
        previous: null,
      };
      // first result
      if (this.offset === 0 && results.length) {
        pagination.current = results[0];
        if (results.length > 1) {
          pagination.next = results[1];
        }
      } else if (this.offset && results.length) {
        pagination.previous = results[0];
        pagination.current = results[1];
        if (results.length > 2) {
          pagination.next = results[2];
        }
      }
      return pagination;
    },
  },
  methods: {
    loadCurrentResult() {
      this.$store.dispatch('searchQueryExplorer/GET_CONTEXT_SEARCH_RESULT', {
        filters: this.searchQuery.getFilters().concat(this.additionalFilters),
        offset: this.offset,
      });
    },
  },
  components: {
    SearchQuerySummary,
    ArticleItem,
  },
  watch: {
    isActive: {
      handler(v) {
        if (v) {
          this.loadCurrentResult();
        }
      },
    },
  },
};
</script>

<style lang="css" scoped>
.search-query-explorer {
  top: auto;
  bottom: 3.5rem;
  color: white;
  background: #343a40;
  border-color: gold;
}
</style>
