<template>
  <marginalia-panel
    class="marginalia-panel"
    :isLeft="true"
    :sections="marginaliaSections.filter(({ isLeft }) => isLeft)"
    ref="marginaliaPanelLeft"
  />
  <div
    class="os-article-viewer"
    v-bind="$attrs"
    :style="{ 'font-size': `${fontSize}%` }"
    ref="container"
  ></div>
  <marginalia-panel
    class="marginalia-panel"
    :isLeft="false"
    :sections="marginaliaSections.filter(({ isLeft }) => !isLeft)"
    ref="marginaliaPanelRight"
  />
</template>

<script lang="ts">
import MarginaliaPanel from '@/components/modules/MarginaliaPanel.vue'
import {
  createOpenSeadragon,
  Rect,
  Viewer,
  getAuthOptions,
  isAuthRequired
} from '@/services/openseadragon'
import { TiledImage, MouseTracker } from 'openseadragon'
import { defineComponent, ref, type PropType, ComponentPublicInstance } from 'vue'

export interface Region {
  articleUid: string
  pageUid: string
  coords: { x: number; y: number; w: number; h: number }
}

function createPageOverlay(tiledImage: TiledImage) {
  const overlay = window.document.createElement('div')
  overlay.setAttribute('class', 'overlay-page')
  const rect = tiledImage.getBounds()
  return { overlay, rect }
}

