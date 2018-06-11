<template lang='html'>
  <main id='IssuePage'>
    <div class="metadata">
      <div class="px-3 py-4">
        <h1 class="text-serif font-weight-bold">{{issue.newspaper['name']}}</h1>
        <p class="text-muted text-capitalize" v-if="issue.date">{{$d(new Date(issue.date), 'long')}}</p>
        <p><strong><i>Le Temps</i> is a Swiss French-language daily newspaper published in Berliner format in Geneva by Le Temaps SA.</strong></p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <hr>
        <named-entity-explorer v-model="issue"></named-entity-explorer>
      </div>
    </div>
    <div class="viewer">
      <issue-viewer
        v-model="issue"
        v-bind:minZoomLevel="minZoomLevel"
        v-bind:maxZoomLevel="maxZoomLevel"
        v-bind:zoomLevel="zoomLevel"
        v-bind:page="page"
        v-on:zoom="onZoom"
        v-on:click="onClick"
        ></issue-viewer>
    </div>
    <div class="userdata" v-bind:class="{active: userDataActive}">
      <div class="controls">
        <a href="#" class="toggle mb-4" v-on:click.prevent="toggleUserData()"><i class="icon" v-bind:class="[userDataActive ? 'close' : 'arrow-left']"></i></a>
        <issue-viewer-zoom-slider v-model="zoomLevel" v-bind:domain="domain"></issue-viewer-zoom-slider>
      </div>
      <div class="data" v-show="userDataActive">
          <h1>userdata</h1>
      </div>
    </div>
  </main>
</template>

<script>
import Page from '@/models/Page';
import NamedEntityExplorer from './modules/NamedEntityExplorer';
import IssueViewer from './modules/IssueViewer';
import IssueViewerZoomSlider from './modules/IssueViewerZoomSlider';

export default {
  data: () => ({
    zoomLevel: 0.5,
    minZoomLevel: 0.25,
    maxZoomLevel: 4,
    page: new Page(),
  }),
  computed: {
    userDataActive() {
      return this.$store.state.settings.sidebar_userdata_expanded;
    },
    domain() {
      return [this.minZoomLevel, this.maxZoomLevel];
    },
    issue() {
      return this.$store.state.issue.issue;
    },
  },
  components: {
    NamedEntityExplorer,
    IssueViewer,
    IssueViewerZoomSlider,
  },
  methods: {
    toggleUserData() {
      this.$store.commit('settings/TOGGLE_USERDATA_EXPANDED');
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
  },
  mounted() {
    this.$store.dispatch('issue/LOAD_ISSUE', this.$route.params.issue_uid).then((issue) => {
      let pageUid = issue.pages[0].uid;

      if (typeof this.$route.params.page_uid !== 'undefined') {
        pageUid = this.$route.params.page_uid;
      }

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
  },
};
</script>

<style scoped lang='less'>
@import "./../assets/less/style.less";

@width_sidebar_userdata_contracted: 52px;

#IssuePage {
    background: @clr-grey-200;
    display: grid;
    grid-template-columns: 350px auto 52px;
    grid-template-rows: auto;
    grid-template-areas: "metadata viewer userdata";
    position: absolute;
    bottom: 0;
    top: 43px;
    width: 100%;
    .metadata {
        grid-area: metadata;
        overflow-y: auto;
        background: @clr-grey-300;
        &::-webkit-scrollbar {
            display: none;
        }
    }

    .viewer {
      grid-area: viewer;
    }

    .userdata {
        grid-area: userdata;
        display: flex;
        .data {
            flex: 1;
        }

        &.active {
            width: 300px;
            background: @clr-white;
            transition: background-color 200ms;
        }

        .controls {
            width: @width_sidebar_userdata_contracted;

            .toggle {
                display: block;
                margin: 5px;
                width: @width_sidebar_userdata_contracted - 10px;
                height: @width_sidebar_userdata_contracted - 10px;
                .icon {
                    transform: scale(1) translate(10px, 10px);
                    color: @clr-black;
                    transition: color 200ms;
                }

                &:hover {
                    .icon {
                        color: @clr-blue-grey-600;
                    }
                }
            }
        }
    }

}
</style>
