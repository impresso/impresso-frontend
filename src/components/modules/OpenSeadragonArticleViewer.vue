<template>
  <marginalia-panel
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
  TiledImage,
  getAuthOptions,
  isAuthRequired
} from '@/services/openseadragon'
import { defineComponent, ref, type PropType, ComponentPublicInstance } from 'vue'

interface Region {
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

  overlay.addEventListener('click', event => {
    const overlayTarget = event.target as HTMLDivElement

    const articleUid = overlayTarget.dataset.articleUid as string
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

const DefaultZoomLevel = 0.0008
const MaxFontSizePc = 100

interface MarginaliaSection {
  title: string
  items: string[]
  isLeft: boolean
}

interface Data {
  viewer?: Viewer
  currentPageIndex: number
  tilesAreReady: boolean
  pagesAreOpen: boolean
  currentOverlays: HTMLDivElement[]
  isDragging: boolean
  currentZoomLevel: number
}

export default defineComponent({
  data: (): Data => ({
    viewer: undefined,
    currentPageIndex: 0,
    tilesAreReady: false,
    currentOverlays: [],
    isDragging: false,
    currentZoomLevel: DefaultZoomLevel,
    pagesAreOpen: false
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
            ? previousItem.x +
              previousItem.width +
              (item.x - (previousItem.x + previousItem.width)) / 2
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
        this.isDragging = true
      })

      this.viewer.addHandler('canvas-drag-end', () => {
        setTimeout(() => {
          this.isDragging = false
        }, 0)
      })

      this.viewer.addHandler('zoom', ({ zoom }) => {
        if (zoom == null) return
        this.currentZoomLevel = zoom
      })

      this.viewer.addOnceHandler('open', () => {
        this.pagesAreOpen = true
      })

      return this.viewer

      // return new Promise(resolve => {
      //   setTimeout(() => {

      //   }, 0)
      // })
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
        pagesAreOpen: this.pagesAreOpen
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
      async handler(pages: string[]) {
        if (pages == null) return
        const viewer = await this.getViewer()

        this.tilesAreReady = false
        viewer.addOnceHandler('tile-loaded', () => {
          viewer.viewport.fitBounds(viewer.world.getItemAt(this.currentPageIndex).getBounds(), true)
          viewer.viewport.zoomTo(DefaultZoomLevel)
          this.tilesAreReady = true
        })
        viewer.open(
          pages.map(page => ({
            tileSource: page,
            ...(isAuthRequired(page) ? getAuthOptions() : {})
          }))
        )
      },
      immediate: true,
      deep: true
    },
    defaultCurrentPageIndex: {
      handler(idx: number) {
        if (this.viewer && this.currentPageIndex !== idx && this.viewer.world.getItemAt(idx)) {
          this.viewer.viewport.fitBounds(this.viewer.world.getItemAt(idx).getBounds(), true)
          this.viewer.viewport.zoomTo(DefaultZoomLevel)
        }
      },
      immediate: true
    },
    readyData: {
      async handler({
        regions,
        article,
        pagesAreOpen
      }: {
        regions: Region[]
        article: { uid: string }
        pagesAreOpen: boolean
      }) {
        if (!pagesAreOpen) return

        // await new Promise(resolve => setTimeout(resolve, 1000))
        const viewer = await this.getViewer()
        this.currentOverlays.forEach(overlay => viewer.removeOverlay(overlay))
        this.currentOverlays = []

        const tiledImage = viewer.world.getItemAt(this.currentPageIndex)
        if (tiledImage == null) return

        this.currentOverlays = regions.map(region => {
          const { overlay, rect } = createRegionOverlay(tiledImage, region, articleUid => {
            if (this.isDragging) return
            this.$emit('article-selected', articleUid)
          })
          if (article.uid && region.articleUid === article.uid) {
            overlay.classList.add('active')
          }
          viewer.addOverlay(overlay, rect)
          return overlay
        })

        // page overlay (page selection background)
        const { overlay, rect } = createPageOverlay(tiledImage)
        viewer.addOverlay(overlay, rect)
        this.currentOverlays.push(overlay)

        if (this.marginaliaPanelLeft == null || this.marginaliaPanelRight == null) {
          console.error('Marginalia panels are not found')
          return
        }
        // marginalia repositioning
        viewer.removeOverlay(this.marginaliaPanelLeft.$el)
        viewer.addOverlay(this.marginaliaPanelLeft.$el, getMarginaliaOverlayRect(tiledImage, false))

        viewer.removeOverlay(this.marginaliaPanelRight?.$el)
        viewer.addOverlay(
          this.marginaliaPanelRight?.$el,
          getMarginaliaOverlayRect(tiledImage, true)
        )
      },
      immediate: true,
      deep: true
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
