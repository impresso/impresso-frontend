<template lang="html">
  <div id="issue-viewer">
    <div class="strip">
      <thumbnail-slider
      v-model="issue"
      v-bind:viewer="viewer"
      v-bind:page_number="page_number"
      v-on:click="goToPage"
      ></thumbnail-slider>
    </div>
    <div id="os-viewer">
    </div>

  </div>
</template>

<script>
import OpenSeadragon from 'openseadragon';
import ViewerOverlay from '../../d3-modules/ViewerOverlay';
import * as services from '../../services';
import ThumbnailSlider from '../modules/ThumbnailSlider';

export default {
  model: {
    prop: 'issue',
  },
  props: {
    issue: {
      default: false,
    },
    page_number: {
      default: 0,
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
  },
  data: () => ({
    viewer: false,
    overlay: null,
    pagedata: {},
  }),
  methods: {
    init() {
      if (!this.viewer) {
        this.viewer = OpenSeadragon({
          // debugMode: true,
          sequenceMode: false,
          id: 'os-viewer',
          showNavigationControl: false,
          showSequenceControl: false,
          initialPage: this.page_number,
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
      this.$emit('click', page);
    },
    getPageData() {
      services.pages.get(this.issue.pages[this.page_number].uid, {}).then((res) => {
        this.pagedata = res;
        this.overlay.update(res);
      });
    },
  },
  watch: {
    issue: {
      handler() {
        this.init();
        this.getPageData();
      },
    },
    page_number: {
      handler(page) {
        if (this.viewer) {
          this.viewer.goToPage(page);
          this.getPageData();
        }
      },
    },
    zoomLevel: {
      handler(val) {
        this.viewer.viewport.zoomTo(val);
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
@import "./../../assets/less/style.less";

#issue-viewer {
    display: flex;
    height: 100%;
    background: @clr-grey-200;

    .strip {
        width: 140px;
        height: 100%;
        position: relative;
    }

}

#os-viewer {
    flex: 1;
    height: 100%;

    .openseadragon-canvas {
        outline: none;
    }

    #overlay-left {
      font-size: 3em;

        color: gray;
        text-align: right;
        text-decoration: none;
        padding-top: 15px;
        .entity {
            border-right: 5px solid transparent;
            padding-top: 5px;
            padding-bottom: 5px;
            padding-right: 10px;
            &:hover {
                border-color: teal;
            }

            .title {
                font-weight: bold;
            }
        }

        h3 {
            font-weight: bold;
            padding-right: 15px;
            border-bottom: 1px solid lightgray;
            padding-bottom: 0.5rem;
            font-style: italic;
            font-size: 1.3em;
        }
    }

    .region {

        border:6px solid @clr-teal-400;
        mix-blend-mode: multiply;
        transition: background 200ms;
        &:hover{
            background: fade(@clr-yellow, 50);
        }
    }

}
</style>
