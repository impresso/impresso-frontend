<template lang="html">
  <div class="border-top">
    <div
      v-for="article in toc"
      class="listArticle border-bottom p-2 bg-light"
      v-on:click="setActiveArticle(article)"
      v-bind:class="{
        'active': article.uid === active,
        'highlight': highlight.includes(article.uid) }">
      <strong class="float-left w-75">{{ theHeader(article) }}</strong>
      <b-button
        class="btn btn-sm btn-secondary float-right"
        variant="outline-primary"
        v-on:click="loadArticle(article)">Load</b-button>
      <br>
      <label class="w-100">pp. {{selected}}
        <b-badge variant="light" v-for="(page, index) in article.pages">{{page.num}}</b-badge>
      </label>
      <p class="teaser mt-0 mb-1">
        {{ theTeaser(article.excerpt, 120) }}
      </p>
      <!-- <pre>{{article}}</pre> -->
    </div>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'toc',
  },
  props: {
    toc: {
      default: [],
    },
    active: {
      default: '',
    },
    highlight: {
      default: [],
    },
  },
  methods: {
    setActiveArticle(article) {
      this.active = article.uid;
    },
    loadArticle(article) {
      this.setActiveArticle(article);
      this.$emit('click', article.uid);
    },
    theHeader(article) {
      if (article.title === '') {
        return this.theTeaser(article.excerpt, 20);
      }
      return article.title;
    },
    theTeaser(excerpt, length) {
      if (excerpt.length > length) { return `${excerpt.substring(0, length)} ...`; }
      return excerpt;
    },
  },
};
</script>

<style scoped lang="less">
.listArticle {
  border-left: 0.1em solid white;
  cursor: grab;
}
.highlight {
  background: white !important;
  border-color: lightblue;
}
.active {
  background: lightblue !important;
}
.teaser {
  font-size: smaller;
}
</style>
