<template lang="html">
  <div id="issue-viewer">
      <thumbnail-slider
      v-model="issue"
      v-bind:viewer="viewer"
      v-on:click="goToPage"
      v-bind:page_uid="page.uid"
      v-bind:page="page"
      class="strip"
      ></thumbnail-slider>
    <div id="os-viewer"></div>
    <b-navbar class="header" type="light" variant="light">
      <b-button-toolbar class="mx-auto">
        <b-button-group class="mx-1" size="sm">
          <b-btn v-on:click.prevent="goToPage('first')">&laquo;</b-btn>
          <b-btn v-on:click.prevent="goToPage('previous')">&lsaquo;</b-btn>
        </b-button-group>
        <b-navbar-nav>
          <b-nav-text>{{page.num}} / {{issue.lastPageNumber}}</b-nav-text>
        </b-navbar-nav>
        <b-button-group class="mx-1" size="sm">
          <b-btn v-on:click.prevent="goToPage('next')">&rsaquo;</b-btn>
          <b-btn v-on:click.prevent="goToPage('last')">&raquo;</b-btn>
        </b-button-group>
      </b-button-toolbar>
    </b-navbar>
  </div>
</template>

<script>
import OpenSeadragon from 'openseadragon';
import ViewerOverlay from '@/d3-modules/ViewerOverlay';
import Page from '@/models/Page';
import Issue from '@/models/Issue';
import ThumbnailSlider from './ThumbnailSlider';

export default {
  model: {
    prop: 'issue',
  },
  props: {
    issue: {
      default: new Issue(),
    },
    minZoomLevel: {
      default: 0.25,
    },
    maxZoomLevel: {
      default: 5,
    },
    zoomLevel: {
      default: 0.5,
    },
    page: {
      default: new Page(),
    },
  },
  data: () => ({
    viewer: false,
    overlay: null,
  }),
  computed: {
    domain() {
      return [this.minZoomLevel, this.maxZoomLevel];
    },
    zoom: {
      get() {
        return this.zoomLevel;
      },
      set(val) {
        this.$emit('zoom', val);
      },
    },
  },
  methods: {
    init() {
      if (!this.viewer) {
        this.viewer = OpenSeadragon({
          // debugMode: true,
          sequenceMode: true,
          id: 'os-viewer',
          showNavigationControl: false,
          showSequenceControl: false,
          initialPage: 0,
          minZoomLevel: this.minZoomLevel,
          maxZoomLevel: this.maxZoomLevel,
          defaultZoomLevel: this.zoomLevel,
          tileSources: this.issue.pages.map(elm => elm.iiif),
          animationTime: 0,
          gestureSettingsMouse: {
            clickToZoom: false,
            dblClickToZoom: true,
          },
          visibilityRatio: 0.1,
        });

        this.overlay = new ViewerOverlay(this.viewer);

        this.viewer.addHandler('zoom', (event) => {
          this.overlay.updateZoomLevel(event.zoom);
          this.$emit('zoom', event.zoom);
        });
      }
    },
    goToPage(page) {
      const index = this.issue.pages.findIndex(p => p.uid === this.page.uid);

      if (page instanceof Page) {
        this.$emit('click', page);
      } else if (page === 'previous') {
        this.$emit('click', this.issue.pages[Math.max(0, index - 1)]);
      } else if (page === 'next') {
        this.$emit('click', this.issue.pages[Math.min(this.issue.pages.length - 1, index + 1)]);
      } else if (page === 'first') {
        this.$emit('click', this.issue.pages[0]);
      } else if (page === 'last') {
        this.$emit('click', this.issue.pages[this.issue.pages.length - 1]);
      }
    },
  },
  watch: {
    issue: {
      handler() {
        this.init();
      },
    },
    zoomLevel: {
      handler(val) {
        this.viewer.viewport.zoomTo(val);
      },
    },
    page: {
      handler(val) {
        if (this.viewer) {
          this.viewer.goToPage(this.issue.pages.indexOf(val));
          this.overlay.update(val);
        }
      },
    },
  },
  mounted() {},
  components: {
    ThumbnailSlider,
  },
};
</script>

<style lang="less">
#issue-viewer {
    background: #eeeeee;
    display: grid;
    grid-template-columns: 120px auto;
    grid-template-rows: 50px auto;
    grid-template-areas: "header header" "strip osviewer";
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
}

#os-viewer {
    grid-area: osviewer;

    .openseadragon-canvas {
        outline: none;
    }

    #overlay-left,
    #overlay-right {
        color: #757575;
        text-decoration: none;
        padding-top: 15px;
        & > div:first-child {
            &.loading {
                opacity: 0;
            }

            &.loaded {
                opacity: 1;
                transition: opacity 250ms;
                transition-delay: 250ms;
            }
        }
    }

    #overlay-left {
        font-size: 3em;
        text-align: right;
        .entity {
            border-right: 5px solid transparent;
            padding-top: 5px;
            padding-bottom: 5px;
            padding-right: 50px;
            &:hover {
                border-color: teal;
            }

            .title {
                font-weight: bold;
            }
        }

        h3 {
            font-weight: bold;
            border-bottom: 1px solid lightgray;
            padding-bottom: 0.5rem;
            padding-right: 50px;
            font-style: italic;
            font-size: 1.3em;
        }
    }

    #overlay-right {
        font-size: 0.8em;
        text-align: left;
        text-decoration: none;

        .entity {
            border-left: 5px solid transparent;
            padding-top: 5px;
            padding-bottom: 5px;
            padding-left: 10px;
            &:hover {
                border-color: teal;
            }
            .title {
                font-weight: bold;
            }
        }
        h3 {
            border-bottom: 1px solid lightgray;
            padding-bottom: 0.5rem;
            padding-left: 10px;
            font-style: italic;
            font-size: 1em;
        }
    }

    #overlay-regions {
        .region {
            mix-blend-mode: multiply;
            transition: background 200ms;
            &:hover {
                background: fade(#FFEB3B, 30);
            }
        }
    }

}
</style>
