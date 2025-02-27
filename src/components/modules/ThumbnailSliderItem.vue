<template>
  <div :id="id" class="ts-item">
    <div class="display-region" :style="style"></div>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent, CSSProperties } from 'vue'
import { createOpenSeadragon, Rect } from '@/services/openseadragon'
import { v4 } from 'uuid'

export default defineComponent({
  props: {
    tileSources: {
      default: () => undefined
    },
    bounds: {
      type: Object as PropType<Rect>
    },
    active: {
      default: false
    }
  },
  data: () => ({
    id: `os-viewer-${v4()}`,
    viewer: undefined,
    style: {
      top: String(0),
      left: String(0),
      width: String(0),
      height: String(0),
      position: 'absolute',
      border: '1px solid rgb(255, 225, 49)',
      background: 'rgba(255, 225, 49, 0.3)',
      backgroundBlendMode: 'multiply',
      overflow: 'hidden',
      margin: 0,
      padding: 0,
      zIndex: 10,
      transition: 'all 100ms'
    } as CSSProperties
  }),
  mounted() {
    const gestureSettings = {
      scrollToZoom: false,
      clickToZoom: false,
      dblClickToZoom: false,
      pinchToZoom: false,
      flickEnabled: false,
      pinchRotate: false
    }

    this.viewer = createOpenSeadragon({
      id: this.id,
      tileSources: [this.tileSources],
      showNavigationControl: false,
      defaultZoomLevel: 0,
      gestureSettingsMouse: gestureSettings,
      panHorizontal: false,
      panVertical: false
    })

    this.$emit('mounted')
  },
  methods: {
    update() {
      if (this.bounds && this.viewer.viewport && this.active) {
        const topleft = this.viewer.viewport.pixelFromPointNoRotate(this.bounds.getTopLeft(), false)
        const bottomright = this.viewer.viewport.pixelFromPointNoRotate(
          this.bounds.getBottomRight(),
          false
        )

        this.style.top = `${Math.round(topleft.y)}px`
        this.style.left = `${Math.round(topleft.x)}px`

        const width = Math.abs(topleft.x - bottomright.x)
        const height = Math.abs(topleft.y - bottomright.y)

        // make sure width and height are non-negative so IE doesn't throw
        this.style.width = `${Math.round(Math.max(width, 0))}px`
        this.style.height = `${Math.round(Math.max(height, 0))}px`

        this.style.display = 'block'
      } else {
        this.style.display = 'none'
      }
    }
  },
  watch: {
    bounds: {
      handler() {
        this.update()
      }
    }
  }
})
</script>

<style scoped lang="less">
.ts-item {
  // pointer-events: none;
  height: 100%;
  width: 100%;
  position: relative;
  cursor: pointer;
  outline: none !important;
}
</style>
