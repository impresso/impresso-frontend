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
    OpenSeadragon({
      id: this.id,
      tileSources: [this.tileSource],
      showNavigationControl: false,
      minZoomLevel: 0.5,
      defaultZoomLevel: 1,
    });
  },
};
</script>

<style scoped lang="less">
.os-viewer {
    height: 100%;
    width: 100%;
}
</style>
