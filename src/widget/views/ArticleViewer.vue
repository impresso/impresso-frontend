<template>
  <div :style="getBackgroundStyle">
    <div class="image">
      <open-seadragon-viewer :style="getOverlayStyle" v-bind:handler="handler" />
    </div>
  </div>
</template>

<script>
import mitt from 'mitt'
import { articles } from '@/services'
import Article from '@/models/Article'
import { validateOrIgnore } from '../logic/props'
import OpenSeadragonViewer from '@/components/modules/OpenSeadragonViewer'

export default {
  data: () => ({
    imageURL: null,
    article: null,
    handler: mitt(),
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
    console.info('[ArticleViewer] mounted:', this.$route.params, this.$route.query)
    if (this.articleUid) {
      articles.get(this.articleUid).then(res => {
        this.article = new Article(res)
        this.initViewer()
      })
    }
    // ({ iiif, accessRights }) => {
    //   this.imageURL = `${iiif}/${this.coords}/full/0/default.jpg`;
    //   console.info('accessRights', accessRights, this.imageURL);
    // });
  },
  computed: {
    articleUid() {
      const { articleUid } = this.$route.params
      // GAZ-1843-03-08-a-i0007
      if (!/^[A-Za-z\d]+-\d{4}-\d{2}-\d{2}-[a-z]-i\d{4}$/.test(articleUid)) {
        console.error('articleUid() not valid:', articleUid)
        return null
      }
      return articleUid
    },
    pageUid() {
      const { pageUid } = this.$route.params
      // GAZ-1843-03-08-a-p0003
      if (!/^[A-Za-z\d]+-\d{4}-\d{2}-\d{2}-[a-z]-p\d{4}$/.test(pageUid)) {
        console.warn('pageUid() not valid:', pageUid, 'returning index.')
        return null
      }
      return pageUid
    },
    getBackgroundStyle() {
      return {
        backgroundColor: validateOrIgnore('backgroundColor', this.backgroundColor),
      }
    },
    getOverlayStyle() {
      return {
        '--overlay-color': validateOrIgnore('overlayBackgroundColor', this.overlayBackgroundColor),
      }
    },
  },
  methods: {
    hasValidCoords() {
      return /^[0-9]+,[0-9]+,[0-9]+,[0-9]+$/.test(this.coords)
    },
    drawHighlightRectangle(viewer, coords) {
      const overlay = window.document.createElement('div')
      overlay.setAttribute('class', 'overlay-region')
      Object.keys(this.getOverlayStyle).forEach(cssProp => {
        overlay[cssProp] = this.getOverlayStyle[cssProp]
      })
      const rect = viewer.viewport.imageToViewportRectangle(...coords)
      viewer.addOverlay(overlay, rect)
    },
    fitBounds(viewer, coords) {
      const margin = isNaN(this.coordsMargin) ? 10 : parseInt(this.coordsMargin, 10)
      const rect = viewer.viewport.imageToViewportRectangle(
        ...[coords[0] - margin, coords[1] - margin, coords[2] + margin * 2, coords[3] + margin * 2],
      )
      viewer.viewport.fitBoundsWithConstraints(rect)
    },
    initViewer() {
      const self = this
      this.isOSVieverLoaded = false
      this.handler.emit('destroy')
      this.handler.emit('init', {
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
      })

      this.handler.emit('dispatch', viewer => {
        viewer.addHandler('tile-loaded', () => {
          if (self.isOSVieverLoaded) {
            return
          }
          console.info(
            'OSViewer @tile-loaded, n. regions:',
            self.article.regions.length,
            'style:',
            self.getOverlayStyle,
            self.coords,
          )
          self.isOSVieverLoaded = true

          if (self.hasValidCoords()) {
            const coords = self.coords.split(',').map(v => parseInt(v, 10))
            self.drawHighlightRectangle(viewer, coords)
            self.fitBounds(viewer, coords)

            return
          }

          self.article.regions.forEach(region => {
            // create one overlay per region
            const overlay = window.document.createElement('div')
            overlay.setAttribute('class', 'overlay-region')
            // self.getOverlayStyle
            Object.keys(self.getOverlayStyle).forEach(cssProp => {
              overlay[cssProp] = self.getOverlayStyle[cssProp]
            })
            const rect = viewer.viewport.imageToViewportRectangle(
              region.coords.x,
              region.coords.y,
              region.coords.w,
              region.coords.h,
            )
            viewer.addOverlay(overlay, rect)
            console.info('overlay-region', region.coords)
          })
        })
      })
    },
  },
}
</script>
<style lang="scss">
@import 'src/assets/legacy/bootstrap-impresso-theme-variables.scss';

div.overlay-region {
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
