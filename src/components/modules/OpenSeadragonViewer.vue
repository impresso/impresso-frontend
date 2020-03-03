<template lang="html">
  <div class="os-viewer"></div>
</template>

<script>
import OpenSeadragon from 'openseadragon';

export default {
  props: {
    handler: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    viewer: null,
    overlays: [],
  }),
  mounted() {
    if (this.handler) {
      this.handler.$on('init', (options = {}) => {
        this.viewer = OpenSeadragon({
          immediateRender: true,
          element: this.$el,
          showNavigationControl: false,
          animationTime: 0,
          defaultZoomLevel: 1,
          ...options,
        });

        this.viewer.addOnceHandler('tile-loaded', () => {
          this.handler.$emit('tile-loaded', this.$el);
        });
      });

      this.handler.$on('dispatch', (cb) => {
        if (cb && this.viewer) {
          cb.call(null, this.viewer);
        }
      });

      this.handler.$on('destroy', () => {
        this.destroy();
      });

      this.handler.$on('fit-bounds', (options) => {
        const rect = this.viewer.viewport.imageToViewportRectangle(
          options.x,
          options.y,
          options.w,
          options.h);
        this.viewer.viewport.fitBounds(rect, true);
      });

      this.handler.$on('fit-bounds-to-overlays', () => {
        if (this.overlays.length) {
          let rect = this.overlays.pop();

          this.overlays.forEach((region) => {
            rect = rect.union(region);
          });

          this.viewer.viewport.fitBounds(rect, true);
        }
      });

      this.handler.$on('add-overlay', (options = {}) => {
        const rect = this.viewer.viewport.imageToViewportRectangle(
          options.x,
          options.y,
          options.w,
          options.h);

        this.overlays.push(rect);

        const overlay = window.document.createElement('div');
        overlay.setAttribute('class', 'overlay');

        if (options.class !== undefined) {
          overlay.setAttribute('class', options.class);
        }

        this.viewer.addOverlay(overlay, rect);
      });
    }
  },
  methods: {
    destroy() {
      this.overlays = [];

      if (this.viewer) {
        this.viewer = this.viewer.destroy();
      }
    },
  },
  beforeDestroy() {
    this.destroy();
  },
};
</script>

<style lang="less">
.os-viewer {
  height: 100%;
  width: 100%;
}
</style>
