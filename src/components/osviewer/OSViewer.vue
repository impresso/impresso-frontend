<template>
  <div class="OSViewer">
    <div ref="osdViewer" class="osd-viewer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import OpenSeadragon from 'openseadragon'
import { getPageIndexFromCenterX, highlightCurrentPage } from './OSViewer.logic'
import { createOpenSeadragon } from '@/services/openseadragon'

export interface OSViewerProps {
  pages: string[]
  gap?: number
  margin?: number
  pageRegions?: {
    articleUid: string
    pageUid: string
    coords: {
      x: number
      y: number
      w: number
      h: number
    }
  }[]
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

const emit = defineEmits<{
  (e: 'update:pageIndex', value: number): void
}>()

const osdViewer = ref<HTMLDivElement | null>(null)
const currentPageOverlay = ref<HTMLDivElement | null>(null)

const dimensions = ref({ width: 0, height: 0, aspectRatio: 1 })
let viewer: OpenSeadragon.Viewer | null = null
let pageWidthWorld = 1
let aspectRatio = 1
let lastEmittedPage = -1
const loadedPagesRef = ref<Set<number>>(new Set())

function loadPageAtIndex(i: number) {
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
    width: pageWidthWorld
  })
  viewer.world.addOnceHandler('add-item', () => {
    console.info('[OSViewer] @add-item', i)
    drawRegionsOnCurrentPage()
  })
}

function drawRegionsOnCurrentPage() {
  if (!viewer) return
  const regions = props.pageRegions
  const tiledImage = viewer.world.getItemAt(pageIndex.value)

  console.info('[OSViewer] drawRegionsOnCurrentPage', regions, tiledImage !== undefined)

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
    viewer.addOverlay(overlayElement, viewportRect)
  }
}

const blackTileSource = {
  tileSize: 256,
  minLevel: 0,
  maxLevel: 0,
  getTileUrl: () =>
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM0sXJ4CgAC7QGV4Z7MDgAAAABJRU5ErkJggg=='
}

async function initializeViewer() {
  if (!osdViewer.value || props.pages.length === 0) return
  if (viewer) {
    viewer.destroy()
    loadedPagesRef.value = new Set()
    viewer = null
  }
  // Load info.json for sizing
  const infoRes = await fetch(props.pages[pageIndex.value])
  const info = await infoRes.json()
  dimensions.value = {
    width: info.width,
    height: info.height,
    aspectRatio: info.width / info.height
  }
  aspectRatio = info.width / info.height
  console.info(
    '[OSViewer] initializeViewer()',
    '\n - width:',
    info.width,
    '\n - height:',
    info.height,
    '\n - aspectRatio:',
    aspectRatio
  )
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
    console.debug('[OSViewer] @canvas-drag')
    isMouseDragging.value = true
  })
  viewer.addHandler('canvas-drag-end', () => {
    console.debug('[OSViewer] @canvas-drag-end')
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

  console.info('[OSViewer] initializeViewer()', pageIndex.value)
  viewer.world.addOnceHandler('add-item', () => {
    panToPage(pageIndex.value)
    bindPanTracking()
  })
}

// Pan to a specific page
function panToPage(index: number) {
  if (!viewer) return

  const coords = new OpenSeadragon.Rect(
    index * (pageWidthWorld + props.gap) - props.gap,
    -props.gap,
    pageWidthWorld + props.gap * 2,
    pageWidthWorld / dimensions.value.aspectRatio + props.gap * 2
  )
  console.info('[OSViewer] panToPage', index, coords)
  viewer.viewport.fitBounds(coords, true)

  // const centerX = index * (pageWidthWorld + props.gap) + pageWidthWorld / 2
  // const center = new OpenSeadragon.Point(centerX, pageWidthWorld / aspectRatio / 2)
  // viewer.viewport.panTo(center, true)
}

// Track pan and emit current page
function bindPanTracking() {
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
    if (index !== lastEmittedPage && index >= 0 && index < props.pages.length) {
      console.info(
        '[OSViewer] bindPanTracking @viewport-change, index:',
        index,
        'iiif',
        props.pages[index]
      )
      loadPageAtIndex(index)

      lastEmittedPage = index

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
  () => {
    console.info('[OSViewer] @pages changed')
    initializeViewer()
  },
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
