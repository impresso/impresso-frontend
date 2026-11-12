<template>
  <div id="IssueViewerText" ref="root" class="px-3 bg-light w-100">
    <div ref="contentItemHeader">
      <ContentItem
        v-if="contentItem"
        :contentItem="contentItem"
        :show-title="false"
        :show-type="false"
        showSemanticEnrichments
        showTopics
      />
      <i-spinner v-if="!article" class="text-center p-5" />
      <div v-if="contentItemCollections.length > 0" class="d-flex flex-wrap align-items-center">
        <div class="badge badge-light my-1 mr-1 very-small-caps">{{ $t('collections') }}</div>

        <b-badge
          v-for="collection in contentItemCollections"
          :key="collection.id"
          variant="info"
          class="m-1 font-size-inherit"
        >
          <router-link
            :to="{ name: 'collection', params: { collection_id: collection.id } }"
            :title="$t('viewCollection')"
          >
            {{ collection.name }}
          </router-link>

          <a
            class="ml-1 dripicons dripicons-cross text-decoration-none"
            :title="$t('removeFromCollection')"
            @click="onRemoveCollection(collection.id)"
          />
        </b-badge>
      </div>
    </div>

    <div v-if="article">
      <div class="alert alert-light" role="alert" v-if="!article.isCC">
        <p>{{ $t('wrongLayout') }}</p>
      </div>
      <div v-if="hasValidRegions === false">
        <p>{{ article.excerpt }}</p>
      </div>
      <b-container fluid v-else class="region-row px-0 mt-3 mb-3 position-relative">
        <!-- computed regions -->
        <div class="row" v-if="withIIIFViewer">
          <div class="col-sm-6 col-xl-7">
            <div :style="{ position: 'sticky', top: `${iiifViewerMarginTop}px` }">
              <IIIFViewer
                class="bg-dark rounded-md shadow border"
                openseadragonCssClass="overflow-hidden rounded-md"
                :style="{ height: `${iiifViewerHeight}px` }"
                :manifestUrls="iiifManifestUrls"
                :overlays="computedIIIFViewerOverlays"
                :fitBoundsToOverlayIdx="fitBoundsToOverlayIdx"
                @clickOnOverlayRegion="
                  ({ fitBoundsToOverlayIdx: idx }) => annotatedTextClickHandler(idx)
                "
              />
            </div>
          </div>
          <div class="col-sm-6 col-xl-4">
            <div
              class="d-flex position-sticky top-0 bg-light z-index-1 justify-content-between align-items-center border-bottom p-2"
            >
              <h4 class="small-caps m-0">{{ $t('transcript') }}</h4>
              <ContentItemCopyText v-if="contentItem" :content-item="contentItem" />
            </div>

            <div v-for="(page, pageIdx) in pageOverlays" :key="pageIdx">
              <div
                class="IssueViewerText__region region text-serif py-2"
                v-for="(region, i) in page.regions"
                :key="region.idx"
                @click="annotatedTextClickHandler([pageIdx, i])"
              >
                <AnnotatedTextTree
                  class="text-serif"
                  v-if="regionsAnnotationTree[region.idx]"
                  :node="regionsAnnotationTree[region.idx]"
                />
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div
            class="row IssueViewerText__regions mt-1"
            v-for="(region, i) in computedRegions"
            :key="i"
          >
            <div v-if="article.isCC" class="col col-sm-5">
              <div class="py-3">
                <IIIFFragment
                  v-if="region.iiif"
                  :iiif="region.iiif"
                  size="!496,480"
                  :scale="1"
                  fit-to-regions
                  :regions="[region]"
                />
              </div>
            </div>
            <div class="col col-sm-7 text-serif py-2">
              <AnnotatedText
                v-if="regionsAnnotationTree[i]"
                :children="getRegionChildren(regionsAnnotationTree[i])"
              />
            </div>
          </div>
        </div>
      </b-container>
    </div>

    <hr class="py-4" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { contentItems as contentItemsService } from '@/services'
