<template lang="html">
  <div class="os-viewer"></div>
</template>

<script lang="ts">
import { createOpenSeadragon } from '@/services/openseadragon'

interface InitEvent {
  tileSources?: string[]
  [key: string]: any
}

interface ICoords {
  x: number
  y: number
  w: number
  h: number
}

export default {
  props: {
    handler: {
      required: true,
      type: Object
    }
  },
  data: () => ({
    viewer: null,
    overlays: []
  }),
  mounted() {
    if (this.handler) {
      this.handler.on('init', ({ tileSources = [], ...options }: InitEvent = {}) => {
        if (this.viewer) return

        this.viewer = createOpenSeadragon({
          immediateRender: true,
          element: this.$el,
          showNavigationControl: false,
          animationTime: 0,
          defaultZoomLevel: 1,
          tileSources,
          ...options
        })

        this.viewer.addOnceHandler('tile-loaded', () => {
          this.handler.emit('tile-loaded', this.$el)
        })
      })

      this.handler.on('dispatch', cb => {
        if (cb && this.viewer) {
          cb.call(null, this.viewer)
        }
      })

      this.handler.on('destroy', () => {
        this.destroy()
      })

      this.handler.on('fit-bounds', options => {
        const rect = this.viewer.viewport.imageToViewportRectangle(
          options.x,
          options.y,
          options.w,
          options.h
        )
        this.viewer.viewport.fitBounds(rect, true)
      })

      this.handler.on('fit-bounds-to-overlays', () => {
        if (this.overlays.length) {
          let rect = this.overlays.pop()

          this.overlays.forEach(region => {
            rect = rect.union(region)
          })

          this.viewer.viewport.fitBounds(rect, true)
        }
      })

      this.handler.on(
        'add-overlay',
        (options: ICoords & { class?: string } = { x: 0, y: 0, h: 0, w: 0 }) => {
          const rect = this.viewer.viewport.imageToViewportRectangle(
            options.x,
            options.y,
            options.w,
            options.h
          )

          this.overlays.push(rect)

          const overlay = window.document.createElement('div')
          overlay.setAttribute('class', 'overlay')

          if (options.class !== undefined) {
            overlay.setAttribute('class', options.class)
          }

          this.viewer.addOverlay(overlay, rect)
        }
      )
    }
  },
  methods: {
    destroy() {
      this.overlays = []

      if (this.viewer) {
        this.viewer = this.viewer.destroy()
      }
    }
  },
  beforeUnmount() {
    this.destroy()
  }
}
</script>

<style lang="less">
.os-viewer {
  height: 100%;
  width: 100%;
}
</style>
