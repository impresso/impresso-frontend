<template lang='html'>
    <i-layout id="IssuePage">
      <i-layout-section width="400px" class="border-right">
        <div slot="header" class="pt-2">
          <base-tabs v-model="tab" v-bind:tabs="tabs"></base-tabs>
        </div>
        <div class="px-3 py-4" v-show="tab.name == 'overview'">
          <h4 v-html="issue.newspaper.name"></h4>
          <p class="text-muted text-capitalize" v-if="issue.date">{{$d(new Date(issue.date), 'long')}}</p>
        </div>
        <div class="px-3 py-4" v-show="tab.name === 'toc'">
          <table-of-contents
          v-bind:toc="toc"
          v-bind:pageUid="pageUid"
          v-bind:articleUid="articleUid"
          v-on:click="loadArticlePage" />
        </div>
        <div class="px-3 py-4" v-show="tab.name === 'search'">
          <h4>@todo: search</h4>
        </div>
      </i-layout-section>
      <i-layout-section>
        <div slot="header" class="border-bottom">
          <b-navbar type="light" variant="light" class="px-0 py-0">
            <b-navbar-nav class="px-2 py-2">
              <pagination
              v-bind:currentPage="issue.pages.findIndex((p) => p.uid === page.uid) + 1"
              v-on:change="onPaginate"
              v-bind:totalRows="issue.pages.length"
              v-bind:size="'sm'"
              v-bind:align="'left'" />
            </b-navbar-nav>
            <b-navbar-nav class="px-2 py-2">
              <div>
                <label class="mr-2">{{$t("label_display")}}</label>
                <b-form-radio-group v-model="mode" button-variant="outline-primary" size="sm" buttons>
                  <b-form-radio value="image">{{$t("display_button_image")}}</b-form-radio>
                  <b-form-radio value="text">{{$t("display_button_text")}}</b-form-radio>
                </b-form-radio-group>
              </div>
            </b-navbar-nav>
          </b-navbar>
        </div>
        <i-layout class="bg-light">
          <i-layout-section width="120px">
            <thumbnail-slider
              v-bind:issue="issue"
              v-on:click="loadPage"
              v-bind:bounds="bounds"
              v-bind:displayMode="mode"
              v-bind:page="issue.pages.find((p) => p.uid === page.uid)" />
          </i-layout-section>
          <i-layout-section>
            <open-seadragon-viewer
              v-show="mode === 'image'"
              v-bind:handler="handler">
            </open-seadragon-viewer>
            <issue-viewer-text
              v-model="page"
              v-show="mode === 'text'" />
          </i-layout-section>
        </i-layout>
      </i-layout-section>
    </i-layout>
</template>

<script>
import Vue from 'vue';

import Issue from '@/models/Issue';
import Page from '@/models/Page';

import CollectionTagger from './CollectionTagger';
import IssueViewerText from './modules/IssueViewerText';
import OpenSeadragonViewer from './modules/OpenSeadragonViewer';
import Pagination from './modules/Pagination';
import BaseTabs from './base/BaseTabs';
import TableOfContents from './modules/TableOfContents';
import ThumbnailSlider from './modules/ThumbnailSlider';

