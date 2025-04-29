<template>
  <div class="OSViewer">
    <div ref="osdViewer" class="osd-viewer"></div>
  </div>
</template>

<script setup lang="ts">
import { createOpenSeadragon, getAuthOptions, isAuthRequired } from '@/services/openseadragon'
import OpenSeadragon from 'openseadragon'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getPageIndexFromCenterX, highlightCurrentPage } from './OSViewer.logic'

interface PageRegion {
  articleUid: string
  pageUid: string
  coords: {
    x: number
    y: number
    w: number
    h: number
  }
}

interface OSViewerProps {
  pages: string[]
  gap?: number
  margin?: number
  pageRegions?: PageRegion[]
}

const pageIndex = defineModel<number>('pageIndex', { default: 0 })

const props = withDefaults(defineProps<OSViewerProps>(), {
  gap: 0.1,
  margin: 0.5,
  pageRegions: () => []
})

const isMouseDragging = ref(false)
// Add a debounce timer for updating the model
const dragDebounceTimer = ref<number | null>(null)

// const emit = defineEmits<{
//   (e: 'update:pageIndex', value: number): void
// }>()

const osdViewer = ref<HTMLDivElement | null>(null)
const currentPageOverlay = ref<HTMLDivElement | null>(null)
const regionsOverlays = ref<HTMLDivElement[]>([])

const dimensions = ref({ width: 0, height: 0, aspectRatio: 1 })
let viewer: OpenSeadragon.Viewer | null = null
let pageWidthWorld = 1
let aspectRatio = 1
const loadedPagesRef = ref<Set<number>>(new Set())

/**
 * Loads the tiled image for a specific page index if it hasn't been loaded yet.
 * Also highlights the current page.
 * @param {number} i - The index of the page to load.
 */
function loadPageAtIndex(i: number): void {
  currentPageOverlay.value = highlightCurrentPage(viewer, i, currentPageOverlay.value, {
    gap: props.gap,
    pageWidthWorld,
    aspectRatio: dimensions.value.aspectRatio
  })
  if (!viewer || loadedPagesRef.value.has(i) || i < 0 || i >= props.pages.length) return

  loadedPagesRef.value.add(i)

  viewer.addTiledImage({
    tileSource: props.pages[i],
    x: i * (pageWidthWorld + props.gap),
    y: 0,
    width: pageWidthWorld,
    ...(isAuthRequired(props.pages[i]) ? getAuthOptions() : {})
  })
  viewer.world.addOnceHandler('add-item', () => {
    drawRegionsOnPage(pageIndex.value)
  })
}

/**
 * Draws the defined page regions as overlays on the page's tiled image.
 */
function drawRegionsOnPage(pageIndex: number): void {
  if (!viewer) return

  // 1. Remove existing overlays

  regionsOverlays.value.forEach(overlay => {
    viewer.removeOverlay(overlay)
  })
  regionsOverlays.value = []

  // 2. Get the current page image
  const regions = props.pageRegions
  const tiledImage = viewer.world.getItemAt(pageIndex)

  if (!tiledImage) return

  for (const region of regions) {
    const viewportRect = tiledImage.imageToViewportRectangle(
      region.coords.x,
      region.coords.y,
      region.coords.w,
      region.coords.h
    )
    const overlayElement = document.createElement('div') as HTMLDivElement
    overlayElement.classList.add('overlay', 'rounded-sm', 'pageRegion')
    overlayElement.dataset.articleUid = region.articleUid
    viewer.addOverlay(overlayElement, viewportRect)
    regionsOverlays.value.push(overlayElement)
  }
}

const blackTileSource = {
  tileSize: 256,
  minLevel: 0,
  maxLevel: 0,
  getTileUrl: () =>
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM0sXJ4CgAC7QGV4Z7MDgAAAABJRU5ErkJggg=='
}

/**
 * Initializes or re-initializes the OpenSeadragon viewer instance.
 * Fetches initial page info, sets up the viewer configuration, and adds placeholders for all pages.
 */
