<template>
  <div class="os-article-viewer" :style="{ 'font-size': `${fontSize}%` }"></div>
</template>

<script>
import Vue from 'vue'
import initViewer, { Rect } from 'openseadragon'
import MarginaliaPanel from '@/components/modules/MarginaliaPanel'

/**
 * @typedef {import('openseadragon').Viewer} Viewer
 * @typedef {import('openseadragon').TiledImage} TiledImage
 * @typedef {{
 *  articleUid: string,
 *  pageUid: string,
 *  coords: { x: number, y: number, w: number, h: number }
 * }} Region
 */

function createPageOverlay(tiledImage) {
  // @ts-ignore
  const overlay = window.document.createElement('div')
  overlay.setAttribute('class', 'overlay-page')
  const rect = tiledImage.getBounds()
  return { overlay, rect }
}

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
    //
    // event.target.parentNode.querySelectorAll('div.overlay-region').forEach((item) => {
    //   if (articleUid === item.getAttribute('data-article-uid')) {
    //     item.classList.add('active')
    //   } else {
    //     item.classList.remove('active')
    //   }
    // })
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

/**
 * @param {boolean} isLeft
 * @returns {Vue}
 */
function createMarginaliaOverlay(isLeft) {
  // @ts-ignore
  const panelContainer = window.document.createElement('div')
  const panel = new Vue(MarginaliaPanel)
  panel.$mount(panelContainer, true)
  panel.$set(panel, 'isLeft', !!isLeft)
  return panel
}

/**
 * @param {TiledImage} tiledImage
 * @returns {Rect}
 */
function getMarginaliaOverlayRect(tiledImage, isRight) {
  const { x, y, width, height } = tiledImage.getBounds()
  const factor = 2.5
  return isRight
    ? new Rect(
      x + width,
      y,
      width / factor,
      height
    )
    : new Rect(
      x - width / factor,
      y,
      width / factor,
      height
    )
}

const DefaultZoomLevel = 0.0008
const MaxFontSizePc = 100

/**
 * @typedef {{
 *   title: string,
 *   items: string[],
 *   isLeft: boolean
 * }} MarginaliaSection
 */

export default {
  data: () => ({
    viewer: /** @type {Viewer|undefined} */ (undefined),
    currentPageIndex: 0,
    tilesAreReady: false,
    currentOverlays: /** @type {any[]} */ ([]),
    isDragging: false,
    marginaliaPanelLeft: createMarginaliaOverlay(true),
    marginaliaPanelRight: createMarginaliaOverlay(false),
    currentZoomLevel: DefaultZoomLevel
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
    article: Object,
    /** @type {import('vue').PropOptions<Region[]>} */
    regions: {
      type: Array,
      default: () => []
    },
    /** @type {import('vue').PropOptions<MarginaliaSection[]>} */
    marginaliaSections: {
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
            defaultZoomLevel: DefaultZoomLevel,
            collectionMode:       true,
            collectionRows:       1,
            // collectionTileSize:   512,
            collectionTileMargin: 16,
            // debugMode: true
          })

          const viewportChangeHandler = () => {
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
          }

          this.viewer.addHandler('viewport-change', viewportChangeHandler)
          this.$emit('page-changed', this.currentPageIndex)

          this.viewer.addHandler('canvas-drag', () => {
            this.isDragging = true;
          });

          this.viewer.addHandler('canvas-drag-end', () => {
            setTimeout(() => { this.isDragging = false }, 0);
          });

          this.viewer.addHandler('zoom', ({ zoom }) => {
            this.currentZoomLevel = /** @type {number} */ (zoom)
          })

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
    },
    readyData() {
      return {
        regions: this.regions,
        article: this.article,
      }
    },
    /** @returns {number} */
    fontSize() {
      const newFontSize = ((this.currentZoomLevel * 0.7) / DefaultZoomLevel) * MaxFontSizePc
      return newFontSize > MaxFontSizePc ? MaxFontSizePc : newFontSize
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
          viewer.viewport.zoomTo(DefaultZoomLevel)
          this.tilesAreReady = true
        })

        viewer.open(pages)
      },
      immediate: true,
      deep: true
    },
    defaultCurrentPageIndex: {
      handler(idx) {
        if (this.viewer && this.currentPageIndex !== idx) {
          this.viewer.viewport.fitBounds(this.viewer.world.getItemAt(idx).getBounds(), true)
        }
      }
    },
    readyData: {
      async handler({ regions, article }) {
        const viewer = await this.getViewer()
        this.currentOverlays.forEach(overlay => viewer.removeOverlay(overlay))
        this.currentOverlays = []

        const tiledImage = viewer.world.getItemAt(this.currentPageIndex)
        if (tiledImage == null) return

        this.currentOverlays = regions.map(region => {
          const { overlay, rect } = createRegionOverlay(
            tiledImage,
            region,
            articleUid => {
              if (this.isDragging) return
              this.$emit('article-selected', articleUid)
            }
          )
          if (article.uid && region.articleUid === article.uid) {
            overlay.classList.add('active');
          }
          viewer.addOverlay(overlay, rect)
          return overlay
        })

        // page overlay (page selection background)
        const { overlay, rect } = createPageOverlay(tiledImage);
        viewer.addOverlay(overlay, rect)
        this.currentOverlays.push(overlay)

        // marginalia repositioning
        viewer.removeOverlay(this.marginaliaPanelLeft.$el)
        viewer.addOverlay(
          this.marginaliaPanelLeft.$el,
          getMarginaliaOverlayRect(tiledImage, false)
        )

        viewer.removeOverlay(this.marginaliaPanelRight.$el)
        viewer.addOverlay(
          this.marginaliaPanelRight.$el,
          getMarginaliaOverlayRect(tiledImage, true)
        )
      },
      immediate: true,
      deep: true
    },
    marginaliaSections: {
      handler() {
        this.marginaliaPanelLeft.$set(
          this.marginaliaPanelLeft,
          'sections',
          this.marginaliaSections.filter(({ isLeft }) => isLeft)
        )
        this.marginaliaPanelRight.$set(
          this.marginaliaPanelRight,
          'sections',
          this.marginaliaSections.filter(({ isLeft }) => !isLeft)
        )
      },
      immediate: true,
      deep: true
    }
  }
}
</script>


<style lang="scss">
.os-article-viewer {
  height: 100%;
  width: 100%;
}
div.overlay-page {
  border: 1px solid green;
  box-shadow: 2px 2px 16px black;
  pointer-events: none;
}

@supports (mix-blend-mode: multiply) {
  div.overlay-region {
    mix-blend-mode: multiply;
  }
}
</style>
