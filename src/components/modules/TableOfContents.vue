<template lang="html">
  <div class="border-top">
    <div
      v-for="article in toc"
      class="listArticle border-bottom p-2 bg-light"
      v-bind:data-article-uid=article.uid
      v-on:click="setActiveArticle(article)"
      v-bind:class="{
        'currentPage': article.pages.find( page => page.num === currentPage) != undefined }">
      <strong class="title float-left w-75">{{ theHeader(article) }}</strong>
      <div class="dot-selected mt-1 float-right" />
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
      //
      // TODO: change page url if article is on different page
      //
      document.querySelectorAll(`:not([data-article-uid=${article.uid}]) .active`).forEach((item) => {
        item.classList.remove('active');
      });
      document.querySelectorAll(`[data-article-uid=${article.uid}]`).forEach((item) => {
        item.classList.add('active');
      });
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

<style scoped lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.listArticle {
  border-left: 1px solid transparent;
  display: block;
  cursor: pointer;
  background: white !important;
  color: $clr-tertiary;

  &.currentPage {
    color: $clr-primary;
    border-color: $clr-quaternary;
    outline: none;
    opacity: 1;

    .dot-selected {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 1px solid $clr-quaternary;
    }
    &.active {
      border-color: $clr-accent-secondary;
      .dot-selected {
        background: $clr-accent-secondary;
        border-color: transparent;
      }
    }

  }
}
.title {
  font-size: smaller;
}
.excerpt {
  font-size: smaller;
}
</style>
