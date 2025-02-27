<template>
  <i-layout id="IssuePageViewer" ref="issuePageViewer">
    <!-- TOC -->
    <list
      :hide-pagination="!displayOnlyMatchingArticles"
      :paginationList="paginationList"
      @change-page="handleMatchingArticlesChangePage"
      width="300px"
    >
      <template v-slot:header v-if="issue">
        <b-tabs pills class="mx-2 pt-2">
          <template v-slot:tabs-start>
            <b-nav-item active-class="active" active>
              <a aria-current="page" class="none router-link-exact-active nav-link active">
                <span v-html="$t('table_of_contents')" />
              </a>
            </b-nav-item>
          </template>
          <template v-slot:default>
            <div class="p-2 px-3 mb-1">
              <form class="pb-1 form-inline">
                <b-form-checkbox
                  :disabled="countActiveFilters === 0"
                  v-model="applyCurrentSearchFilters"
                  switch
                >
                  {{ $t('actions.addCurrentSearch') }}
                </b-form-checkbox>
              </form>
              <b-alert
                variant="transparent"
                class="pb-1 small"
                show
                v-if="countActiveFilters === 0 || ignoredFilters.length"
              >
                <div v-if="countActiveFilters === 0">
                  {{ $t('applyCurrentSearchFiltersDisabled') }}
                </div>
                <span
                  v-if="ignoredFilters.length"
                  v-html="$tc('numbers.ignoredFilters', ignoredFilters.length)"
                >
                </span>
              </b-alert>
              <search-pills
                disable-reset
                v-if="applyCurrentSearchFilters"
                :filters="allowedFilters"
                @changed="handleFiltersChanged"
                class="pb-1"
              />
              <b-input
                class="mb-2"
                v-model.trim="suggestionQuery"
                debounce="500"
                :placeholder="$t('label_filter_articles')"
              />

              <div class="mb-2 IssueViewerPage_matchingArticles" v-if="hasMatchingArticles">
                <div v-if="isLoadingServiceQuery">{{ $t('actions.loading') }}</div>
                <div
                  v-else-if="applyCurrentSearchFilters && !suggestionQuery.length"
                  v-html="
                    $tc('numbers.articlesMatchingSearchFilters', matchingArticles.length, {
                      n: $n(matchingArticles.length),
                      q: suggestionQuery
                    })
                  "
                />
                <div
                  v-else-if="applyCurrentSearchFilters"
                  v-html="
                    $tc('numbers.articlesMatchingWithinSearch', matchingArticles.length, {
                      n: $n(matchingArticles.length),
                      q: suggestionQuery
                    })
                  "
                />
                <div
                  v-else
                  v-html="
                    $tc('numbers.articlesMatching', matchingArticles.length, {
                      n: $n(matchingArticles.length),
                      q: suggestionQuery
                    })
                  "
                />
              </div>
            </div>
          </template>
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
      <template v-slot:header>
        <IssueViewerPageHeading
          :isLoading="isLoading"
          :showCurrentSearchFilters="applyCurrentSearchFilters"
          :filtersWithItems="filtersWithItems"
          :issue="issue"
          :article="selectedArticle"
          :mediaSource="tableOfContents?.newspaper"
          :page="page"
        >
          <template v-slot:label>
            <RouterLink v-if="issue" :to="{ name: 'issue', params: { issue_uid: issueId } }">
              {{ $t('Newspaper issue') }}
            </RouterLink>

            <span v-else>{{ $t('loading') }}</span>
          </template>
          <template v-slot:actions>
            <CollectionAddTo
              right
              v-if="!isLoading && selectedArticle"
              :item="selectedArticle"
              :text="$t('add_to_collection')"
            />
            <div v-else-if="!isLoading && issue" class="d-flex justify-content-end">
              <WithTooltip :content="$t('label_previous_page')" delay>
                <b-button
                  class="border-dark"
                  variant="light"
                  size="sm"
                  :disabled="currentPageIndex === 0"
                  @click="() => changeCurrentPageIndex(currentPageIndex - 1)"
                >
                  <div class="dripicons dripicons-media-previous pt-1"></div>
                </b-button>
              </WithTooltip>
              <div
                class="px-2 pt-1 border-top border-bottom"
                v-html="
                  $t('ppOf', {
                    num: page.num,
                    pages: issue.pages.length
                  })
                "
              ></div>
              <WithTooltip :content="$t('label_next_page')" delay>
                <b-button
                  class="border-dark"
                  variant="light"
                  size="sm"
                  :disabled="currentPageIndex + 1 === issue.pages.length"
                  @click="() => changeCurrentPageIndex(currentPageIndex + 1)"
                >
                  <div class="dripicons dripicons-media-next pt-1"></div>
                </b-button>
              </WithTooltip>
            </div>
          </template>
        </IssueViewerPageHeading>
        <b-navbar-nav class="IssueViewerPage_tabs px-3 border-bottom pb-2">
          <b-tabs pills>
            <template v-slot:tabs-end>
              <b-nav-item class="pl-2" :class="{ active: mode === FacsimileMode }">
                <button
                  size="sm"
                  class="btn btn-transparent small-caps"
                  @click="mode = FacsimileMode"
                >
                  {{ $t('facsimileView') }}
                </button>
              </b-nav-item>
              <b-nav-item class="pl-2" :class="{ active: mode === RegionTranscriptMode }">
                <button
                  size="sm"
                  class="btn btn-transparent small-caps"
                  @click="mode = RegionTranscriptMode"
                >
                  {{ $t('closeReadingView') }}
                </button>
              </b-nav-item>
              <b-nav-item class="pl-2" :class="{ active: mode === IIIFViewerTranscriptMode }">
                <button
                  size="sm"
                  class="btn btn-transparent small-caps"
                  @click="mode = IIIFViewerTranscriptMode"
                >
                  {{ $t('contextView') }}
                </button>
              </b-nav-item>
            </template>
          </b-tabs>
        </b-navbar-nav>
      </template>
      <!-- content -->
      <div class="d-flex h-100 justify-content-center position-relative" v-if="issue">
        <div class="d-flex h-100 justify-content-center" v-if="!isContentAvailable">
          <div class="align-self-center">
            <p>{{ $t('errors.loggedInOnly') }}</p>
            <br />
            <b-button @click="handleLoginClick()" block size="sm" variant="outline-primary">{{
              $t('actions.login')
            }}</b-button>
          </div>
        </div>
        <open-seadragon-article-viewer
          :class="{ 'show-outlines': outlinesVisible }"
          :style="isContentAvailable && mode === FacsimileMode ? {} : { display: 'none' }"
          :pages="pagesIIIFUrls"
          :regions="regions"
          :defaultCurrentPageIndex="currentPageIndex"
          :article="{ uid: articleId }"
          :marginaliaSections="
            isContentAvailable && mode === FacsimileMode ? marginaliaSections : []
          "
          @page-changed="changeCurrentPageIndex"
          @article-selected="handleArticleIdSelectedInViewer"
        />

        <issue-viewer-text
          v-if="isContentAvailable && articleId != null && mode !== FacsimileMode"
          :article_uid="articleId"
          :withIIIFViewer="mode === IIIFViewerTranscriptMode"
        />

        <issue-viewer-bookmarker
          @remove-selection="handleRemoveSelection"
          @click-full-text="showArticleText(selectedArticle.uid)"
          :article="selectedArticle"
          :visible="mode === FacsimileMode"
        />

        <div
          class="position-absolute d-flex drop-shadow bg-dark border-radius"
          style="bottom: 1rem"
          v-if="mode === FacsimileMode"
        >
          <div v-for="(item, i) in issue.pages" :key="i" @click="() => changePageNum(item.num)">
            <page-item class="bg-dark p-2" :active="pageId === item.uid" :item="item" />
          </div>
        </div>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script>
