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
          <p>{{issue.newspaper}}</p>
        </div>
        <div v-show="tab.name === 'toc'">
          <h4>table of contents</h4>
        </div>
        <div v-show="tab.name === 'search'">
          <h4>search</h4>
        </div>
      </i-layout-section>
      <i-layout-section>
        <div class="main">
          <div class="header border-bottom p-2">
            <pagination
            v-model="currentPage"
            v-bind:totalRows="totalRows"
            v-bind:size="'sm'"
            v-bind:align="'left'" />
          </div>
          <div class="strip">
            <thumbnail-slider
              v-bind:issue="issue"
              v-model="page"
              v-bind:viewer="viewer" />
          </div>
          <div class="viewer">
            <issue-viewer
            v-model="viewer"
            v-bind:issue="issue"
            v-bind:page="page" />
          </div>
        </div>
      </i-layout-section>
    </i-layout>
</template>

<script>
import Page from '@/models/Page';
import Pagination from './modules/Pagination';
import CollectionTagger from './CollectionTagger';
import BaseTabs from './base/BaseTabs';
import ThumbnailSlider from './modules/ThumbnailSlider';
import IssueViewer from './modules/IssueViewer';

export default {
  data: () => ({
    page: new Page(),
    viewer: false,
    tab: {},
  }),
  computed: {
    issue() {
      return this.$store.state.issue.issue;
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
  components: {
    CollectionTagger,
    BaseTabs,
    ThumbnailSlider,
    IssueViewer,
    Pagination,
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

      this.$store.dispatch('issue/LOAD_PAGE', pageUid).then((page) => {
        this.page = this.issue.pages.find(p => p.uid === page.uid);
      });
    });
  },
  watch: {
    '$route.params.page_uid': {
      handler(pageUid) {
        this.$store.dispatch('issue/LOAD_PAGE', pageUid).then((page) => {
          this.page = this.issue.pages.find(p => p.uid === page.uid);
        });
      },
    },
    page() {
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
.main{
  background: #eeeeee;
  display: grid;
  grid-template-columns: 120px auto;
  grid-template-rows: min-content auto;
  grid-template-areas: "header header" "strip viewer";
  height: 100%;
  position: relative;
  .strip {
      grid-area: strip;
      position: absolute;
      width: 100%;
      height: 100%;
  }

  .header {
      grid-area: header;
  }

  .viewer{
    grid-area: viewer;
  }
}
</style>

<i18n>
{
  "en": {
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
