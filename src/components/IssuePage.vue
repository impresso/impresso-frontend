<template>
  <i-layout id="IssuePage" class="bg-light" ref="issuePage">
    <i-layout-section width="350px">

      <template v-slot:header>
      <div class="border-bottom border-tertiary">
        <b-tabs pills class="mx-2 pt-2">
          <template v-slot:tabs-end>
            <b-nav-item
              class="pl-2"
              @click="switchTab('toc')"
              :class="{ active: !isTabSearch }"
              active-class="none"
              >{{ $t('table_of_contents') }}</b-nav-item
            >
            <b-nav-item
              class="pl-2"
              @click="switchTab('search')"
              :class="{ active: isTabSearch }"
              active-class="none"
              >{{ $t('search_and_find') }}</b-nav-item
            >
          </template>
        </b-tabs>
        <div class="py-2 px-3">
          <div v-if="issue" class="mb-2">
            <span v-if="isTabSearch">
              <span
                v-if="q.length"
                v-html="
                  $tc('numbers.articlesMatching', matchesTotalRows, {
                    n: $n(matchesTotalRows),
                    q,
                  })
                "
              />
              <span v-else v-html="$tc('numbers.articles', matchesTotalRows)" />
            </span>
            <span
              v-else
              class="small-caps"
              v-html="
                $t('stats', {
                  countPages: issue.countPages,
                  countArticles: issue.countArticles,
                })
              "
            />
          </div>
          <div v-if="isTabSearch">
            <search-pills
              :filters="filters"
              @changed="handleFiltersChanged"
              :excluded-types="['hasTextContents', 'isFront', 'issue', 'newspaper']"
            />
            <div class="input-group">
              <b-form-input
                placeholder="search for ..."
                v-model.trim="q"
                v-on:change="search"
              />
            </div>
          </div>
        </div>
      </div>
      </template>
      <!--  ToC -->
      <table-of-contents
        v-if="!isTabSearch && isTocReady"
        :tableOfContents="issue"
        :page="page"
        :article="article"
        :articles="matchingArticles"
        v-on:click="gotoArticle"
      />

      <table-of-contents
        v-if="isTabSearch && isTocReady"
        :tableOfContents="issue"
        :page="page"
        :article="article"
        :articles="matchingArticles"
        flatten
        v-on:click="gotoArticle"
      />

      <div class="fixed-pagination-footer p-1 m-0 mb-2" v-if="isTabSearch">
        <pagination
          v-bind:currentPage="matchesCurrentPage"
          v-bind:perPage="matchesPerPage"
          v-bind:totalRows="matchesTotalRows"
          v-bind:showDescription="false"
          v-on:change="onInputPagination"
        />
      </div>
    </i-layout-section>
    <!--  page openseadragon or article -->
    <i-layout-section main>
      <template v-slot:header>
      <div class="border-bottom">
        <b-navbar type="light" variant="light" class="px-0 py-0 border-bottom">
          <section class="p-2 pl-3">
            <h3 v-if="issue" class="m-0">
              {{ issue.newspaper.name }} &mdash;
              <span class="date small">
                {{ $d(issue.date, 'long') }}
              </span>
            </h3>
          </section>
          <b-navbar-nav v-if="issue" class=" border">
            <!-- {{ currentPageIndex}} / {{issue.pages.length}} {{ page.num}} -->
            <b-button
              variant="light"
              size="sm"
              v-bind:disabled="currentPageIndex === 0"
              v-on:click="gotoPageIndex(currentPageIndex - 1)"
            >
              <div class="dripicons dripicons-media-previous pt-1"></div>
            </b-button>
            <div v-if="page" class="px-2 pt-1">{{ $tc('pp', 1, { pages: page.num }) }}</div>
            <b-button
              variant="light"
              size="sm"
              v-bind:disabled="currentPageIndex + 1 === issue.pages.length"
              v-on:click="gotoPageIndex(currentPageIndex + 1)"
            >
              <div class="dripicons dripicons-media-next pt-1"></div>
            </b-button>
          </b-navbar-nav>
        </b-navbar>
        <b-navbar type="light" variant="light" class="px-0 py-0">
          <b-navbar-nav v-if="article" class="px-3 py-2 border-right">
            <div v-if="article">
              <span class="badge bg-accent-secondary text-clr-white">{{
                $t(`buckets.type.${article.type}`)
              }}</span>
              <span class="badge">
                <span class="small-caps" id="selected-article-language">{{
                  article.language
                }}</span>
                |
                <span>{{ articlePages }}</span>
                <div :title="$t(`buckets.language.${article.language}`)"></div>
              </span>
            </div>
          </b-navbar-nav>
          <b-navbar-nav v-if="article && article.type" class="px-3 py-2 border-right">
            <radio-group
              :modelValue="mode"
              @update:modelValue="mode = $event"
              :options="modeOptions"
              type="button"
            />
            <small>
              <info-button name="What-OCR" class="ml-2 mt-1 d-block" />
            </small>
          </b-navbar-nav>

          <b-navbar-nav class="py-2 px-3">
            <b-button
              v-show="mode === 'image'"
              class="mr-2"
              :variant="showOutlines !== '' ? 'primary' : 'outline-primary'"
              size="sm"
              @click="showOutlines = showOutlines === '' ? 'show-outlines' : ''"
            >
              <div class="d-flex flex-row align-items-center">
                <div class="d-flex dripicons dripicons-preview mr-2" />
                <div v-if="showOutlines">{{ $t('toggle_outlines_on') }}</div>
                <div v-else>{{ $t('toggle_outlines_off') }}</div>
              </div>
            </b-button>
            <b-button
              :variant="isFullscreen ? 'primary' : 'outline-primary'"
              size="sm"
              @click="toggleFullscreen"
              class="mr-3"
            >
              <div class="d-flex flex-row align-items-center">
                <div
                  class="mr-2 d-flex dripicons"
                  :class="{ 'dripicons-contract': isFullscreen, 'dripicons-expand': !isFullscreen }"
                />
                <div v-if="isFullscreen">{{ $t('toggle_fullscreen_on') }}</div>
                <div v-else>{{ $t('toggle_fullscreen_off') }}</div>
              </div>
            </b-button>
          </b-navbar-nav>
        </b-navbar>
      </div>
      </template>
      <div class="d-flex h-100 justify-content-center" v-if="!isContentAvailable && issue">
        <div class="align-self-center">
          <p>{{ $t('errors.loggedInOnly') }}</p>
          <br />
          <b-button @click="handleLoginClick()" block size="sm" variant="outline-primary">{{
            $t('actions.login')
          }}</b-button>
        </div>
      </div>
      <open-seadragon-viewer
        :class="['bg-light', showOutlines]"
        v-show="isContentAvailable && mode === 'image'"
        v-bind:handler="handler"
      />
      <issue-viewer-text
        v-if="article && article.uid && mode === 'text'"
        v-bind:article_uid="article.uid"
      />
    </i-layout-section>
    <i-layout-section width="120px" class="border-left" v-if="issue">
      <thumbnail-slider
        :bounds="bounds"
        :issue="issue"
        @click="gotoPage"
        :displayMode="mode"
        :page="page"
      />
    </i-layout-section>
  </i-layout>
