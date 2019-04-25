<template lang="html">
  <div id="thumbnail-slider" ref="thumbnailSlider">
    <div class="tiles">
      <div
        v-if="page && issue"
        v-for="(item, index) in issue.pages"
        class="tile"
        v-bind:ref="`page-${item.uid}`"
        v-bind:class="{active: page.uid === item.uid}"
        v-on:click="onClickPage(item)">
        <div class="mini_viewer" v-bind:class="{selected: page.uid === item.uid}">
          <thumbnail-slider-item
            v-bind:tileSources="item.iiif"
            v-bind:bounds="bounds"
            v-bind:active="page.uid === item.uid && displayMode === 'image'"
            ></thumbnail-slider-item>
        </div>
        <span class="page_number">{{item.num}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Page from '@/models/Page';
import Issue from '@/models/Issue';
import ThumbnailSliderItem from './ThumbnailSliderItem';

export default {
  props: {
    issue: new Issue(),
    bounds: false,
    page: new Page(),
    displayMode: {
      default: 'image',
    },
  },
  mounted() {
  },
  methods: {
    onClickPage(page) {
      this.$emit('click', page);
    },
    scrollToActivePage() {
      if (this.page.uid) {
        const elm = this.$refs[`page-${this.page.uid}`][0];
        const parent = this.$refs.thumbnailSlider;
        if (parent.scrollTop > elm.offsetTop ||
          ((elm.offsetTop + elm.offsetHeight) - parent.scrollTop) > parent.offsetHeight) {
          parent.scrollTop = elm.offsetTop;
        }
      }
    },
  },
  components: {
    ThumbnailSliderItem,
  },
  watch: {
    page() {
      this.scrollToActivePage();
    },
    issue: {
      handler() {
        window.setTimeout(() => {
          this.scrollToActivePage();
        }, 500);
      },
    },
  },
};
</script>

<style lang="less">
#thumbnail-slider {
    position: absolute;
    height: 100%;
    scroll-behavior: smooth;
    overflow-x: hidden;
    overflow-y: scroll;
    white-space: nowrap;

    .tiles {
        width: 100%;
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
                background: fade(#eeeeee, 90);
                color: #424242;
                width: 2em;
                height: 2em;
                text-align: center;
                padding-top: 0.2em;
                border: 1px solid #E0E0E0;
                z-index: 20;
            }

            .mini_viewer {
                background: white;
                border: 1px solid #E0E0E0;
                width: 100px;
                height: 100%;
                float: right;
                overflow: hidden;
                padding: 5px;
                &.selected {
                    border-color: #9E9E9E;
                }
                &.selected + .page_number {
                    border: 1px solid #9E9E9E;
                    background: fade(#BDBDBD, 90);
                    color: white;
                }
            }

        }
    }
}
</style>
