<template lang="html">
  <div id="thumbnail-slider" class="dragscroll" ref="thumbnail-slider">
    <div class="tiles">
      <div class="tile" v-bind:class="{selected: value === index}" v-for="(page, index) in pages" v-on:click="goToPage(index)">
        <thumbnail-slider-item v-bind:tileSources="page.iiif" v-bind:bounds="bounds" v-bind:active="value === index"></thumbnail-slider-item>
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
      if (this.scrollLeft === this.$refs['thumbnail-slider'].scrollLeft) {
        this.$emit('input', page);
      }

      this.scrollLeft = this.$refs['thumbnail-slider'].scrollLeft;
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
