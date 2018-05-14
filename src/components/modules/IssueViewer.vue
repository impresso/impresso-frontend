<template lang="html">
  <div id="os-viewer"></div>
</template>

<script>
import OpenSeadragon from 'openseadragon';

export default {
  model: {
    prop: 'issue',
  },
  props: {
    issue: {
      default: null,
    },
    activePage: {
      default: 0,
    },
  },
  data: () => ({
    viewer: false,
  }),
  watch: {
    issue: {
      handler(val) {
        this.viewer = OpenSeadragon({
          // debugMode: true,
          sequenceMode: true,
          collectionRows: 1,
          id: 'os-viewer',
          showNavigator: false,
          showNavigationControl: false,
          showSequenceControl: false,
          initialPage: this.activePage,
          minZoomLevel: 0.3,
          defaultZoomLevel: 0,
          tileSources: val.pages.map(elm => elm.iiif),
        });
      },
    },
    activePage: {
      handler(page) {
        this.viewer.goToPage(page);
      },
    },
  },
};
</script>

<style scoped lang="less">
#os-viewer {
    width: 100%;
    height: 100%;
}
</style>
