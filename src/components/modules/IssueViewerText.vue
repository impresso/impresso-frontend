<template>
  <div id="IssueViewerText" class="px-3 bg-light w-100">
    <i-spinner v-if="!article" class="text-center p-5" />
    <div v-if="article">
      <article-item :item="article" show-entities show-topics />
      <div class="my-2" />
      <!-- <collection-add-to :item="article" :text="$t('add_to_collection')" /> -->
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
      <b-container fluid v-else class="region-row mt-3 mb-3 position-relative">
        <p class="small d-flex align-items-center m-0">
          <div
            v-html="
              $tc('textReuseLabel', textReusePassages.length, {
                n: textReusePassages.length
              })
            "
          />
          <info-button class="ml-2" name="text-reuse" />
        </p>
        <!-- computed regions -->
        <b-row
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
          <div class="col" :class="{ 'col-sm-7': article.isCC, 'col-sm-12': !article.isCC }">
            <div class="region py-3">
              <AnnotatedText
                v-if="regionsAnnotationTree[i]"
                :children="regionsAnnotationTree[i].children"
                :cluster-colours="clusterColourMap"
                :selected-cluster-id="selectedClusterId"
                @onClusterSelected="clusterSelectedHandler"
              />
            </div>
          </div>
        </b-row>
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

<script>
import { mapStores } from 'pinia'
import { articlesSuggestions, articleTextReusePassages, textReusePassages as textReusePassagesService, articles as articlesService } from '@/services'
import SearchResultsSimilarItem from './SearchResultsSimilarItem.vue'
import ArticleItem from './lists/ArticleItem.vue'
import AnnotatedText from './AnnotatedText.vue'
import InfoButton from '@/components/base/InfoButton.vue'

import Article from '@/models/Article'
import { useCollectionsStore } from '@/stores/collections'
import { useSelectionMonitorStore } from '@/stores/selectionMonitor'

import {
  getNamedEntitiesFromArticleResponse,
  getAnnotateTextTree,
  passageToPassageEntity
} from '@/logic/articleAnnotations'


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
      viewerTopOffset: 0
    }
  },
  updated() {
    const { height } = document.querySelector('#TheHeader').getBoundingClientRect()
    this.viewerTopOffset = height

    document.querySelectorAll('.tr-passage').forEach(element => {
      element.removeEventListener('mouseenter', this.mouseenterPassageHandler)
      element.addEventListener('mouseenter', this.mouseenterPassageHandler)
      element.removeEventListener('mouseleave', this.mouseleavePassageHandler)
      element.addEventListener('mouseleave', this.mouseleavePassageHandler)
    })
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
    // this wuld ensure to have a max width of 100% for the largest region and smaller fr the ther ones
    computedRegions() {
      if (!this.hasValidRegions) return []
      const regions = this.article.regions
      const maxRegionWidth = Math.max(...regions.map(({ coords }) => coords.w))

      return regions.map(r => ({
        ...r,
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
      return this.$route.query.trClusterId
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
    InfoButton
  },
  methods: {
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
    mouseenterPassageHandler(e) {
      const { id } = e.target.dataset
      const peerElements = [...document.querySelectorAll(`.tr-passage[data-id="${id}"]`)]
      const siblingElements = [...document.querySelectorAll(`.tr-passage`)]

      siblingElements.map(element => {
        element.classList.remove('active')
        element.removeEventListener('click', this.passageClickHandler)
      })
      peerElements.map(element => element.classList.add('active'))

      e.target.addEventListener('click', this.passageClickHandler)

      this.selectedPassageId = id
      this.hoverPassageLineTopOffset = e.pageY
    },
    mouseleavePassageHandler(e) {
      const { id } = e.target.dataset
      const peerElements = [...document.querySelectorAll(`.tr-passage[data-id="${id}"]`)]

      peerElements.map(element => element.classList.remove('active'))

      e.target.removeEventListener('click', this.passageClickHandler)

      this.selectedPassageId = null
    },
    passageClickHandler() {
      this.$router.push({
        name: 'text-reuse-clusters',
        query: {
          q: `#${this.selectedClusterId}`
        }
      })
    },
    async clusterSelectedHandler(trClusterId, trPseudoPassageItem) {
      console.info('@clusterSelectedHandler', trClusterId, trPseudoPassageItem)
      const items = await textReusePassagesService.find({
        query: {
          limit: 1,
          filters: [{ type: 'id', q: trPseudoPassageItem.id }],
          addons: { newspaper: 'text' }
        }
      }).then(res => {
        console.debug('passages', res)
        return res.data
      })
      if(!items.length) {
        console.warn('No items found for cluster', trClusterId, 'and id', trPseudoPassageItem.id)
        return
      }
      
      this.selectionMonitorStore.show({
        type: 'textReusePassage',
        item: {
          ...items[0],
          // fix temporary issue on text reuse passage result, sometimes title is NaN...
          title: this.article.title
        },
        context: 'textReuse',
        scope: 'comparePassages',
        applyCurrentSearchFilters: false,
        displayTimeline: false,
        displayActionButtons: false,
        displayCurrentSearchFilters: false
      })
    }
  },
  watch: {
    article_uid: {
      immediate: true,
      async handler(articleUid) {
        this.articlesSuggestions = []

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
    position: absolute;
    right: 0;
    max-width: 100%;
    pointer-events: none;
  }

  .tr-passage {
    opacity: 0.8;
    transition: opacity 0.2s ease;
    cursor: pointer;

    &.active {
      opacity: 1;
    }
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
