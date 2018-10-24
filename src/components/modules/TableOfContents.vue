<template lang="html">
  <div class="border-top">
    <div
      v-for="article in toc"
      class="listArticle border-bottom p-2 bg-light"
      v-on:click="setActiveArticle(article)"
      v-bind:class="{
        'active': article.uid === active,
        'highlight': article.pages.find( page => page.num === currentPage) != undefined }">
      <strong class="title float-left w-75">{{ theHeader(article) }}</strong>
      <b-button
        class="btn btn-sm btn-secondary float-right"
        variant="outline-primary"
        v-on:click="loadArticle(article)">Load</b-button>
      <br>
      <label class="w-100">pp. {{selected}}
        <b-badge variant="light" v-for="(page, index) in article.pages">{{page.num}}</b-badge>
      </label>
      <p class="excerpt mt-0 mb-1">
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
    currentPage: {
      default: 1,
    },
    active: {
      default: '',
    },
  },
  methods: {
    setActiveArticle(article) {
      this.active = article.uid;
    },
    loadArticle(article) {
      this.setActiveArticle(article);
      this.$emit('click', article.pages[0].uid);
    },
    theHeader(article) {
      if (article.title === '') {
        return this.theTeaser(article.excerpt, 40);
      }
      return this.theTeaser(article.title, 100);
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
  border-left: 1px solid #e7e7e7;
  cursor: pointer;
  opacity: 0.6;
}
.highlight {
  background: white !important;
  border-color: lightblue;
  outline: none;
  opacity: 1;
}
.active {
  background: lightblue !important;
  opacity: 1;
}
.title {
  font-size: smaller;
}
.excerpt {
  font-size: smaller;
}
</style>
