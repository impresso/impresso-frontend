<template>
  <div class="os-article-viewer"></div>
</template>

<script>
import initViewer from 'openseadragon'

/**
 * @typedef {import('openseadragon').Viewer} Viewer
 */

export default {
  data: () => ({
    viewer: /** @type {Viewer|undefined} */ (undefined),
    currentPageIndex: 0
  }),
  props: {
    /** @type {import('vue').PropOptions<string[]>} */
    pages: {
      type: Array
    },
    defaultCurrentPageIndex: {
      type: Number,
      default: 0
    }
  },
  methods: {
    /**
     * @returns {Promise<Viewer>}
     */
    async getViewer() {
      if (this.viewer != null) return this.viewer
      return new Promise((resolve) => {
        setTimeout(() => {
          this.viewer = initViewer({
            element: this.$el,
            immediateRender: true,
            showNavigationControl: false,
            // animationTime: 0,
            defaultZoomLevel: 0.001,
            collectionMode:       true,
            collectionRows:       1,
            // collectionTileSize:   512,
            collectionTileMargin: 16,
            debugMode: true
          })
          resolve(this.viewer)
        }, 0)
      })
    }
  },
  mounted() {
    this.currentPageIndex = this.defaultCurrentPageIndex
  },
  watch: {
    pages: {
      /** @param {string[]} pages */
      async handler(pages) {
        if (pages == null) return
        const viewer = await this.getViewer()

        viewer.addOnceHandler('tile-loaded', () => {
          viewer.viewport.fitBounds(viewer.world.getItemAt(this.currentPageIndex).getBounds(), true)
        })

        viewer.addHandler('viewport-change', () => {
          if (viewer.world.getItemCount() === 0) return
          let { x: currentX } = viewer.viewport.getCenter()
          const firstItemX = viewer.world.getItemAt(0).getBounds().x

          if (currentX < firstItemX) currentX = firstItemX

          const itemsBounds = [...Array(viewer.world.getItemCount()).keys()].map(i => viewer.world.getItemAt(i).getBounds())
          const currentItemIndex = itemsBounds.findIndex((item, index, bounds) => {
            if (index + 1 >= bounds.length) return true

            const previousItem = index > 0 ? bounds[index-1] : undefined
            const nextItem = bounds[index+1]

            const leftBoundary = previousItem
              ? (previousItem.x + previousItem.width) + (item.x - (previousItem.x + previousItem.width)) / 2
              : item.x
            const rightBoundary = item.x + item.width + (nextItem.x - (item.x + item.width)) / 2

            return currentX >= leftBoundary && currentX < rightBoundary
          })

          if (currentItemIndex !== this.currentPageIndex) {
            this.currentPageIndex = currentItemIndex
            this.$emit('page-changed', this.currentPageIndex)
          }
        })
        viewer.open(pages)
      },
      immediate: true,
      deep: true
    }
  }
}
</script>


<style lang="less">
.os-article-viewer {
  height: 100%;
  width: 100%;
}
</style>
