<template>
  <i-layout id="IssuePageViewer" ref="issuePageViewer">
    <!-- TOC -->
    <list :hide-pagination="!!matchingArticles.length" width="350px">
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
              <b-input class="mb-3" v-model.trim="suggestionQuery"
                debounce="500" :placeholder="$t('filter_articles')" />

            </div>
          </b-tab>
        </b-tabs>
      </template>
      <template v-slot:default>
        <div v-for="(item, i) in tableOfContentsArticles" :key="i"
          class="border-bottom"
          @click="handleArticleSelected(item.uid, item.pages[0].num)"
        >
          <table-of-contents-item :item="item" :active="item.uid === articleId"/>
        </div>
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
              <span class="date">
              {{ $d(issue.date, 'long') }}
              </span>
            </h3>
          </section>
          <b-navbar-nav class=" border">
            <b-button variant="light" size="sm"
              :disabled="currentPageIndex === 0"
              @click="changeCurrentPageIndex(currentPageIndex - 1)">
              <div class="dripicons dripicons-media-previous pt-1"></div>
            </b-button>
            <div class="px-2 pt-1">{{ $tc('pp', 1, { pages: page ? page.num : undefined }) }}</div>
            <b-button variant="light" size="sm"
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

        </b-navbar>
      </div>
      <!-- content -->
      <div class="d-flex h-100 justify-content-center"  v-if="issue">
        <div class="d-flex h-100 justify-content-center" v-if="!isContentAvailable">
          <div class="align-self-center">
            <p>{{ $t('errors.loggedInOnly') }}</p>
            <br/>
            <b-button :to="{ name: 'login' }" block size="sm" variant="outline-primary">{{ $t('actions.login') }}</b-button>
          </div>
        </div>
        <open-seadragon-article-viewer
          :class="[
            'bg-light',
            outlinesVisible ? 'show-outlines' : '',
          ]"
          v-if="isContentAvailable"
          :pages="pagesIIIFUrls"
          :regions="regions"
          :defaultCurrentPageIndex="currentPageIndex"
          :article="{ uid: articleId }"
          @page-changed="changeCurrentPageIndex"
          @article-selected="handleArticleSelected"/>
      </div>
    </i-layout-section>
    <i-layout-section width="120px" class="border-left">
      <list hide-pagination v-if="issue">
        <div v-for="(item, i) in issue.pages" :key="i" @click="changeCurrentPageIndex(i)">
          <page-item
          :active="pageId === item.uid"
          :item="item" />
        </div>
      </list>
    </i-layout-section>
  </i-layout>
</template>

<script>
import OpenSeadragonArticleViewer from '@/components/modules/OpenSeadragonArticleViewer'
import TableOfContentsItem from '@/components/modules/lists/TableOfContentsItem'
import PageItem from '@/components/modules/lists/PageItem'
import List from '@/components/modules/lists/List'
import {
  issues as issuesService,
  tableOfContents as tableOfContentsService,
  articles as articlesService,
  search as searchService,
} from '@/services'
import { getQueryParameter } from '@/router/util'
import { getPageId, getShortArticleId, getLongArticleId } from '@/logic/ids'
import Issue from '@/models/Issue'
import Article from '@/models/Article'
import TableOfContents from '@/models/TableOfContents'

const Params = Object.freeze({ IssueId: 'issue_uid' })
const QueryParams = Object.freeze({ PageNumber: 'p', ArticleId: 'articleId' })

export default {
  data: () => ({
    issue: /** @type {Issue|undefined} */ (undefined),
    tableOfContents: /** @type {TableOfContents|undefined} */ (undefined),
    pagesArticles: /** @type {{[key: string] : Article[] }} */ ({}),
    // left panel
    paginationPerPage: 200,
    paginationCurrentPage: 1,
    paginationTotalRows: 0,
    matchingArticles: /** @type {Article[]} */ [],
    outlinesVisible: false
  }),
  components: {
    OpenSeadragonArticleViewer,
    TableOfContentsItem,
    PageItem,
    List,
  },
  computed: {
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
      if (this.suggestionQuery.length) {
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
    /** @returns {{ q: string, limit: number, page: number }} */
    serviceQuery() {
      return {
        q: this.suggestionQuery,
        limit: this.paginationPerPage,
        page: this.paginationCurrentPage,
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
        await this.loadRegions(pageIndex)
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
        if (this.issue == null) return
        const { q, limit, page } = params;
        const filters = [{ type: 'issue', q: this.issue.uid }]
        this.matchingArticles = [];

        if (q.length){
          filters.push({ type: 'string', q });
          searchService.find({
            query: { filters, page, limit, group_by: 'articles' },
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
    /** @param {number} pageIndex */
    changeCurrentPageIndex(pageIndex) {
      console.info('@changeCurrentPageIndex', pageIndex, this.currentPageIndex);
      this.currentPageIndex = pageIndex;
    },
    /**
     * @param {string} articleUid
     * @param {number} pageNumber
     */
    handleArticleSelected(articleUid, pageNumber) {
      const params = {
        [QueryParams.ArticleId]: articleUid == null ? undefined : getShortArticleId(articleUid)
      }
      if (pageNumber) {
        params[QueryParams.PageNumber] = String(pageNumber)
      }
      this.$navigation.updateQueryParameters(params)
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
    }
  }
}
</script>

<i18n>
{
  "en": {
    "stats": "<b>{countArticles}</b> articles in <b>{countPages}</b> pages ({accessRights})",
    "label_display": "Display as",
    "table_of_contents": "table of contents",
    "toggle_outlines_on": "outlines: on",
    "toggle_outlines_off": "Outlines: off"
  }
}
</i18n>
