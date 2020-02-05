<template lang="html">
  <div class="search-query-explorer" :class="{ 'dark-mode': darkMode }">
    <label class="px-3">{{ $t('currentResults') }}</label>
    <div class="summary">
      <blockquote class="ml-3 px-2 mb-2">
        <span v-html="incipit" />
        <search-query-summary class="d-inline" :search-query='searchQuery'/>
      </blockquote>
    </div>

    <div class="p-3" v-if="isLoading">
      {{ $t('actions.loading') }}
    </div>
    <div v-else>
      <div class="search-query-explorer-result p-3" v-for="(item, index) in results" :key="index" v-on:click.prevent.stop="gotoArticle(item)">
        <span v-html="getCurrentIndex(index)" />
        <article-item
          :item="item"
          show-meta show-excerpt
        />
      </div>
    </div>
    <!-- eof resutls / loading -->
    <div>
      <div class=" p-1 m-0">
        <pagination
          v-bind:perPage="paginationResultsList.perPage"
          v-bind:currentPage="paginationResultsList.currentPage"
          v-bind:totalRows="paginationResultsList.totalRows"
          v-on:change="onChangePage"
          class="small-caps"
          v-bind:showDescription="false"
          dark-mode
        />
      </div>
    </div>
  </div>
</template>

<script>
import SearchQuerySummary from '../modules/SearchQuerySummary';
import ArticleItem from '../modules/lists/ArticleItem';
import Pagination from '../modules/Pagination';

export default {
  props: {
    darkMode: Boolean,
  },
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
    paginationResultsList() {
      return this.$store.state.searchQueryExplorer.pagination;
    },
    isActive() {
      return this.$store.state.searchQueryExplorer.isActive;
    },
    isLoading() {
      return this.$store.state.searchQueryExplorer.isLoading;
    },
    results() {
      return this.$store.state.searchQueryExplorer.results;
    },
    incipit() {
      const n = this.$n(this.paginationResultsList.totalRows);
      return this.$tc('incipit', this.paginationResultsList.totalRows, {
        n,
        groupByLabel: this.$tc('numbers.results', this.paginationResultsList.totalRows, { n }),
      });
    },
  },
  methods: {
    getCurrentIndex(index) {
      return this.$t('numbers.of', {
        index: this.$n(
          (this.paginationResultsList.perPage * (this.paginationResultsList.currentPage - 1))
          + index + 1,
        ),
        total: this.$n(this.paginationResultsList.totalRows),
      });
    },
    onChangePage(page) {
      this.$store.dispatch('searchQueryExplorer/GET_CONTEXT_SEARCH_RESULT', {
        filters: this.searchQuery.getFilters().concat(this.additionalFilters),
        page,
      });
    },
    gotoArticle(article) {
      this.$router.push({
        name: 'article',
        params: {
          issue_uid: article.issue.uid,
          page_uid: article.pages[0].uid,
          article_uid: article.uid,
        },
      });
    },
    loadCurrentResult() {
      this.onChangePage(1);
    },
  },
  components: {
    SearchQuerySummary,
    ArticleItem,
    Pagination,
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

<style lang="scss">
.search-query-explorer {
  min-width: 400px;
}
.search-query-explorer.dark-mode {
  color: white;

  .summary{
    blockquote{
      border-left: 2px solid white;
    }
  }

  span.item.newspaper{
    color: white;
  }

  article h2, article h2 a{
    color: #c2c8ce;
    font-size: inherit;
  }
  article .article-newspaper{
    color: #c2c8ce;
  }

  .search-query-explorer-result {
    border-bottom: 1px solid #343a40;
  }
  .search-query-explorer-result:hover{
    background: #343a40;

    article h2{
      color: white;
    }
  }
}

</style>
<i18n>
{
  "en": {
    "incipit": "{groupByLabel} found | {groupByLabel} found | {groupByLabel} found",
    "currentResults": "List of results for the current search query"
  }
}
</i18n>
