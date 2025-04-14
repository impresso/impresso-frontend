<template>
  <div>{{ pageIndex }}</div>
  <div class="viewer-container">
    <div ref="osdViewer" class="osd-viewer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import OpenSeadragon from 'openseadragon'

export interface OSViewerProps {
  pages: string[]
  pageIndex?: number
  gap?: number
}

const props = withDefaults(defineProps<OSViewerProps>(), {
  pageIndex: 0,
  gap: 0.1
})

const emit = defineEmits<{
  (e: 'update:pageIndex', value: number): void
}>()

const osdViewer = ref<HTMLDivElement | null>(null)
let viewer: OpenSeadragon.Viewer | null = null
let pageWidthWorld = 1
let aspectRatio = 1
let lastEmittedPage = -1

const loadedPagesRef = ref<Set<number>>(new Set())

function tryLoadPage(i: number) {
  if (!viewer || loadedPagesRef.value.has(i) || i < 0 || i >= props.pages.length) return

  loadedPagesRef.value.add(i)

  viewer.addTiledImage({
    tileSource: props.pages[i],
    x: i * (pageWidthWorld + props.gap),
    y: 0,
    width: pageWidthWorld
  })
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
    viewer = null
  }

  // Load info.json for sizing
  const infoRes = await fetch(props.pages[props.pageIndex])
  const info = await infoRes.json()
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
  viewer = OpenSeadragon({
    element: osdViewer.value,
    prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
    showNavigationControl: true,
    preserveViewport: true,
    visibilityRatio: 1.0,
    constrainDuringPan: false,
    showNavigator: false,
    defaultZoomLevel: 1,
    minZoomLevel: 0.5,
    maxZoomLevel: 10
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
  console.info('[OSViewer] initializeViewer()', props.pageIndex)
  panToPage(props.pageIndex)
  bindPanTracking()
  // viewer.addOnceHandler('open', () => {
  //   console.info('[OSViewer] @open', props.pageIndex)

  //   bindPanTracking()
  // })
}

// Pan to a specific page
function panToPage(index: number) {
  if (!viewer) return
  const centerX = index * (pageWidthWorld + props.gap) + pageWidthWorld / 2
  const center = new OpenSeadragon.Point(centerX, pageWidthWorld / aspectRatio / 2)
  viewer.viewport.panTo(center, true)
}

// Track pan and emit current page
function bindPanTracking() {
  if (!viewer) return

  viewer.addHandler('viewport-change', () => {
    const center = viewer!.viewport.getCenter()
    const index = Math.round(center.x / (pageWidthWorld + props.gap))
    if (index !== lastEmittedPage && index >= 0 && index < props.pages.length) {
      console.info('[OSViewer] bindPanTracking @viewport-change, index:', index)
      tryLoadPage(index)
      lastEmittedPage = index
      emit('update:pageIndex', index)
    }
  })
}

watch(() => props.pages, initializeViewer)
watch(
  () => props.pageIndex,
  newIndex => {
    nextTick(() => panToPage(newIndex))
  }
)

onMounted(initializeViewer)
onBeforeUnmount(() => {
  viewer?.destroy()
})
</script>

<style scoped>
.viewer-container {
  width: 100%;
  height: 100vh;
}
.osd-viewer {
  width: 100%;
  height: 100%;
  background-color: #7b8793;
}
</style>