async function initializeViewer(): Promise<void> {
  if (!osdViewer.value || props.pages.length === 0) return
  if (viewer) {
    viewer.destroy()
    loadedPagesRef.value = new Set()
    viewer = null
  }
  // Load info.json for sizing

  const authIsRequired = isAuthRequired(props.pages[pageIndex.value])

  const infoRes = await fetch(props.pages[pageIndex.value], {
    headers: {
      ...(authIsRequired ? getAuthOptions().ajaxHeaders : {})
    }
  })
  const info = await infoRes.json()

  dimensions.value = {
    width: info.width,
    height: info.height,
    aspectRatio: info.width / info.height
  }
  aspectRatio = info.width / info.height
  viewer = createOpenSeadragon({
    immediateRender: true,
    element: osdViewer.value,
    prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
    showNavigationControl: true,
    preserveViewport: true,
    visibilityRatio: 0.5,
    constrainDuringPan: false,
    showNavigator: false,
    defaultZoomLevel: 1,
    minZoomLevel: 0.2,
    maxZoomLevel: 10
  })
  // Add mouse drag event handlers
  viewer.addHandler('canvas-drag', () => {
    isMouseDragging.value = true
  })
  viewer.addHandler('canvas-drag-end', () => {
    // Set a timer to reset the dragging state after a short delay
    setTimeout(() => {
      isMouseDragging.value = false
    }, 200)
  })

  for (let i = 0; i < props.pages.length; i++) {
    viewer.addTiledImage({
      tileSource: {
        ...blackTileSource,
        width: info.width,
        height: info.height
      },
      x: i * (pageWidthWorld + props.gap),
      y: 0,
      width: pageWidthWorld
    })
  }

  viewer.world.addOnceHandler('add-item', () => {
    panToPage(pageIndex.value)
    bindPanTracking()
  })
}

/**
 * Pans and zooms the viewport to fit a specific page index.
 * @param {number} index - The index of the page to navigate to.
 */
function panToPage(index: number): void {
  if (!viewer) return

  const coords = new OpenSeadragon.Rect(
    index * (pageWidthWorld + props.gap) - props.gap,
    -props.gap,
    pageWidthWorld + props.gap * 2,
    pageWidthWorld / dimensions.value.aspectRatio + props.gap * 2
  )
  viewer.viewport.fitBounds(coords, true)

  // const centerX = index * (pageWidthWorld + props.gap) + pageWidthWorld / 2
  // const center = new OpenSeadragon.Point(centerX, pageWidthWorld / aspectRatio / 2)
  // viewer.viewport.panTo(center, true)
}

/**
 * Binds an event handler to the viewer's viewport-change event to track panning
 * and update the current page index based on the viewport center.
 * Uses debouncing when the user is dragging.
 */
function bindPanTracking(): void {
  if (!viewer) return

  viewer.addHandler('viewport-change', () => {
    const center = viewer!.viewport.getCenter()
    const index = getPageIndexFromCenterX(
      center.x,
      pageWidthWorld,
      props.gap,
      0,
      props.pages.length
    )

    if (index !== pageIndex.value) {
      pageIndex.value = index
    }

    drawRegionsOnPage(index)

    if (index >= 0 && index < props.pages.length) {
      loadPageAtIndex(index)

      // If we're dragging, use a debounce to update the model
      if (isMouseDragging.value) {
        // Clear any existing timer
        if (dragDebounceTimer.value !== null) {
          clearTimeout(dragDebounceTimer.value)
        }
        // Set a new timer to update the model after dragging settles
        dragDebounceTimer.value = setTimeout(() => {
          pageIndex.value = index
        }, 100) as unknown as number
      }
      //  else {
      //   // If not dragging, update the model immediately
      //   pageIndex.value = index
      // }
    }
  })
}

watch(
  () => props.pages,
  initializeViewer,
  { deep: true } // Add deep option to detect changes within the array
)
watch(
  () => pageIndex.value,
  newIndex => {
    nextTick(() => {
      if (!isMouseDragging.value) {
        // If not dragging, update the model immediately
        panToPage(newIndex)
        loadPageAtIndex(newIndex)
      }
    })
  }
)
watch(
  () => props.pageRegions,
  () => {
    if (viewer) {
      drawRegionsOnPage(pageIndex.value)
    }
  },
  { deep: true }
)

onMounted(initializeViewer)
onBeforeUnmount(() => {
  viewer?.destroy()
})
</script>

<style>
.OSViewer {
  width: 100%;
  height: 100%;
}
.OSViewer .pageRegion {
  border: 1px solid blue;
  pointer-events: none;
}
.OSViewer .osd-viewer {
  width: 100%;
  height: 100%;
  background-color: hsl(210, 10%, 50%);
}
.OSViewer .page-highlight {
  pointer-events: none;
  z-index: 10;
  border: 1px solid transparent;
  border-radius: 2px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  animation: OSViewer_highlightFade 0.4s ease-in-out;

  /* Outer glow */
  box-shadow: 0 0 25px 4px rgba(255, 255, 255, 0.5);
}

@keyframes OSViewer_highlightFade {
  0% {
    box-shadow: 0 0 0 rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 25px 4px rgba(255, 255, 255, 0.5);
  }
}
</style>
