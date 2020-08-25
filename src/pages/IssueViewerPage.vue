<template>
  <i-layout id="IssuePageViewer" ref="issuePageViewer">
    <!-- TOC -->
    <list
      :hide-pagination="!displayOnlyMatchingArticles"
      :paginationList="paginationList"
      @change-page="handleMatchingArticlesChangePage"
      width="350px">
      <template v-slot:header v-if="issue">
        <b-tabs pills class="mx-2 pt-2">
          <b-tab active>
            <template v-slot:title>
              <span v-html="$t('table_of_contents')"/>
            </template>
            <div class="p-2 px-3">
              <p v-html="$t('stats', {
                countArticles: issue.countArticles,
                countPages: issue.countPages,
                accessRights: $t(`buckets.accessRight.${issue.accessRights }`)
              })" />
              <b-form inline>
                <b-form-checkbox
                  :disabled="countActiveFilters === 0"
                  v-model="applyCurrentSearchFilters"
                  switch>
                  {{ $t('actions.addCurrentSearch') }}
                </b-form-checkbox>
              </b-form>
              <b-alert variant="transparent" class="p-1 small" show>
                <div v-if="countActiveFilters === 0">
                  {{ $t('applyCurrentSearchFiltersDisabled') }}
                </div>
                <span v-if="ignoredFilters.length"
                  v-html="$tc('numbers.ignoredFilters', ignoredFilters.length)">
                </span>
              </b-alert>
              <search-pills disable-reset
                v-if="applyCurrentSearchFilters"
                :filters="filters"
                @changed="handleFiltersChanged"
              />
              <b-input class="mb-3" v-model.trim="suggestionQuery"
                debounce="500" :placeholder="$t('label_filter_articles')" />
                <b-form-checkbox :disabled="!hasMatchingArticles"
                  v-model="displayOnlyMatchingArticles"
                  switch>
                  <span v-html="$tc('filter_included_only', paginationTotalRows)"/>
                </b-form-checkbox>
            </div>
          </b-tab>
        </b-tabs>
      </template>
      <template v-slot:default>
        <issue-viewer-table-of-contents
          :items="tableOfContentsArticles"
          :selected-article-id="articleId"
          @article-selected="handleArticleSelected"
          @click-full-text="showArticleText"
        />
      </template>
    </list>
    <!-- main section -->
    <i-layout-section main>
      <!-- header -->
      <div slot="header" class="border-bottom" v-if="issue">
        <b-navbar variant="light" class="px-0 py-0">
          <section class='p-2 pl-3'>
            <h3 class="m-0">
              <b>{{ issue.newspaper.name }}</b> &middot;
              <span class="date">{{ $d(issue.date, 'long') }}</span>
            </h3>
          </section>
          <b-navbar-nav>
            <b-button class="border-dark" variant="light" size="sm"
              :disabled="currentPageIndex === 0"
              @click="changeCurrentPageIndex(currentPageIndex - 1)">
              <div class="dripicons dripicons-media-previous pt-1"></div>
            </b-button>
            <div class="px-2 pt-1 border-top border-bottom" v-html="$t('ppOf', {
              num: page.num,
              pages: issue.pages.length
            })"></div>
            <b-button class="border-dark" variant="light" size="sm"
              :disabled="(currentPageIndex + 1) === issue.pages.length"
              @click="changeCurrentPageIndex(currentPageIndex + 1)">
              <div class="dripicons dripicons-media-next pt-1"></div>
            </b-button>
          </b-navbar-nav>

          <b-button
            class="ml-2"
            :variant="outlinesVisible ? 'primary' : 'outline-primary'" size="sm"
            @click="outlinesVisible = !outlinesVisible">
            <div class="d-flex flex-row align-items-center">
              <div class="d-flex dripicons dripicons-preview mr-2" />
              <div v-if="outlinesVisible">{{$t('toggle_outlines_on')}}</div>
              <div v-else>{{$t('toggle_outlines_off')}}</div>
            </div>
          </b-button>

          <b-navbar-nav class="ml-auto p-2" v-if="selectedArticle && isArticleTextDisplayed">
            <b-button size="sm" variant="outline-primary" @click="isArticleTextDisplayed = false">{{ $t('facsimileView') }}</b-button>
          </b-navbar-nav>
        </b-navbar>
      </div>
      <!-- content -->
      <div class="d-flex h-100 justify-content-center position-relative"  v-if="issue">
        <div class="d-flex h-100 justify-content-center" v-if="!isContentAvailable">
          <div class="align-self-center">
            <p>{{ $t('errors.loggedInOnly') }}</p>
            <br/>
            <b-button :to="{ name: 'login' }" block size="sm" variant="outline-primary">{{ $t('actions.login') }}</b-button>
          </div>
        </div>
        <open-seadragon-article-viewer
          :class="{ 'show-outlines': outlinesVisible }"
          :style="(isContentAvailable && !isArticleTextDisplayed) ? {} : { display: 'none' }"
          :pages="pagesIIIFUrls"
          :regions="regions"
          :defaultCurrentPageIndex="currentPageIndex"
          :article="{ uid: articleId }"
          :marginaliaSections="marginaliaSections"
          @page-changed="changeCurrentPageIndex"
          @article-selected="handleArticleIdSelectedInViewer"/>

        <issue-viewer-text
          v-if="isContentAvailable && articleId != null && isArticleTextDisplayed"
          :article_uid="articleId"/>

        <issue-viewer-bookmarker
          @remove-selection="handleRemoveSelection"
          @click-full-text="showArticleText(selectedArticle.uid)"
          :article="selectedArticle"
          :visible="!isArticleTextDisplayed"/>

        <div class="position-absolute d-flex drop-shadow bg-dark border-radius" style="bottom: 1rem">
          <div v-for="(item, i) in issue.pages" :key="i" @click="changeCurrentPageIndex(i)">
            <page-item class="bg-dark p-2"
            :active="pageId === item.uid"
            :item="item" />
          </div>
        </div>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
