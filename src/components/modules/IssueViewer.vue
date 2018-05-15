<template lang="html">
  <div id="issue-viewer">
    <div class="strip">
      <thumbnail-slider
      v-model="issue"
      v-bind:viewer="viewer"
      v-bind:page_number="page_number"
      v-on:click="goToPage"
      ></thumbnail-slider>
    </div>
    <div id="os-viewer"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import OpenSeadragon from 'openseadragon';
import ThumbnailSlider from '../modules/ThumbnailSlider';

require('svg-overlay');

export default {
  model: {
    prop: 'issue',
  },
  props: {
    issue: {
      default: false,
    },
    page_number: {
      default: 0,
    },
  },
  data: () => ({
    viewer: false,
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
    namedEntities: [
      {
        id: 'a0',
        imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/304px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg',
        boundingBox: {
          x: 147,
          y: 1850,
          h: 48,
          w: 106,
        },
      },
      {
        id: 'a1',
        imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Franz_Liszt_by_Nadar%2C_March_1886.png/297px-Franz_Liszt_by_Nadar%2C_March_1886.png',
        boundingBox: {
          x: 372,
          y: 2010,
          h: 48,
          w: 194,
        },
      },
    ],
  }),
  methods: {
    goToPage(page) {
      this.$emit('click', page);
    },
  },
  watch: {
    issue: {
      handler(val) {
        if (!this.viewer) {
          this.viewer = OpenSeadragon({
            // debugMode: true,
            sequenceMode: true,
            collectionRows: 1,
            id: 'os-viewer',
            showNavigator: false,
            showNavigationControl: false,
            showSequenceControl: false,
            initialPage: this.page_number,
            minZoomLevel: 0.3,
            defaultZoomLevel: 0,
            tileSources: val.pages.map(elm => elm.iiif),
          });
        }
      },
    },
    page_number: {
      handler(page) {
        if (this.viewer) {
          this.viewer.goToPage(page);
        }
      },
    },
  },
  methods: {
    drawArticleOverlay(articleID) {
      const art = this.articles.find(x => x.uid === articleID);
      console.log(art.title);
    },
  },
  mounted() {
    const overlay = this.viewer.svgOverlay();
    const highlights = d3.select(overlay.node()).append('g').classed('highlights', true);
    const highlight = highlights.selectAll('rect').data(this.namedEntities).enter().append('rect')
      .attr('fill', 'rgba(255,220,0,0.5)')
      .attr('stroke', 'red')
      .attr('stroke-width', '.001px');

    // draw entity highlights
    highlight
      .attr('x', d => this.getImageToViewportCoordinates(d.boundingBox.x, 0).x)
      .attr('width', d => this.getImageToViewportCoordinates(d.boundingBox.w, 0).x)
      .attr('y', d => this.getImageToViewportCoordinates(0, d.boundingBox.y).y)
      .attr('height', d => this.getImageToViewportCoordinates(0, d.boundingBox.h).y);

    // const highlights = d3.select(overlay.node()).append('g').classed('highlights', true);
    const d3Rect = d3.select(overlay.node()).append('rect')
      .style('fill', '#f00')
      .attr('x', 0.5)
      .attr('width', 0.25)
      .attr('y', 0.5)
      .attr('height', 0.25);

    overlay.onClick(d3Rect.node(), () => {
      console.log('click');
    });

    this.drawArticleOverlay('GDL-1860-01-24-a-0001-4961839');
  },
  components: {
    ThumbnailSlider,
  },
};
</script>

<style scoped lang="less">
@import "./../../assets/less/style.less";

#issue-viewer {
    display: flex;
    height: 100%;
    background: @clr-grey-200;
}

#os-viewer {
    flex: 1;
    height: 100%;
}

.strip {
    width: 140px;
    height: 100%;
    position: relative;
}
<<<<<<< HEAD .highlights rect {
    fill: green;
}
======= >>>>>>> f65929f40f3b4c10377167ee4c3e5cc09a419523
</style>
