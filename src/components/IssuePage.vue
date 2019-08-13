<template lang="html">
  <i-layout id="IssuePage">
    <i-layout-section width="350px" class="border-right">
      <div slot="header" class="border-bottom border-tertiary bg-light">
        <b-tabs pills class="border-bottom mx-2 pt-2">
          <template slot="tabs">
            <b-nav-item class="pl-2 active"
              active-class='none'>{{$t('table_of_contents')}}</b-nav-item>
          </template>
        </b-tabs>
        <div class="py-2 px-3">
          <div v-if="issue" class="mb-2">
            <div>{{ issue.newspaper.name }}</div>
            <div class="small-caps">{{ $d(issue.date, 'long') }}</div>
            <div class="small-caps" v-html="$t('stats', {
              countPages: issue.countPages,
              countArticles: issue.countArticles,
            })"/>
          </div>
          <search-pills
            :excluded-types="['hasTextContents', 'isFront', 'issue']"
            @remove="onRemoveFilter"
          />
          <b-input-group>
            <b-form-input
            placeholder="search for ..."
            v-model.trim="q"
            v-on:change.native="search"/>
          </b-input-group>
        </div>
      </div>
      <!--  ToC -->
      <table-of-contents v-if="isTocReady"
        :tableOfContents="issue"
        :page="page"
        :article="article"
        v-on:click="gotoArticle" />
    </i-layout-section>
    <!--  page openseadragon or article -->
    <i-layout-section>
      <div slot="header" class="border-bottom">
        <b-navbar type="light" variant="light" class="px-0 py-0">
          <b-navbar-nav class="px-2 py-2 mx-auto">
            <div>
              <label class="mr-2">{{$t("label_display")}}</label>
              <b-form-radio-group v-model="mode" button-variant="outline-primary" size="sm" buttons>
                <b-form-radio value="image"><icon name="image"/></b-form-radio>
                <b-form-radio value="text" v-bind:disabled="!article"><icon name="align-left"/></b-form-radio>
              </b-form-radio-group>
            </div>
          </b-navbar-nav>
        </b-navbar>
      </div>
      <open-seadragon-viewer
        v-show="mode === 'image'"
        v-bind:handler="handler" />
      <issue-viewer-text v-if="article && article.uid && mode === 'text'"
        v-bind:article_uid="article.uid"/>
    </i-layout-section>
    <i-layout-section width="120px" class="border-left" v-if="issue">
      <thumbnail-slider
        :bounds="bounds"
        :issue="issue"
        @click="gotoPage"
        :displayMode="mode"
        :page="page" />
    </i-layout-section>
  </i-layout>
</template>

<script>
import Vue from 'vue';
import Icon from 'vue-awesome/components/Icon';

import 'vue-awesome/icons/image';
import 'vue-awesome/icons/align-left';

import IssueViewerText from './modules/IssueViewerText';
import OpenSeadragonViewer from './modules/OpenSeadragonViewer';

import SearchPills from './SearchPills';
import TableOfContents from './modules/TableOfContents';
import ThumbnailSlider from './modules/ThumbnailSlider';

