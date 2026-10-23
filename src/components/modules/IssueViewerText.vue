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
        <div v-if="textReusePassages.length" class="small d-flex align-items-center m-0">
          <div
            v-html="$t('textReuseLabel', { n: textReusePassages.length }, textReusePassages.length)"
          />
          <info-button class="ml-2" name="text-reuse" />
        </div>

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
                  :cluster-colours="clusterColourMap"
                  :selected-cluster-id="selectedClusterId"
                  @clusterSelected="clusterSelectedHandler"
                  @passageClicked="passageSelectedHandler"
                  @passageMouseenter="mouseenterPassageHandler"
                  @passageMouseleave="mouseleavePassageHandler"
                />
                <!-- <AnnotatedText
                  class="text-serif"
                  v-if="regionsAnnotationTree[region.idx]"
                  :children="regionsAnnotationTree[region.idx].children"
                  :cluster-colours="clusterColourMap"
                  :selected-cluster-id="selectedClusterId"
                  @clusterSelected="clusterSelectedHandler"
                  @passageClicked="passageSelectedHandler"
                  @passageMouseenter="mouseenterPassageHandler"
                  @passageMouseleave="mouseleavePassageHandler"
                /> -->
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
                :children="regionsAnnotationTree[i].children"
                :cluster-colours="clusterColourMap"
                :selected-cluster-id="selectedClusterId"
                @clusterSelected="clusterSelectedHandler"
                @passageClicked="passageSelectedHandler"
                @passageMouseenter="mouseenterPassageHandler"
                @passageMouseleave="mouseleavePassageHandler"
              />
            </div>
          </div>
        </div>
      </b-container>
    </div>

    <hr class="py-4" />
    <div
      :style="{ top: `${hoverPassageLineTopOffset}px` }"
      class="passage-control bs-tooltip-left"
      role="tooltip"
      v-if="selectedPassage"
    >
      <div class="tooltip-inner">
        {{ $t('cluster_tooltip', { size: selectedPassage.clusterSize }) }}
      </div>
    </div>

    <CompareTextReusePassageModal
      :is-visible="isCompareTextReusePassageModalVisible"
      :item="selectedTextReusePassageItem"
      @dismiss="isCompareTextReusePassageModalVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { articleTextReusePassages, contentItems as contentItemsService } from '@/services'
import type { ContentItem as ContentItemType } from '@/models/generated/canonical/contentItem'
import Article from '@/models/Article'
import Collection from '@/models/Collection'
import { useCollectionsStore } from '@/stores/collections'
import { useFeaturesStore } from '@/stores/features'
import { useNotificationsStore } from '@/stores/notifications'
import { useSelectionMonitorStore } from '@/stores/selectionMonitor'
import {
  getNamedEntitiesFromArticleResponse,
  getAnnotateTextTree,
  passageToPassageEntity
} from '@/logic/articleAnnotations'

import ContentItem from './lists/ContentItem.vue'
import AnnotatedTextTree from './AnnotatedTextTree.vue'
import IIIFViewer, { type Overlay } from './IIIFViewer.vue'
import IIIFFragment from '../IIIFFragment.vue'
import CompareTextReusePassageModal from '@/components/CompareTextReusePassageModal.vue'
import InfoButton from '@/components/base/InfoButton.vue'

const COLOUR_SCHEME = [
  '#8dd3c7',
  '#bebada',
  '#fb8072',
  '#80b1d3',
  '#fdb462',
  '#b3de69',
  '#fccde5',
  '#d9d9d9',
  '#bc80bd',
  '#ccebc5',
  '#ffed6f'
]
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

const route = useRoute()
const router = useRouter()
const collectionsStore = useCollectionsStore()
const featuresStore = useFeaturesStore()
const notificationsStore = useNotificationsStore()
const selectionMonitorStore = useSelectionMonitorStore()

// template refs (matched by name with ref="root" / ref="contentItemHeader")
const root = ref<HTMLDivElement | null>(null)
const contentItemHeader = ref<HTMLDivElement | null>(null)

const article = ref<Article | null>(null)
const textReusePassages = ref<any[]>([])
const selectedPassageId = ref<string | number | undefined>(undefined)
const hoverPassageLineTopOffset = ref(0)
const fitBoundsToOverlayIdx = ref<[number, number]>([0, 0])
const iiifViewerHeight = ref(iiifViewerMinHeight)
const isCompareTextReusePassageModalVisible = ref(false)
const selectedTextReusePassageItem = ref<any | null>(null)

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

