<template lang="html">
  <div id="os-viewer"></div>
</template>

<script>
import OpenSeadragon from 'openseadragon';
import ViewerOverlay from '@/d3-modules/ViewerOverlay';
import Page from '@/models/Page';
import Issue from '@/models/Issue';

export default {
  model: {
    prop: 'viewer',
  },
  props: {
    issue: {
      default: new Issue(),
    },
    minZoomLevel: {
      default: 0.25,
    },
    maxZoomLevel: {
      default: 5,
    },
    zoomLevel: {
      default: 0.5,
    },
    page: {
      default: new Page(),
    },
    viewer: false,
  },
  data: () => ({
    overlay: null,
  }),
  methods: {
    init() {
      if (!this.viewer) {
        const viewer = OpenSeadragon({
          // debugMode: true,
          sequenceMode: true,
          id: 'os-viewer',
          showNavigationControl: false,
          showSequenceControl: false,
          initialPage: 0,
          minZoomLevel: this.minZoomLevel,
          maxZoomLevel: this.maxZoomLevel,
          defaultZoomLevel: this.zoomLevel,
          tileSources: this.issue.pages.map(elm => elm.iiif),
          animationTime: 0,
          gestureSettingsMouse: {
            clickToZoom: false,
            dblClickToZoom: true,
          },
          visibilityRatio: 0.1,
        });

        this.overlay = new ViewerOverlay(viewer);

        viewer.addHandler('zoom', (event) => {
          this.overlay.updateZoomLevel(event.zoom);
          this.$emit('zoom', event.zoom);
        });

        this.$emit('input', viewer);
      }
    },
  },
  watch: {
    issue: {
      handler() {
        this.init();
      },
    },
    page: {
      handler(val) {
        if (this.viewer) {
          this.viewer.goToPage(this.issue.pages.indexOf(val));
          this.overlay.update(val);
        }
      },
    },
  },
};
</script>

<style lang="less">

#os-viewer {
  height: 100%;

    .openseadragon-canvas {
        outline: none;
    }

    #overlay-left,
    #overlay-right {
        color: #757575;
        text-decoration: none;
        padding-top: 15px;
        & > div:first-child {
            &.loading {
                opacity: 0;
            }

            &.loaded {
                opacity: 1;
                transition: opacity 250ms;
                transition-delay: 250ms;
            }
        }
    }

    #overlay-left {
        font-size: 3em;
        text-align: right;
        .entity {
            border-right: 5px solid transparent;
            padding-top: 5px;
            padding-bottom: 5px;
            padding-right: 50px;
            &:hover {
                border-color: teal;
            }

            .title {
                font-weight: bold;
            }
        }

        h3 {
            font-weight: bold;
            border-bottom: 1px solid lightgray;
            padding-bottom: 0.5rem;
            padding-right: 50px;
            font-style: italic;
            font-size: 1.3em;
        }
    }

    #overlay-right {
        font-size: 0.8em;
        text-align: left;
        text-decoration: none;

        .entity {
            border-left: 5px solid transparent;
            padding-top: 5px;
            padding-bottom: 5px;
            padding-left: 10px;
            &:hover {
                border-color: teal;
            }
            .title {
                font-weight: bold;
            }
        }
        h3 {
            border-bottom: 1px solid lightgray;
            padding-bottom: 0.5rem;
            padding-left: 10px;
            font-style: italic;
            font-size: 1em;
        }
    }

    .articleOverlay {
        position: relative;
        cursor: pointer;
        .region {
            position: absolute;
            border: 1px solid rgb(255, 225, 49);
            mix-blend-mode: multiply;
            transition: 200ms;
        }
        &.highlight {
          .region {
              background: rgba(255, 225, 49, 0.3);
              border-width: 0.2em;
          }
        }
        &.active {
          .region {
            background: rgba(49, 225, 255, 0.3);
            border-color: rgb(49, 225, 255);
            border-width: 0.2em;
          }
        }
    }
}
</style>