import OpenSeadragonArticleViewer from '@/components/modules/OpenSeadragonArticleViewer.vue'
import PageItem from '@/components/modules/lists/PageItem.vue'
import List from '@/components/modules/lists/List.vue'
import IssueViewerText from '@/components/modules/IssueViewerText.vue'
import {
  issues as issuesService,
  tableOfContents as tableOfContentsService,
  search as searchService,
  images as imagesService
} from '@/services'
import { getQueryParameter } from '@/router/util'
import { getPageId, getShortArticleId, getLongArticleId } from '@/logic/ids'
import {
  searchQueryGetter,
  searchQuerySetter,
  mapApplyCurrentSearchFilters
} from '@/logic/queryParams'
import SearchQuery, { getFilterQuery } from '@/models/SearchQuery'
import Issue from '@/models/Issue'
import Article from '@/models/Article'
import TableOfContents from '@/models/TableOfContents'
import SearchPills from '@/components/SearchPills.vue'
import IssueViewerBookmarker from '@/components/IssueViewerBookmarker.vue'
import IssueViewerTableOfContents from '@/components/IssueViewerTableOfContents.vue'
import CollectionAddTo from '@/components/modules/CollectionAddTo.vue'
import WithTooltip from '@/components/base/WithTooltip.vue'
import { mapStores } from 'pinia'
import { useEntitiesStore } from '@/stores/entities'
import { useUserStore } from '@/stores/user'
import { Navigation } from '@/plugins/Navigation'
import IssueViewerPageHeading from '@/components/IssueViewerPageHeading.vue'
import { SupportedFiltersByContext } from '@/logic/filters'

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
const AllowedFilterTypes = SupportedFiltersByContext.search

