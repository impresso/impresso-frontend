<template lang="html">
  <div v-bind:id="id" v-bind:bbox="bbox" class="os-viewer"></div>
</template>

<script>
import OpenSeadragon from 'openseadragon';

const uuid = require('uuid');

export default {
  model: {
    prop: 'tileSource',
  },
  props: ['tileSource', 'bbox'],
  data: () => ({
    id: `os-viewer-${uuid.v4()}`,
  }),
  mounted() {
    this.viewer = OpenSeadragon({
      id: this.id,
      tileSources: [this.tileSource],
      showNavigationControl: false,
      minZoomLevel: 1,
      fitBoundsPlacement: OpenSeadragon.Placement.CENTER,
    });
    this.viewer.addHandler('animation-start', () => {
      this.fitThumb();
    });
    this.viewer.addHandler('open', () => {
      this.fitThumb();
    });
  },
  methods: {
    fitThumb() {
      const dw = this.viewer.world.getItemAt(0).getContentSize().x;
      const dh = this.viewer.world.getItemAt(0).getContentSize().y;
      const rect = new OpenSeadragon.Rect(
        (this.bbox[0] / dw) - 0.02,
        (this.bbox[1] / dh) - 0.02,
        (this.bbox[2] / dw) + 0.04,
        (this.bbox[3] / dh) + 0.04,
      );
      this.viewer.viewport.fitBounds(rect, true);
    },
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
