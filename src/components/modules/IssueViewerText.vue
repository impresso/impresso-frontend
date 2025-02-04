<template>
  <div id="IssueViewerText" ref="root" class="px-3 bg-light w-100">
    <i-spinner v-if="!article" class="text-center p-5" />
    <div v-if="article">
      <b-badge
        v-for="(collection, i) in article.collections"
        v-bind:key="`co_${i}`"
        variant="info"
        class="mt-1 mr-1"
      >
        <router-link
          class="text-white"
          v-bind:to="{ name: 'collection', params: { collection_uid: collection.uid } }"
        >
          {{ collection.name }}
        </router-link>
        <a class="dripicons dripicons-cross" v-on:click="onRemoveCollection(collection, article)" />
      </b-badge>
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
        <div class="row">
          <div class="col-sm-6 col-xl-7">
            <div
              :style="{
                position: 'sticky',
                top: `${iiifViewerMarginTop}px`
              }"
            >
              <IIIFViewer
                class="bg-dark rounded-md shadow border"
                openseadragonCssClass="overflow-hidden rounded-md"
                :style="{ height: `${availableOffsetHeight - iiifViewerMarginTop * 2}px` }"
                v-if="article"
                :manifestUrls="
                  computedIIIFViewerOverlays.map((d: any) => {
                    return d.manifestUrls
                  })
                "
                :overlays="computedIIIFViewerOverlays"
                :fitBoundsToOverlayIdx="fitBoundsToOverlayIdx"
              />
            </div>
          </div>
          <div class="col-sm-6 col-xl-4">
            <div v-for="(page, pageIdx) in computedIIIFViewerOverlays" :key="pageIdx">
              <div
                class="IssueViewerText__region region py-3"
                v-for="(region, i) in page.regions"
                :key="region.idx"
                @click="() => annotatedTextClickHandler([pageIdx, i])"
              >
                <AnnotatedText
                  v-if="regionsAnnotationTree[region.idx]"
                  :children="regionsAnnotationTree[region.idx].children"
                  :cluster-colours="clusterColourMap"
                  :selected-cluster-id="selectedClusterId"
                  @clusterSelected="clusterSelectedHandler"
                  @passageClicked="passageSelectedHandler"
                  @passageMouseenter="mouseenterPassageHandler"
                  @passageMouseleave="mouseleavePassageHandler"
                />
                {{ [pageIdx, i] }}
                {{ page.id }}
              </div>
            </div>
          </div>
        </div>
        <!-- <b-row
          class="IssueViewerText__regions mt-1"
          v-for="(region, i) in computedRegions"
          v-bind:key="i"
        >
          <div v-if="article.isCC" class="col col-sm-5">
            <div class="py-3">
              <img
                v-bind:src="region.iiifFragment"
                alt="IIIF Region"
                :style="{ width: `${region.nw * 100}%` }"
              />
            </div>
          </div>
          <div class="col col-sm-7">
            {{ region }}
          </div>
        </b-row> -->
      </b-container>
    </div>
    <hr class="py-4" />
    <b-container fluid class="similar-items px-0">
      <h3>Similar Articles</h3>
      <i-spinner v-if="!articlesSuggestions.length" class="text-center p-5" />
      <b-row>
        <b-col
          cols="12"
          sm="12"
          md="12"
          lg="6"
          xl="4"
          v-for="(searchResult, index) in articlesSuggestions"
          v-bind:key="`${index}_ra`"
        >
          <search-results-similar-item
            :searchResult="searchResult"
            :topics="commonTopics(searchResult.topics)"
          />
        </b-col>
      </b-row>
    </b-container>
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
import {
  articlesSuggestions,
  articleTextReusePassages,
  textReusePassages as textReusePassagesService,
  articles as articlesService
} from '@/services'
import SearchResultsSimilarItem from './SearchResultsSimilarItem.vue'
import ArticleItem from './lists/ArticleItem.vue'
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
import TextReusePassage from '@/models/TextReusePassage'
import { type Overlay } from './IIIFViewer.vue'
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
      articlesSuggestions: [],
      textReusePassages: [],
      selectedPassageId: undefined,
      hoverPassageLineTopOffset: undefined,
      viewerTopOffset: 0,
      fitBoundsToOverlayIdx: [0, 0],
      availableOffsetHeight: 500,
      iiifViewerMarginTop: 20
    } as {
      article: any
      textReusePassages: any[]
      viewerTopOffset: number
      fitBoundsToOverlayIdx: [number, number]
      availableOffsetHeight: number
      iiifViewerMarginTop: number
    }
  },
  updated() {
    this.resize()
  },
  mounted() {
    this.viewerTopOffset = document.querySelector('#TheHeader').getBoundingClientRect().height
    window.addEventListener('resize', this.resize)
  },
  computed: {
    ...mapStores(useCollectionsStore),
    ...mapStores(useSelectionMonitorStore),
    articlePages() {
      if (!this.article.pages || !this.article.pages.length) {
        return this.$t('no_page_info')
      }
      if (this.article.pages.length === 1) {
        return this.$t('page', { num: this.article.pages[0]?.num })
      }
      return this.$t('pages', { nums: this.article.pages.map(d => d.num).join(', ') })
    },
    topics() {
      return this.article.topics.filter(rel => rel.topic)
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

      const overlays = this.article.pages
        .sort(d => d.pageUid)
        .map((page: any, j: number) => {
          return {
            id: page.uid,
            manifestUrls: page.iiif,
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
  props: ['article_uid'],
  components: {
    ArticleItem,
    SearchResultsSimilarItem,
    AnnotatedText,
    InfoButton,
    IIIFViewer
  },
  methods: {
    annotatedTextClickHandler(fitBoundsToOverlayIdx: [number, number]) {
      this.fitBoundsToOverlayIdx = fitBoundsToOverlayIdx
    },
    resize() {
      const { height } = document.querySelector('#TheHeader').getBoundingClientRect()
      if (this.$refs.root) {
        try {
          const availableOffsetHeight = this.$refs.root.parentNode?.offsetHeight
          console.debug('[IssueViewerText] @updated ', availableOffsetHeight)
          this.availableOffsetHeight = availableOffsetHeight
        } catch (e) {
          console.warn('[IssueViewerText] @updated parentNode not found', e)
        }
      }
      this.viewerTopOffset = height
    },
    commonTopics(suggestionTopics) {
      return this.topics.filter(a => suggestionTopics.some(b => a.topicUid === b.topicUid))
      // sort by master topics relevance
      // .sort((a, b) => b.relevance - a.relevance);
    },
    onRemoveCollection(collection, item) {
      const idx = item.collections.findIndex(c => c.uid === collection.uid)
      if (idx !== -1) {
        this.collectionsStore
          .removeCollectionItem({
            collection,
            item
          })
          .then(() => {
            item.collections.splice(idx, 1)
            this.$forceUpdate()
          })
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
        this.articlesSuggestions = []
        console.info('[IssueViewerText] @article_uid', articleUid)
        this.fitBoundsToOverlayIdx = [0, 0]
        const trPromise = this.textReuseEnabled
          ? articleTextReusePassages
              .find({ query: { id: articleUid } })
              .then(({ passages }) => passages)
          : Promise.resolve([])

        const [article, textReusePassages] = await Promise.all([
          articlesService.get(articleUid).then(d => new Article(d)),
          trPromise
        ])
        this.article = article
        this.textReusePassages = textReusePassages

        articlesSuggestions.get(articleUid).then(res => {
          this.articlesSuggestions = res.data
        })
      }
    }
  }
}
</script>

<style lang="scss">
@import 'src/assets/legacy/bootstrap-impresso-theme-variables.scss';

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
    "wrongLayout": "Note: Facsimile could not be retrieve for this specific article. To read it in its digitized version, switch to \"Facsimile view\"",
    "page": "pag. {num}",
    "pages": "pp. {nums}",
    "add_to_collection": "Add to Collection ...",
    "cluster_tooltip": "View all {size} articles containing this passage",
    "textReuseLabel": "No text reuse passages available| <b>1</b> text reuse passage available | <b>{n}</b> text reuse passages available"
  }
}
</i18n>