const FacsimileMode = '0'
const RegionTranscriptMode = '1'
const IIIFViewerTranscriptMode = '2'

export default {
  data: () => ({
    FacsimileMode,
    RegionTranscriptMode,
    IIIFViewerTranscriptMode,
    //
    issue: /** @type {Issue|undefined} */ (undefined),
    tableOfContents: /** @type {TableOfContents|undefined} */ (undefined),
    issueImages: /** @type {Image[]} */ ([]),
    issueImagesIndex: /** @type {{[key: string] : Image[] }} */ ({}),
    pagesArticles: /** @type {{[key: string] : Article[] }} */ ({}),
    pagesMarginalia: /** @type {{[key: string] : any[] }} */ ({}),
    // left panel
    paginationPerPage: 20,
    paginationCurrentPage: 1,
    paginationTotalRows: 0,
    matchingArticles: /** @type {Article[]} */ [],
    outlinesVisible: false,
    isFullscreen: false,
    isLoadingServiceQuery: false,
    displayOnlyMatchingArticles: false
  }),
  components: {
    OpenSeadragonArticleViewer,
    PageItem,
    List,
    IssueViewerText,
    SearchPills,
    IssueViewerBookmarker,
    IssueViewerTableOfContents,
    CollectionAddTo,
    WithTooltip,
    IssueViewerPageHeading
  },
  props: {
    filters: {
      type: Array,
      default: () => []
    },
    filtersWithItems: {
      type: Array,
      default: () => []
    }
  },
  mounted() {
    if (this.suggestionQuery.length) {
      this.displayOnlyMatchingArticles = true
    }
  },
  created() {
    // eslint-disable-next-line
    console.debug('[IssueViewerPage] created()')
    window.addEventListener('fullscreenchange', this.fullscreenChange)
    window.addEventListener('keydown', this.keyDown)
  },
  unmounted() {
    // eslint-disable-next-line
    console.debug('[IssueViewerPage] unmounted()')
    window.removeEventListener('fullscreenchange', this.fullscreenChange)
    window.removeEventListener('keydown', this.keyDown)
  },
  computed: {
    ...mapStores(useEntitiesStore, useUserStore),
    applyCurrentSearchFilters: mapApplyCurrentSearchFilters(),
    searchQuery: {
      ...searchQueryGetter(),
      ...searchQuerySetter({
        additionalQueryParams: {
          p: '1'
        }
      })
    },
    isLoading() {
      return this.issue == null
    },
    $navigation() {
      return new Navigation(this)
    },
    /** @returns {Filter[]} */
    allowedFilters() {
      // filter by type
      return this.filtersWithItems.filter(({ type }) => AllowedFilterTypes.includes(type))
    },
    /** @returns {Filter[]} */
    ignoredFilters() {
      return this.filtersWithItems.filter(({ type }) => !AllowedFilterTypes.includes(type))
    },
    /** @returns {number} */
    countActiveFilters() {
      return this.filters.length
    },
    /** @returns {boolean} */
    hasMatchingArticles() {
      return (
        this.suggestionQuery.length > 0 ||
        (this.applyCurrentSearchFilters && this.countActiveFilters > 0)
      )
    },
    /** @returns {string} */
    issueId() {
      return this.$route.params[Params.IssueId]
    },
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
        return undefined
      }
      return this.tableOfContents.articles.find(d => d.uid === this.articleId)
    },
    mode: {
      get() {
        if (!this.selectedArticle) return FacsimileMode
        const textMode = getQueryParameter(this, QueryParams.TextMode)
        if ([FacsimileMode, RegionTranscriptMode, IIIFViewerTranscriptMode].includes(textMode)) {
          return textMode
        }
        return IIIFViewerTranscriptMode
      },
      set(q) {
        this.$navigation.updateQueryParametersWithHistory({
          [QueryParams.TextMode]: q
        })
      }
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

      return articles.flatMap(article =>
        article.regions.map(region => ({
          articleUid: article.uid,
          pageUid: this.pageId,
          coords: region.coords
        }))
      )
    },
    /** @returns {import('@/models/ArticleBase').default[]} */
    tableOfContentsArticles() {
      let items = []
      if (this.hasMatchingArticles) {
        items = this.matchingArticles
      } else if (this.tableOfContents) {
        items = this.tableOfContents.articles
      }
      // enrich with corresponding images
      if (!this.issueImages.length) {
        return items
      }
      return items.map(d => {
        if (this.issueImagesIndex[d.uid]) {
          d.setImages(this.issueImagesIndex[d.uid])
        }

        return d
      })
    },
    suggestionQuery: {
      /** @returns {string} */
      get() {
        return getQueryParameter(this, 'q', '') ?? ''
      },
      /** @param {string} q */
      set(q) {
        this.paginationCurrentPage = 1
        this.$navigation.updateQueryParametersWithHistory({
          q
        })
      }
    },
    /** @returns {{ q: string, limit: number, page: number, issueUid?: string, filters: Filter[] }} */
    serviceQuery() {
      const sq = {
        q: this.suggestionQuery,
        limit: this.paginationPerPage,
        page: this.paginationCurrentPage,
        issueUid: this.issue?.uid,
        filters: this.applyCurrentSearchFilters ? this.filters.map(getFilterQuery) : []
      }
      // eslint-disable-next-line
      console.debug('[IssueViewerPage] computed serviceQuery', sq)
      return sq
    },
    /** @returns {any} */
    paginationList() {
      return {
        perPage: this.paginationPerPage,
        currentPage: this.paginationCurrentPage,
        totalRows: this.paginationTotalRows
      }
    },
    currentPageIndex: {
      /** @returns {number} */
      get() {
        if (!this.issue) return -1
        if (this.selectedArticle) {
          const articlePage = this.selectedArticle.pages[0]
          return this.issue.pages.findIndex(p => p.uid === articlePage.uid)
        }
        const pageNumber = parseInt(
          /** @type {string} */ (getQueryParameter(this, QueryParams.PageNumber)),
          10
        )
        if (isNaN(pageNumber)) return 0
        // handle missing pages.
        return this.issue.pages.findIndex(p => p.num === pageNumber)
      },
      /** @param {number} index */
      set(index) {
        // set page num in query fro the page corresponding to the right currentPageIndex
        const pageNumber = this.issue?.pages[index]?.num
        this.$navigation.updateQueryParameters({
          [QueryParams.PageNumber]: pageNumber
        })
      }
    },
    /** @returns {import('@/models/User')} */
    currentUser() {
      return this.userStore.user
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
        this.issue = await issuesService.get(id).then(data => {
          console.debug('[IssueViewerPage] issue', data)
          return new Issue(data)
        })

        this.tableOfContents = new TableOfContents(
          await tableOfContentsService.get(id).then(res => {
            console.debug('[IssueViewerPage] tableOfContents', res)
            return res
          })
        )
        // / load images
        this.issueImages = await imagesService
          .find({
            query: {
              filters: [{ type: 'issue', q: id }],
              limit: 100
            }
          })
          .then(({ data }) => data)
        // remap images by article property
        this.issueImagesIndex = this.issueImages.reduce((acc, d) => {
          if (d.contentItemUid != null) {
            if (!Array.isArray(acc[d.contentItemUid])) {
              acc[d.contentItemUid] = [d]
            } else {
              acc[d.contentItemUid].push(d)
            }
          }
          return acc
        }, {})
      },
      immediate: true
    },
    currentPageIndex: {
      /** @param {number} pageIndex */
      async handler(pageIndex) {
        await Promise.all([this.loadRegions(pageIndex), this.loadMarginalia(pageIndex)])
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
          return
        }
        if (this.issue == null) return
        // eslint-disable-next-line
        console.debug('[IssueViewerPage] @serviceQuery changed, params:', params)
        const { q, limit, page, issueUid, filters } = params
        this.matchingArticles = []
        if (q.length > 1 || filters.length) {
          const additionalFilters = [{ type: 'issue', q: issueUid }]
          if (q.length > 1) {
            const regex = /\*+$/i
            additionalFilters.push({ type: 'string', q: (q + '*').replace(regex, '*') })
          }
          this.isLoadingServiceQuery = true
          searchService
            .find({
              lock: false,
              query: {
                filters: filters.concat(additionalFilters),
                page,
                limit,
                group_by: 'articles'
              }
            })
            .then(({ data, total }) => {
              this.paginationTotalRows = total
              this.matchingArticles = data.map(article => new Article(article))
              this.isLoadingServiceQuery = false
            })
            .catch(err => {
              console.warn('[IssueViewerPage] @serviceQuery Error', err)
              this.isLoadingServiceQuery = false
            })
        }
      },
      immediate: true
    }
  },
  methods: {
    handleLoginClick() {
      this.userStore.setRedirectionRoute({
        path: this.$route.path,
        query: this.$route.query,
        params: this.$route.params
      })
      console.info('router', this.$route)
      this.$router.push({
        name: 'login'
      })
    },
    keyDown(e) {
      if (e.shiftKey) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault()
            this.changeCurrentPageIndex(this.currentPageIndex - 1)
            break
          case 'ArrowRight':
            e.preventDefault()
            this.changeCurrentPageIndex(this.currentPageIndex + 1)
            break
          default:
            break
        }
      }
    },
    fullscreenChange() {
      this.isFullscreen = !this.isFullscreen
    },
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        this.$refs.issuePageViewer.$el
          .requestFullscreen()
          .then(() => {})
          .catch(err => {
            console.info(
              `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
            )
          })
      } else {
        document.exitFullscreen()
      }
    },
    handleFiltersChanged(filters) {
      this.displayOnlyMatchingArticles = true
      // add back ignored filters so that we can reuse them in other views
      this.searchQuery = new SearchQuery({
        filters: filters.concat(this.ignoredFilters)
      })
    },
    handleMatchingArticlesChangePage(page) {
      this.paginationCurrentPage = page
    },
    /** @param {number} pageIndex */
    changeCurrentPageIndex(pageIndex) {
      this.currentPageIndex = pageIndex
      // this.$navigation.updateQueryParameters({
      //   [QueryParams.ArticleId]: undefined,
      //   [QueryParams.PageNumber]: String(this.issue.pages[pageIndex]?.num)
      // })
    },
    changePageNum(pageNum) {
      console.debug('[IssueViewerPage] changePageNum to:', pageNum)
      this.$navigation.updateQueryParameters({
        [QueryParams.ArticleId]: undefined,
        [QueryParams.PageNumber]: pageNum
      })
    },
    handleRemoveSelection() {
      this.$navigation.updateQueryParameters({
        [QueryParams.ArticleId]: undefined
      })
    },
    handleArticleSelected(article) {
      this.$navigation.updateQueryParameters({
        [QueryParams.ArticleId]: getShortArticleId(article.uid),
        [QueryParams.PageNumber]: String(article.pages[0]?.num)
      })
    },
    /**
     * @param {string} articleUid
     * @param {number} pageNumber (optional)
     */
    handleArticleIdSelectedInViewer(articleUid) {
      // display the whole table of contents
      this.displayOnlyMatchingArticles = false
      this.$navigation.updateQueryParameters({
        [QueryParams.ArticleId]: getShortArticleId(articleUid)
      })
    },
    /** @param {number} pageIndex */
    async loadRegions(pageIndex) {
      if (this.issue == null) return
      if (this.pagesArticles[pageIndex] == null) {
        const pageId = getPageId(this.issueId, pageIndex)
        console.debug('[IssueViewerPage] loadRegions', pageId)
        const articles = await searchService
          .find({
            query: {
              filters: [{ type: 'page', q: pageId }]
            }
          })
          .then(response => {
            return response.data.map(d => new Article(d))
          })
        this.pagesArticles[pageIndex] = articles
      }
    },
    async loadMarginalia(pageIndex) {
      if (this.issue == null) return
      if (this.pagesMarginalia[pageIndex] == null) {
        const results = await Promise.all([
          this.entitiesStore.loadPageTopics(this.pageId),
          this.entitiesStore.loadPageEntities(this.pageId)
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

        this.pagesMarginalia[pageIndex] = entitySections.concat([topicsSection])
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

<i18n lang="json">
{
  "en": {
    "stats": "<b>{countArticles}</b> articles in <b>{countPages}</b> pages <br/><span class='small'>{accessRights}</span>",
    "label_stats": "<span class='number'>{countArticles}</span> articles in <span class='number'>{countPages}</span> pages",
    "label_previous_page": "Previous Page (Shift + ←)",
    "label_next_page": "Next Page (Shift + →)",
    "label_display": "Display as",
    "label_filter_articles": "Search words...",
    "label_matching_articles": "",
    "table_of_contents": "table of contents",
    "toggle_outlines_on": "show article outlines",
    "toggle_outlines_off": "hide article outlines",
    "toggle_fullscreen_on": "switch to fullscreen mode",
    "toggle_fullscreen_off": "exit fullscreen mode",
    "add_to_collection": "Add to Collection ...",
    "filter_included_only": "show only matching articles (no results) | show only matching articles (<b>1</b> result) | show only matching articles (<b>{n}</b> results)"
  }
}
</i18n>

<style lang="scss">
@import 'src/assets/legacy/bootstrap-impresso-theme-variables.scss';
.IssueViewerPage_matchingArticles .number {
  font-weight: bold;
}
section.i-layout-section {
  background-color: $clr-bg-secondary;
}
section.i-layout-section > div.header {
  background-color: $clr-bg-primary;
}
.IssueViewerPage_tabs .active > .small-caps {
  font-weight: var(--impresso-wght-smallcaps-bold);
  font-variation-settings: 'wght' var(--impresso-wght-smallcaps-bold);
  box-shadow:
    var(--impresso-color-black) 0 2px 0 0,
    var(--impresso-color-black) 0 2px 0 0;
  border-bottom: 1px solid var(--impresso-color-black);
}
</style>
