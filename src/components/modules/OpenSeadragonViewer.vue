<template lang="html">
  <div class="os-viewer"></div>
</template>

<script>
import OpenSeadragon from 'openseadragon';
import { getAuthenticationBearer } from '@/services';

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
  computed: {
    authenticationOptions() {
      const token = getAuthenticationBearer()
      return typeof token === 'string' && token.length
        ? {
          loadTilesWithAjax: true,
          ajaxHeaders: {
            Authorization: 'Bearer ' + token
          }
        }
        : null
    }
  },
  mounted() {
    if (this.handler) {
      this.handler.on('init', ({ tileSources=[], ...options} = {}) => {
        if (this.viewer) return
        // add authentication options only if striclty necessary;
        // that is, if tileSources contains `import.meta.env.VITE_BASE_URL`
        // e.g. VITE_BASE_URL=https://impresso-project.ch/
        const localAuthenticationOptions = tileSources.some(d => d.indexOf(import.meta.env.VITE_BASE_URL) === 0)
          ? this.authenticationOptions
          : null

        this.viewer = OpenSeadragon({
          immediateRender: true,
          element: this.$el,
          showNavigationControl: false,
          animationTime: 0,
          defaultZoomLevel: 1,
          tileSources,
          ...options,
          ...localAuthenticationOptions
        });

        this.viewer.addOnceHandler('tile-loaded', () => {
          this.handler.emit('tile-loaded', this.$el);
        });
      });

      this.handler.on('dispatch', (cb) => {
        if (cb && this.viewer) {
          cb.call(null, this.viewer);
        }
      });

      this.handler.on('destroy', () => {
        this.destroy();
      });

      this.handler.on('fit-bounds', (options) => {
        const rect = this.viewer.viewport.imageToViewportRectangle(
          options.x,
          options.y,
          options.w,
          options.h);
        this.viewer.viewport.fitBounds(rect, true);
      });

      this.handler.on('fit-bounds-to-overlays', () => {
        if (this.overlays.length) {
          let rect = this.overlays.pop();

          this.overlays.forEach((region) => {
            rect = rect.union(region);
          });

          this.viewer.viewport.fitBounds(rect, true);
        }
      });

      this.handler.on('add-overlay', (options = {}) => {

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
  beforeUnmount() {
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
