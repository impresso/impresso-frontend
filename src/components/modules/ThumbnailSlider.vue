<template lang="html">
  <div id="thumbnail-slider" class="dragscroll" ref="thumbnail-slider">
    <div class="tiles">
      <div class="tile"
        v-for="(page, index) in pages"
        v-on:click="goToPage(index)">
        <span class="page_number">{{page.num}}</span>
        <div class="mini_viewer" v-bind:class="{selected: value === index}">
          <thumbnail-slider-item
            v-bind:tileSources="page.iiif"
            v-bind:bounds="bounds"
            v-bind:active="value === index"
            v-on:mounted="onMountedTile"
            ></thumbnail-slider-item>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ThumbnailSliderItem from './ThumbnailSliderItem';

require('dragscroll');

export default {
  data: () => ({
    bounds: [],
    scrollTop: 0,
    center: true,
    mountedTiles: 0,
  }),
  props: {
    pages: {
      required: true,
    },
    value: {
      type: Number,
      default: 1,
    },
    viewer: {
      default: false,
    },
  },
  mounted() {},
  methods: {
    goToPage(page) {
      this.center = false;

      // only if no sroll took place we want to emit the click
      // if (this.scrollTop === this.$refs['thumbnail-slider'].scrollTop) {
      this.$emit('input', page);
      // }
      //
      // this.scrollTop = this.$refs['thumbnail-slider'].scrollTop;
    },
    centerActiveTile() {
      if (this.center && this.viewer) {
        const activeElement = this.$refs['thumbnail-slider'].getElementsByClassName('tile')[this.value];
        const parentElement = this.$refs['thumbnail-slider'];

        parentElement.scrollTop = activeElement.offsetTop + (
          (activeElement.offsetHeight / 2) - (parentElement.offsetHeight / 2)
        );
      }
    },
    onMountedTile() {
      this.mountedTiles += 1;

      // if all tiles are mounted we want to center the slider
      if (this.pages.length === this.mountedTiles) {
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
    value: {
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
        // text-align: center;
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
                top: 30px;
            }

            .mini_viewer {
                // border: 1px solid rgba(0,0,0,0);
                background: white;
                border: 1px solid @clr-grey-300;
                width: 100px;
                height: 100%;
                float: right;
                overflow: hidden;
                padding: 5px;
                &.selected {
                    border-color: #ccc;
                }
            }

        }
    }
    .dragscroll {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 999999;
        background: rgba(255,100,0,0.8);
    }
}
</style>
