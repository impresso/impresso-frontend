<template lang="html">
  <b-media class="py-3 border-bottom">
    <div class="thumbnail bg-light border" slot="aside" >
      <open-seadragon-viewer
        v-bind:handler="handler">
      </open-seadragon-viewer>
    </div>
    <h2 v-if="article.title" class="mb-0">
      <a href="#" v-on:click.prevent="click" v-html="article.title" />
    </h2>
    <div class="article-meta mb-2">
      <strong v-if="article.newspaper.name">{{article.newspaper.name}}, </strong>
      <span class="small-caps">{{$d(new Date(article.date), "long")}}</span>
      (p. <span>{{article.pages.map(page => page.num).join('; ')}}</span>)
    </div>

    <div v-if="article.excerpt.length > 0" class="article-excerpt mb-2">{{article.excerpt}}</div>

    <ul v-if="article.matches.length > 0" class="article-matches mb-2">
      <li v-for="match in article.matches" v-html="match.fragment" v-show="match.fragment.trim().length > 0"></li>
    </ul>
    <b-badge class="mb-2" pill v-for="tag in article.tags" variant="secondary" v-bind:key="tag.uid">{{tag.name}}</b-badge>
    <b-button size="sm" variant="outline-primary" v-on:click.prevent="click">{{$t('view')}}</b-button>
    <b-dropdown v-on:show="setFocus" size="sm" variant="outline-primary" text="Add to Collection ...">
      <collection-add-to style="margin: -0.5em 0 -0.5em 0" :item="article" />
    </b-dropdown>

  </b-media>
</template>

<script>
import Vue from 'vue';
import OpenSeadragonViewer from './OpenSeadragonViewer';
import CollectionAddTo from './CollectionAddTo';

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
    setFocus(event) {
      this.$nextTick(() => {
        event.target.querySelector('input').focus();
      });
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
    CollectionAddTo,
  },
  mounted() {
    this.init();

    this.handler.$on('tile-loaded', () => {
      if (this.article.isCC) {
        this.article.regions.forEach((region) => {
          if (region.pageUid === this.article.pages[0].uid) {
            if (region.coords.x) region.coords[0] = region.coords.x;
            if (region.coords.y) region.coords[1] = region.coords.y;
            if (region.coords.w) region.coords[2] = region.coords.w;
            if (region.coords.h) region.coords[3] = region.coords.h;
            const overlay = {
              x: region.coords[0],
              y: region.coords[1],
              w: region.coords[2],
              h: region.coords[3],
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

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

div.overlay-region{
  background: $clr-accent-secondary;
  opacity: 0.25;
}
.thumbnail {
    width: 215px;
    height: 240px;
    position: relative;
    cursor: move;
}
h2 {
  font-size: 1.2em;
  font-weight: 500;
  a {
    text-decoration: underline;
    text-decoration-color:#ccc;
    &:hover {
      text-decoration-color: transparent;
    }
  }
}
.article-matches,
.article-meta,
.article-excerpt {
  font-size: 0.9em;
}
ul.article-matches {
  list-style: none;
  padding: 0;
  li {
    border-left: 2px solid black;
    margin: 1em 0;
    padding-left: 1em;
  }
}
</style>

<i18n>
{
  "en": {
    "view": "View"
  },
  "nl": {
    "view": "Bekijk"
  }
}
</i18n>
