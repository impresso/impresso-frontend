<template>
  <i-layout id="IssuePageViewer" class="bg-light" ref="issuePageViewer">
    <!-- main section -->
    <i-layout-section main>
      <!-- header -->
      <div slot="header" class="border-bottom">
        [Issue header]
      </div>
      <!-- content -->
      <div class="d-flex h-100 justify-content-center">
        <open-seadragon-article-viewer
          :pages="pagesIIIFUrls"
          :regions="regions"
          :defaultCurrentPageIndex="currentPageIndex"
          @page-changed="handlePageChanged"
          @article-selected="handleArticleSelected"/>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
import OpenSeadragonArticleViewer from '@/components/modules/OpenSeadragonArticleViewer'
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
    OpenSeadragonArticleViewer
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
        const pageNumber = parseInt(/** @type {string} */ (getQueryParameter(this, QueryParams.PageNumber)), 10)
        if (isNaN(pageNumber)) return 0
        return pageNumber - 1
      },
      /** @param {number} index */
      set(index) {
        this.$navigation.updateQueryParameters({
          [QueryParams.PageNumber]: index + 1
        })
      }
    }
  },
  watch: {
    issueId: {
      /** @param {string} id */
      async handler(id) {
        if (id == null) throw new Error('Issue ID must always be defined on this page')
        this.issue = new Issue(await issuesService.get(id))
        await this.loadRegions(this.currentPageIndex)
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
    handlePageChanged(pageIndex) {
      this.currentPageIndex = pageIndex
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