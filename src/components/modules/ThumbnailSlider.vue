<template lang="html">
  <div id="thumbnail-slider" class="dragscroll" ref="thumbnail-slider">
    <div class="tiles">
      <div class="tile"
        v-for="(page, index) in issue.pages"
        v-on:click="onClickPage(index)">
        <div class="mini_viewer" v-bind:class="{selected: page_number === index}">
          <thumbnail-slider-item
            v-bind:tileSources="page.iiif"
            v-bind:bounds="bounds"
            v-bind:active="page_number === index"
            v-on:mounted="onMountedTile"
            ></thumbnail-slider-item>
        </div>
        <span class="page_number">{{page.num}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import ThumbnailSliderItem from './ThumbnailSliderItem';

require('dragscroll');

export default {
  model: {
    prop: 'issue',
  },
  data: () => ({
    bounds: [],
    scrollTop: 0,
    center: false,
    mountedTiles: 0,
  }),
  props: {
    issue: {},
    page_number: {
      type: Number,
      default: 1,
    },
    viewer: {
      default: false,
    },
  },
  mounted() {},
  methods: {
    onClickPage(page) {
      this.center = false;
      this.$emit('click', page);
    },
    centerActiveTile() {
      if (this.center && this.viewer) {
        const activeElement = this.$refs['thumbnail-slider'].getElementsByClassName('tile')[this.page_number];
        const parentElement = this.$refs['thumbnail-slider'];

        parentElement.scrollTop = activeElement.offsetTop + (
          (activeElement.offsetHeight / 2) - (parentElement.offsetHeight / 2)
        );
      }
    },
    onMountedTile() {
      this.mountedTiles += 1;

      // if all tiles are mounted we want to center the slider
      if (this.issue.pages.length === this.mountedTiles) {
        this.centerActiveTile();
      }
    },
  },
  watch: {
    viewer: {
      handler() {
        this.viewer.addHandler('animation', () => {
          this.bounds = this.viewer.viewport.getBoundsNoRotate();
        });

        this.viewer.addHandler('update-viewport', () => {
          this.bounds = this.viewer.viewport.getBoundsNoRotate();
        });
      },
    },
    issue: {
      handler() {
        this.centerActiveTile();
        this.center = true;
      },
    },
  },
  components: {
    ThumbnailSliderItem,
  },
};
</script>

<style lang="less">
@import "./../../assets/less/style.less";

#thumbnail-slider {
    overflow-x: hidden;
    overflow-y: auto;
    white-space: nowrap;
    position: absolute;
    width: 100%;
    height: 100%;
    &::-webkit-scrollbar {
        display: none;
    }
    .tiles {
        width: 100%;
        position: relative;
        height: 100%;
        .tile {
            width: 100%;
            height: 160px;
            padding: 10px;
            position: relative;
            .page_number {
                font-size: smaller;
                position: absolute;
                right: 10px;
                bottom: 10px;
                background: fade(@clr-grey-200, 90);
                color: #424242;
                width: 2em;
                height: 2em;
                text-align: center;
                padding-top: 0.2em;
                border: 1px solid @clr-grey-300;
                z-index: 1000;
            }
            .mini_viewer {
                background: white;
                border: 1px solid @clr-grey-300;
                width: 100px;
                height: 100%;
                float: right;
                overflow: hidden;
                padding: 5px;
                &.selected {
                    border-color: @clr-grey-500;
                }
                &.selected + .page_number {
                    border: 1px solid @clr-grey-500;
                    background: fade(@clr-grey-400, 90);
                    color: white;
                }
            }
        }
    }
}
</style>
