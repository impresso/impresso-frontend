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
      <div class="header">
        <div class="page-tags">
          Page Tags
        </div>
        <div class="articleMeta">
          <div class="title">
            LOCAL
          </div>
          <div class="description">
            chronique locale
          </div>
        </div>
          <div class="pagination">
            <a v-on:click="goToPage(page_number - 1)" href="#" class="left">
              <span class="arrow-left icon"></span>
            </a>
              <strong>{{page_number + 1}}</strong> / <strong>125</strong>
              <a v-on:click="goToPage(page_number + 1)" href="#" class="right">
                <span class="arrow-right icon"></span>
              </a>
          </div>
          <div class="ocr-qt">
            OCR Quality <span class="qt">80%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import OpenSeadragon from 'openseadragon';

import * as services from '../../services';
import ThumbnailSlider from '../modules/ThumbnailSlider';

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
    minZoomLevel: {
      default: 0.25,
    },
    maxZoomLevel: {
      default: 5,
    },
    zoomLevel: {
      default: 0.5,
    },
  },
  data: () => ({
    viewer: false,
    pagedata: {},
  }),
  methods: {
    init() {
      if (!this.viewer) {
        this.viewer = OpenSeadragon({
          // debugMode: true,
          sequenceMode: false,
          id: 'os-viewer',
          showNavigationControl: false,
          showSequenceControl: false,
          initialPage: this.page_number,
          minZoomLevel: this.minZoomLevel,
          maxZoomLevel: this.maxZoomLevel,
          defaultZoomLevel: this.zoomLevel,
          tileSources: this.issue.pages.map(elm => elm.iiif),
          animationTime: 0.1,
        });

        this.viewer.addHandler('zoom', (event) => {
          this.$emit('zoom', event.zoom);
        });
      }
    },
    goToPage(page) {
      if (page >= 0 && page < this.issue.pages.length) {
        this.$emit('click', page);
      }
    },
    getPageData() {
      services.pages.get(this.issue.pages[this.page_number].uid, {}).then((res) => {
        this.pagedata = res;
      });
    },
  },
  watch: {
    issue: {
      handler() {
        this.init();
        this.getPageData();
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
    zoomLevel: {
      handler(val) {
        this.viewer.viewport.zoomTo(val);
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
        background: fade(@clr-grey-200, 90);
        width: 120px;
        height: 100%;
        position: relative;
    }
}

#os-viewer {
    flex: 1;
    height: 100%;
    position: relative;
    .header {
        background: fade(@clr-grey-200, 90);
        position: absolute;
        z-index: 1000;
        top: 0;
        width: 100%;
        height: 48px;
        line-height: 36px;
        padding: 5px;
        transition: background 250ms;
        display: flex;
        justify-content: flex-end;
        font-size: 0.80em;
        border-bottom: 0.05em solid @clr-grey-400;
        .articleMeta {
            opacity: 0.6;
            margin-top: 0.4em;
            line-height: 1.7;
            .title {
                font-weight: bold;
            }
        }
        .pagination {
            width: 50%;
            text-align: center;
            display: block;

            a {
                display: inline-block;
                box-sizing: border-box;
                width: 34px;
                height: 34px;
                border-radius: 0.2em;
                margin: 0 1em;
                // outline: 1px solid red;
                vertical-align: bottom;
                transition: background 300ms;
                .icon {
                    margin-left: -8px;
                    transform: scale(0.5);
                    margin-top: 17px;
                    transition: margin 150ms 300ms;
                }
                &:hover {
                    background: fade(@clr-grey-400, 40);
                }
                &:hover .arrow-left {
                    margin-left: -12px;
                }
                &:hover .arrow-right {
                    margin-left: -4px;
                }

            }
        }

        // &:hover {
        //     background: fade(@clr-grey-200, 90);
        // }
        .page-tags {
            width: 15%;
            color: @clr-grey-800;
            font-style: italic;
        }
        .ocr-qt {
            width: 25%;
            color: @clr-grey-800;
            font-style: italic;
            text-align: right;
            span.qt {
                display: inline;
                line-height: 1em;
                padding: 3px 5px;
                font-size: 1.2em;
                margin-left: 10px;
                font-style: normal;
                .text-serif();
                font-weight: bold;
                background: @clr-grey-400;
                color: @clr-grey-100;
                // border: 2px solid @clr-grey-800;
                // padding: 3px 7px;
                border-radius: 5px;
            }
        }
    }

    .openseadragon-canvas {
        outline: none;
    }

    .highlights rect {
        fill: green;
    }
}
</style>