import OpenSeadragonArticleViewer from '@/components/modules/OpenSeadragonArticleViewer'
import PageItem from '@/components/modules/lists/PageItem'
import List from '@/components/modules/lists/List'
import IssueViewerText from '@/components/modules/IssueViewerText'
import {
  issues as issuesService,
  tableOfContents as tableOfContentsService,
  articles as articlesService,
  search as searchService,
} from '@/services'
import { getQueryParameter } from '@/router/util'
import { getPageId, getShortArticleId, getLongArticleId } from '@/logic/ids'
import { searchQueryGetter, searchQuerySetter, mapApplyCurrentSearchFilters } from '@/logic/queryParams'
import SearchQuery, { getFilterQuery } from '@/models/SearchQuery';
import Issue from '@/models/Issue'
import Article from '@/models/Article'
import TableOfContents from '@/models/TableOfContents'
import SearchPills from '@/components/SearchPills'
import IssueViewerBookmarker from '@/components/IssueViewerBookmarker'
import IssueViewerTableOfContents from '@/components/IssueViewerTableOfContents'

/**
 * @typedef {import('@/models').Filter} Filter
 * @typedef {import('@/models/ArticleBase').default} ArticleBase
 */

const Params = Object.freeze({ IssueId: 'issue_uid' })
const QueryParams = Object.freeze({
  PageNumber: 'p',
  ArticleId: 'articleId',
  TextMode: 'text'
})
const AllowedFilterTypes = ['title', 'string', 'location', 'topic', 'person'];

