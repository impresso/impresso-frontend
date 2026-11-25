<template>
  <div class="ContentItemViewer d-flex flex-column h-100" :style="rootStyle">
    <div v-if="isLoading" class="ContentItemViewer__state flex-grow-1">
      <LoadingBlock class="w-100 h-100" :height="200" :label="$t('loading')" />
    </div>

    <div v-else-if="status !== 'ready'" class="ContentItemViewer__state flex-grow-1" role="alert">
      <div class="ContentItemViewer__message">
        <p class="mb-2">{{ $t(`status.${status}`) }}</p>
        <a
          v-if="status === 'notPublic'"
          :href="permalink"
          target="_blank"
          rel="noopener noreferrer"
          class="small"
        >
          {{ $t('viewOnImpresso') }}
        </a>
      </div>
    </div>

    <template v-else>
      <IIIFViewer
        ref="viewerRef"
        class="ContentItemViewer__viewer position-relative flex-grow-1"
        :manifestUrls="manifestUrls"
        :overlays="overlays"
        :margin="margin"
        @ready="onViewerReady"
      />
      <ContentItemCitation
        v-if="!props.hideCitation && contentItem"
        class="ContentItemViewer__citation small"
        :contentItem="contentItem"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import IIIFViewer from '@/components/modules/IIIFViewer.vue'
import type { Overlay, OverlayCoords } from '@/components/modules/IIIFViewer.vue'
import ContentItemCitation from '@/components/ContentItemCitation.vue'
import LoadingBlock from '@/components/LoadingBlock.vue'
import type {
  ContentItem as ContentItemType,
  ContentItemPage
} from '@/models/generated/canonical/contentItem'
import { contentItems as contentItemsService } from '@/services'
import { getContentItemPermalink } from '@/logic/ids'
import { validateOrIgnore } from '@/widget/logic/props'

export interface ContentItemViewerProps {
  contentItemId: string
  /** Page to display. Defaults to all pages of the content item. */
  pageId?: string
  backgroundColor?: string
  overlayBackgroundColor?: string
  cssFilter?: string
  /** Region to highlight and zoom to, as "x,y,w,h" in image pixels of the displayed page. */
  coords?: string
  coordsMargin?: string
  alternativeTitle?: string
  hideCitation?: boolean
}

type Status = 'ready' | 'notFound' | 'notPublic' | 'error'

const props = withDefaults(defineProps<ContentItemViewerProps>(), {
  hideCitation: false
})

const viewerRef = ref<InstanceType<typeof IIIFViewer> | null>(null)
const contentItem = ref<ContentItemType | null>(null)
const isLoading = ref(true)
const status = ref<Status>('ready')

const permalink = computed(() => getContentItemPermalink(props.contentItemId))

const rootStyle = computed(() => {
  const [filter, value] = validateOrIgnore('cssFilter', props.cssFilter)
  return {
    backgroundColor: validateOrIgnore('backgroundColor', props.backgroundColor),
    '--overlay-color': validateOrIgnore('overlayBackgroundColor', props.overlayBackgroundColor),
    filter: filter ? `${filter}(${value})` : 'none'
  }
})

const margin = computed(() => Number(validateOrIgnore('coordsMargin', props.coordsMargin)))

const highlightCoords = computed<OverlayCoords | null>(() => {
  if (!props.coords || validateOrIgnore('coords', props.coords, null) === null) return null
  const [x, y, w, h] = props.coords.split(',').map(v => parseInt(v, 10))
  return { x, y, w, h }
})

const displayedPages = computed<ContentItemPage[]>(() => {
  const pages = contentItem.value?.facsimile?.pages ?? []
  const selectedPage = props.pageId ? pages.find(page => page.id === props.pageId) : undefined
  return selectedPage ? [selectedPage] : pages
})

const manifestUrls = computed<string[]>(() =>
  displayedPages.value.map(page => page.iiif?.manifestUrl ?? '').filter(url => url.length > 0)
)

const overlays = computed<Overlay[]>(() => {
  if (highlightCoords.value) {
    return [{ id: 'highlight', regions: [{ id: 'highlight', coords: highlightCoords.value }] }]
  }
  return displayedPages.value.map(page => ({
    id: page.id ?? '',
    regions: (page.regionCoordinates ?? []).map(([x, y, w, h], idx) => ({
      id: `${page.id}-${idx}`,
      coords: { x, y, w, h }
    }))
  }))
})

const onViewerReady = () => {
  if (highlightCoords.value) {
    viewerRef.value?.recenterToCoords(highlightCoords.value)
  }
}

const loadContentItem = async (contentItemId: string) => {
  isLoading.value = true
  contentItem.value = null
  try {
    const data = (await contentItemsService.get(contentItemId)) as ContentItemType
    if (data.access?.copyright !== 'pbl') {
      status.value = 'notPublic'
      return
    }
    if (props.alternativeTitle && data.text) {
      data.text.title = props.alternativeTitle
    }
    contentItem.value = data
    status.value = manifestUrls.value.length > 0 ? 'ready' : 'error'
  } catch (err) {
    console.error('[ContentItemViewer] error loading content item:', err)
    const { code, name } = (err ?? {}) as { code?: number; name?: string }
    status.value = code === 404 || name === 'NotFound' ? 'notFound' : 'error'
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.contentItemId,
  contentItemId => {
    if (contentItemId) loadContentItem(contentItemId)
  },
  { immediate: true }
)
</script>

<style>
.ContentItemViewer {
  --overlay-color: #56ccf294;
}
.ContentItemViewer__state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.ContentItemViewer__message {
  max-width: 28rem;
  padding: 1rem 1.5rem;
  text-align: center;
  background-color: var(--clr-white, #fff);
  border-radius: var(--impresso-border-radius-sm, 4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
.ContentItemViewer__citation {
  flex-shrink: 0;
  padding: 0.5rem 0.75rem;
  background-color: var(--clr-white, #fff);
}
.ContentItemViewer .IIIFViewer .overlay {
  background-color: var(--overlay-color);
  border-color: transparent;
  box-shadow: none;
}
.ContentItemViewer .IIIFViewer .overlay.hidden {
  background-color: transparent;
}
</style>

<i18n lang="json">
{
  "en": {
    "loading": "Loading…",
    "viewOnImpresso": "View on Impresso",
    "status": {
      "notFound": "This content item could not be found.",
      "notPublic": "This content item is not in the public domain and cannot be embedded.",
      "error": "This content item could not be loaded."
    }
  }
}
</i18n>