import type { ContentItem as ContentItemType } from '@/models/generated/canonical/contentItem'
import Article from '@/models/Article'
import Collection from '@/models/Collection'
import { useCollectionsStore } from '@/stores/collections'
import { useNotificationsStore } from '@/stores/notifications'
import { getNamedEntitiesFromContentItem, getAnnotateTextTree } from '@/logic/articleAnnotations'
import type { AnnotationTreeChild } from '@/logic/articleAnnotations'

import ContentItem from './lists/ContentItem.vue'
import AnnotatedTextTree from './AnnotatedTextTree.vue'
import AnnotatedText from './AnnotatedText.vue'
import IIIFViewer, { type Overlay } from './IIIFViewer.vue'
import IIIFFragment from '../IIIFFragment.vue'
import ContentItemCopyText from '../contentItem/ContentItemCopyText.vue'

const iiifViewerMinHeight = 500
const iiifViewerMarginTop = 20

const props = withDefaults(
  defineProps<{
    article_id?: string
    contentItem?: ContentItemType | null
    withIIIFViewer?: boolean
  }>(),
  { withIIIFViewer: false }
)

const emit = defineEmits<{
  'update:contentItem': [contentItem: ContentItemType]
}>()

const collectionsStore = useCollectionsStore()
const notificationsStore = useNotificationsStore()

// template refs (matched by name with ref="root" / ref="contentItemHeader")
const root = ref<HTMLDivElement | null>(null)
const contentItemHeader = ref<HTMLDivElement | null>(null)

const article = ref<Article | null>(null)
// canonical content item fetched from `article_id` when the parent does not
// provide one through the `contentItem` prop.
const fetchedContentItem = ref<ContentItemType | null>(null)
const resolvedContentItem = computed(() => props.contentItem ?? fetchedContentItem.value)
const fitBoundsToOverlayIdx = ref<[number, number]>([0, 0])
const iiifViewerHeight = ref(iiifViewerMinHeight)

const contentItemCollections = computed<Collection[]>(() => {
  const collections = props.contentItem?.semanticEnrichments?.collections ?? []
  return collections.map((c: any) => new Collection({ ...c, name: c.title || c.name, id: c.id }))
})

// regions must have numeric coords: { x, y, w, h }
const hasValidRegions = computed(
  () =>
    article.value?.regions.every(({ coords }) =>
      [coords?.x, coords?.y, coords?.w, coords?.h].every(v => !isNaN(v as number))
    ) ?? false
)

// Per-page grouping of the article regions, keeping the global region index so the
// transcript column can look up its annotation tree node. Also carries the page's
// IIIF manifest url, which is passed to IIIFViewer separately.
const pageOverlays = computed(() => {
  if (!article.value || !hasValidRegions.value) return []
  const regionsByPageId: Record<
    string,
    ((typeof article.value.regions)[number] & { idx: number })[]
  > = {}
  article.value.regions.forEach((region, idx) => {
    ;(regionsByPageId[region.pageId] ??= []).push({ ...region, idx })
  })
  return article.value.pages.map(page => ({
    id: page.id,
    manifestUrls: page.iiif,
    regions: regionsByPageId[page.id] ?? []
  }))
})

// Shape expected by IIIFViewer's `overlays` prop: every region needs an id and
// pixel coords (regions without coords are already excluded by hasValidRegions).
const computedIIIFViewerOverlays = computed<Overlay[]>(() =>
  pageOverlays.value.map(page => ({
    id: page.id,
    regions: page.regions.flatMap(region =>
      region.coords ? [{ id: String(region.idx), coords: region.coords }] : []
    )
  }))
)

const iiifManifestUrls = computed(() => pageOverlays.value.map(page => page.manifestUrls))

const computedRegions = computed(() => {
  if (!article.value || !hasValidRegions.value) return []
  const regions = article.value.regions
  const maxRegionWidth = Math.max(...regions.map(({ coords }) => coords.w))
  return regions.map((r, i) => ({
    ...r,
    id: i,
    // normalised width
    nw: Math.min(1, r.coords.w / maxRegionWidth)
  }))
})