const clusterColourMap = computed(() => {
  const clusterIds = new Set<string>(textReusePassages.value.map(({ clusterId }) => clusterId))
  const map: Record<string, string> = {}
  let idx = 0
  for (const id of clusterIds) {
    map[id] = COLOUR_SCHEME[idx++ % COLOUR_SCHEME.length]
  }
  return map
})

const regionsAnnotationTree = computed(() => {
  const a = article.value
  if (!a) return []
  const entities = getNamedEntitiesFromArticleResponse(a)
  const passageEntities = textReusePassages.value.map(passageToPassageEntity)
  return getAnnotateTextTree(
    a.content,
    entities.concat(passageEntities),
    a.contentLineBreaks,
    a.regionBreaks
  ).children
})

const selectedPassage = computed(() =>
  selectedPassageId.value
    ? textReusePassages.value.find(({ id }) => id === selectedPassageId.value)
    : undefined
)

const selectedClusterId = computed(() => route.query.trClusterId as string)

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

function mouseenterPassageHandler(_clusterId: string, passageId: string, e: MouseEvent) {
  selectedPassageId.value = passageId
  hoverPassageLineTopOffset.value = (e.currentTarget as HTMLElement).getBoundingClientRect().y
}

function mouseleavePassageHandler() {
  selectedPassageId.value = undefined
}

function passageSelectedHandler(trClusterId: string, trPassageId: string) {
  const trPassage = textReusePassages.value.find(p => p.id === trPassageId)
  if (!trPassage) {
    console.error(
      '[IssueViewerText] @passageSelectedHandler Passage not found with id:',
      trPassageId
    )
    return
  }
  selectedTextReusePassageItem.value = {
    id: trPassage.id,
    title: trPassage.title,
    date: trPassage.date,
    content: trPassage.content,
    article: { id: trPassage.articleId || trPassage.article?.id },
    textReuseCluster: {
      id: trClusterId,
      clusterSize: trPassage.clusterSize,
      lexicalOverlap: trPassage.lexicalOverlap,
      timeDifferenceDay: trPassage.timeDifferenceDay
    }
  }
  // Defensive: if any parallel UI path opens the selection monitor, force-close it.
  selectionMonitorStore.hide()
  isCompareTextReusePassageModalVisible.value = true
}

function clusterSelectedHandler(trClusterId: string) {
  router.replace({ query: { ...route.query, trClusterId } })
}

watch(
  () => props.article_id,
  async (articleId, _prev, onCleanup) => {
    // ignore the response if article_id changed (or the component unmounted) meanwhile
    let stale = false
    onCleanup(() => (stale = true))

    fitBoundsToOverlayIdx.value = [0, 0]
    if (!articleId) return

    const [contentItem, passages] = await Promise.all([
      contentItemsService.get(articleId),
      featuresStore.isTextReuseEnabled
        ? articleTextReusePassages
            .find({ query: { id: articleId } })
            .then(({ passages }) => passages)
        : Promise.resolve<any[]>([])
    ])
    if (stale) return
    article.value = Article.fromContentItem(contentItem)
    textReusePassages.value = passages
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
@use 'sass:color';
@use '@/assets/legacy/bootstrap-impresso-theme-variables.scss' as *;

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
    box-shadow: inset 0px -2px 0px 0px color.adjust($clr-tertiary, $alpha: -0.5);
    transition: box-shadow 0.2s;
    cursor: pointer;

    &::before {
      font-family: 'dripicons-v2';
      font-size: 75%;
      opacity: 0.6;
      padding-right: 2px;
    }

    &:hover {
      box-shadow: inset 0px -24px 0px 0px color.adjust($clr-tertiary, $alpha: -0.5);
    }
  }

  .passage-control {
    position: fixed;
    right: 0;
    max-width: 100%;
    pointer-events: none;
  }

  span.location::before {
    content: '\e012';
  }

  span.location.continuation::before {
    content: '';
  }

  span.person::before {
    content: '\e056';
  }

  span.person.continuation::before {
    content: '';
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
    "wrongLayout": "Note: Facsimile could not be retrieve for this specific article. To read it in its digitized version, switch to \"Facsimile view\"",
    "cluster_tooltip": "View all {size} articles containing this passage",
    "textReuseLabel": "No text reuse passages available| <b>1</b> text reuse passage available | <b>{n}</b> text reuse passages available"
  }
}
</i18n>
