<template lang="html">
  <b-media>
    <div class="thumbnail" slot="aside" >
      <open-seadragon-viewer v-model="article.pages[0].iiif"></open-seadragon-viewer>
    </div>
    <h2><a href="#" v-on:click.prevent="click">{{article.title}}</a></h2>
    <p>{{$d(article.date, "long")}}</p>
    <collection-tagger v-model="article"></collection-tagger>

    <div>
      <b-badge pill v-for="tag in article.tags" variant="secondary" v-bind:key="tag.uid">{{tag.name}}</b-badge>
    </div>
  </b-media>
</template>

<script>
import OpenSeadragonViewer from './modules/OpenSeadragonViewer';
import CollectionTagger from './CollectionTagger';

export default {
  model: {
    prop: 'article',
  },
  props: {
    article: {
      required: true,
    },
  },
  methods: {
    click() {
      this.$emit('click');
    },
  },
  components: {
    OpenSeadragonViewer,
    CollectionTagger,
  },
};
</script>

<style scoped lang="less">
.thumbnail {
    width: 240px;
    height: 180px;
    position: relative;
    cursor: move;
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
