<template lang='html'>
    <i-layout id="IssuePage">
      <i-layout-section width="400px" class="border-right">
        <div slot="header" class="pt-2">
          <base-tabs v-model="tab" v-bind:tabs="tabs"></base-tabs>
        </div>
        <div class="px-3 py-4" v-show="tab.name == 'overview'">
          <h1 class="text-serif font-weight-bold">{{issue.newspaper['name']}}</h1>
          <collection-tagger v-model="issue"></collection-tagger>
          <p class="text-muted text-capitalize" v-if="issue.date">{{$d(new Date(issue.date), 'long')}}</p>
        </div>
        <div class="px-3 py-4" v-show="tab.name === 'toc'">
          <table-of-contents
          v-model="toc"
          v-on:click="loadArticle" />
        </div>
        <div v-show="tab.name === 'search'">
          <h4>search</h4>
        </div>
      </i-layout-section>
      <i-layout-section>
        <div slot="header" class="border-bottom">
          <b-navbar type="light" variant="light" class="px-0 py-0">
            <b-navbar-nav class="px-2 py-2">
              <pagination
              v-model="currentPage"
              v-bind:totalRows="totalRows"
              v-bind:size="'sm'"
              v-bind:align="'left'" />
            </b-navbar-nav>
            <b-navbar-nav class="px-2 py-2">
              <div>
                <label class="mr-2">{{$t("label_display")}}</label>
                <b-form-radio-group v-model="mode" button-variant="outline-primary" size="sm" v-on:input="loadArticles" buttons>
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
                v-model="page"
                v-bind:bounds="bounds" />
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
    page: new Page(),
    handler: new Vue(),
    bounds: {},
    tab: {},
  }),
  computed: {
    issue() {
      return this.$store.state.issue.issue;
    },
    toc() {
      return this.$store.state.issue.toc;
    },
    mode: {
      get() {
        return this.$store.state.issue.viewerMode;
      },
      set(mode) {
        this.$store.commit('issue/UPDATE_VIEWER_MODE', mode);
      },
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
    totalRows: {
      get() {
        return this.issue.pages.length;
      },
    },
    currentPage: {
      get() {
        return this.issue.pages.indexOf(this.page) + 1 || 1;
      },
      set(val) {
        this.page = this.issue.pages[val - 1];
      },
    },
  },
  methods: {
    loadPage(pageUid) {
      this.$store.dispatch('issue/LOAD_PAGE', pageUid).then((page) => {
        this.page = this.issue.pages.find(p => p.uid === page.uid);
        this.loadArticles();
      });
    },
    loadArticles() {
      if (this.mode === 'text') {
        this.$store.dispatch('issue/LOAD_ARTICLES', this.page.uid);
      }
    },
    loadArticle(articleUid) {
      this.$store.dispatch('issue/LOAD_ARTICLE', articleUid);
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
  mounted() {
    this.$store.dispatch('issue/LOAD_ISSUE', this.$route.params.issue_uid).then((issue) => {
      let pageUid = issue.pages[0].uid;

      if (typeof this.$route.params.page_uid !== 'undefined') {
        pageUid = this.$route.params.page_uid;
      }

      this.$store.commit('SET_HEADER_TITLE', {
        subtitle: this.$d(this.issue.date, 'short'),
        title: this.issue.newspaper.name,
      });

      const options = {
        // debugMode: true,
        sequenceMode: true,
        showNavigationControl: false,
        showSequenceControl: false,
        initialPage: 0,
        tileSources: this.issue.pages.map(elm => elm.iiif),
        animationTime: 0,
        gestureSettingsMouse: {
          clickToZoom: false,
          dblClickToZoom: true,
        },
        visibilityRatio: 0.1,
      };

      this.handler.$emit('init', options);

      this.handler.$emit('dispatch', (viewer) => {
        viewer.addHandler('animation', () => {
          this.bounds = viewer.viewport.getBoundsNoRotate();
        });

        viewer.addHandler('update-viewport', () => {
          this.bounds = viewer.viewport.getBoundsNoRotate();
        });
      });

      this.loadPage(pageUid);
    });

    this.$store.dispatch('issue/LOAD_TOC', this.$route.params.issue_uid);
  },
  watch: {
    '$route.params.page_uid': {
      handler(pageUid) {
        this.loadPage(pageUid);
      },
    },
    page() {
      this.handler.$emit('dispatch', (viewer) => {
        viewer.goToPage(this.currentPage - 1);
      });

      this.$router.push({
        name: 'page',
        params: {
          issue_uid: this.issue.uid,
          page_uid: this.page.uid,
        },
      });
    },
  },
};
</script>

<style scoped lang='less'>
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
