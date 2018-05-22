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
    <div id="os-viewer"></div>
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
    .openseadragon-canvas {
        outline: none;
    }

    .highlights rect {
        fill: green;
    }
}
</style>
