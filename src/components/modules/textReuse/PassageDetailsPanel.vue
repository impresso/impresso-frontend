<template>
  <div class="d-flex flex-column passage-details-panel">
    <!-- image and text -->
    <div class="d-flex flex-row">
      <div class="image flex-shrink-1 d-flex">
  <div class="d-flex flex-row flex-shrink-1 image-placeholder">
    <lazy-open-seadragon-article-page-viewer
      :viewerOptions="pageViewerOptions"
      :overlays="pageViewerOverlays">
    </lazy-open-seadragon-article-page-viewer>
  </div>
      </div>
      <div class="content pl-4">
  <!-- title and meta -->
  <div class="d-flex flex-column">
    <h2>
      <router-link :to="articleLink">
        {{ passage.title }}
      </router-link>
    </h2>
    <!-- TODO: extract this and same code in ArticleItem into a separate component -->
    <div class="article-meta">
      <router-link :to="{ name: 'newspaper', params: { newspaper_uid: newspaper.uid }}" class="article-newspaper">
        {{ newspaper.name }}
      </router-link>
      <item-selector :uid="newspaper.uid" :item="newspaper" type="newspaper"/> &nbsp;
      <span class="date">{{ $d(new Date(passage.date), "long") }}</span>
      <span>{{ pages }}</span>
    </div>
  </div>
  <!-- text -->
  <div>
    {{passage.content}}
  </div>
      </div>
    </div>
  </div>
</template>


<script>
import ItemSelector from '../ItemSelector.vue';
import { getShortArticleId } from '@/logic/ids'
import LazyOpenSeadragonArticlePageViewer from '../vis/LazyOpenSeadragonArticlePageViewer.vue'

const RegionOverlayClass = 'overlay-region selected'

export default {
  props: {
    passage: {
      type: Object,
      required: true
    },
    newspaper: {
      type: Object
    },
    iiifUrl: {
      type: String
    }
  },
  components: {
    ItemSelector,
    LazyOpenSeadragonArticlePageViewer
  },
  computed: {
    articleLink() {
      const { articleId, pageNumbers } = this.passage
      const issueid = articleId.match(/(^.+)-i/)[1]
      const pageNum = pageNumbers[0]
      return {
        name: 'issue-viewer',
        params: {
          issue_uid: issueid,
        },
        query: {
          articleId: getShortArticleId(articleId),
          p: pageNum,
        }
      }
    },
    pages() {
      return this.$tc(
        'pp',
        this.passage.pageNumbers.length,
        { pages: this.passage.pageNumbers.join(',') }
      );
    },
    pageViewerOptions() {
      return {
        tileSources: [this.iiifUrl],
        showNavigator: true,
        navigatorAutoFade: false,
        navigatorBackground: '#f8f9fa',
        navigatorBottom: 0,
        navigatorRight: 0,
        navigatorSizeRatio: 0.25,
        navigatorDisplayRegionColor: 'black',
        navigatorBorderColor: '#dee2e6',
        navigatorOpacity: 1,
      }
    },
    pageViewerOverlays() {
      return this.passage.pageRegions
        .map(([x, y, w, h]) => {
          return { x, y, w, h, class: RegionOverlayClass }
        })
    }
  }
}
</script>

<style lang="scss" scoped>
  // .content {
    // flex-basis: 60%;
  // }
  .image {
    // flex-basis: 40%;

    .image-placeholder {
      width: 215px;
      height: 240px;
    }
  }
</style>
