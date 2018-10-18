<template lang="html">
  <div class="tile my-3 border">
    <div class="thumbnail">
      <open-seadragon-viewer
        v-model="article.pages[0].iiif"
        v-bind:bbox="article.regions[0].coords">
      </open-seadragon-viewer>
    </div>
      <a href="#" v-on:click.prevent="click" class="titleblock article-meta p-2 border-top">
        <h2 v-show="article.title != ''" v-html="article.title" />
        <div class="small-caps">
          {{article.newspaper.name}}
        </div>
        <div class="small-caps">
          {{$d(article.date, "long")}} (p. <span>{{article.pages.map(page => page.num).join('; ')}}</span>)
        </div>
      </a>
  </div>
</template>

<script>
import OpenSeadragonViewer from './OpenSeadragonViewer';

export default {
  model: {
    prop: 'article',
  },
  props: ['article'],
  methods: {
    click() {
      this.$emit('click');
    },
  },
  components: {
    OpenSeadragonViewer,
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
