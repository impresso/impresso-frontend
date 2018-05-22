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
    <div id="os-viewer">
    </div>

  </div>
</template>

<script>
// import * as d3 from 'd3';
import OpenSeadragon from 'openseadragon';
import ViewerOverlay from '../../d3-modules/ViewerOverlay';
import * as services from '../../services';
import ThumbnailSlider from '../modules/ThumbnailSlider';

// require('svg-overlay');

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
    overlay: null,
    pagedata: {},
  }),
  methods: {
    init() {
      this.overlay = new ViewerOverlay({
        container: '#overlay-left',
      });

      if (!this.viewer) {
        this.viewer = OpenSeadragon({
          // debugMode: true,
          sequenceMode: false,
          id: 'os-viewer',
          showNavigationControl: false,
          showSequenceControl: false,
          initialPage: this.page_number,
          minZoomLevel: 0.3,
          defaultZoomLevel: 0.5,
          tileSources: this.issue.pages.map(elm => elm.iiif),
          overlays: [
            {
              px: 0,
              py: 0,
              id: 'overlay-left',
              class: 'overlay',
            },
          ],
        });

        // console.log(this.viewer.viewport.getBounds());
      }
    },
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
    // drawArticleOverlay() {
    // this.viewer.addOnceHandler('open', () => {
    //   // console.log('OK ----');
    //   const self = this.viewer;
    //   const overlay = this.viewer.svgOverlay();
    //
    //   const articles = d3.select(overlay.node()).append('g').classed('article', true);
    //   const article = articles.selectAll('rect').data(this.articles).enter().append('rect')
    //     .attr('fill', 'rgba(0,0,0,0)')
    //     .attr('stroke', 'black')
    //     .attr('stroke-width', '0.01px')
    //     .attr('opacity', '0.5');
    //
    //   article
    //     .attr('x', d => this.getImageToViewportCoordinates
    // (d.regions.x, 0).x)
    //     .attr('width', d => this.getImageToViewportCoordinates
    // (d.regions.w, 0).x)
    //     .attr('y', d => this.getImageToViewportCoordinates(0, d.regions.y).y)
    //     .attr('height', d => this.getImageToViewportCoordinates(0, d.regions.h).y)
    //     .on('click', function mousedown() {
    //       d3.select(this)
    //         .attr('stroke', 'red');
    //     })
    //     .on('mouseover', function mouseover() {
    //       // d3.event.preventDefault();
    //       self.gestureSettingsMouse.clickToZoom = false;
    //       d3.select(this)
    //         .attr('opacity', '1');
    //     })
    //     .on('mouseout', function mouseout() {
    //       self.gestureSettingsMouse.clickToZoom = true;
    //       d3.select(this)
    //         .attr('opacity', '0.5');
    //     });
    //
    //   // draw entity highlights
    //   const highlights = d3.select(overlay.node()).append('g').classed('highlights', true);
    //   const highlight = highlights.selectAll('rect').data(this.namedEntities).enter()
    // .append('rect')
    //     .attr('fill', 'rgba(255,220,0,0.5)')
    //     .attr('stroke-width', '0');
    //
    //   highlight
    //     .attr('x', d => this.getImageToViewportCoordinates(d.boundingBox.x, 0).x)
    //     .attr('width', d => this.getImageToViewportCoordinates(d.boundingBox.w, 0).x)
    //     .attr('y', d => this.getImageToViewportCoordinates(0, d.boundingBox.y).y)
    //     .attr('height', d => this.getImageToViewportCoordinates(0, d.boundingBox.h).y)
    //     .on('click', function mousedown() {
    //       const id = d => d.id;
    //       console.log('clicked', id);
    //       d3.select(this)
    //         .transition()
    //         .ease(d3.easeSin)
    //         .duration(100)
    //         .attr('fill', 'red');
    //     })
    //     .on('mouseover', function mouseover() {
    //       // d3.event.preventDefault();
    //       self.gestureSettingsMouse.clickToZoom = false;
    //       d3.select(this)
    //         .transition()
    //         .ease(d3.easeSin)
    //         .duration(200)
    //         .attr('opacity', '1')
    //         .attr('stroke-width', '0.01px');
    //     })
    //     .on('mouseout', function mouseout() {
    //       self.gestureSettingsMouse.clickToZoom = true;
    //       d3.select(this)
    //         .transition()
    //         .ease(d3.easeSin)
    //         .duration(200)
    //         .attr('opacity', '0.5')
    //         .attr('stroke-width', '.004px');
    //     });
    // });
    // },
    // getImageToViewportCoordinates(x, y) {
    // console.log(x, y);
    // console.log(this.viewer.viewport.imageToViewportCoordinates(x, y).x);
    // console.log(this.viewer.viewport.imageToViewportCoordinates(x, y).y);
    // return this.viewer.viewport.imageToViewportCoordinates(x, y);
    // let i;
    // let tiledImage;
    // let count = viewer.world.getItemCount();
    // for (i = 0; i < count; i += 1) {
    //   tiledImage = viewer.world.getItemAt(i);
    //   tiledImage.setPosition(new OpenSeadragon.Point(i, 0));
    // }
    // },
    getPageData() {
      services.pages.get(this.issue.pages[this.page_number].uid, {}).then((res) => {
        this.pagedata = res;
        console.log(res);
        this.viewer.addOnceHandler('open', () => {
          this.overlay.update(res);
        });
        // const MouseTracker = new OpenSeadragon.MouseTracker({
        //   element: 'html-overlay',
        //   clickHandler: (event) => {
        //     const target = event.originalEvent.target;
        //     if (target.matches('a')) {
        //       if (target.getAttribute('target') === '_blank') {
        //         window.open(target.getAttribute('href'));
        //       } else {
        //         location.href = target.getAttribute('href');
        //       }
        //     }
        //   },
        // });
        // this.viewer.addOnceHandler('open', () => {
        //   document.getElementById('html-overlay').innerHTML =
        // '<ol><li>html data hfkdshfdkfhdjkf dsfd fhks</li></ol>';
        //
        //   const IMAGE_RULER_HIGHLIGHT = 'image-ruler';
        //
        //   const IMAGE_RULER_DEFAULT_POSITION = new OpenSeadragon.Point(0, 0);
        //
        //   this.viewer.addOverlay(IMAGE_RULER_HIGHLIGHT, IMAGE_RULER_DEFAULT_POSITION,
        //     OpenSeadragon.Placement.RIGHT);
        // });
        // this.viewer.addOnceHandler('open', () => {
        //   document.getElementById('overlay_left').innerHTML = 'html data';
        //   document.getElementById('overlay_right').innerHTML = '<ol><li>html data</li><li><a href="https://google.lu">Link</a></li></ol>';
        // });
      });
    },
  },
  watch: {
    issue: {
      handler() {
        this.init();
        this.getPageData();
        // this.drawArticleOverlay('GDL-1860-01-24-a-0001-4961839');
      },
    },
    page_number: {
      handler(page) {
        if (this.viewer) {
          this.viewer.goToPage(page);
          this.getPageData();
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

<style lang="less">
@import "./../../assets/less/style.less";

#issue-viewer {
    display: flex;
    height: 100%;
    background: @clr-grey-200;

    .strip {
        width: 140px;
        height: 100%;
        position: relative;
    }

}

#os-viewer {
    flex: 1;
    height: 100%;
    .openseadragon-canvas {
        outline: none;
    }
    #overlay-left {
        // outline: 1px solid red;
        color: gray;
        text-align: right;
        width: 200px;
        margin-left: -200px;
        text-decoration: none;

        .entity {

            border-right: 5px solid transparent;
            padding-top: 5px;
            padding-bottom: 5px;
            padding-right: 10px;
            &:hover {
                border-color: teal;
            }
        }
        h3 {
            padding-right: 15px;
            border-bottom: 1px solid lightgray;
            padding-bottom: 0.5rem;
            font-style: italic;
            font-size: 100%;
        }
        .entity-title {
            font-weight: bold;
        }
        .entity-description {}
    }

    #overlay-right {
        background-color: green;
        color: white;
        width: 200px;
        min-height: 100px;
    }
    .highlights rect {
        fill: green;
    }

    #image-ruler {
        background-color: red;
        color: white;
        width: 50px;
        height: 500px;
    }

}
</style>
