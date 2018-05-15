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
        regions: {
          x: 547,
          y: 850,
          h: 448,
          w: 206,
        },
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
    // drawArticleOverlay(articleID) {
    //   const art = this.articles.find(x => x.uid === articleID);
    //   console.log(art.title);
    // }
    // clicky(clickToZoom) {
    //   this.viewer.gestureSettingsMouse.clickToZoom = clickToZoom;
    // },
    drawArticleOverlay() {
      this.viewer.addOnceHandler('open', () => {
        // console.log('OK ----');
        const self = this.viewer;
        const overlay = this.viewer.svgOverlay();

        const articles = d3.select(overlay.node()).append('g').classed('article', true);
        const article = articles.selectAll('rect').data(this.articles).enter().append('rect')
          .attr('fill', 'rgba(0,0,0,0)')
          .attr('stroke', 'black')
          .attr('stroke-width', '0.01px')
          .attr('opacity', '0.5');

        article
          .attr('x', d => this.getImageToViewportCoordinates(d.regions.x, 0).x)
          .attr('width', d => this.getImageToViewportCoordinates(d.regions.w, 0).x)
          .attr('y', d => this.getImageToViewportCoordinates(0, d.regions.y).y)
          .attr('height', d => this.getImageToViewportCoordinates(0, d.regions.h).y)
          .on('click', function mousedown() {
            d3.select(this)
              .attr('stroke', 'red');
          })
          .on('mouseover', function mouseover() {
            // d3.event.preventDefault();
            self.gestureSettingsMouse.clickToZoom = false;
            d3.select(this)
              .attr('opacity', '1');
          })
          .on('mouseout', function mouseout() {
            self.gestureSettingsMouse.clickToZoom = true;
            d3.select(this)
              .attr('opacity', '0.5');
          });

        // draw entity highlights
        const highlights = d3.select(overlay.node()).append('g').classed('highlights', true);
        const highlight = highlights.selectAll('rect').data(this.namedEntities).enter().append('rect')
          .attr('fill', 'rgba(255,220,0,0.5)')
          .attr('stroke-width', '0');

        highlight
          .attr('x', d => this.getImageToViewportCoordinates(d.boundingBox.x, 0).x)
          .attr('width', d => this.getImageToViewportCoordinates(d.boundingBox.w, 0).x)
          .attr('y', d => this.getImageToViewportCoordinates(0, d.boundingBox.y).y)
          .attr('height', d => this.getImageToViewportCoordinates(0, d.boundingBox.h).y)
          .on('click', function mousedown() {
            const id = d => d.id;
            console.log('clicked', id);
            d3.select(this)
              .transition()
              .ease(d3.easeSin)
              .duration(100)
              .attr('fill', 'red');
          })
          .on('mouseover', function mouseover() {
            // d3.event.preventDefault();
            self.gestureSettingsMouse.clickToZoom = false;
            d3.select(this)
              .transition()
              .ease(d3.easeSin)
              .duration(200)
              .attr('opacity', '1')
              .attr('stroke-width', '0.01px');
          })
          .on('mouseout', function mouseout() {
            self.gestureSettingsMouse.clickToZoom = true;
            d3.select(this)
              .transition()
              .ease(d3.easeSin)
              .duration(200)
              .attr('opacity', '0.5')
              .attr('stroke-width', '.004px');
          });
      });
    },
    getImageToViewportCoordinates(x, y) {
      // console.log(x, y);
      // console.log(this.viewer.viewport.imageToViewportCoordinates(x, y).x);
      // console.log(this.viewer.viewport.imageToViewportCoordinates(x, y).y);
      return this.viewer.viewport.imageToViewportCoordinates(x, y);
      // let i;
      // let tiledImage;
      // let count = viewer.world.getItemCount();
      // for (i = 0; i < count; i += 1) {
      //   tiledImage = viewer.world.getItemAt(i);
      //   tiledImage.setPosition(new OpenSeadragon.Point(i, 0));
      // }
    },
  },
  watch: {
    issue: {
      handler(val) {
        if (!this.viewer) {
          this.viewer = OpenSeadragon({
            // debugMode: true,
            sequenceMode: false,
            collectionRows: 1,
            id: 'os-viewer',
            showNavigator: false,
            showNavigationControl: false,
            showSequenceControl: false,
            initialPage: this.page_number,
            minZoomLevel: 0.3,
            defaultZoomLevel: 0.5,
            tileSources: val.pages.map(elm => elm.iiif),
          });
        }

        this.drawArticleOverlay('GDL-1860-01-24-a-0001-4961839');
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
  mounted() {},
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
.highlights rect {
    fill: green;
}
</style>