export default {
  data: () => ({
    handler: new Vue(),
    bounds: {},
    issue: null,
    page: null,
    article: null,
    currentPageIndex: -1,
    pagesIndex: {},
    isTocLoaded: false,
    isLoaded: false,
    isDragging: false,
    q: '',
  }),
  computed: {
    isTocReady() {
      return this.issue && this.page && this.isTocLoaded;
    },
    mode: {
      get() {
        return this.article ? this.$store.state.issue.viewerMode : 'image';
      },
      set(mode) {
        this.$store.commit('issue/UPDATE_VIEWER_MODE', mode);
      },
    },
  },
  methods: {
    async init() {
      if (!this.issue || this.issue.uid !== this.$route.params.issue_uid) {
        this.issue = await this.loadIssue({
          uid: this.$route.params.issue_uid,
        });
        // create or reset page index to quickly get access to the desired page
        this.pagesIndex = {};
        this.issue.pages.forEach((page, i) => {
          this.pagesIndex[page.uid] = i;
        });
        this.isTocLoaded = false;
      }
      // then let's load a page: if there's none, let's take the first one (cover)
      let pageUid;
      if (this.$route.params.page_uid) {
        pageUid = this.$route.params.page_uid;
      } else {
        pageUid = this.issue.cover;
      }

      if (!this.page || this.page.uid !== pageUid) {
        this.page = await this.loadPage({
          uid: pageUid,
        });
        this.currentPageIndex = this.issue.pages.findIndex(p => p.uid === this.page.uid);
        // we reset the handler here. Why?
        await this.resetHandler();
        // we dispatch the gotoPage to change page in openseadragon
        this.handler.$emit('dispatch', (viewer) => {
          viewer.goToPage(this.currentPageIndex);
        });
      }
      // if there's a specific article, let's load it
      if (this.$route.params.article_uid) {
        if (!this.article || this.article.uid !== this.$route.params.article_uid) {
          this.article = await this.loadArticle({
            uid: this.$route.params.article_uid,
          });
          this.selectArticle();
        }
      }

      if (this.$route.params.image_uid) {
        console.warn('WIP!');
      }

      if (!this.isTocLoaded) {
        await this.loadToC();
      }
      // load first article (according to current page!)
      if (!this.article) {
        if (this.issue.pages[this.currentPageIndex].articles.length) {
          this.article = this.issue.pages[this.currentPageIndex].articles[0];
        } else {
          console.warn('there is no article for the current page...?');
        }
      }
    },
    resetHandler() {
      const self = this;
      this.handler.$emit('destroy');
      this.handler.$emit('init', {
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
      });
      this.handler.$emit('dispatch', (viewer) => {
        viewer.addHandler('animation', () => {
          this.bounds = viewer.viewport.getBoundsNoRotate();
        });

        viewer.addHandler('update-viewport', () => {
          this.bounds = viewer.viewport.getBoundsNoRotate();
        });

        viewer.addHandler('canvas-drag', () => {
          this.isDragging = true;
        });

        viewer.addHandler('canvas-drag-end', () => {
          window.setTimeout(() => {
            this.isDragging = false;
          }, 100);
        });

        viewer.addHandler('tile-loaded', () => {
          if (self.isLoaded) { // skip
            return;
          }
          console.log('@tile-loaded');
          self.isLoaded = true;
          self.page.articles.forEach((article) => {
            // regions
            article.regions.forEach((region) => {
              const overlay = window.document.createElement('div');

              overlay.setAttribute('class', 'overlay-region');
              overlay.dataset.articleUid = article.uid;

              overlay.addEventListener('mouseenter', (event) => {
                const articleUid = event.target.dataset.articleUid;

                event.target.parentNode.querySelectorAll(`[data-article-uid=${articleUid}]`).forEach((item) => {
                  item.classList.add('selected');
                });
              });

              overlay.addEventListener('click', (event) => {
                if (this.isDragging === false || this.isDragging === undefined) {
                  const articleUid = event.target.dataset.articleUid;

                  this.$router.push({
                    name: 'article',
                    params: {
                      article_uid: articleUid,
                    },
                  });
                }
              });

              overlay.addEventListener('mouseleave', (event) => {
                const articleUid = event.target.dataset.articleUid;

                event.target.parentNode.querySelectorAll(`[data-article-uid=${articleUid}]`).forEach((item) => {
                  item.classList.remove('selected');
                });
              });

              const rect = viewer.viewport.imageToViewportRectangle(
                region.coords.x,
                region.coords.y,
                region.coords.w,
                region.coords.h);

              viewer.addOverlay(overlay, rect);
            });
            // matches
            article.matches.forEach((match) => {
              // console.log('match', match);
              if (match.pageUid === article.pages[0].uid) {
                const overlay = {
                  x: match.coords[0],
                  y: match.coords[1],
                  w: match.coords[2],
                  h: match.coords[3],
                  class: 'overlay-match',
                };
                this.handler.$emit('add-overlay', overlay);
              }
            });
          });
            // this.selectArticle();
        });
      });
    },
    loadIssue({ uid }) {
      console.info('...loading issue', uid);
      return this.$store.dispatch('issue/LOAD_ISSUE', uid);
    },
    loadPage({ uid }) {
      console.info('...loading page', uid);
      return this.$store.dispatch('issue/LOAD_PAGE', uid);
    },
    loadArticle({ uid }) {
      console.info('...loading article', uid);
      return this.$store.dispatch('issue/LOAD_ARTICLE', uid);
    },
    loadToC() {
      console.info('...loading ToC', this.issue.uid);
      return this.$store.dispatch('issue/LOAD_TABLE_OF_CONTENTS', this.issue.uid)
        .then((articles) => {
          this.issue.articles = articles;
          // for each article for each page
          for (let i = 0, l = articles.length; i < l; i += 1) {
            for (let ii = 0, ll = articles[i].pages.length; ii < ll; ii += 1) {
              const pageUid = articles[i].pages[ii].uid;
              this.issue.pages[this.pagesIndex[pageUid]].articles.push(this.issue.articles[i]);
            }
          }
          this.isTocLoaded = true;
        });
    },
    onRemoveFilter(filter) {
      this.$store.commit('search/REMOVE_FILTER', filter);
    },
    search() {
      console.info('IssuePage, search:', this.q);
      // search in page using current uids in current page,
      // add to current search pills filters
      const filtersIndex = this.$store.getters['search/getSearch'].filtersIndex;
      console.info('  has filterindex', filtersIndex);
      if (!filtersIndex.issue) {
        this.$store.commit('search/ADD_FILTER', {
          type: 'issue',
          q: this.issue.uid,
        });
      }
      // if there is no issue filter, add one!
      this.$store.commit('search/ADD_FILTER', {
        type: 'string',
        q: this.q,
      });
    },
    selectArticle() {
      const self = this;
      this.handler.$emit('dispatch', (viewer) => {
        viewer.overlaysContainer.querySelectorAll('div').forEach((overlay) => {
          if (overlay.dataset.articleUid === self.article.uid) {
            overlay.classList.add('active');
          } else {
            overlay.classList.remove('active');
          }
        });
      });
    },
    gotoPage(page) {
      this.$router.push({
        name: 'page',
        params: {
          issue_uid: this.issue.uid,
          page_uid: page.uid,
        },
      });
    },
    gotoArticle({ article }) {
      console.info('gotoArticle:', article.uid);
      this.$router.push({
        name: 'article',
        params: {
          issue_uid: article.issue.uid,
          article_uid: article.uid,
          page_uid: article.pages[0].uid,
        },
      });
    },
  },
  components: {
    OpenSeadragonViewer,
    IssueViewerText,
    ThumbnailSlider,
    TableOfContents,
    Icon,
    SearchPills,
  },
  watch: {
    $route: {
      immediate: true,
      async handler({ name, params }) {
        console.info('@$route changed:', name, params);
        await this.init();
      },
    },
  },
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

// TODO: we have this classblock twice, also on SearchPage.vue
// block is not scoped so these two interfere with eachother so they interfere
// to be the exact same
/// Maybe we can move this to bootpresso?
div.overlay-region{
  background: $clr-accent-secondary;
  opacity: 0;

  transition: opacity 300ms;
  cursor: pointer;
  &.selected, &.active{
    opacity: 0.2;
  }
}


@supports (mix-blend-mode: multiply) {
	div.overlay-region {
    mix-blend-mode: multiply;
    &.selected, &.active{
      opacity: 0.5;
    }
  }

}
</style>

<i18n>
{
  "en": {
    "stats": "<b>{countArticles}</b> articles in <b>{countPages}</b> pages",
    "label_display": "Display as",
    "table_of_contents": "table of contents"
  },
  "nl": {
    "label_display": "Toon als",
    "table_of_contents": "Inhoudsopgave"
  }
}
</i18n>
