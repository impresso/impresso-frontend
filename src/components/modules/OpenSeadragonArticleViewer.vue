<template>
  <div class="os-article-viewer"></div>
</template>

<script>
import initViewer from 'openseadragon'


/**
 * @typedef {import('openseadragon').Viewer} Viewer
 * @typedef {import('openseadragon').TiledImage} TiledImage
 * @typedef {import('openseadragon').Rect} Rect
 * @typedef {{
 *  articleUid: string,
 *  pageUid: string,
 *  coords: { x: number, y: number, w: number, h: number }
 * }} Region
 */

/**
 * @param {TiledImage} tiledImage
 * @param {Region} region
 * @param {(articleUid: string) => void} clickHandler
 * @returns {{ overlay: any, rect: Rect }}
 */
function createRegionOverlay(tiledImage, region, clickHandler) {

  // @ts-ignore
  const overlay = window.document.createElement('div')
  overlay.setAttribute('class', 'overlay-region')
  overlay.dataset.articleUid = region.articleUid

  overlay.addEventListener('mouseenter', (event) => {
    const articleUid = event.target.dataset.articleUid

    event.target.parentNode.querySelectorAll(`[data-article-uid=${articleUid}]`).forEach((item) => {
      item.classList.add('selected')
    })
  })

  overlay.addEventListener('click', (event) => {
    const articleUid = event.target.dataset.articleUid
    event.stopPropagation()
    clickHandler(articleUid)
  })

  overlay.addEventListener('mouseleave', (event) => {
    const articleUid = event.target.dataset.articleUid

    event.target.parentNode.querySelectorAll(`[data-article-uid=${articleUid}]`).forEach((item) => {
      item.classList.remove('selected')
    })
  })

  const rect = tiledImage.imageToViewportRectangle(
    region.coords.x,
    region.coords.y,
    region.coords.w,
    region.coords.h
  )

  return { overlay, rect }
}

export default {
  data: () => ({
    viewer: /** @type {Viewer|undefined} */ (undefined),
    currentPageIndex: 0,
    tilesAreReady: false,
    currentOverlays: [],
    isDragging: false
  }),
  props: {
    /** @type {import('vue').PropOptions<string[]>} */
    pages: {
      type: Array
    },
    defaultCurrentPageIndex: {
      type: Number,
      default: 0
    },
    /** @type {import('vue').PropOptions<Region[]>} */
    regions: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    /**
     * @returns {Promise<Viewer>}
     */
    async getViewer() {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (this.viewer != null) return resolve(this.viewer)

          this.viewer = initViewer({
            element: this.$el,
            immediateRender: true,
            showNavigationControl: false,
            // animationTime: 0,
            gestureSettingsMouse: {
              clickToZoom: false,
              dblClickToZoom: true,
            },
            defaultZoomLevel: 0.001,
            collectionMode:       true,
            collectionRows:       1,
            // collectionTileSize:   512,
            collectionTileMargin: 16,
            debugMode: true
          })


          this.viewer.addHandler('viewport-change', () => {
            const viewer = /** @type {Viewer} */ (this.viewer)
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

          this.viewer.addHandler('canvas-drag', () => {
            this.isDragging = true;
          });

          this.viewer.addHandler('canvas-drag-end', () => {
            setTimeout(() => { this.isDragging = false }, 0);
          });

          resolve(this.viewer)
        }, 0)
      })
    }
  },
  mounted() {
    this.currentPageIndex = this.defaultCurrentPageIndex
  },
  computed: {
    readyRegions() {
      if (this.tilesAreReady) return this.regions
      return []
    }
  },
  watch: {
    pages: {
      /** @param {string[]} pages */
      async handler(pages) {
        if (pages == null) return
        const viewer = await this.getViewer()

        this.tilesAreReady = false
        viewer.addOnceHandler('tile-loaded', () => {
          viewer.viewport.fitBounds(viewer.world.getItemAt(this.currentPageIndex).getBounds(), true)
          this.tilesAreReady = true
        })

        viewer.open(pages)
      },
      immediate: true,
      deep: true
    },
    readyRegions: {
      /**
       * @param {Region[]} regions
       */
      async handler(regions) {
        const viewer = await this.getViewer()

        this.currentOverlays.forEach(overlay => viewer.removeOverlay(overlay))
        this.currentOverlays = []

        const tiledImage = viewer.world.getItemAt(this.currentPageIndex)

        this.currentOverlays = /**  @type {never[]} */ (regions.map(region => {
          const { overlay, rect } = createRegionOverlay(
            tiledImage,
            region,
            articleUid => {
              if (this.isDragging) return
              this.$emit('article-selected', articleUid)
            }
          )
          viewer.addOverlay(overlay, rect)
          return overlay
        }))
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

@supports (mix-blend-mode: multiply) {
  div.overlay-region {
    mix-blend-mode: multiply;
  }
}
</style>