const regionsAnnotationTree = computed(() => {
  // NOTE: `article` (the deprecated Article model) is intentionally not used
  // here. Annotations are derived directly from the canonical `ContentItem`.
  const contentItem = resolvedContentItem.value
  if (!contentItem?.text?.content) return []
  const entities = getNamedEntitiesFromContentItem(contentItem)
  return getAnnotateTextTree(
    contentItem.text.content,
    entities,
    contentItem.facsimile?.lineBreaks ?? [],
    contentItem.facsimile?.regionBreaks ?? []
  ).children
})

function getRegionChildren(region: AnnotationTreeChild) {
  return typeof region === 'string' ? [] : region.children
}

function annotatedTextClickHandler(idx: [number, number]) {
  fitBoundsToOverlayIdx.value = idx
}

function resize() {
  const rootEl = root.value
  const headerEl = contentItemHeader.value
  if (!rootEl || !headerEl) return
  const { top } = rootEl.getBoundingClientRect()
  const available = window.innerHeight - top - iiifViewerMarginTop - headerEl.offsetHeight
  // keep a minimum height for the openseadragon viewer
  iiifViewerHeight.value = Math.max(iiifViewerMinHeight, available)
}

async function onRemoveCollection(collectionId: string) {
  const item = props.contentItem
  const collections = item?.semanticEnrichments?.collections ?? []
  const collection = collections.find(c => c.id === collectionId)
  if (!item?.id || !collection) return

  await collectionsStore.removeCollectionItem({
    item: { id: item.id },
    collection: { id: collectionId }
  })
  notificationsStore.addNotification({
    type: 'info',
    title: 'Collection',
    message: `Removed from collection "${collection.title || (collection as any).name}"`
  })
  emit('update:contentItem', {
    ...item,
    semanticEnrichments: {
      ...item.semanticEnrichments,
      collections: collections.filter(c => c.id !== collectionId)
    }
  })
}

watch(
  () => props.article_id,
  async (articleId, _prev, onCleanup) => {
    // ignore the response if article_id changed (or the component unmounted) meanwhile
    let stale = false
    onCleanup(() => (stale = true))

    fitBoundsToOverlayIdx.value = [0, 0]
    if (!articleId) {
      fetchedContentItem.value = null
      return
    }

    const contentItem = await contentItemsService.get(articleId)
    if (stale) return
    article.value = Article.fromContentItem(contentItem)
    fetchedContentItem.value = contentItem
  },
  { immediate: true }
)

let headerObserver: ResizeObserver | undefined

onMounted(() => {
  window.addEventListener('resize', resize)
  // the header grows when the content item / collections load
  if (contentItemHeader.value) {
    headerObserver = new ResizeObserver(resize)
    headerObserver.observe(contentItemHeader.value)
  }
  resize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  headerObserver?.disconnect()
})
</script>

<style lang="scss">
.IssueViewerText__region {
  cursor: pointer;
  transition: border-color 0.2s var(--impresso-transition-ease);
  padding: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 0.25rem;
  border: 1px solid transparent;
}

.IssueViewerText__region:hover {
  border-color: var(--clr-grey-400);
}

#IssueViewerText {
  height: 100%;

  article h2 {
    font-size: 3.5rem;
  }

  article .article-excerpt {
    font-size: inherit;
  }

  .line {
    margin-top: 2px;
  }

  span.location,
  span.person {
    position: relative;
    background-color: var(--impresso-color-black-alpha-10);
    padding-left: 16px;
  }
  span.location.continuation,
  span.person.continuation {
    padding-left: 0;
  }
  span.location svg,
  span.person svg {
    position: absolute;
    top: 4px;
    left: 2px;
  }

  .region-row {
    margin: 1px;
  }

  .region {
    p {
      margin-bottom: 0;
    }
  }

  .similar-items h2 {
    font-size: 1em;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "collections": "collections",
    "viewCollection": "View collection",
    "removeFromCollection": "Remove from collection",
    "wrongLayout": "Note: Facsimile could not be retrieve for this specific article. To read it in its digitized version, switch to \"Facsimile view\""
  }
}
</i18n>
