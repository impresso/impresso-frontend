<template>
  <div class="ContentItemViewerText">
    <div ref="contentItemHeader">
      <ContentItem
        v-if="contentItem"
        :item="contentItem"
        :show-title="false"
        :show-type="false"
        showSemanticEnrichments
      />
      <div v-if="contentItemCollections.length" class="d-flex flex-wrap align-items-center">
        <div class="badge badge-light my-1 mr-1 very-small-caps">collections</div>

        <b-badge
          v-for="(collection, i) in contentItemCollections"
          v-bind:key="i"
          variant="info"
          class="m-1 font-size-inherit"
        >
          <router-link
            v-bind:to="{ name: 'collection', params: { collection_uid: collection.uid } }"
            title="View collection"
          >
            {{ collection.title }}
          </router-link>

          <a
            class="ml-1 dripicons dripicons-cross text-decoration-none"
            title="Remove from collection"
            v-on:click="onRemoveCollection(collection.uid)"
          />
        </b-badge>
      </div>
    </div>
    <div class="container-fluid my-3" v-if="contentItem">
      <div class="row">
        <div class="col-sm-6 col-xl-7">
          <div
            class="position-sticky"
            :style="{
              top: `${iiifViewerMarginTop}px`
            }"
          >
            <IIIFViewer
              class="bg-dark rounded-md shadow border"
              openseadragonCssClass="overflow-hidden rounded-md"
              :style="{ height: `${iiifViewerHeight}px` }"
              v-bind="iiifProps"
              :fitBoundsToOverlayIdx="iiifFitBoundsToOverlayIdx"
            />
          </div>
        </div>
        <div class="col-sm-6 col-xl-4">
          <section v-for="(transcript, i) in iiifOverlaysTranscript" :key="transcript.id">
            <button
              class="btn btn-sm text-decoration-underline"
              @click="overlayTranscriptClickHandler(transcript)"
            >
              <b>{{ i + 1 }}</b> /
              <span class="text-muted"
                >{{ iiifOverlaysTranscript.length }} &mdash;
                {{ $t('pageNumber', { n: transcript.page.number }) }}</span
              >
            </button>
            <p>
              {{ transcript.transcript }}
            </p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import ContentItem from './modules/lists/ContentItem.vue'
import type {
  ContentItemPage,
  ContentItem as ContentItemType
} from '@/models/generated/schemas/contentItem'
import IIIFViewer, { Overlay } from './modules/IIIFViewer.vue'

const contentItemHeader = ref<HTMLElement | null>(null)

export interface ContentItemViewerTextProps {
  contentItem: ContentItemType
  isLoading: boolean
  iiifViewerMarginTop?: number
}

const props = withDefaults(defineProps<ContentItemViewerTextProps>(), {
  isLoading: false,
  iiifViewerMarginTop: 20
})
const contentItemPages = computed(() => {
  return props.contentItem?.image?.pages || []
})
const contentItemCollections = computed(() => {
  return props.contentItem?.semanticEnrichments?.collections || []
})

const onRemoveCollection = (collectionUid: string) => {
  console.debug(`[ContentItemViewerText] onRemoveCollection: ${collectionUid}`)
}

// iiif viewer props --- to be passed to IIIFViewer component
const iiifManifestUrls = computed<string[]>(() => {
  return contentItemPages.value.map(page => page.iiif.manifestUrl)
})

const iiifOverlays = computed<Overlay[]>(() => {
  let idx = 0
  return contentItemPages.value.map((page: ContentItemPage) => ({
    id: page.id,
    manifestUrl: page.iiif.manifestUrl,
    regions: page.regionCoordinates.map(([x, y, w, h]) => ({
      id: `overlay-${idx++}`,
      coords: { x, y, w, h }
    }))
  }))
})
const iiifFitBoundsToOverlayIdx = ref<[number, number]>([0, 0])
const iiifProps = computed(() => {
  return {
    manifestUrls: iiifManifestUrls.value,
    overlays: iiifOverlays.value
  }
})

const iiifViewerHeight = ref<number>(500)

interface OverlayTranscript {
  id: string
  idx: number
  transcript: string
  pageIdx: number
  regionIdx: number
  transcriptIdx?: number
  page: ContentItemPage
}
const overlayTranscriptClickHandler = (transcript: OverlayTranscript) => {
  iiifFitBoundsToOverlayIdx.value = [transcript.pageIdx, transcript.regionIdx]
}

const iiifOverlaysTranscript = computed<OverlayTranscript[]>(() => {
  if (!props.contentItem.image) {
    return []
  }
  const transcript = props.contentItem.text.content || ''
  const breakpoints = [0, ...props.contentItem.image.regionBreaks]

  const flatRegions: {
    page: ContentItemPage
    pageRegionIdx: number
    pageIdx: number
    transcriptIdx: number
  }[] = []
  let transcriptIdx = 0

  contentItemPages.value.forEach((page, pageIdx) => {
    page.regionCoordinates.forEach((_, pageRegionIdx) => {
      flatRegions.push({
        page,
        pageRegionIdx: pageRegionIdx,
        pageIdx: pageIdx,
        transcriptIdx: transcriptIdx
      })
      transcriptIdx++
    })
  })

  console.debug(
    '[ContentItemViewerText] iiifOverlaysTranscript',
    breakpoints.length,
    flatRegions.length
  )

  return breakpoints.map((breakpoint: number, i) => ({
    id: `overlay-${i}`,
    idx: i,
    pageIdx: flatRegions[i]?.pageIdx,
    regionIdx: flatRegions[i]?.pageRegionIdx,
    transcriptIdx: i,
    page: flatRegions[i]?.page,
    transcript: transcript.slice(breakpoint, breakpoints[i + 1] || transcript.length).trim()
  }))
})

const resize = () => {
  if (!contentItemHeader.value) {
    return
  }
  console.debug('[ContentItemViewerText] @resize')
}

onMounted(() => {
  window.addEventListener('resize', resize)
  resize()
})
</script>
