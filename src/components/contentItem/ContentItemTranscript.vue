<template>
  <div class="ContentItemTranscript">
    <!-- item summary: title, type and specs live in the page header -->
    <section ref="summaryRef">
      <ContentItem
        v-if="contentItem"
        :content-item="contentItem"
        :showIIIFThumbnail="!hasUsableFacsimile"
        :show-title="false"
        :show-type="false"
        showSemanticEnrichments
        showTopics
        showCollections
      />
    </section>

    <!-- facsimile + transcript, synced through the region overlays -->
    <div v-if="hasUsableFacsimile" class="row mt-3 mb-3">
      <div class="col-sm-6 col-xl-7">
        <div
          ref="viewerWrapper"
          class="ContentItemTranscript__viewer position-sticky top-0 border rounded-sm"
        >
          <IIIFViewer
            v-if="viewerHeight"
            class="bg-dark"
            :style="{ height: `${viewerHeight}px` }"
            :manifest-urls="iiifManifestUrls"
            :overlays="iiifViewerOverlays"
            :fit-bounds-to-overlay-idx="fitBoundsToOverlayIdx"
            openseadragon-css-class="overflow-hidden"
            @click-on-overlay-region="onOverlayRegionClick"
          />
        </div>
      </div>
      <div class="col-sm-6 col-xl-5">
        <div
          class="d-flex position-sticky top-0 bg-light justify-content-between align-items-center border-bottom p-2 z-index-1"
        >
          <h4 class="small-caps m-0">{{ $t('transcript') }}</h4>
          <ContentItemCopyText v-if="contentItem" :content-item="contentItem" />
        </div>
        <div v-for="(page, pageIdx) in pageRegions" :key="page.id">
          <div
            v-for="(region, regionIdx) in page.regions"
            :key="region.idx"
            class="ContentItemTranscript__region region text-serif py-2"
            @click="onTranscriptRegionClick([pageIdx, regionIdx])"
          >
            <AnnotatedTextTree
              v-if="transcriptTree[region.idx]"
              :node="transcriptTree[region.idx]"
              :has-explore-access="hasExploreAccess"
            />
          </div>
        </div>
        <Alert v-if="!transcriptTree.length" type="info" class="mt-3">
          {{ $t('noTranscriptAvailable') }}
        </Alert>
      </div>
    </div>

    <!-- fallback: annotated transcript only (no usable facsimile regions) -->
    <template v-else>
      <div
        v-if="contentItem?.text?.content"
        class="d-flex justify-content-between align-items-center border-bottom mt-3 mb-2 pb-2"
      >
        <h4 class="small-caps m-0">{{ $t('transcript') }}</h4>
        <ContentItemCopyText :content-item="contentItem" />
      </div>
      <div v-if="transcriptTree.length" class="ContentItemTranscript__text text-serif py-2">
        <AnnotatedTextTree
          v-for="(region, index) in transcriptTree"
          :key="index"
          :node="region"
          :has-explore-access="hasExploreAccess"
        />
      </div>
      <Alert v-else-if="contentItem" type="info" class="mt-3">
        {{ $t('noTranscriptAvailable') }}
      </Alert>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ContentItem as ContentItemType } from '@/models/generated/canonical/contentItem'
import ContentItem from '@/components/modules/lists/ContentItem.vue'
import ContentItemCopyText from '@/components/contentItem/ContentItemCopyText.vue'
import AnnotatedTextTree from '@/components/modules/AnnotatedTextTree.vue'
import Alert from 'impresso-ui-components/components/Alert.vue'
import IIIFViewer, { type Overlay } from '@/components/modules/IIIFViewer.vue'
import { useContentItemAccess } from '@/composables/useContentItemAccess'
import { getAnnotateTextTree } from '@/logic/articleAnnotations'
import { getNamedEntitiesFromContentItem } from '@/logic/contentItemAnnotations'

export interface ContentItemRegion {
  /** Flat index across all pages, matching the annotation tree children order. */
  idx: number
  /** [x, y, w, h] in image pixel coordinates. */
  coords: [number, number, number, number]
}

export interface ContentItemPageRegions {
  id: string
  manifestUrl: string
  regions: ContentItemRegion[]
}

export interface ContentItemTranscriptProps {
  contentItem?: ContentItemType
}

const props = defineProps<ContentItemTranscriptProps>()

const { hasExploreAccess } = useContentItemAccess(() => props.contentItem ?? {})

/**
 * Annotated transcript tree, derived from the canonical content item the same
 * way as in IssueViewerText: named entities are highlighted and only linked
 * when the user has explore access. `children` are indexed by the flat region
 * index across all pages.
 */
