<template>
  <open-seadragon-viewer
    v-bind:handler="handler"
    v-observe-visibility="handleVisibilityChange">
  </open-seadragon-viewer>
</template>

<script>
import mitt from 'mitt';
import OpenSeadragonViewer from '@/components/modules/OpenSeadragonViewer.vue';

/**
 * @typedef {object} Overlay
 * @property {number} x - coord
 * @property {number} y - coord
 * @property {number} w - dimension
 * @property {number} h - dimension
 * @property {string} class - class
 */

export default {
  data: () => ({
    handler: mitt(),
    isVisible: false, // by default the item is not visible in the browser viewport
  }),
  props: {
    viewerOptions: {
      type: Object,
      required: true
    },
    overlays: {
      type: Array, /** @type { Overlay[] } */
      required: false
    }
  },
  components: {
    OpenSeadragonViewer,
  },
  mounted() {
    this.handler.on('tile-loaded', () => {
      if (this.overlays) {
        this.overlays.forEach(overlay => this.handler.emit('add-overlay', overlay));
      }
      this.handler.emit('fit-bounds-to-overlays');
    });
  },
  methods: {
    handleVisibilityChange(isVisible) {
      this.isVisible = isVisible
    },
    init() {
      if (!this.isVisible || !this.viewerOptions) return
      this.handler.emit('init', this.viewerOptions);
    }
  },
  watch: {
    viewerOptions() {
      this.handler.emit('destroy')
      this.init()
    },
    overlays() {
      this.handler.emit('destroy')
      this.init()
    },
    isVisible() { this.init() }
  }
}
</script>
