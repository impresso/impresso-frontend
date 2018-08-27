<template lang="html">
    <div v-bind:id="id" class="os-viewer"></div>
</template>

<script>
import OpenSeadragon from 'openseadragon';

const uuid = require('uuid');

export default {
  model: {
    prop: 'tileSource',
  },
  props: ['tileSource'],
  data: () => ({
    id: `os-viewer-${uuid.v4()}`,
  }),
  mounted() {
    this.viewer = OpenSeadragon({
      id: this.id,
      tileSources: [this.tileSource],
      showNavigationControl: false,
      minZoomLevel: 0.5,
      defaultZoomLevel: 1,
    });
  },
  watch: {
    tileSource: {
      handler(val) {
        this.viewer.addTiledImage({
          tileSource: val,
          index: 0, // the index of the item. Added on top of all other items if not specified.
          replace: true, // the item at index will be removed and the new item is added in its place
        });
      },
    },
  },
};
</script>

<style scoped lang="less">
.os-viewer {
    height: 100%;
    width: 100%;
}
</style>
