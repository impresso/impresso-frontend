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
      <div class="header">
        <div class="ocr-qt">
          OCR Quality <span class="qt">80%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import OpenSeadragon from 'openseadragon';

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
          animationTime: 0.1,
        });

        this.viewer.addHandler('zoom', (event) => {
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
    position: relative;
    .header{
        position: absolute;
        z-index: 1000;
        top:0;
        width: 100%;
        height: 50px;
        background: fade(@clr-grey-200, 75);
        .ocr-qt{
          float:right;
          padding: 15px;
          font-size: .75em;
          line-height: 2.3em;
          color: @clr-grey-800;
          font-style: italic;
          span.qt{
            display: block;
            float:right;
            line-height: 1em;
            padding: 3px 5px;
            font-size: 1.2em;
            margin-left: 10px;
            font-style: normal;
            .text-serif();
            font-weight: bold;
            border:2px solid @clr-grey-800;
            // padding: 3px 7px;
            border-radius: 5px;
          }
        }
    }

    .openseadragon-canvas {
        outline: none;
    }

    .highlights rect {
        fill: green;
    }
}
</style>
