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
                <span v-html="$t('table_of_contents')"></span>
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
                ></div>
                <div
                  v-else-if="applyCurrentSearchFilters"
                  v-html="
                    $tc('numbers.articlesMatchingWithinSearch', matchingArticles.length, {
                      n: $n(matchingArticles.length),
                      q: suggestionQuery
                    })
                  "
                ></div>
                <div
                  v-else
                  v-html="
                    $tc('numbers.articlesMatching', matchingArticles.length, {
                      n: $n(matchingArticles.length),
                      q: suggestionQuery
                    })
                  "
                ></div>
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
          :mediaSource="mediaSource"
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
          v-if="isContentAvailable && mode === FacsimileMode"
          :class="{ 'show-outlines': outlinesVisible }"
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

        <!-- <OSViewer
          :style="isContentAvailable && mode === FacsimileMode ? {} : { display: 'none' }"
          :pages="pagesIIIFUrls"
          :pageRegions="regions"
          :pageIndex="currentPageIndex"
          @update:pageIndex="changeCurrentPageIndex"
        /> -->

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

        <thumbnail-navigator
          v-if="mode === FacsimileMode"
          class="position-absolute"
          style="bottom: 1rem"
          :pages="issue.pages"
          :current-page-uid="pageId"
          @update:current-page-uid="pageThumbnailSelected"
        />
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script lang="ts">
import { defineComponent, PropType, ComponentPublicInstance } from 'vue'

import OpenSeadragonArticleViewer from '@/components/modules/OpenSeadragonArticleViewer.vue'
import OSViewer, { PageRegion } from '@/components/osviewer/OSViewer.vue'
import List from '@/components/modules/lists/List.vue'
import IssueViewerText from '@/components/modules/IssueViewerText.vue'
import {
  issues as issuesService,
  tableOfContents as tableOfContentsService,
  search as searchService,
  images as imagesService
} from '@/services'
import { CommonQueryParameters, getQueryParameter } from '@/router/util'
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
import ThumbnailNavigator from '@/components/thumbnailNavigator/ThumbnailNavigator.vue'
import { mapStores } from 'pinia'
import { useEntitiesStore } from '@/stores/entities'
import { useUserStore } from '@/stores/user'
import { Navigation } from '@/plugins/Navigation'
import IssueViewerPageHeading from '@/components/IssueViewerPageHeading.vue'
import { SupportedFiltersByContext } from '@/logic/filters'
import type { Filter, IImage, MediaSource } from '@/models'
import type ArticleBase from '@/models/ArticleBase'
import type Page from '@/models/Page'
import type Image from '@/models/Image'

// Define types for service queries and responses
interface ServiceQuery {
  q: string
  limit: number
  page: number
  issueUid?: string
  filters: Record<string, any>[]
}

interface PaginationList {
  perPage: number
  currentPage: number
  totalRows: number
}

interface MarginaliaSections {
  title: string
  isLeft: boolean
  items: string[]
}

// Viewer modes
const FacsimileMode = '0'
const RegionTranscriptMode = '1'
const IIIFViewerTranscriptMode = '2'

// Route parameters
const Params = Object.freeze({ IssueId: 'issue_uid' })
const QueryParams = Object.freeze({
  PageNumber: 'p',
  ArticleId: 'articleId',
  TextMode: 'text'
})
const AllowedFilterTypes = SupportedFiltersByContext.search