export default {
  data: () => ({
    issue: /** @type {Issue|undefined} */ (undefined),
    tableOfContents: /** @type {TableOfContents|undefined} */ (undefined),
    pagesArticles: /** @type {{[key: string] : Article[] }} */ ({}),
    pagesMarginalia: /** @type {{[key: string] : any[] }} */ ({}),
    // left panel
    paginationPerPage: 20,
    paginationCurrentPage: 1,
    paginationTotalRows: 0,
    matchingArticles: /** @type {Article[]} */ [],
    outlinesVisible: false,
    displayOnlyMatchingArticles: false,
  }),
  components: {
    OpenSeadragonArticleViewer,
    PageItem,
    List,
    IssueViewerText,
    SearchPills,
    IssueViewerBookmarker,
    IssueViewerTableOfContents
  },
  mounted() {
    if (this.suggestionQuery.length) {
      this.displayOnlyMatchingArticles = true;
    }
  },
  computed: {
    applyCurrentSearchFilters: mapApplyCurrentSearchFilters(),
    searchQuery: {
      ...searchQueryGetter(),
      ...searchQuerySetter({
        additionalQueryParams: {
          p: '1',
        },
      }),
    },
    /** @returns {Filter[]} */
    filters() {
      // filter by type
      return this.searchQuery.filters
        .filter(({ type }) => AllowedFilterTypes.includes(type));
    },
    /** @returns {Filter[]} */
    ignoredFilters() {
      return this.searchQuery.filters
        .filter(({ type }) => !AllowedFilterTypes.includes(type))
    },
    /** @returns {number} */
    countActiveFilters() {
      return this.filters.length;
    },
    /** @returns {boolean} */
    hasMatchingArticles() {
      return this.suggestionQuery.length > 0 || (this.applyCurrentSearchFilters && this.countActiveFilters > 0)
    },
    /** @returns {string} */
    issueId() { return this.$route.params[Params.IssueId] },
    /** @returns {string|undefined} */
    pageId: {
      /** @return {string|undefined} */
      get() {
        return getPageId(this.issueId, this.currentPageIndex)
      }
    },
    /** @returns {string|undefined} */
    articleId() {
      const shortArticleId = getQueryParameter(this, QueryParams.ArticleId)
      if (shortArticleId == null) return undefined
      return getLongArticleId(this.issueId, shortArticleId)
    },
    /**
     * @returns {ArticleBase|undefined}
     */
    selectedArticle() {
      if (!this.tableOfContents) {
        return undefined;
      }
      return this.tableOfContents.articles.find(d => d.uid === this.articleId)
    },
    isArticleTextDisplayed: {
      /** @returns {boolean} */
      get() {
        const textMode = getQueryParameter(this, QueryParams.TextMode)
        return textMode === '1'
      },
      /** @param {string} q */
      set(q) {
        this.$navigation.updateQueryParametersWithHistory({
          [QueryParams.TextMode]: q ? '1' : undefined,
        });
      },
    },
    /** @returns {import('@/models/Page').default|undefined} */
    page() {
      if (this.currentPageIndex === -1) return undefined
      return this.issue?.pages[this.currentPageIndex]
    },
    /** @returns {string[]|undefined} */
    pagesIIIFUrls() {
      if (this.issue == null) return undefined
      return this.issue.pages.map(page => page.iiif)
    },
    /** @returns {any[]} */
    regions() {
      const articles = this.pagesArticles[this.currentPageIndex]
      if (articles == null) return []

      return articles.flatMap(article => article.regions.map(region => ({
        articleUid: article.uid,
        pageUid: this.pageId,
        coords: region.coords
      })))
    },
    /** @returns {import('@/models/ArticleBase').default[]} */
    tableOfContentsArticles() {
      if ((this.suggestionQuery.length || this.filters.length) && this.displayOnlyMatchingArticles) {
        return this.matchingArticles;
      }
      if (this.tableOfContents) {
        return this.tableOfContents.articles;
      }
      return []
    },
    suggestionQuery: {
      /** @returns {string} */
      get() {
        return getQueryParameter(this, 'q', '') ?? ''
      },
      /** @param {string} q */
      set(q) {
        this.paginationCurrentPage = 1;
        this.$navigation.updateQueryParametersWithHistory({
          q,
        });
      },
    },
    /** @returns {{ q: string, limit: number, page: number, issueUid?: string, filters: Filter[] }} */
    serviceQuery() {
      return {
        q: this.suggestionQuery,
        limit: this.paginationPerPage,
        page: this.paginationCurrentPage,
        issueUid: this.issue?.uid,
        filters: this.applyCurrentSearchFilters
          ? this.filters.map(getFilterQuery)
          : [],
      };
    },
    /** @returns {any} */
    paginationList() {
      return {
        perPage: this.paginationPerPage,
        currentPage: this.paginationCurrentPage,
        totalRows: this.paginationTotalRows,
      };
    },
    currentPageIndex: {
      /** @returns {number} */
      get() {
        if (!this.issue) return -1;
        const pageNumber = parseInt(/** @type {string} */ (getQueryParameter(this, QueryParams.PageNumber)), 10)
        if (isNaN(pageNumber)) return 0;
        // handle missing pages.
        return this.issue.pages.findIndex(p => p.num === pageNumber);
      },
      /** @param {number} index */
      set(index) {
        // set page num in query fro the page corresponding to the right currentPageIndex
        const pageNumber = this.issue?.pages[index]?.num;
        this.$navigation.updateQueryParameters({
          [QueryParams.PageNumber]: pageNumber
        })
      }
    },
    /** @returns {import('@/models/User').default} */
    currentUser() {
      return this.$store.getters['user/user'];
    },
    /** @returns {boolean} */
    isContentAvailable() {
      if (this.issue == null) return false
      const isPublic = this?.issue?.accessRights === 'OpenPublic'
      const isLoggedIn = this.currentUser?.isActive ?? false
      return isPublic || isLoggedIn
    },
    /** @returns {any[]} */
    marginaliaSections() {
      return this.pagesMarginalia[this.currentPageIndex] ?? []
    }
  },
  watch: {
    issueId: {
      /** @param {string} id */
      async handler(id) {
        this.issue = new Issue(await issuesService.get(id))
        this.tableOfContents = new TableOfContents(await tableOfContentsService.get(id))
      },
      immediate: true
    },
    currentPageIndex: {
      /** @param {number} pageIndex */
      async handler(pageIndex) {
        await Promise.all([
          this.loadRegions(pageIndex),
          this.loadMarginalia(pageIndex)
        ])
      },
      immediate: true
    },
    serviceQuery: {
      /**
       * @param {any} params
       * @param {any} oldParams
       * @returns {undefined}
       */
      handler(params, oldParams) {
        // this get called twice becaues of the suggestionQuery
        const newParamsStr = JSON.stringify(params)
        const oldParamsStr = JSON.stringify(oldParams)
        if (newParamsStr === oldParamsStr) {
          // Params are the same: ${newParamsStr} ${oldParamsStr}`)
          return;
        }
        if (this.issue == null) return;
        const { q, limit, page, issueUid, filters } = params;
        this.matchingArticles = [];
        if (q.length > 1 || filters.length) {
          const additionalFilters = [{ type: 'issue', q: issueUid }]
          if (q.length > 1) {
            additionalFilters.push({ type: 'string', q });
          }
          searchService.find({
            lock: false,
            query: {
              filters: filters.concat(additionalFilters),
              page, limit, group_by: 'articles'
            },
          }).then(({ data, total }) => {
            this.paginationTotalRows = total;
            this.matchingArticles = data.map(article => new Article(article));
          });
        }
      },
      immediate: true,
    },
  },
  methods: {
    handleFiltersChanged(filters) {
      this.displayOnlyMatchingArticles = true;
      // add back ignored filters so that we can reuse them in other views
      this.searchQuery = new SearchQuery({
        filters: filters.concat(this.ignoredFilters),
      });
    },
    handleMatchingArticlesChangePage(page) {
      this.paginationCurrentPage = page;
    },
    /** @param {number} pageIndex */
    changeCurrentPageIndex(pageIndex) {
      this.currentPageIndex = pageIndex;
    },
    handleRemoveSelection() {
      this.$navigation.updateQueryParameters({
        [QueryParams.ArticleId]: undefined,
      });
    },
    handleArticleSelected(article) {
      this.$navigation.updateQueryParameters({
        [QueryParams.ArticleId]: getShortArticleId(article.uid),
        [QueryParams.PageNumber]: String(article.pages[0].num)
      })
    },
    /**
     * @param {string} articleUid
     * @param {number} pageNumber (optional)
     */
    handleArticleIdSelectedInViewer(articleUid) {
      // display the whole table of contents
      this.displayOnlyMatchingArticles = false;
      this.$navigation.updateQueryParameters({
        [QueryParams.ArticleId]: getShortArticleId(articleUid)
      })
    },
    /** @param {number} pageIndex */
    async loadRegions(pageIndex) {
      if (this.issue == null) return
      if (this.pagesArticles[pageIndex] == null) {
        const articles = await articlesService
          .find({
            query: {
              filters: [{ type: 'page', q: getPageId(this.issueId, pageIndex) }],
              limit: 500
            }
          })
          .then(response => response.data.map(article => new Article(article)))
        this.$set(this.pagesArticles, pageIndex, articles)
      }
    },
    async loadMarginalia(pageIndex) {
      if (this.issue == null) return
      if (this.pagesMarginalia[pageIndex] == null) {
        const results = await Promise.all([
          this.$store.dispatch('entities/LOAD_PAGE_TOPICS', this.pageId),
          this.$store.dispatch('entities/LOAD_PAGE_ENTITIES', this.pageId)
        ])

        const topicsSection = {
          title: this.$tc(`label.${results[0].type}.title`, results[0].buckets.length),
          isLeft: true,
          items: results[0].buckets.map(bucket => `${bucket.item.htmlExcerpt} (${bucket.count})`)
        }
        const entitySections = results[1].map(facet => {
          return {
            title: this.$tc(`label.${facet.type}.title`, facet.buckets.length),
            isLeft: false,
            items: facet.buckets.map(bucket => `${bucket.item.name} (${bucket.count})`)
          }
        })

        this.$set(this.pagesMarginalia, pageIndex, entitySections.concat([topicsSection]))
      }
    },
    /** @param {string} articleUid */
    showArticleText(articleUid) {
      const params = {
        [QueryParams.ArticleId]: articleUid == null ? undefined : getShortArticleId(articleUid),
        [QueryParams.TextMode]: '1'
      }
      this.$navigation.updateQueryParameters(params)
    },
    exitTextViewer() {
      const params = {
        [QueryParams.TextMode]: undefined
      }
      this.$navigation.updateQueryParameters(params)
    }
  }
}
</script>

<i18n>
{
  "en": {
    "stats": "<b>{countArticles}</b> articles in <b>{countPages}</b> pages ({accessRights})",
    "label_display": "Display as",
    "label_filter_articles": "Search words...",
    "table_of_contents": "table of contents",
    "toggle_outlines_on": "outlines: on",
    "toggle_outlines_off": "Outlines: off",
    "facsimileView": "Facsimile",
    "closeReadingView": "Transcript",
    "filter_included_only": "show only matching articles (no results) | show only matching articles (<b>1</b> result) | show only matching articles (<b>{n}</b> results)"
  }
}
</i18n>

<style lang="scss">
.close-button {
  position: absolute;
  right: 0;
}
</style>
