<template lang="html">
  <div id="thumbnail-slider" class="dragscroll" ref="thumbnail-slider">
    <div class="tiles">
      <div class="tile" v-bind:class="{selected: value === index}" v-for="(page, index) in pages" v-on:click="goToPage(index)">
        <thumbnail-slider-item
          v-bind:tileSources="page.iiif"
          v-bind:bounds="bounds"
          v-bind:active="value === index"
          v-on:mounted="onMountedTile"
          ></thumbnail-slider-item>
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
    scrollLeft: 0,
    center: true,
    mountedTiles: 0,
  }),
  props: {
    height: {
      type: Number,
      default: 200,
    },
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
      if (this.scrollLeft === this.$refs['thumbnail-slider'].scrollLeft) {
        this.$emit('input', page);
      }

      this.scrollLeft = this.$refs['thumbnail-slider'].scrollLeft;
    },
    centerActiveTile() {
      if (this.center && this.viewer) {
        const activeElement = this.$refs['thumbnail-slider'].getElementsByClassName('tile')[this.value];
        const parentElement = this.$refs['thumbnail-slider'];

        parentElement.scrollLeft = activeElement.offsetLeft + (
          (activeElement.offsetWidth / 2) - (parentElement.offsetWidth / 2)
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
#thumbnail-slider {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    position: absolute;
    width: 100%;
    height: 100%;
    background: #666;
    .tiles {
        text-align: center;
        padding: 10px;
        height: 100%;
        .tile {
            display: inline-block;
            border: 2px solid rgba(0,0,0,0);
            border-radius: 5px;
            width: 140px;
            height: 100%;
            padding: 5px;
            overflow: hidden;
            &.selected {
                border-color: #ccc;
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