const transcriptTree = computed(() => {
  const contentItem = props.contentItem
  if (!contentItem?.text?.content) {
    return []
  }
  const entities = getNamedEntitiesFromContentItem(contentItem)
  return getAnnotateTextTree(
    contentItem.text.content,
    entities,
    contentItem.facsimile?.lineBreaks ?? [],
    contentItem.facsimile?.regionBreaks ?? []
  ).children
})

/** Pages with their regions, straight from the canonical content item. */
const pageRegions = computed<ContentItemPageRegions[]>(() => {
  const pages = props.contentItem?.facsimile?.pages
  if (!pages?.length) {
    return []
  }
  let regionIdx = 0
  return pages.map((page, pageIdx) => ({
    id: page.id ?? `page-${pageIdx}`,
    manifestUrl: page.iiif?.manifestUrl ?? '',
    regions: (page.regionCoordinates ?? []).map(coords => ({
      idx: regionIdx++,
      coords
    }))
  }))
})

const hasValidRegionCoords = computed(() =>
  pageRegions.value.every(page =>
    page.regions.every(({ coords }) =>
      [coords[0], coords[1], coords[2], coords[3]].every(Number.isFinite)
    )
  )
)

/** The facsimile view requires at least one page with a manifest and one region. */
const hasUsableFacsimile = computed(
  () =>
    hasValidRegionCoords.value &&
    pageRegions.value.some(page => page.manifestUrl.length > 0) &&
    pageRegions.value.some(page => page.regions.length > 0)
)

const iiifManifestUrls = computed(() => pageRegions.value.map(page => page.manifestUrl))

/** Shape expected by IIIFViewer's `overlays` prop: one entry per page. */
const iiifViewerOverlays = computed<Overlay[]>(() =>
  pageRegions.value.map(page => ({
    id: page.id,
    regions: page.regions.map(region => ({
      id: String(region.idx),
      coords: {
        x: region.coords[0],
        y: region.coords[1],
        w: region.coords[2],
        h: region.coords[3]
      }
    }))
  }))
)

/** [page index, region index within the page] — the viewer fits bounds to it. */
const fitBoundsToOverlayIdx = ref<[number, number]>([-1, -1])

const onTranscriptRegionClick = (idx: [number, number]) => {
  fitBoundsToOverlayIdx.value = idx
}

const onOverlayRegionClick = (payload: { fitBoundsToOverlayIdx: [number, number] }) => {
  fitBoundsToOverlayIdx.value = payload.fitBoundsToOverlayIdx
}

/* Viewer sizing, as in ImageContentItemFacsimile: OpenSeadragon reads its
   container height once at init, so it must be a real pixel value before mount. */
const BOTTOM_MARGIN = 24
const MIN_VIEWER_HEIGHT = 400

const viewerWrapper = ref<HTMLDivElement | null>(null)
const summaryRef = ref<HTMLElement | null>(null)
const viewerHeight = ref(0)

const updateViewerHeight = () => {
  if (!viewerWrapper.value) return
  const { top } = viewerWrapper.value.getBoundingClientRect()
  viewerHeight.value = Math.max(window.innerHeight - top - BOTTOM_MARGIN, MIN_VIEWER_HEIGHT)
}

let summaryObserver: ResizeObserver | undefined

onMounted(() => {
  updateViewerHeight()
  window.addEventListener('resize', updateViewerHeight)
  // the summary grows when the content item (and its enrichments) load
  if (summaryRef.value) {
    summaryObserver = new ResizeObserver(updateViewerHeight)
    summaryObserver.observe(summaryRef.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewerHeight)
  summaryObserver?.disconnect()
})

watch(
  () => props.contentItem?.id,
  () => {
    // zoom to the first region of the new item (applied when the viewer opens)
    fitBoundsToOverlayIdx.value = [0, 0]
    nextTick(updateViewerHeight)
  }
)
</script>

<style>
.ContentItemTranscript__viewer {
  overflow: hidden;
}

.ContentItemTranscript__region {
  cursor: pointer;
  transition: border-color 0.2s var(--impresso-transition-ease);
  padding: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 0.25rem;
  border: 1px solid transparent;
}

.ContentItemTranscript__region:hover {
  border-color: var(--clr-grey-400);
}

.ContentItemTranscript__text {
  overflow-wrap: anywhere;
}
</style>

<i18n lang="json">
{
  "en": {
    "transcript": "Transcript",
    "noTranscriptAvailable": "No transcript available for this content item."
  }
}
</i18n>
