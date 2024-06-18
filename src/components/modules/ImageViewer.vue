<template>
  <div class="thumbnail">
    <open-seadragon-viewer
      v-bind:handler="handler">
    </open-seadragon-viewer>
  </div>
</template>

<script>
import mitt from 'mitt';
import OpenSeadragonViewer from './OpenSeadragonViewer';

export default {
  data: () => ({
    handler: mitt(),
  }),
  props: {
    image: {
      default: false,
    },
    options: {},
  },
  components: {
    OpenSeadragonViewer,
  },
  methods: {
    init() {
      const options = {

        showNavigator: true,
        navigatorAutoFade: false,
        navigatorBackground: '#f8f9fa',
        navigatorBottom: 0,
        navigatorRight: 0,
        navigatorSizeRatio: 0.25,
        defaultZoomLevel: 0,
        navigatorDisplayRegionColor: 'black',
        navigatorBorderColor: '#dee2e6',
        navigatorOpacity: 1,
        tileSources: [this.image],
        ...this.options,
      };

      this.handler.emit('init', options);
    },
  },
  mounted() {
    this.init();
  },
  watch: {
    image: {
      handler() {
        this.handler.emit('destroy');
        this.init();
      },
    },
  },
};
</script>

<style scoped lang="less">
.thumbnail {
    width: 100%;
    height: 250px;
    cursor: move;
}
</style>
