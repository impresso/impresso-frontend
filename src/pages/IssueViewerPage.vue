<template>
  <i-layout id="IssuePageViewer" ref="issuePageViewer">
    <!-- main section -->
    <i-layout-section main class="bg-dark">
      <!-- header -->
      <div slot="header" class="border-bottom" v-if="issue">
        <b-navbar type="light" variant="light" class="px-0 py-0">
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
            <div class="px-2 pt-1">{{ $tc('pp', 1, { pages: page.num }) }}</div>
            <b-button variant="light" size="sm"
              :disabled="(currentPageIndex + 1) === issue.pages.length"
              @click="changeCurrentPageIndex(currentPageIndex + 1)">
              <div class="dripicons dripicons-media-next pt-1"></div>
            </b-button>
          </b-navbar-nav>
        </b-navbar>
      </div>
      <!-- content -->
      <div class="d-flex h-100 justify-content-center"  v-if="issue">
        <open-seadragon-article-viewer
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
import PageItem from '@/components/modules/lists/PageItem'
import List from '@/components/modules/lists/List'
import { issues as issuesService, articles as articlesService } from '@/services'
import { getQueryParameter } from '@/router/util'
import { getPageId, getShortArticleId, getLongArticleId } from '@/logic/ids'
import Issue from '@/models/Issue'
import Article from '@/models/Article'

const Params = Object.freeze({ IssueId: 'issue_uid' })
const QueryParams = Object.freeze({ PageNumber: 'p', ArticleId: 'articleId' })

export default {
  data: () => ({
    issue: /** @type {Issue|undefined} */ (undefined),
    pagesArticles: /** @type {{[key: string] : Article[] }} */ ({})
  }),
  components: {
    OpenSeadragonArticleViewer,
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
    page() {
      if (this.currentPageIndex === -1) return undefined
      return this.issue.pages[this.currentPageIndex]
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
        const pageNumber = this.issue.pages[index]?.num;
        this.$navigation.updateQueryParameters({
          [QueryParams.PageNumber]: pageNumber
        })
      }
    }
  },
  watch: {
    issueId: {
      /** @param {string} id */
      async handler(id) {
        this.issue = new Issue(await issuesService.get(id))
      },
      immediate: true
    },
    currentPageIndex: {
      /** @param {number} pageIndex */
      async handler(pageIndex) {
        await this.loadRegions(pageIndex)
      },
      immediate: true
    }
  },
  methods: {
    changeCurrentPageIndex(pageIndex) {
      console.info('@changeCurrentPageIndex', pageIndex, this.currentPageIndex);
      this.currentPageIndex = pageIndex;
    },
    handleArticleSelected(articleUid) {
      this.$navigation.updateQueryParameters({
        [QueryParams.ArticleId]: articleUid == null ? undefined : getShortArticleId(articleUid)
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
    }
  }
}
</script>
