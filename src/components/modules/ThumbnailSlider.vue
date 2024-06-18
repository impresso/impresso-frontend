<template lang="html">
  <div id="thumbnail-slider" ref="thumbnailSlider">
    <div class="tiles" v-if="page && issue">
      <div
        v-for="(item, index) in issue.pages"
        v-bind:key="index"
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
import ThumbnailSliderItem from './ThumbnailSliderItem.vue';

export default {
  props: {
    issue: new Issue(),
    bounds: {},
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
      if (this.page) {
        const elm = this.$refs[`page-${this.page.uid}`][0];
        const parent = this.$refs.thumbnailSlider;
        if (parent.scrollTop > elm.offsetTop ||
          ((elm.offsetTop + elm.offsetHeight) - parent.scrollTop) > parent.offsetHeight) {
          parent.scrollTo({ top: elm.offsetTop, behavior: 'smooth' });
        }
      }
    },
  },
  components: {
    ThumbnailSliderItem,
  },
  watch: {
    page: {
      handler(val, oldval) {
        if (oldval instanceof Page) {
          this.scrollToActivePage();
        }
      },
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
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    white-space: nowrap;
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
                background: fade(#eeeeee, 90);
                color: #424242;
                width: 2em;
                height: 2em;
                text-align: center;
                padding-top: 0.2em;
                border: 1px solid #E0E0E0;
                z-index: 20;
            }
            &.active {
              background: #343a40;
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
                    border-color: #343a40;
                }
                &.selected + .page_number {
                    border-color: #343a40;
                    background: #343a40;
                    color: white;
                    font-weight: bold;
                }
            }

        }
    }
}
</style>