export default defineComponent({
  data() {
    return {
      FacsimileMode,
      RegionTranscriptMode,
      IIIFViewerTranscriptMode,

      issue: undefined as Issue | undefined,
      tableOfContents: undefined as TableOfContents | undefined,
      issueImages: [] as IImage[],
      issueImagesIndex: {} as Record<string, IImage[]>,
      pagesArticles: {} as Record<string, Article[]>,
      pagesMarginalia: {} as Record<string, MarginaliaSections[]>,

      // left panel
      paginationPerPage: 20,
      paginationCurrentPage: 1,
      paginationTotalRows: 0,
      matchingArticles: [] as Article[],
      outlinesVisible: false,
      isFullscreen: false,
      isLoadingServiceQuery: false,
      displayOnlyMatchingArticles: false
    }
  },
  components: {
    OpenSeadragonArticleViewer,
    OSViewer,
    List,
    IssueViewerText,
    SearchPills,
    IssueViewerBookmarker,
    IssueViewerTableOfContents,
    CollectionAddTo,
    WithTooltip,
    IssueViewerPageHeading,
    ThumbnailNavigator
  },
  props: {
    filters: {
      type: Array as PropType<Filter[]>,
      default: () => []
    },
    filtersWithItems: {
      type: Array as PropType<Filter[]>,
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
    ...mapStores(useEntitiesStore),
    ...mapStores(useUserStore),
    applyCurrentSearchFilters: mapApplyCurrentSearchFilters(),
    searchQuery: {
      ...searchQueryGetter(),
      ...searchQuerySetter({
        additionalQueryParams: {
          p: '1'
        }
      })
    },
    isLoading(): boolean {
      return this.issue == null
    },
    $navigation(): Navigation {
      return new Navigation(this)
    },
    allowedFilters(): Filter[] {
      // filter by type
      return this.filtersWithItems.filter(({ type }) => AllowedFilterTypes.includes(type))
    },
    ignoredFilters(): Filter[] {
      return this.filtersWithItems.filter(({ type }) => !AllowedFilterTypes.includes(type))
    },
    countActiveFilters(): number {
      return this.filters.length
    },
    hasMatchingArticles(): boolean {
      return (
        this.suggestionQuery.length > 0 ||
        (this.applyCurrentSearchFilters && this.countActiveFilters > 0)
      )
    },
    issueId(): string {
      return this.$route.params[Params.IssueId] as string
    },
    pageId(): string | undefined {
      return getPageId(this.issueId, this.currentPageIndex)
    },
    articleId(): string | undefined {
      const shortArticleId = this.$route.query[CommonQueryParameters.LegacyArticleId] as string
      if (!shortArticleId) return
      return getLongArticleId(this.issueId, shortArticleId)
    },
    selectedArticle(): ArticleBase | undefined {
      if (!this.tableOfContents) {
        return undefined
      }
      return this.tableOfContents.articles.find(d => d.uid === this.articleId)
    },
    mode: {
      get(): string {
        if (!this.selectedArticle || !this.articleId) return FacsimileMode
        const textMode = getQueryParameter(this, QueryParams.TextMode)
        if ([FacsimileMode, RegionTranscriptMode, IIIFViewerTranscriptMode].includes(textMode)) {
          return textMode
        }
        return IIIFViewerTranscriptMode
      },
      set(q: string) {
        this.$navigation.updateQueryParametersWithHistory({
          [QueryParams.TextMode]: q
        })
      }
    },
    page(): Page | undefined {
      if (this.currentPageIndex === -1) return undefined
      return this.issue?.pages[this.currentPageIndex]
    },
    pagesIIIFUrls(): string[] | undefined {
      if (this.issue == null) return undefined
      return this.issue.pages.map(page => page.iiif)
    },
    regions(): PageRegion[] {
      const articles = this.pagesArticles[this.currentPageIndex]
      if (articles == null) return []

      const regions = articles.flatMap(article =>
        article.regions
          .filter(region => region.pageUid === this.pageId)
          .map(region => ({
            articleUid: article.uid,
            pageUid: this.pageId,
            coords: region.coords as PageRegion['coords']
          }))
      )

      return regions
    },
    tableOfContentsArticles(): ArticleBase[] {
      let items: ArticleBase[] = []
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
      get(): string {
        return getQueryParameter(this, CommonQueryParameters.SuggestionQuery, '') ?? ''
      },
      set(q: string) {
        this.paginationCurrentPage = 1
        this.$navigation.updateQueryParametersWithHistory({
          q
        })
      }
    },
    serviceQuery(): ServiceQuery {
      const sq = {
        q: this.suggestionQuery,
        limit: this.paginationPerPage,
        page: this.paginationCurrentPage,
        issueUid: this.issueId,
        filters: this.applyCurrentSearchFilters ? this.filters.map(getFilterQuery) : []
      }
      // eslint-disable-next-line
      console.debug('[IssueViewerPage] computed serviceQuery', sq)
      return sq
    },
    paginationList(): PaginationList {
      return {
        perPage: this.paginationPerPage,
        currentPage: this.paginationCurrentPage,
        totalRows: this.paginationTotalRows
      }
    },
    currentPageIndex: {
      get(): number {
        if (!this.issue) return -1
        if (this.selectedArticle) {
          const articlePage = this.selectedArticle.pages[0]
          return this.issue.pages.findIndex(p => p.uid === articlePage.uid)
        }
        const pageNumber = parseInt(getQueryParameter(this, QueryParams.PageNumber) as string, 10)
        if (isNaN(pageNumber)) return 0
        // handle missing pages.
        return this.issue.pages.findIndex(p => p.num === pageNumber)
      },
      set(index: number) {
        if (this.mode !== FacsimileMode) {
          // if we are not in facsimile mode, we do not change the page index
          return
        }
        const pageNumber = this.issue?.pages[index]?.num

        this.$navigation.updateQueryParameters({
          [QueryParams.ArticleId]: undefined,
          [QueryParams.PageNumber]: String(pageNumber)
        })
      }
    },
    currentUser() {
      return this.userStore.user === false ? undefined : this.userStore.user
    },
    isContentAvailable(): boolean {
      if (this.issue == null) return false
      const isPublic = this?.issue?.accessRights === 'OpenPublic'
      const isLoggedIn = this.currentUser?.isActive ?? false
      return isPublic || isLoggedIn
    },
    marginaliaSections(): MarginaliaSections[] {
      return this.pagesMarginalia[this.currentPageIndex] ?? []
    },
    mediaSource() {
      const newspaper = this.tableOfContents?.newspaper
      if (!newspaper) return undefined
      return {
        id: newspaper.id,
        name: newspaper.type,
        type: 'newspaper'
      } satisfies MediaSource
    }
  },
  watch: {
    issueId: {
      async handler(id: string) {
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
        this.issueImagesIndex = this.issueImages.reduce(
          (acc: Record<string, IImage[]>, d: IImage) => {
            if (d.contentItemUid != null) {
              if (!Array.isArray(acc[d.contentItemUid])) {
                acc[d.contentItemUid] = [d]
              } else {
                acc[d.contentItemUid].push(d)
              }
            }
            return acc
          },
          {}
        )
      },
      immediate: true
    },
    currentPageIndex: {
      async handler(pageIndex: number) {
        await Promise.all([this.loadRegions(pageIndex), this.loadMarginalia(pageIndex)])
      },
      immediate: true
    },
    serviceQuery: {
      handler(params: ServiceQuery, oldParams: ServiceQuery) {
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
    pageThumbnailSelected(pageUid: string) {
      const pageIndex = this.issue?.pages.findIndex(p => p.uid === pageUid)
      if (pageIndex != null && pageIndex >= 0) {
        this.changeCurrentPageIndex(pageIndex)
      }
    },
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
    keyDown(e: KeyboardEvent) {
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
        ;(this.$refs.issuePageViewer as ComponentPublicInstance).$el
          .requestFullscreen()
          .then(() => {})
          .catch((err: Error) => {
            console.info(
              `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
            )
          })
      } else {
        document.exitFullscreen()
      }
    },
    handleFiltersChanged(filters: Filter[]) {
      this.displayOnlyMatchingArticles = true
      // add back ignored filters so that we can reuse them in other views
      this.searchQuery = new SearchQuery({
        filters: filters.concat(this.ignoredFilters)
      })
    },
    handleMatchingArticlesChangePage(page: number) {
      this.paginationCurrentPage = page
    },
    changeCurrentPageIndex(pageIndex: number) {
      this.currentPageIndex = pageIndex
    },
    handleRemoveSelection() {
      this.$navigation.updateQueryParameters({
        [QueryParams.ArticleId]: undefined
      })
    },
    handleArticleSelected(article: ArticleBase) {
      this.$navigation.updateQueryParameters({
        [QueryParams.ArticleId]: getShortArticleId(article.uid),
        [QueryParams.PageNumber]: String(article.pages[0]?.num)
      })
    },
    handleArticleIdSelectedInViewer(articleUid: string) {
      // display the whole table of contents
      this.displayOnlyMatchingArticles = false
      this.$navigation.updateQueryParameters({
        [QueryParams.ArticleId]: getShortArticleId(articleUid)
      })
    },
    async loadRegions(pageIndex: number) {
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
    async loadMarginalia(pageIndex: number) {
      if (this.issue == null) return
      if (this.pagesMarginalia[pageIndex] == null) {
        const results = await Promise.all([
          this.entitiesStore.loadPageTopics(this.pageId as string),
          this.entitiesStore.loadPageEntities(this.pageId as string)
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
    showArticleText(articleUid: string) {
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
})
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
@import '@/assets/legacy/bootstrap-impresso-theme-variables.scss';
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
