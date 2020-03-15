<template lang="html">
  <div :style="getBackgroundStyle">
    <div class="image">
      <open-seadragon-viewer :style="getOverlayStyle"
        v-bind:handler="handler" />
    </div>
    <div class="caption">
      <div class="p-3" v-if="article">
        <h1 class="mb-2">{{ article.title }}</h1>
        {{ article.newspaper.name }} - {{ article.date }}
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { articles } from '@/services';
import Article from '@/models/Article';
import { validateOrIgnore } from '../logic/props';
import OpenSeadragonViewer from '@/components/modules/OpenSeadragonViewer';

export default {
  data: () => ({
    imageURL: null,
    article: null,
    handler: new Vue(),
    isOSVieverLoaded: false,
  }),
  props: {
    backgroundSize: String,
    backgroundColor: String,
    cssFilter: String,
    overlayBackgroundColor: String,
    coordsMargin: String,
    coords: String,
  },
  components: {
    OpenSeadragonViewer,
  },
  mounted() {
    if (this.articleUid) {
      articles.get(this.articleUid).then((res) => {
        this.article = new Article(res);
        this.initViewer();
      });
    }
    // ({ iiif, accessRights }) => {
    //   this.imageURL = `${iiif}/${this.coords}/full/0/default.jpg`;
    //   console.info('accessRights', accessRights, this.imageURL);
    // });
  },
  computed: {
    articleUid() {
      const { articleUid } = this.$route.params;
      // GAZ-1843-03-08-a-i0007
      if (!/^[A-Za-z]+-\d{4}-\d{2}-\d{2}-[a-z]-i\d{4}$/.test(articleUid)) {
        console.error('articleUid() not valid:', articleUid);
        return null;
      }
      return articleUid;
    },
    pageUid() {
      const { pageUid } = this.$route.params;
      // GAZ-1843-03-08-a-p0003
      if (!/^[A-Za-z]+-\d{4}-\d{2}-\d{2}-[a-z]-p\d{4}$/.test(pageUid)) {
        console.warn('pageUid() not valid:', pageUid, 'returning index.');
        return null;
      }
      return pageUid;
    },
    getBackgroundStyle() {
      return {
        backgroundColor: validateOrIgnore(
          'backgroundColor',
          this.backgroundColor,
        ),
      };
    },
    getOverlayStyle() {
      return {
        '--overlay-color': validateOrIgnore(
          'overlayBackgroundColor',
          this.overlayBackgroundColor,
        ),
      };
    },
  },
  methods: {
    initViewer() {
      const self = this;
      this.isOSVieverLoaded = false;
      this.handler.$emit('destroy');
      this.handler.$emit('init', {
        sequenceMode: true,
        showSequenceControl: false,
        initialPage: 0,
        tileSources: this.article.pages.map(d => d.iiif),
        defaultZoomLevel: 1,
        // showNavigator: true,
        minZoomImageRatio: 0.5,
        gestureSettingsMouse: {
          clickToZoom: false,
          dblClickToZoom: true,
        },
        visibilityRatio: 0.5,
      });

      this.handler.$emit('dispatch', (viewer) => {
        viewer.addHandler('tile-loaded', () => {
          if (self.isOSVieverLoaded) {
            return;
          }
          console.info('OSViewer @tile-loaded, n. regions:', self.article.regions.length, 'style:', self.getOverlayStyle);
          self.isOSVieverLoaded = true;

          self.article.regions.forEach((region) => {
            // create one overlay per region
            const overlay = window.document.createElement('div');
            overlay.setAttribute('class', 'overlay-region');
            // self.getOverlayStyle
            Object.keys(self.getOverlayStyle).forEach((cssProp) => {
              overlay[cssProp] = self.getOverlayStyle[cssProp];
            })
            const rect = viewer.viewport.imageToViewportRectangle(
              region.coords.x,
              region.coords.y,
              region.coords.w,
              region.coords.h);
            viewer.addOverlay(overlay, rect);
            console.info('overlay-region', region.coords);
          });

          const coords = validateOrIgnore(
            'coords',
            self.coords,
            false,
          );

          if (coords) {
            const margin = parseInt(validateOrIgnore(
              'coordsMargin',
              self.coordsMargin,
            ), 10);
            setTimeout(function() {
              const args = coords.split(',').map((v, k) => {
                const v0 = parseInt(v, 10);
                return k > 1 ? v0 + (margin * 2) : v0 - margin;
              });
              // args[0] = args[0] - margin;
              // args[1] = args[1] - margin;
              // args[2] = args[2] + (margin * 2);
              // args[3] = args[3] + (margin * 2);
              viewer.viewport.fitBounds(viewer.viewport.imageToViewportRectangle(
                // 75,203,1291,626
                ... args,
                // ...coords.split(','), // -45,163,1351,666
              ));
            }, 0);
          }
        });
      });
    }
  }
};
</script>
<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";
.image{
  background: #dbdbdb;
}
div.overlay-region{
  // background-color: $clr-accent-secondary;
  background-color: var(--overlay-color);
  // transparentize($clr-accent-secondary, 0.2);
  cursor: pointer;

  &.selected {
    background-color: transparentize($clr-accent-secondary, 0.8);
  }
  &.active {
    background-color: transparentize($clr-accent-secondary, 0.5);
    cursor: inherit;
  }
}
@supports (mix-blend-mode: multiply) {
  div.overlay-region {
    mix-blend-mode: multiply;
  }
}
</style>
