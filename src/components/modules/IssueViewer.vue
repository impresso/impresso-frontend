<template lang="html">
  <div id="issue-viewer">
    <div class="strip">
      <thumbnail-slider v-model="activePage" v-bind:pages="issue.pages" v-bind:viewer="viewer"></thumbnail-slider>
    </div>
    <div id="os-viewer"></div>
  </div>
</template>

<script>
import OpenSeadragon from 'openseadragon';

import ThumbnailSlider from '../modules/ThumbnailSlider';

export default {
  model: {
    prop: 'issue',
  },
  props: {
    issue: {
      default: null,
    },
    activePage: {
      default: 0,
    },
    articles: [
      {
        labels: [
          'article',
        ],
        regions: [
          [10, 10, 50, 50],
        ],
        date: '1859-01-01',
        uid: 'GDL-1860-01-24-a-0001-4961839',
        title: 'Article Title',
      },
    ],
  },
  data: () => ({
    viewer: false,
  }),
  watch: {
    issue: {
      handler(val) {
        this.viewer = OpenSeadragon({
          // debugMode: true,
          sequenceMode: true,
          collectionRows: 1,
          id: 'os-viewer',
          showNavigator: false,
          showNavigationControl: false,
          showSequenceControl: false,
          initialPage: this.activePage,
          minZoomLevel: 0.3,
          defaultZoomLevel: 0,
          tileSources: val.pages.map(elm => elm.iiif),
        });
      },
    },
    activePage: {
      handler(page) {
        this.viewer.goToPage(page);
      },
    },
  },
  methods: {
    drawArticleOverlay(articleID) {
      console.log(this.articles, articleID);
    },
  },
  mounted() {
    this.drawArticleOverlay('GDL-1860-01-24-a-0001-4961839');
  },
  components: {
    ThumbnailSlider,
  },
};
</script>

<style scoped lang="less">
#issue-viewer {
    width: 100%;
    height: 100%;
    position: relative;
}

#os-viewer {
    position: absolute;
    height: 100%;
    right: 0;
    left: 140px;
}

.strip {
    position: absolute;
    right: 0;
    left: 0;
    width: 140px;
    height: 100%;
}
</style>
