<template lang="html">
  <div id="thumbnail-slider" class="dragscroll" ref="thumbnail-slider">
    <div class="tiles">
      <div
        v-for="item in issue.pages"
        class="tile"
        v-bind:class="{active: page.uid === item.uid}"
        v-on:click="onClickPage(item)">
        <div class="mini_viewer" v-bind:class="{selected: page.uid === item.uid}">
          <thumbnail-slider-item
            v-bind:tileSources="item.iiif"
            v-bind:bounds="bounds"
            v-bind:active="page.uid === item.uid"
            ></thumbnail-slider-item>
        </div>
        <span class="page_number">{{item.num}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Page from '@/models/Page';
import ThumbnailSliderItem from './ThumbnailSliderItem';

require('dragscroll');

export default {
  model: {
    prop: 'issue',
  },
  data: () => ({
    bounds: [],
    mountedTiles: 0,
  }),
  props: {
    issue: {},
    viewer: {
      default: false,
    },
    page: new Page(),
  },
  mounted() {},
  methods: {
    onClickPage(item) {
      this.$emit('click', item);
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
