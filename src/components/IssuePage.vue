<template lang='html'>
    <i-layout id="IssuePage">
    <i-layout-section width="400px">
      <div class="px-3 py-4">
        <h1 class="text-serif font-weight-bold">{{issue.newspaper['name']}}</h1>
        <collection-tagger v-model="issue"></collection-tagger>
        <p class="text-muted text-capitalize" v-if="issue.date">{{$d(new Date(issue.date), 'long')}}</p>
        <p><strong><i>Le Temps</i> is a Swiss French-language daily newspaper published in Berliner
          format in Geneva by Le Temaps SA.</strong></p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
          esse cillum dolore eu fugiat nulla pariatur.</p>
          <button type="button" name="button" v-on:click="toggleMode('text')">Text</button>
          <button type="button" name="button" v-on:click="toggleMode('image')">Image</button>
        <hr>
        <named-entity-explorer v-model="issue"></named-entity-explorer>
      </div>
    </i-layout-section>
    <i-layout-section>
      <issue-viewer
        v-show="mode === 'image'"
        v-model="issue"
        v-bind:minZoomLevel="minZoomLevel"
        v-bind:maxZoomLevel="maxZoomLevel"
        v-bind:zoomLevel="zoomLevel"
        v-bind:page="page"
        v-on:zoom="onZoom"
        v-on:click="onClick"
        ></issue-viewer>
        <article-viewer
        v-model="article" />
      </i-layout-section>
    </i-layout>
</template>

<script>
import Article from '@/models/Article';
import Page from '@/models/Page';

import ArticleViewer from './modules/ArticleViewer';
import CollectionTagger from './CollectionTagger';
import IssueViewer from './modules/IssueViewer';
import IssueViewerZoomSlider from './modules/IssueViewerZoomSlider';
import NamedEntityExplorer from './NamedEntityExplorer';

export default {
  data: () => ({
    zoomLevel: 0.5,
    minZoomLevel: 0.25,
    maxZoomLevel: 4,
    page: new Page(),
    mode: 'image',
    article: new Article(),
  }),
  computed: {
    userDataActive() {
      return this.$store.state.settings.sidebar_userdata_expanded;
    },
    issue() {
      return this.$store.state.issue.issue;
    },
  },
  components: {
    NamedEntityExplorer,
    IssueViewer,
    IssueViewerZoomSlider,
    CollectionTagger,
    ArticleViewer,
  },
  methods: {
    toggleUserData() {
      this.$store.commit('settings/TOGGLE_USERDATA_EXPANDED');
    },
    toggleMode(mode) {
      this.mode = mode;
    },
    onZoom(zoom) {
      this.zoomLevel = zoom;
    },
    onClick(page) {
      // TODO: name: 'article' when there is an article_uid
      this.$router.push({
        name: 'page',
        params: {
          issue_uid: this.issue.uid,
          page_uid: page.uid,
        },
      });
    },
    loadArticle(articleUid) {
      this.$store.dispatch('issue/LOAD_ARTICLE', articleUid).then((article) => {
        this.article = article;
      });
    },
    loadPage(pageUid) {
      this.$store.dispatch('issue/LOAD_PAGE', pageUid).then((page) => {
        this.page = this.issue.pages.find(p => p.uid === page.uid);
      });
    },
  },
  mounted() {
    this.$store.dispatch('issue/LOAD_ISSUE', this.$route.params.issue_uid).then((issue) => {
      let pageUid = issue.pages[0].uid;

      if (typeof this.$route.params.page_uid !== 'undefined') {
        pageUid = this.$route.params.page_uid;
      }

      if (typeof this.$route.params.article_uid !== 'undefined') {
        const articleUid = this.$route.params.article_uid;
        this.loadArticle(articleUid);
      }

      this.$store.commit('SET_HEADER_TITLE', {
        subtitle: this.$d(this.issue.date, 'short'),
        title: this.issue.newspaper.name,
      });

      this.loadPage(pageUid);
    });
  },
  watch: {
    '$route.params.page_uid': {
      handler(pageUid) {
        this.loadPage(pageUid);
      },
    },
    '$route.params.article_uid': {
      handler(articleUid) {
        this.loadArticle(articleUid);
        // this.$store.dispatch('issue/LOAD_PAGE', pageUid).then((page) => {
        //   this.page = this.issue.pages.find(p => p.uid === page.uid);
        // });
      },
    },
  },
};
</script>

<style scoped lang='less'>
</style>
