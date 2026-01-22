<template>
  <div id="IssueViewerText" ref="root" class="px-3 bg-light w-100">
    <div ref="contentItemHeader">
      <ContentItem
        v-if="contentItem"
        :item="contentItem"
        :show-title="false"
        :show-type="false"
        showSemanticEnrichments
        showTopics
      />
      <i-spinner v-if="!article" class="text-center p-5" />
      <div v-if="contentItemCollections.length > 0" class="d-flex flex-wrap align-items-center">
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
            {{ collection.name }}
          </router-link>

          <a
            class="ml-1 dripicons dripicons-cross text-decoration-none"
            title="Remove from collection"
            v-on:click="onRemoveCollection(collection.uid)"
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
            v-html="
              $tc('textReuseLabel', textReusePassages.length, {
                n: textReusePassages.length
              })
            "
          />
          <info-button class="ml-2" name="text-reuse" />
        </div>

        <!-- computed regions -->
        <div class="row" v-if="withIIIFViewer">
          <div class="col-sm-6 col-xl-7">
            <div
              :style="{
                position: 'sticky',
                top: `${iiifViewerMarginTop}px`
              }"
            >
              {{ contentItem }}
              <IIIFViewer
                class="bg-dark rounded-md shadow border"
                openseadragonCssClass="overflow-hidden rounded-md"
                :style="{ height: `${iiifViewerHeight}px` }"
                v-if="article"
                :manifestUrls="
                  computedIIIFViewerOverlays.map((d: any) => {
                    return d.manifestUrls
                  })
                "
                :overlays="computedIIIFViewerOverlays"
                :fitBoundsToOverlayIdx="fitBoundsToOverlayIdx"
                @clickOnOverlayRegion="
                  ({ fitBoundsToOverlayIdx: idx }) => annotatedTextClickHandler(idx)
                "
              />
            </div>
          </div>
          <div class="col-sm-6 col-xl-4">
            <div v-for="(page, pageIdx) in computedIIIFViewerOverlays" :key="pageIdx">
              <div
                class="IssueViewerText__region region text-serif py-2"
                v-for="(region, i) in page.regions"
                :key="region.idx"
                @click="() => annotatedTextClickHandler([pageIdx, i])"
              >
                <AnnotatedText
                  class="text-serif"
                  v-if="regionsAnnotationTree[region.idx]"
                  :children="regionsAnnotationTree[region.idx].children"
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
        </div>
        <div v-if="!withIIIFViewer">
          <div
            class="row IssueViewerText__regions mt-1"
            v-for="(region, i) in computedRegions"
            v-bind:key="i"
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
                ></IIIFFragment>
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
      :style="`top:${hoverPassageLineTopOffset}px`"
      class="passage-control bs-tooltip-left"
      role="tooltip"
      v-if="selectedPassage"
    >
      <div class="tooltip-inner">
        {{ $t('cluster_tooltip', { size: selectedPassage.clusterSize }) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapStores } from 'pinia'
import { articleTextReusePassages, contentItems as contentItemsService } from '@/services'

import ContentItem from './lists/ContentItem.vue'
import type { ContentItem as ContentItemType } from '@/models/generated/schemas/contentItem'
import AnnotatedText from './AnnotatedText.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import IIIFViewer from './IIIFViewer.vue'

import Article from '@/models/Article'
import { useCollectionsStore } from '@/stores/collections'
import { useSelectionMonitorStore } from '@/stores/selectionMonitor'

import {
  getNamedEntitiesFromArticleResponse,
  getAnnotateTextTree,
  passageToPassageEntity
} from '@/logic/articleAnnotations'
import TextReuseCluster from '@/models/TextReuseCluster'
import IIIFFragment from '../IIIFFragment.vue'
import ListOfSimilarContentItems from '../ListOfSimilarContentItems.vue'
import Collection from '@/models/Collection'
import { useNotificationsStore } from '@/stores/notifications'

const colourScheme = [
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

export default {
  data() {
    return {
      article: null,
      textReusePassages: [],
      selectedPassageId: undefined,
      hoverPassageLineTopOffset: 0,
      fitBoundsToOverlayIdx: [0, 0],
      iiifViewerMinHeight: 500,
      iiifViewerHeight: 500,
      iiifViewerMarginTop: 20
    } as {
      article: Article
      textReusePassages: any[]
      selectedPassageId: string | number | undefined
      hoverPassageLineTopOffset: number
      fitBoundsToOverlayIdx: [number, number]
      iiifViewerMinHeight: number
      iiifViewerHeight: number
      iiifViewerMarginTop: number
    }
  },

  mounted() {
    window.addEventListener('resize', this.resize)
    this.resize()
  },
  computed: {
    ...mapStores(useCollectionsStore),
    ...mapStores(useNotificationsStore),
    ...mapStores(useSelectionMonitorStore),

    contentItemCollections(): Collection[] {
      if (!this.contentItem) return []
      const collections = this.contentItem.semanticEnrichments?.collections || []
      return collections.map(
        (c: any) =>
          new Collection({
            ...c,
            name: c.title || c.name,
            uid: c.uid
          })
      )
    },
    hasValidRegions() {
      // verify that regions exist and conform to this:
      // "regions": [{
      //   "coords": {
      //   "x": 583,
      //   "y": 1327,
      //   "w": 245,
      //   "h": 57
      // }}]
      return !this.article.regions.some(({ coords }) => {
        return isNaN(coords.x) || isNaN(coords.y) || isNaN(coords.w) || isNaN(coords.h)
      })
    },
    computedIIIFViewerOverlays() {
      if (!this.hasValidRegions) return []
      const regionsByPageIndex = this.article.regions.reduce((acc, region, idx) => {
        if (!acc[region.pageUid]) {
          acc[region.pageUid] = []
        }

        acc[region.pageUid].push({
          ...region,
          idx
        })
        return acc
      }, {})

      const overlays = this.article.pages.map(page => {
        return {
          id: page.uid,
          manifestUrls: page.iiif
            .replace('https://dev.impresso-project.ch/', '/')
            .replace('http://dev.impresso-project.ch/', '/'),
          regions: regionsByPageIndex[page.uid] || []
        }
      })
      console.debug('[IssueViewerText] @computedIIIFViewerOverlays', overlays)
      return overlays
    },
    computedRegions() {
      if (!this.hasValidRegions) return []
      const regions = this.article.regions
      const maxRegionWidth = Math.max(...regions.map(({ coords }) => coords.w))

      return regions.map((r, i) => ({
        ...r,
        id: i,
        // nrmalised width
        nw: Math.min(1, r.coords.w / maxRegionWidth)
      }))
    },
    clusterColourMap() {
      const clusterIds = [...new Set(this.textReusePassages.map(({ clusterId }) => clusterId))]
      return clusterIds.reduce((map, id, idx) => {
        map[id] = colourScheme[idx]
        return map
      }, {})
    },
    regionsAnnotationTree() {
      if (!this.article) return []

      const entities = getNamedEntitiesFromArticleResponse(this.article)
      const passageEntities = this.textReusePassages.map(passageToPassageEntity)

      const lineBreaks = this.article.contentLineBreaks
      const regionBreaks = this.article.regionBreaks

      return getAnnotateTextTree(
        this.article.content,
        entities.concat(passageEntities),
        lineBreaks,
        regionBreaks
      ).children
    },
    selectedPassage() {
      if (this.selectedPassageId) {
        return this.textReusePassages.filter(({ id }) => id === this.selectedPassageId)[0]
      }
      return undefined
    },
    selectedClusterId() {
      return this.$route.query.trClusterId as string
    },
    textReuseEnabled() {
      // @ts-ignore
      return !!window.impressoFeatures?.textReuse?.enabled
    }
  },
  props: {
    article_uid: String,
    contentItem: Object as () => ContentItemType | null,
    withIIIFViewer: {
      type: Boolean,
      default: false
    }
  },
  components: {
    ContentItem,
    ListOfSimilarContentItems,
    AnnotatedText,
    InfoButton,
    IIIFViewer,
    IIIFFragment
  },
  methods: {
    annotatedTextClickHandler(fitBoundsToOverlayIdx: [number, number]) {
      this.fitBoundsToOverlayIdx = fitBoundsToOverlayIdx
    },

    resize() {
      if (!this.$refs.root && this.$refs.contentItemHeader) {
        return
      }
      const rootAsDiv = this.$refs.root as HTMLDivElement
      const contentItemHeaderAsDiv = this.$refs.contentItemHeader as HTMLDivElement
      try {
        const { top: rootOffsetTop } = rootAsDiv.getBoundingClientRect() as DOMRect
        const headerHeight = contentItemHeaderAsDiv.offsetHeight
        const iiifViewerHeight =
          window.innerHeight - rootOffsetTop - this.iiifViewerMarginTop - headerHeight
        // add minimum height for the openseadragonviewer
        this.iiifViewerHeight = Math.max(this.iiifViewerMinHeight, iiifViewerHeight)
      } catch (e) {
        console.warn('[IssueViewerText] @updated parentNode not found', e)
      }
    },
    async onRemoveCollection(collectionId: string) {
      const item = this.contentItem
      const itemId = item?.id
      const collections = item?.semanticEnrichments?.collections ?? []
      const collection = collections.find(c => c.uid === collectionId)

      if (!itemId || !collection) return

      await this.collectionsStore.removeCollectionItem({
        item: { uid: itemId },
        collection: { uid: collectionId }
      })
      this.notificationsStore.addNotification({
        type: 'info',
        title: 'Collection',
        message: `Removed from collection "${collection.title || (collection as any)?.name}"`
      })
      if (this.contentItem?.semanticEnrichments?.collections) {
        this.contentItem.semanticEnrichments.collections =
          this.contentItem.semanticEnrichments.collections.filter(c => c.uid !== collectionId)
      }
    },
    mouseenterPassageHandler(clusterId, passageId, e: MouseEvent) {
      this.selectedPassageId = passageId

      const el = e.currentTarget as HTMLElement
      this.hoverPassageLineTopOffset = el.getBoundingClientRect().y
    },
    mouseleavePassageHandler(clusterId, passageId, e) {
      this.selectedPassageId = null
    },
    passageClickHandler() {
      // create a filter for the selected cluster
      this.$router.push({
        name: 'text-reuse-clusters',
        query: {
          q: `#${this.selectedClusterId}`
        }
      })
    },
    passageSelectedHandler(trClusterId: string, trPassageId: string) {
      const trPassage = this.textReusePassages.find(p => p.id === trPassageId)
      if (!trPassage) {
        console.error(
          '[issueViewerText] @passageSelectedHandler Passage not found with id:',
          trPassageId
        )
        return
      }
      const item = new TextReuseCluster({
        id: trClusterId,
        maxDate: new Date(trPassage.timeCoverage.to),
        minDate: new Date(trPassage.timeCoverage.from),
        clusterSize: trPassage.clusterSize,
        lexicalOverlap: trPassage.lexicalOverlap
      })
      console.info('[issueViewerText] @passageSelectedHandler', item)
      this.selectionMonitorStore.show({
        type: 'textReuseCluster',
        item,
        scope: 'comparePassages',
        applyCurrentSearchFilters: false,
        displayCurrentSearchFilters: false
      })
    },
    clusterSelectedHandler(trClusterId: string) {
      this.$router.replace({
        query: {
          ...this.$route.query,
          trClusterId
        }
      })
    }
  },
  watch: {
    article_uid: {
      immediate: true,
      async handler(articleUid) {
        console.info(
          '[IssueViewerText] watch@article_uid',
          articleUid,
          '- textReuseEnabled:',
          this.textReuseEnabled
        )
        this.fitBoundsToOverlayIdx = [0, 0]
        const trPromise = this.textReuseEnabled
          ? articleTextReusePassages
              .find({ query: { id: articleUid } })
              .then(res => {
                console.debug(
                  '[IssueViewerText] watch@article_uid articleTextReusePassages succesfully get',
                  res
                )
                return res
              })
              .then(({ passages }) => passages)
          : Promise.resolve([])

        const [article, textReusePassages] = await Promise.all([
          contentItemsService.get(articleUid).then(d => {
            console.debug(['[IssueViewerText] @article_uid', d])
            return Article.fromContentItem(d)
          }),
          trPromise
        ])
        this.article = article
        this.textReusePassages = textReusePassages
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/legacy/bootstrap-impresso-theme-variables.scss';

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
  overflow: none;
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
    box-shadow: inset 0px -2px 0px 0px transparentize($clr-tertiary, 0.5);
    transition: box-shadow 0.2s;
    cursor: pointer;

    &::before {
      font-family: 'dripicons-v2';
      font-size: 75%;
      opacity: 0.6;
      padding-right: 2px;
    }

    &:hover {
      box-shadow: inset 0px -24px 0px 0px transparentize($clr-tertiary, 0.5);
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
    "similarContentItems": "Similar Content Items",
    "wrongLayout": "Note: Facsimile could not be retrieve for this specific article. To read it in its digitized version, switch to \"Facsimile view\"",
    "page": "pag. {num}",
    "pages": "pp. {nums}",
    "add_to_collection": "Add to Collection ...",
    "cluster_tooltip": "View all {size} articles containing this passage",
    "textReuseLabel": "No text reuse passages available| <b>1</b> text reuse passage available | <b>{n}</b> text reuse passages available"
  }
}
</i18n>
