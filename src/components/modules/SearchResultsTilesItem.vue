'<template lang="html">
  <div class="tile my-3 border">
    <div class="thumbnail bg-light">
      <open-seadragon-viewer
        v-bind:handler="handler">
      </open-seadragon-viewer>
    </div>
    <a href="#" v-on:click.prevent="click" class="titleblock article-meta p-2 border-top">
      <h2 v-show="article.title != ''" v-html="article.title" />
      <div v-show="article.newspaper.name != ''" class="small-caps">
        {{article.newspaper.name}}
      </div>
      <div class="small-caps">
        {{$d(new Date(article.date), 'short')}}
        (p. <span>{{article.pages.map(page => page.num).join('; ')}}</span>)
      </div>
    </a>
  </div>
</template>

<script>
import Vue from 'vue';
import OpenSeadragonViewer from './OpenSeadragonViewer';

export default {
  data: () => ({
    handler: new Vue(),
  }),
  model: {
    prop: 'article',
  },
  props: ['article'],
  methods: {
    click() {
      this.$emit('click');
    },
    init() {
      const options = {
        tileSources: [this.article.pages[0].iiif],
        showNavigator: true,
        navigatorAutoFade: false,
        navigatorBackground: '#f8f9fa',
        navigatorBottom: 0,
        navigatorRight: 0,
        navigatorSizeRatio: 0.25,
        navigatorDisplayRegionColor: 'black',
        navigatorBorderColor: '#dee2e6',
        navigatorOpacity: 1,
      };
      this.handler.$emit('init', options);
    },
  },
  components: {
    OpenSeadragonViewer,
  },
  mounted() {
    this.init();

    this.handler.$on('tile-loaded', () => {
      if (this.article.isCC) {
        this.article.regions.forEach((region) => {
          if (region.pageUid === this.article.pages[0].uid) {
            const overlay = {
              x: region.coords.x,
              y: region.coords.y,
              w: region.coords.w,
              h: region.coords.h,
              class: 'overlay-region selected',
            };

            this.handler.$emit('add-overlay', overlay);
          }
        });

        this.article.matches.forEach((match) => {
          if (match.pageUid === this.article.pages[0].uid) {
            const overlay = {
              x: match.coords[0],
              y: match.coords[1],
              w: match.coords[2],
              h: match.coords[3],
              class: 'overlay-match',
            };

            this.handler.$emit('add-overlay', overlay);
          }
        });

        this.handler.$emit('fit-bounds-to-overlays');
      }
    });
  },
  watch: {
    article: {
      handler() {
        this.handler.$emit('destroy');
        this.init();
      },
    },
  },
};
</script>

<style scoped lang="less">
.tile {
  &:hover {
    transition: 0.2s;
    border-color: black !important;
  }
  .titleblock {
    display:block;
    &:hover {
      text-decoration: none;
      border-color: black !important;
    }
  }
  .thumbnail {
      width: 100%;
      height: 250px;
      cursor: move;
  }
  h2 {
    font-size: 1em;
    font-weight: 500;
  }
}

</style>

<i18n>
{
  "en": {
  },
  "nl": {
  }
}
</i18n>
