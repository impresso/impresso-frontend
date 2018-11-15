<template lang="html">
  <div id="TableOfContents">
    <ul class="page" v-for="page in toc.pages" v-bind:class="{active: page.uid === pageUid}">
      <li class="article" v-for="article in page.articles" v-bind:class="{active: article.uid === articleUid}">
        <a href="#" v-on:click.prevent="onClick(article, page)">
          <span v-html="article.title || $t('no_title')"></span>
          <span class="float-right">{{page.num}}</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import Issue from '@/models/Issue';

export default {
  props: {
    toc: {
      default: new Issue(),
    },
    pageUid: {
      default: '',
    },
    articleUid: {
      default: '',
    },
  },
  methods: {
    onClick(article, page) {
      this.$emit('click', {
        article,
        page,
      });
    },
  },
};
</script>

<style scoped lang="scss">
@import "impresso-theme/src/scss/variables.sass";

#TableOfContents{
  ul.page{
    margin-bottom: 0;
    padding: 0;
    border-left: 2px solid rgba(0,0,0,0);
    list-style: none;
    &.active{
      border-left-color: rgba(0,0,0,0.5);
    }

    li.article{
      &.active{
        font-weight: bold;
      }
      a{
        padding: 0 15px;
        display: block;
      }
    }
  }
}
</style>

<i18n>
{
  "en": {
    "page": "Page",
    "no_title": "No title"
  },
  "nl": {
    "page": "Pagina",
    "no_title": "Zonder titel"
  }
}
</i18n>