export default {
  data: () => ({
    handler: new Vue(),
    bounds: {},
    tab: {},
    issue: new Issue(),
    page: new Page(),
    toc: {},
  }),
  computed: {
    mode: {
      get() {
        return this.$store.state.issue.viewerMode;
      },
      set(mode) {
        this.$store.commit('issue/UPDATE_VIEWER_MODE', mode);
      },
    },
    issueUid() {
      return this.$route.params.issue_uid;
    },
    pageUid() {
      return this.$route.params.page_uid;
    },
    articleUid() {
      return this.$route.params.article_uid;
    },
    tabs() {
      return [
        {
          label: this.$t('tabs.overview'),
          name: 'overview',
          active: true,
        },
        {
          label: this.$t('tabs.toc'),
          name: 'toc',
        },
        {
          label: this.$t('tabs.search'),
          name: 'search',
        },
      ];
    },
  },
  methods: {
    onPaginate(pageNumber) {
      this.loadPage(this.issue.pages[pageNumber - 1]);
    },
    loadArticle(article) {
      this.$router.push({
        name: 'article',
        params: {
          article_uid: article.uid,
          page_uid: article.pages[0].uid,
        },
      });
    },
    loadPage(page) {
      this.$router.push({
        name: 'page',
        params: {
          page_uid: page.uid,
        },
      });
    },
    loadArticlePage(data) {
      this.$router.push({
        name: 'article',
        params: {
          article_uid: data.article.uid,
          page_uid: data.page.uid,
        },
      });
    },
    selectArticle() {
      this.handler.$emit('dispatch', (viewer) => {
        viewer.overlaysContainer.querySelectorAll('div').forEach((overlay) => {
          if (overlay.dataset.articleUid === this.articleUid) {
            overlay.classList.add('active');
          } else {
            overlay.classList.remove('active');
          }
        });
      });
    },
  },
  components: {
    BaseTabs,
    CollectionTagger,
    OpenSeadragonViewer,
    IssueViewerText,
    Pagination,
    ThumbnailSlider,
    TableOfContents,
  },
  watch: {
    '$route.params.issue_uid': {
      immediate: true,
      handler(issueUid) {
        this.handler.$emit('destroy');
        this.$store.dispatch('issue/LOAD_ISSUE', issueUid).then((issue) => {
          this.issue = issue;

          this.$store.commit('SET_HEADER_TITLE', {
            subtitle: this.$d(this.issue.date, 'short'),
            title: this.issue.newspaper.name,
          });

          const options = {
            sequenceMode: true,
            showSequenceControl: false,
            initialPage: 0,
            tileSources: this.issue.pages.map(elm => elm.iiif),
            minZoomImageRatio: 0.5,
            gestureSettingsMouse: {
              clickToZoom: false,
              dblClickToZoom: true,
            },
            visibilityRatio: 0.5,
          };

          this.handler.$emit('init', options);

          this.handler.$emit('dispatch', (viewer) => {
            viewer.addHandler('animation', () => {
              this.bounds = viewer.viewport.getBoundsNoRotate();
            });

            viewer.addHandler('update-viewport', () => {
              this.bounds = viewer.viewport.getBoundsNoRotate();
            });

            viewer.addHandler('tile-loaded', () => {
              this.page.articles.forEach((article) => {
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
              });
              this.selectArticle();
            });
          });
        });

        this.$store.dispatch('issue/LOAD_TOC', issueUid).then((toc) => {
          this.toc = toc;
        });
      },
    },
    '$route.params.page_uid': {
      immediate: true,
      handler(pageUid) {
        this.$store.dispatch('issue/LOAD_PAGE', pageUid).then((page) => {
          this.page = page;

          this.handler.$emit('dispatch', (viewer) => {
            viewer.goToPage(this.issue.pages.findIndex(p => p.uid === pageUid));
          });
        });
      },
    },
    '$route.params.article_uid': {
      handler() {
        this.selectArticle();
      },
    },
  },
};
</script>

<style lang='scss'>
@import "impresso-theme/src/scss/variables.sass";

// TODO: we have this classblock twice, also on SearchPage.vue
// block is not scoped so these two interfere with eachother so they interfere
// to be the exact same
/// Maybe we can move this to bootpresso?
div.overlay-region{
  background: $clr-accent-secondary;
  opacity: 0;
  transition: opacity 300ms;
  &.selected, &.active{
    opacity: 0.25;
  }
}
</style>

<i18n>
{
  "en": {
    "label_display": "Display as",
    "display_button_image": "Image",
    "display_button_text": "Text",
    "tabs": {
        "overview": "Overview",
        "toc": "Table of Contents",
        "search": "Search"
    }
  },
  "nl": {
    "tabs": {
        "overview": "Overzicht",
        "toc": "Inhoudsopgave",
        "search": "Zoek"
    }
  }
}
</i18n>
