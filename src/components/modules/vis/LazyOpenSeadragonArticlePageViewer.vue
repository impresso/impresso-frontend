<template>
  <div ref="viewer">
    <open-seadragon-viewer v-bind:handler="handler" v-if="isVisible">
    </open-seadragon-viewer>
  </div>
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
    observer: undefined,
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

    // old browser - load right away
    if (!('IntersectionObserver' in window)) {
      this.isVisible = true
    }

    this.observer = new IntersectionObserver((entries) => {
      let entry = entries[0];

      if (entries.length > 1) {
        const intersectingEntry = entries.find((e) => e.isIntersecting);

        if (intersectingEntry) {
          entry = intersectingEntry;
        }
      }

      this.isVisible = entry.isIntersecting
      console.log('isVisible', this.isVisible)
    })
    if (this.observer) {
      this.observer.observe(this.$refs.viewer)
    }
  },
  methods: {
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