</template>

<script>
import mitt from 'mitt'
import IssueViewerText from './modules/IssueViewerText.vue'
import OpenSeadragonViewer from './modules/OpenSeadragonViewer.vue'

import SearchPills from './SearchPills.vue'
import TableOfContents from './modules/TableOfContents.vue'
import ThumbnailSlider from './modules/ThumbnailSlider.vue'
import Pagination from './modules/Pagination.vue'
import InfoButton from './base/InfoButton.vue'
import { toCanonicalFilter, SupportedFiltersByContext } from '../logic/filters'
import { mapSearchQuery } from '@/logic/queryParams'
import RadioGroup from '@/components/layout/RadioGroup.vue';
import { mapStores } from 'pinia'
import { useEntitiesStore } from '@/stores/entities'
import { useIssueStore } from '@/stores/issue'
import { useUserStore } from '@/stores/user'
import { search as searchService } from '@/services'
import Article from '@/models/Article';
import { renderMetaTags } from '@/plugins/MetaTags'

export default {
  data: () => ({
    tab: 'toc',
    handler: mitt(),
    bounds: {},
    // issue: null,
    page: null,
    article: null,
    applyCurrentSearchFilters: false,
    currentPageIndex: -1,
    pagesIndex: {},
    isTocLoaded: false,
    isSearchLoaded: false,
    isMarginaliaLoaded: false,
    isMarginaliaUpdated: false,
    isLoaded: false,
    isDragging: false,
    q: '',
    isFullscreen: false,
    // matching articles
    matchesTotalRows: 0,
    matchesPerPage: 10,
    matchesCurrentPage: 1,
    // marginalia
    pageTopics: [],
    pagePersons: [],
    pageLocations: [],
    //
    matches: [],
    tocArticles: [],
    issueFilters: [],
  }),
  created() {
    window.addEventListener('fullscreenchange', this.fullscreenChange)
    window.addEventListener('keydown', this.keyDown)
  },
  unmounted() {
    window.removeEventListener('fullscreenchange', this.fullscreenChange)
    window.removeEventListener('keydown', this.keyDown)
  },
  computed: {
    ...mapStores(useEntitiesStore, useIssueStore, useUserStore),
    modeOptions() {
      return [
        { value: 'image', text: this.$t('facsimileView'), iconName: 'image' },
        {
          value: 'text',
          text: this.$t('closeReadingView'),
          iconName: 'align-left',
          disabled: !this.article,
        },
      ]
    },
    searchQuery: mapSearchQuery(),
    currentSearchFilters() {
      return this.searchQuery.filters.filter(filter =>
        SupportedFiltersByContext.search.includes(filter.type),
      )
    },
    isContentAvailable() {
      if (this.issue) {
        if (this.issue.accessRights === 'OpenPublic') {
          return true
        } else if (this.currentUser && this.currentUser.isActive) {
          return true
        }
      }
      return false
    },
    currentUser() {
      return this.userStore.user
    },
    issue() {
      return this.issueStore.issue
    },
    isTocReady() {
      return this.issue && this.page && this.isTocLoaded
    },
    isTabSearch() {
      return this.tab === 'search'
    },
    matchingArticles() {
      if (!this.isTocReady) {
        return []
      }

      const matchesUids = this.matches.map(d => d.id)
      const results = []

      this.issue.articles.forEach(article => {
        const idx = matchesUids.indexOf(article.uid)
        if (idx !== -1) {
          results.push({
            ...article,
            matches: this.matches[idx].matches,
          })
        }
      })
      return results
    },
    articlePages() {
      if (!this.article || !this.article.pages) {
        return ''
      }
      return this.$tc('pp', this.article.nbPages, {
        pages: this.article.pages.map(d => d.num).join(','),
      })
    },
    mode: {
      get() {
        // no article°uid? image without a doubt
        return this.$route.params.article_uid ?
          this.issueStore.viewerMode :
          'image';
      },
      set(mode) {
        this.issueStore.updateViewerMode(mode)
        this.init();
      },
    },
    showOutlines: {
      get() {
        return this.issueStore.showOutlines;
      },
      set(showOutlines) {
        this.issueStore.updateOutlines(showOutlines)
      },
    },
    filters: {
      get() {
        let filters = [...this.issueFilters]
        if (this.issue != null) {
          filters.push({
            type: 'issue',
            q: this.issue.uid,
          })
        }
        return filters
      },
      set(filters) {
        this.issueFilters = filters.filter(({ type }) => type !== 'issue')
      },
    },
  },
  methods: {
    async init() {
      this.issueFilters = [...this.currentSearchFilters]

      if (this.$route.query.tab === 'search') {
        this.tab = 'search'
      } else {
        this.tab = 'toc'
      }
      if (!this.issue || this.issue.uid !== this.$route.params.issue_uid) {
        await this.loadIssue({
          uid: this.$route.params.issue_uid,
        })
        this.isTocLoaded = false
      }
      // then let's load a page: if there's none, let's take the first one (cover)
      let pageUid
      if (this.$route.params.page_uid) {
        pageUid = this.$route.params.page_uid
      } else {
        pageUid = this.issue.cover
      }

      if (!this.page || this.page.uid !== pageUid) {
        this.page = await this.loadPage({
          uid: pageUid,
        })
        this.currentPageIndex = this.issue.pages.findIndex(p => p.uid === this.page.uid)

        // we reset the handler here. Why?
        await this.resetHandler()
        // we dispatch the gotoPage to change page in openseadragon
        this.handler.emit('dispatch', viewer => {
          viewer.goToPage(this.currentPageIndex)
        })
        // force reload fo marginalia, page changed.
        this.isMarginaliaLoaded = false
        this.isMarginaliaUpdated = false
      }
      // if there's a specific article, let's load it
      if (this.$route.params.article_uid) {
        if (!this.article || this.article.uid !== this.$route.params.article_uid) {
          this.article = await this.loadArticle({
            uid: this.$route.params.article_uid,
          })
        }
      } else if (this.article) {
        // unload current article
        this.article = null
      }

      if (this.article) {
        // select article using the article uid
        this.selectArticle()
      }

      if (this.$route.params.image_uid) {
        console.warn('WIP!')
      }

      if (!this.isTocLoaded) {
        await this.loadToC()
      }

      // get article properties from toc
      // if (this.mode !== 'text' && !this.article) {
      //   const selectedArticle = this.tocArticles.find(d => d.uid === this.article.uid);
      //   if (selectedArticle) {
      //     this.article = selectedArticle;
      //   }
      // }
      // refresh metadata according the current route
      this.renderMetaTags()

      if (!this.isSearchLoaded) {
        await this.search()
      }

      if (!this.isMarginaliaLoaded) {
        await this.loadMarginalia()
      }
    },
    handleLoginClick() {
      this.$router.push({ name: 'login' })
    },
    renderMetaTags() {
      let tags = {}
      const titleParts = [this.issue.newspaper.name, this.$d(this.issue.date, 'short')]

      if (this.$route.name === 'article') {
        titleParts.unshift(this.article.uid)
        tags = {
          dc: {
            'DC.title': this.article.title,
            'DC.type': 'newspaperArticle',
            'DC.identifier': this.article.uid,
            'DC.rights': 'copyright',
            'DC.language': this.article.language,
            'DC.publication': 'impresso',
            'DC.isPartOf': this.issue.newspaper.name,
            'DCTERMS.issued': this.issue.date
              .toISOString()
              .split('T')
              .shift(),
            'DCTERMS.publisher': this.issue.newspaper.name,
          },
          og: {
            'og:site_name': this.issue.newspaper.name,
          },
          meta: {
            citation_newspaper_title: this.issue.newspaper.name,
            description: this.article.excerpt,
          },
        }
      }

      renderMetaTags({
        title: titleParts.join(' · '),
        ...tags,
        updateZotero: true,
      })
    },
    switchTab(tab) {
      // swith tab query params leaving the other untouched
      console.info('switch tab to:', tab)
      this.$router.push({
        name: this.$route.name,
        params: this.$route.params,
        query: {
          tab,
        },
      })
    },
    updateMarginalia() {
      console.info('Update page marginalia')
      const listMapper = () => d => `<li>${d.item.htmlExcerpt || d.item.name} (${d.count})</li>`
      const sectionFormatter = (items, type) =>
        [
          '<section><h4 class="small-caps border-bottom">',
          this.$tc(`label.${type}.title`, items.length),
          '</h4><ul>',
          items.map(listMapper(type)).join(''),
          '</ul></section>',
        ].join('')
      this.marginaliaLeft.innerHTML = sectionFormatter(this.pageTopics, 'topic')
      this.marginaliaRight.innerHTML = [
        sectionFormatter(this.pagePersons, 'person'),
        sectionFormatter(this.pageLocations, 'location'),
      ].join('')
      this.isMarginaliaUpdated = true
    },
    resetHandler() {
      const self = this
      self.isLoaded = false
      this.handler.emit('destroy')
      this.handler.emit('init', {
        sequenceMode: true,
        showSequenceControl: false,
        initialPage: 0,
        tileSources: this.issue.pages.map(d => d.iiif),
        defaultZoomLevel: 0,
        minZoomImageRatio: 0.5,
        gestureSettingsMouse: {
          clickToZoom: false,
          dblClickToZoom: true,
        },
        visibilityRatio: 0.5,
      })
      this.handler.emit('dispatch', viewer => {
        viewer.addHandler('animation', () => {
          this.bounds = viewer.viewport.getBoundsNoRotate()
        })

        viewer.addHandler('update-viewport', () => {
          this.bounds = viewer.viewport.getBoundsNoRotate()
        })

        viewer.addHandler('canvas-drag', () => {
          this.isDragging = true
        })

        viewer.addHandler('canvas-drag-end', () => {
          window.setTimeout(() => {
            this.isDragging = false
          }, 100)
        })

        viewer.addHandler('tile-loaded', () => {
          if (self.isLoaded) {
            // skip
            return
          }
          console.info('OS Viewer @tile-loaded, n. of articles:', self.page.articles.length)
          self.isLoaded = true
          // create or reset marginalia left
          self.marginaliaLeft = window.document.createElement('div')
          self.marginaliaLeft.setAttribute('class', 'marginalia left')
          viewer.addOverlay(
            self.marginaliaLeft,
            viewer.viewport.imageToViewportRectangle(-4000, 0, 4000, 10000),
          )
          // create or reset marginalia right
          self.marginaliaRight = window.document.createElement('div')
          self.marginaliaRight.setAttribute('class', 'marginalia right')
          viewer.addOverlay(
            self.marginaliaRight,
            viewer.viewport.imageToViewportRectangle(
              viewer.world.getItemAt(0).getContentSize().x,
              0,
              4000,
              10000,
            ),
          )
          if (self.isMarginaliaLoaded) {
            self.updateMarginalia()
          }

          self.page.articles.forEach(article => {
            // regions
            // debugger;
            article.regions.forEach(region => {
              const overlay = window.document.createElement('div')

              overlay.setAttribute('class', 'overlay-region')
              overlay.dataset.articleUid = article.uid

              // selected article regions
              // if (article.uid === this.$route.params.article_uid) {
              //   this.$router.push({
              //     name: 'article',
              //     params: {
              //       article_uid: this.$route.params.article_uid,
              //     },
              //   });
              // }

              overlay.addEventListener('mouseenter', event => {
                const articleUid = event.target.dataset.articleUid

                event.target.parentNode
                  .querySelectorAll(`[data-article-uid=${articleUid}]`)
                  .forEach(item => {
                    item.classList.add('selected')
                  })
              })

              overlay.addEventListener('click', event => {
                if (this.isDragging === false || this.isDragging === undefined) {
                  const articleUid = event.target.dataset.articleUid

                  this.$router.push({
                    name: 'article',
                    params: {
                      article_uid: articleUid,
                    },
                  })
                }
              })

              overlay.addEventListener('mouseleave', event => {
                const articleUid = event.target.dataset.articleUid

                event.target.parentNode
                  .querySelectorAll(`[data-article-uid=${articleUid}]`)
                  .forEach(item => {
                    item.classList.remove('selected')
                  })
              })

              const rect = viewer.viewport.imageToViewportRectangle(
                region.coords.x,
                region.coords.y,
                region.coords.w,
                region.coords.h,
              )
              viewer.addOverlay(overlay, rect)
            })
            // matches
            article.matches.forEach(match => {
              // console.log('match', match);
              if (match.pageUid === article.pages[0]?.uid) {
                const overlay = {
                  x: match.coords[0],
                  y: match.coords[1],
                  w: match.coords[2],
                  h: match.coords[3],
                  class: 'overlay-match',
                }
                this.handler.emit('add-overlay', overlay)
              }
            })
          })
          if (this.article) {
            this.selectArticle()
          }
        })
      })
    },
    loadIssue({ uid }) {
      // console.info('...loading issue', uid);
      return this.issueStore.loadIssue(uid);
    },
    loadPage({ uid }) {
      // console.info('...loading page', uid);
      return this.issueStore.loadPage(uid);
    },
    loadPageTopics({ uid }) {
      // console.info('...loading marginalia topics', uid);
      return this.entitiesStore.loadPageTopics(uid);
    },
    loadPageEntities({ uid }) {
      // console.info('...loading marginalia named entities', uid);
      return this.entitiesStore.loadPageEntities(uid);
    },
    loadArticle({ uid }) {
      // console.info('...loading article', uid);
      return this.issueStore.loadArticle(uid);
    },
    loadToC() {
      // console.info('...loading ToC', this.issue.uid);
      return this.issueStore.loadTableOfContents()
        .then((articles) => {
          this.tocArticles = articles;
          this.isTocLoaded = true;
        });
    },
    loadMarginalia() {
      // console.info('...loading marginalia:', this.page.uid);
      return Promise.all([
        this.loadPageTopics({ uid: this.page.uid }),
        this.loadPageEntities({ uid: this.page.uid }),
      ]).then(([topicFacet, [locationFacet, personFacet]]) => {
        this.isMarginaliaLoaded = true
        this.pageTopics = topicFacet.buckets
        this.pageLocations = locationFacet.buckets
        this.pagePersons = personFacet.buckets
        if (this.isLoaded) {
          this.updateMarginalia()
        }
      })
    },
    handleFiltersChanged(filters) {
      this.issueFilters = filters.slice(0, filters.length - 1)
      this.search()
    },
    onInputPagination(page) {
      this.matchesCurrentPage = page
      this.search()
    },
    search() {
      const filters = [...this.filters]
      if (this.q.length > 0) {
        filters.push({
          type: 'string',
          q: this.q,
        })
      }

      if (!filters.length) {
        // console.info('-> search() skip, q is empty.');
        return
      }

      const query = {
        filters: filters.map(toCanonicalFilter),
        facets: [],
        group_by: 'raw',
        page: this.matchesCurrentPage,
        limit: 12,
        order_by: 'id',
      }

      searchService.find({
        query,
      }).then((res) => {
        if (query.groupBy === 'articles') {
          res.data = res.data.map(result => new Article(result));
        }
        return res;
      }).then((result) => {
        this.isSearchLoaded = true;
        this.matches = result.data;
        this.matchesTotalRows = result.total;
        // console.info('-> search() success for q:', this.q);
      })
    },
    selectArticle() {
      const self = this
      this.handler.emit('dispatch', viewer => {
        viewer.overlaysContainer.querySelectorAll('div').forEach(overlay => {
          if (self.article && overlay.dataset.articleUid === self.article.uid) {
            overlay.classList.add('active')
          } else {
            overlay.classList.remove('active')
          }
        })
      })
    },
    gotoPageIndex(idx) {
      const page = this.issue.pages[idx]
      if (page) {
        this.gotoPage(page)
      }
    },
    gotoPage(page) {
      this.$router.push({
        name: 'page',
        params: {
          issue_uid: this.issue.uid,
          page_uid: page.uid,
        },
      })
    },
    gotoArticle({ article }) {
      console.info('gotoArticle:', article.uid)
      this.$router.push({
        name: 'article',
        params: {
          issue_uid: this.issue.uid,
          article_uid: article.uid,
          page_uid: article.pages[0]?.uid,
        },
        query: {
          tab: this.tab,
        },
      })
    },
    keyDown(e) {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          this.gotoPageIndex(this.currentPageIndex - 1)
          break
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          this.gotoPageIndex(this.currentPageIndex + 1)
          break
        default:
          break
      }
    },
    fullscreenChange() {
      this.isFullscreen = !this.isFullscreen
    },
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        this.$refs.issuePage.$el
          .requestFullscreen()
          .then(() => {})
          .catch(err => {
            console.info(
              `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
            )
          })
      } else {
        document.exitFullscreen()
      }
    },
  },
  components: {
    OpenSeadragonViewer,
    IssueViewerText,
    ThumbnailSlider,
    TableOfContents,
    SearchPills,
    Pagination,
    InfoButton,
    RadioGroup,
  },
  watch: {
    $route: {
      immediate: true,
      handler({ name, params, query }) {
        console.info('@$route changed:', name, params, query)
        this.init()
      },
    },
  },
}
</script>

<style lang="scss">
@import 'src/assets/legacy/bootstrap-impresso-theme-variables.scss';

div.marginalia {
  // background: $clr-accent;
  // border: 2px solid black;
  section {
    max-width: 200px;
    font-size: 80%;
    color: #626e7a;
  }
  &.left {
    padding-right: 1em;
    text-align: right;
  }
  &.left section {
    position: absolute;
    right: 1em;
  }
  h4 {
    font-weight: bold;
    padding-bottom: 1rem;
  }
  &.right {
    padding-left: 1em;
    text-align: left;
  }
  ul {
    list-style: none;
    padding: 0.5em 0;
  }
}

@supports (mix-blend-mode: multiply) {
  div.overlay-region {
    mix-blend-mode: multiply;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "stats": "<b>{countArticles}</b> articles in <b>{countPages}</b> pages",
    "label_display": "Display as",
    "table_of_contents": "table of contents",
    "search_and_find": "search in issue",
    "toggle_fullscreen_on": "Fullscreen: on",
    "toggle_outlines_on": "outlines: on",
    "toggle_fullscreen_off": "Fullscreen: off",
    "toggle_outlines_off": "Outlines: off",
    "facsimileView": "Facsimile",
    "closeReadingView": "Transcript"
  },
  "nl": {
    "label_display": "Toon als",
    "table_of_contents": "Inhoudsopgave"
  }
}
</i18n>
