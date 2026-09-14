<template>
  <div class="ImageContentItemFacsimile">
    <div ref="viewerWrapper" class="facsimile-viewer mb-3 position-relative border rounded-sm">
      <IIIFViewer
        v-if="manifestUrl && viewerHeight"
        ref="viewerRef"
        class="bg-dark"
        :style="{ height: viewerHeight + 'px' }"
        :manifest-urls="[manifestUrl]"
        :overlays="overlays"
        @ready="onViewerReady"
        @clickOnOverlayRegion="centerOnOverlayRegion"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, nextTick, ref, watch } from 'vue'
import SearchResultsImageItem from '@/components/modules/SearchResultsImageItem.vue'
import IIIFViewer, { type Overlay } from '@/components/modules/IIIFViewer.vue'
import { IImage } from '@/models'

const props = defineProps<{
  image?: IImage | null
  userPlan?: string
}>()

/**
 * The IImage model only exposes a rasterized `previewUrl`
 * (e.g. `.../{identifier}/{region}/{size}/{rotation}/{quality}.{format}`).
 * IIIFViewer needs the manifest (`info.json`) url instead, so, for now, we
 * derive it by stripping the trailing region/size/rotation/quality segments.
 */
const manifestUrl = computed(() => {
  const previewUrl = props.image?.previewUrl
  if (!previewUrl) return undefined
  return previewUrl.replace(/\/[^/]+\/[^/]+\/[^/]+\/[^/]+$/, '/info.json')
})

/**
 * The IIIF region segment (`x,y,w,h` in pixels) preceding size/rotation/quality
 * in the previewUrl, if present. Other region forms ("full", "square", "pct:...")
 * aren't backed by pixel coords we can draw an overlay from, so they're ignored.
 */
const regionCoords = computed(() => {
  const previewUrl = props.image?.previewUrl
  if (!previewUrl) return undefined
  const match = previewUrl.match(/\/([^/]+)\/[^/]+\/[^/]+\/[^/]+$/)
  const region = match?.[1]
  if (!region) return undefined
  const pixelMatch = region.match(/^(\d+),(\d+),(\d+),(\d+)$/)
  if (!pixelMatch) return undefined
  const [, x, y, w, h] = pixelMatch
  return { x: Number(x), y: Number(y), w: Number(w), h: Number(h) }
})

// Kept only to draw the highlight box; centering is now done via recenterToCoords below.
const overlays = computed<Overlay[]>(() => {
  if (!regionCoords.value) return []
  return [{ id: 'region', regions: [{ id: 'region', coords: regionCoords.value }] }]
})

const viewerRef = ref<InstanceType<typeof IIIFViewer> | null>(null)

const onViewerReady = () => {
  if (regionCoords.value) {
    viewerRef.value?.recenterToCoords(regionCoords.value)
  }
}

// Re-center on the highlighted region when its overlay is clicked.
const centerOnOverlayRegion = () => {
  if (regionCoords.value) {
    viewerRef.value?.recenterToCoords(regionCoords.value)
  }
}

// Space to leave below the viewer (page padding, etc.) when computing available height.
const BOTTOM_MARGIN = 24
const MIN_VIEWER_HEIGHT = 400

const viewerWrapper = ref<HTMLDivElement | null>(null)
// Starts unset so IIIFViewer (and its one-time OpenSeadragon init) waits for a real measurement.
const viewerHeight = ref(0)

// OpenSeadragon only reads its container's height once at init, so it must be a real pixel value
// available before IIIFViewer mounts (the wrapper stays in the DOM regardless of manifestUrl).
const updateViewerHeight = () => {
  if (!viewerWrapper.value) return
  const { top } = viewerWrapper.value.getBoundingClientRect()
  const available = window.innerHeight - top - BOTTOM_MARGIN
  viewerHeight.value = Math.max(available, MIN_VIEWER_HEIGHT)
}

onMounted(() => {
  updateViewerHeight()
  window.addEventListener('resize', updateViewerHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewerHeight)
})

// Re-measure in case the header/title above the wrapper changes size for the new image.
watch(manifestUrl, () => {
  nextTick(updateViewerHeight)
})
</script>

<style lang="scss" scoped>
.facsimile-viewer {
  overflow: hidden;
}
</style>
