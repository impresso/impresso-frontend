<template lang="html">
  <div class="search-query-explorer" :class="{ 'dark-mode': darkMode }">
    <label class="px-3" v-if="!noLabel">{{ $t('currentResults') }}</label>
    <div class="summary">
      <blockquote class="px-2 mb-2">
        <span v-if="!noIncipit" v-html="incipit" />
        <search-query-summary class="d-inline" :search-query='{ filters: enrichedFilters }'/>
      </blockquote>
    </div>
    <div class="p-3" style="min-height:100px" v-if="isLoading">
      {{ $t('actions.loading') }}
    </div>
    <div v-else>
      <div class="search-query-explorer-result" v-for="(item, index) in results" :key="index" >
        <p class="mb-2">
          <span v-html="getCurrentIndex(index)" />
          <b-button size="sm" class="ml-2" @click="$router.push(getRouteWithSearchQuery({ name: 'search' }))" variant="outline-primary">
            {{ $t('actions.browseAll') }}
          </b-button>
        </p>
        <article-item class="search-query-explorer-article-item p-2 mt-1"
          :item="item"
          show-link
          show-meta show-excerpt
        />
      </div>
    </div>
    <!-- eof resutls / loading -->
    <div>
      <div class=" p-1 m-0" v-if="!noPagination">
        <pagination
          v-bind:perPage="limit"
          v-bind:currentPage="paginationCurrentPage"
          v-bind:totalRows="paginationTotalRows"
          v-on:change="onChangePage"
          size="sm"
          v-bind:showDescription="false"
          :dark-mode="darkMode"
          class="justify-content-center"
        />
      </div>
    </div>
  </div>
</template>

<script>
import SearchQuerySummary from '@/components/modules/SearchQuerySummary.vue';
import ArticleItem from '@/components/modules/lists/ArticleItem.vue';
import Pagination from '@/components/modules/Pagination.vue';
import {
  toCanonicalFilter,
  joinFiltersWithItems,
  serializeFilters,
  SupportedFiltersByContext
} from '@/logic/filters'
import {
  search as searchService,
  filtersItems as filtersItemsService
} from '@/services'
import Article from '@/models/Article'

/**
 * @param {import('@/models').Filter} filter
 * @returns {boolean}
 */
const supportedSearchIndexFilters = filter => SupportedFiltersByContext.search.includes(filter.type)

export default {
  props: {
    darkMode: Boolean,
    searchQuery: Object,
    limit: {
      type: Number,
      default: 1,
    },
    noIncipit: Boolean,
    noLabel: Boolean,
    noPagination: Boolean,
  },
  data: () => ({
    paginationCurrentPage: 1,
    paginationTotalRows: 0,
    results: [],
    isLoading: false,
    isActive: false,
    /** @type {Filter[]} */
    filtersWithItems: [],
  }),
  computed: {
    /** @returns {Filter[]} */
    enrichedFilters() {
      return this.filtersWithItems.length
        ? this.filtersWithItems
        : this.searchQuery.filters
    },
    serializedFilters() {
      return serializeFilters(this.searchQuery.filters);
    },
    serviceQuery() {
      return {
        filters: this.searchQuery.filters.filter(supportedSearchIndexFilters).map(toCanonicalFilter),
        limit: this.limit,
        page: this.paginationCurrentPage,
        // orderBy: this.orderBy,
        group_by: 'articles',
      };
    },
    additionalFilters() {
      return [];
    },
    incipit() {
      const n = this.$n(this.paginationTotalRows);
      return this.$tc('incipit', this.paginationTotalRows, {
        n,
        groupByLabel: this.$tc('numbers.results', this.paginationTotalRows, { n }),
      });
    },
  },
  methods: {
    getCurrentIndex(index) {
      // console.log('getCurrentIndex', index, this.paginationTotalRows, this.page);
      return this.$t('numbers.of', {
        index: this.$n(
          (this.limit * (this.paginationCurrentPage - 1))
          + index + 1,
        ),
        total: this.$n(this.paginationTotalRows),
      });
    },
    getRouteWithSearchQuery(route) {
      return {
        ...route,
        query: {
          ...route.query,
          sq: this.serializedFilters,
        },
      };
    },
    onChangePage(page) {
      this.paginationCurrentPage = page;
    },
    gotoArticle(article) {
      this.$router.push({
        name: 'article',
        params: {
          issue_uid: article.issue.uid,
          page_uid: article.pages[0]?.uid,
          article_uid: article.uid,
        },
      });
    },
  },
  components: {
    SearchQuerySummary,
    ArticleItem,
    Pagination,
  },
  watch: {
    serviceQuery: {
      async handler(query, previousQuery={}) {
        if (JSON.stringify(query) === JSON.stringify(previousQuery)){
          return;
        }
        this.isLoading = true;
        this.results = [];
        const { data, total } = await searchService.find({
          lock: false,
          query,
        }).finally(() => {
          this.isLoading = false;
        });
        this.results = data.map(result => new Article(result))
        this.paginationTotalRows = total;
      },
      immediate: true,
    },
    serializedFilters: {
      async handler(filters, previousSerializedFilters) {
        if (previousSerializedFilters === filters){
          return;
        }
        // enrich filters
        this.filtersWithItems = await filtersItemsService.find({
          query: {
            filters,
          },
        }).then(joinFiltersWithItems);
      },
      immediate: true,
    },
  },
};
</script>

<style lang="scss">
.search-query-explorer {
  .summary{
    blockquote{
      border-left: 2px solid black;
    }
  }
  .search-query-explorer-article-item{
    // background: #eaeaea;
  }
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
    text-decoration-color: inherit;
  }
  article .article-newspaper{
    color: #c2c8ce;
  }

  .search-query-explorer-result {
    border-bottom: 1px solid #343a40;
  }
  .search-query-explorer-article-item{
    background: #ffffff1f;
    // border-top: 1px solid #caccce;
    // border-bottom: 1px solid #caccce;
    min-height: 100px;

    article h2{
      color: white;
    }
  }
}

</style>
<i18n lang="json">
{
  "en": {
    "incipit": "{groupByLabel} found | {groupByLabel} found | {groupByLabel} found",
    "currentResults": "List of results for the current search query"
  }
}
</i18n>
