<template>
  <div class="ImageContentItemFacsimile">
    <div class="row">
      <div :class="regionTexts.length ? 'col-sm-6 col-xl-7' : 'col-12'">
        <div
          ref="viewerWrapper"
          class="facsimile-viewer mb-3 position-sticky top-0 border rounded-sm"
        >
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
      <div v-if="regionTexts?.length" class="col-sm-6 col-xl-5">
        <div
          v-for="(text, i) in regionTexts"
          :key="i"
          class="mb-3 p-2 rounded border"
          :class="{ 'transcript-region': true }"
          @click="centerOnContentRegion(i)"
        >
          <p class="mb-0 text-serif">{{ text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, nextTick, ref, watch } from 'vue'
import SearchResultsImageItem from '@/components/modules/SearchResultsImageItem.vue'
import IIIFViewer, { type Overlay } from '@/components/modules/IIIFViewer.vue'
import { IImage } from '@/models'
import type { ContentItem as ContentItemType } from '@/models/generated/canonical/contentItem'

const props = defineProps<{
  image?: IImage | null
  userPlan?: string
  contentItem?: ContentItemType | null
  contentItemRegions?: { id: string; coords: { x: number; y: number; w: number; h: number } }[]
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

const overlays = computed<Overlay[]>(() => {
  const regions: Overlay['regions'] = []

  if (regionCoords.value) {
    regions.push({ id: 'image-region', coords: regionCoords.value })
  }

  if (props.contentItemRegions) {
    for (const region of props.contentItemRegions) {
      regions.push(region)
    }
  }

  if (regions.length === 0) return []
  return [{ id: 'all-regions', regions }]
})

const regionTexts = computed(() => {
  const content = props.contentItem?.text?.content
  const regionBreaks = props.contentItem?.facsimile?.regionBreaks
  if (!content) return []
  if (!regionBreaks?.length) return [content]

  const texts: string[] = []
  texts.push(content.substring(0, regionBreaks[0]).trim())
  for (let i = 1; i < regionBreaks.length; i++) {
    texts.push(content.substring(regionBreaks[i - 1], regionBreaks[i]).trim())
  }
  texts.push(content.substring(regionBreaks[regionBreaks.length - 1]).trim())
  return texts.filter(t => t.length > 0)
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

// Re-center on the content item region when its transcript paragraph is clicked.
const centerOnContentRegion = (idx: number) => {
  const region = props.contentItemRegions?.[idx]
  if (region) {
    viewerRef.value?.recenterToCoords(region.coords)
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

.transcript-region {
  cursor: pointer;
  transition: border-color 0.2s var(--impresso-transition-ease);
}

.transcript-region:hover {
  border-color: var(--clr-grey-400);
}
</style>
