<template lang="html">
  <b-media class="result">
    <div class="thumbnail" slot="aside" >
      <open-seadragon-viewer v-model="article.pages[0].iiif"></open-seadragon-viewer>
    </div>
    <h2 class="text-serif"><a class="bb" href="#" v-on:click.prevent="click" v-html="article.title"></a></h2>
    <p>
      <strong>{{article.newspaper.name}}</strong>,
      {{$d(article.date, "long")}},
      {{article.pages.length > 1? 'pp.' : 'p.'}} <span>{{article.pages.map(page => page.num).join('-')}}</span>
      <collection-tagger v-model="article"></collection-tagger>
    </p>
    <p v-if="article.excerpt.length > 0">{{article.excerpt}}</p>
    <ul>
      <li v-for="match in article.matches" v-html="match.fragment" v-show="match.fragment.trim().length > 0"></li>
    </ul>
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
@import "./../assets/less/style.less";

.thumbnail {
    width: 240px;
    height: 180px;
    position: relative;
    cursor: move;
    border:1px solid @clr-grey;
}

.result{
  h2 {
    font-size: 1.2em;
    font-weight: bold;
    line-height: 1.414em;

    a{
      color: @clr-grey-900;
      &:hover{
        border-color: @clr-black;
        text-decoration: none;
      }
    }
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