function createRegionOverlay(
  tiledImage: TiledImage,
  region: Region,
  clickHandler: (articleUid: string) => void
): { overlay: any; rect: Rect } {
  const overlay = window.document.createElement('div')
  overlay.setAttribute('class', 'overlay-region')
  overlay.dataset.articleUid = region.articleUid

  overlay.addEventListener('mouseenter', event => {
    const overlayTarget = event.target as HTMLDivElement
    const articleUid = overlayTarget.dataset.articleUid

    overlayTarget.parentNode?.querySelectorAll(`[data-article-uid=${articleUid}]`).forEach(item => {
      item.classList.add('selected')
    })
  })

  new MouseTracker({
    element: overlay,
    clickHandler: function (event: any) {
      if (!event.quick) return

      const overlayTarget = event?.originalEvent?.target as HTMLDivElement
      if (overlayTarget == null) return

      const articleUid = overlayTarget.dataset.articleUid as string
      clickHandler(articleUid)
    }
  })

  overlay.addEventListener('mouseleave', event => {
    const overlayTarget = event.target as HTMLDivElement

    const articleUid = overlayTarget.dataset.articleUid

    overlayTarget.parentNode?.querySelectorAll(`[data-article-uid=${articleUid}]`).forEach(item => {
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

function getMarginaliaOverlayRect(tiledImage: TiledImage, isRight: boolean) {
  const { x, y, width, height } = tiledImage.getBounds()
  const factor = 2.5
  return isRight
    ? new Rect(x + width, y, width / factor, height)
    : new Rect(x - width / factor, y, width / factor, height)
}

const blackTileSource = {
  tileSize: 256,
  minLevel: 0,
  maxLevel: 0,
  getTileUrl: () =>
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM0sXJ4CgAC7QGV4Z7MDgAAAABJRU5ErkJggg=='
}

const getCurrentItemIndex = (viewer: Viewer) => {
  let { x: currentX } = viewer.viewport.getCenter()
  const firstItemX = viewer.world.getItemAt(0).getBounds().x

  if (currentX < firstItemX) currentX = firstItemX

  const itemsBounds = [...Array(viewer.world.getItemCount()).keys()].map(i =>
    viewer.world.getItemAt(i).getBounds()
  )
  const currentItemIndex = itemsBounds.findIndex((item, index, bounds) => {
    if (index + 1 >= bounds.length) return true

    const previousItem = index > 0 ? bounds[index - 1] : undefined
    const nextItem = bounds[index + 1]

    const leftBoundary = previousItem
      ? previousItem.x + previousItem.width + (item.x - (previousItem.x + previousItem.width)) / 2
      : item.x
    const rightBoundary = item.x + item.width + (nextItem.x - (item.x + item.width)) / 2

    return currentX >= leftBoundary && currentX < rightBoundary
  })

  return currentItemIndex
}

const DefaultZoomLevel = 0.0008
const MaxFontSizePc = 100

export interface MarginaliaSection {
  title: string
  items: string[]
  isLeft: boolean
}

export interface Data {
  viewer?: Viewer
  currentPageIndex: number
  initialFitCompleted: boolean
  currentOverlays: HTMLDivElement[]
  currentZoomLevel: number

  /** Indices of pages that have been fully loaded. */
  loadedPages: Set<number>

  /** Indices of real pages added (without placeholder) */
  realPages: Set<number>

  /** How many neighbour pages load left and right of the current page. */
  neighboursToLoad: number
}

export default defineComponent({
  data: (): Data => ({
    viewer: undefined,
    currentPageIndex: 0,
    initialFitCompleted: false,
    currentOverlays: [],
    currentZoomLevel: DefaultZoomLevel,
    loadedPages: new Set(),
    realPages: new Set(),
    neighboursToLoad: 2
  }),
  setup() {
    const container = ref<HTMLElement | undefined>()
    const marginaliaPanelLeft = ref<ComponentPublicInstance | undefined>()
    const marginaliaPanelRight = ref<ComponentPublicInstance | undefined>()

    return {
      container,
      marginaliaPanelLeft,
      marginaliaPanelRight
    }
  },
  props: {
    pages: {
      /**
       * Array of page URLs.
       */
      type: Array as PropType<string[]>,
      default: () => [],
      required: true
    },
    defaultCurrentPageIndex: {
      type: Number,
      default: 0
    },
    article: Object,
    regions: {
      type: Array as PropType<Region[]>,
      default: () => []
    },
    marginaliaSections: {
      type: Array as PropType<MarginaliaSection[]>,
      default: () => []
    }
  },
  emits: ['page-changed', 'article-selected'],
  methods: {
    async getViewer(): Promise<Viewer> {
      await this.$nextTick()

      if (this.viewer != null) return this.viewer

      this.viewer = createOpenSeadragon({
        element: this.container,
        immediateRender: true,
        showNavigationControl: false,
        // animationTime: 0,
        gestureSettingsMouse: {
          clickToZoom: false,
          dblClickToZoom: true
        },
        defaultZoomLevel: DefaultZoomLevel,
        collectionMode: true,
        collectionRows: 1,
        // collectionTileSize:   512,
        collectionTileMargin: 16
        // debugMode: true
      })

      const viewportChangeHandler = () => {
        const viewer = this.viewer
        if (!viewer) return

        if (viewer.world.getItemCount() === 0) return

        const currentItemIndex = getCurrentItemIndex(viewer)

        if (currentItemIndex !== this.currentPageIndex && this.initialFitCompleted) {
          this.currentPageIndex = currentItemIndex
          this.$emit('page-changed', this.currentPageIndex)
        }
      }

      this.viewer.addHandler('viewport-change', viewportChangeHandler)
      this.$emit('page-changed', this.currentPageIndex)

      this.viewer.addHandler('zoom', ({ zoom }) => {
        if (zoom == null) return
        this.currentZoomLevel = zoom
      })

      this.viewer.world.addHandler('add-item', async evt => {
        const image = evt.item

        image.addHandler('bounds-change', evt => {
          const image = evt.eventSource
          const imageIndex = this.viewer.world.getIndexOfItem(image)

          if (imageIndex === this.currentPageIndex) {
            this.applyMarginaliaAndOverlay(this.viewer, image)

            const { width, height } = image.getBounds()
            const isNominal = width === 1 || height === 1

            if (!this.initialFitCompleted && !isNominal) {
              this.viewer.viewport.fitBounds(image.getBounds(), true)
              this.viewer.viewport.zoomTo(DefaultZoomLevel)
              this.initialFitCompleted = true
            }
          }
        })

        image.addHandler('fully-loaded-change', evt => {
          const image = evt.eventSource
          const imageIndex = this.viewer.world.getIndexOfItem(image)

          if (evt.fullyLoaded) {
            this.loadedPages.add(imageIndex)
          } else {
            this.loadedPages.delete(imageIndex)
          }
        })
      })

      return this.viewer
    },
    async applyMarginaliaAndOverlay(viewer: Viewer, tiledImage: TiledImage) {
      this.currentOverlays.forEach(overlay => viewer.removeOverlay(overlay))
      this.currentOverlays = []

      const regions = this.regions
      const article = this.article

      // page overlay (page selection background)
      const { overlay, rect } = createPageOverlay(tiledImage)
      viewer.addOverlay(overlay, rect)

      this.currentOverlays = regions.map(region => {
        const { overlay, rect } = createRegionOverlay(tiledImage, region, articleUid => {
          this.$emit('article-selected', articleUid)
        })
        if (article.uid && region.articleUid === article.uid) {
          overlay.classList.add('active')
        }
        viewer.addOverlay(overlay, rect)

        return overlay
      })
      this.currentOverlays.push(overlay)

      if (this.marginaliaPanelLeft == null || this.marginaliaPanelRight == null) {
        return
      }

      // marginalia repositioning
      viewer.removeOverlay(this.marginaliaPanelLeft.$el)
      viewer.addOverlay(this.marginaliaPanelLeft.$el, getMarginaliaOverlayRect(tiledImage, false))

      viewer.removeOverlay(this.marginaliaPanelRight?.$el)
      viewer.addOverlay(this.marginaliaPanelRight?.$el, getMarginaliaOverlayRect(tiledImage, true))
    }
  },
  mounted() {
    this.currentPageIndex = this.defaultCurrentPageIndex
  },
  computed: {
    /** @returns {number} */
    fontSize() {
      const newFontSize = ((this.currentZoomLevel * 0.7) / DefaultZoomLevel) * MaxFontSizePc
      return newFontSize > MaxFontSizePc ? MaxFontSizePc : newFontSize
    }
  },
  watch: {
    pages: {
      async handler(pages: string[]) {
        if (pages == null) return

        const viewer = await this.getViewer()
        this.realPages.clear()
        this.loadedPages.clear()
        viewer.world.removeAll()
        this.initialFitCompleted = false

        const authIsRequired = isAuthRequired(pages[0])

        const infoRes = await fetch(pages[0], {
          headers: {
            ...(authIsRequired ? getAuthOptions().ajaxHeaders : {})
          }
        })
        const info = await infoRes.json()

        pages.forEach((page, idx) => {
          if (
            idx < Math.max(0, this.currentPageIndex - this.neighboursToLoad) ||
            idx >
              Math.min(
                this.pages.length - this.neighboursToLoad,
                this.currentPageIndex + this.neighboursToLoad
              )
          ) {
            viewer.addTiledImage({
              tileSource: {
                ...blackTileSource,
                width: info.width,
                height: info.height
              },
              index: idx
            })
          } else {
            this.realPages.add(idx)

            viewer.addTiledImage({
              tileSource: page,
              ...(isAuthRequired(page) ? getAuthOptions() : {}),
              index: idx
            })
          }
        })
      },
      immediate: true,
      deep: true
    },
    defaultCurrentPageIndex: {
      handler(idx: number) {
        if (this.currentPageIndex !== idx) {
          this.currentPageIndex = idx
        }
      },
      immediate: true
    },
    currentPageIndex: {
      async handler(newIndex: number) {
        if (this.viewer == null) return

        const image = this.viewer.world.getItemAt(newIndex)
        const currentItemIndex = getCurrentItemIndex(this.viewer)

        if (currentItemIndex !== newIndex) {
          this.viewer.viewport.panTo(image.getBounds().getCenter(), true)
        }

        await this.applyMarginaliaAndOverlay(this.viewer, image)

        const loadFrom = Math.max(newIndex - this.neighboursToLoad, 0)
        const loadTo = Math.min(newIndex + this.neighboursToLoad, this.pages.length - 1)
        const indicesRange = [...Array(loadTo - loadFrom + 1).keys()].map(i => i + loadFrom)

        indicesRange.forEach(idx => {
          if (this.realPages.has(idx)) return

          const tiledImage = this.viewer.world.getItemAt(idx)
          if (tiledImage == null) return

          const page = this.pages[idx]

          // using the bounds of the tiled image to position it correctly
          // otherwise it will flicker.
          const { x, y, width } = tiledImage.getBounds()

          this.viewer.addTiledImage({
            tileSource: page,
            ...(isAuthRequired(page) ? getAuthOptions() : {}),
            index: idx,
            x,
            y,
            width,
            replace: true
          })

          this.realPages.add(idx)
        })
      }
    }
  },
  components: {
    MarginaliaPanel
  }
})
</script>

<style lang="scss">
@import '@/assets/legacy/bootstrap-impresso-theme-variables.scss';

.os-article-viewer {
  height: 100%;
  width: 100%;
}

.marginalia-panel {
  display: none;
}

div.overlay-page {
  border: 10px solid transparentize($clr-accent-secondary, 0.5);
  box-shadow: 0 0 40px #0005;
  pointer-events: none;
}

.overlay-region {
  background-color: transparentize($clr-accent-secondary, 1);
  transition: background-color 300ms;
  cursor: pointer;

  &.selected {
    background-color: transparentize($clr-accent-secondary, 0.8);
  }
  &.active {
    background-color: transparentize($clr-accent-secondary, 0.5);
    cursor: inherit;
  }
}

@supports (mix-blend-mode: multiply) {
  div.overlay-region {
    mix-blend-mode: multiply;
  }
}
</style>
