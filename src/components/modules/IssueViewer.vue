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
  },
  data: () => ({
    viewer: false,
  }),
  methods: {
    goToPage(page) {
      this.$emit('click', page);
    },
  },
  watch: {
    issue: {
      handler(val) {
        if (!this.viewer) {
          this.viewer = OpenSeadragon({
            // debugMode: true,
            sequenceMode: true,
            collectionRows: 1,
            id: 'os-viewer',
            showNavigator: false,
            showNavigationControl: false,
            showSequenceControl: false,
            initialPage: this.page_number,
            minZoomLevel: 0.3,
            defaultZoomLevel: 0,
            tileSources: val.pages.map(elm => elm.iiif),
          });
        }
      },
    },
    page_number: {
      handler(page) {
        if (this.viewer) {
          this.viewer.goToPage(page);
        }
      },
    },
  },
  components: {
    ThumbnailSlider,
  },
};
</script>

<style scoped lang="less">
@import "./../../assets/less/style.less";

#issue-viewer {
    display: flex;
    height: 100%;
    background: @clr-grey-200;
}

#os-viewer {
    flex: 1;
    height: 100%;
}

.strip {
    width: 140px;
    height: 100%;
    position: relative;
}
</style>
