<template lang="html">
  <b-media class="py-3 border-bottom">
    <div class="thumbnail border" slot="aside" >
      <open-seadragon-viewer
        v-model="article.pages[0].iiif"
        v-bind:bbox="article.regions[0].coords">
      </open-seadragon-viewer>
    </div>
    <h2><a href="#" v-on:click.prevent="click" v-html="article.title"></a></h2>
    <div class="article-meta mb-1">
      <strong>{{article.newspaper.name}}</strong>,
      <span class="small-caps">{{$d(article.date, "long")}}</span>
      (p. <span>{{article.pages.map(page => page.num).join('; ')}}</span>)
    </div>
    <div v-if="article.excerpt.length > 0" class="article-excerpt">{{article.excerpt}}</div>
    <ul class="article-matches">
      <li v-for="match in article.matches" v-html="match.fragment" v-show="match.fragment.trim().length > 0"></li>
    </ul>
    <div>
      <b-badge pill v-for="tag in article.tags" variant="secondary" v-bind:key="tag.uid">{{tag.name}}</b-badge>
    </div>
  </b-media>
</template>

<script>
import OpenSeadragonViewer from './OpenSeadragonViewer';

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
  },
};
</script>

<style scoped lang="less">
.thumbnail {
    width: 215px;
    height: 240px;
    position: relative;
    cursor: move;
}
h2 {
  font-size: 1em;
  font-weight: 500;
  font-family: questa-grande;
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
  },
  "nl": {
  }
}
</i18n>
