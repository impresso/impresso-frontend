<template lang="html">
  <div id="TableOfContents">
    <ul class="page p-0 my-1 border-top" v-for="page in toc.pages" v-bind:class="{active: page.uid === pageUid}">
      <li class="article border-bottom" v-for="article in page.articles" v-bind:class="{active: article.uid === articleUid}">
        <a href="#" v-on:click.prevent="onClick(article, page)" class="bg-light p-2">
          <span v-html="article.title || `${article.excerpt.substring(0, 35)} ... (${$t('no_title')})`"></span>
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
    list-style: none;
    font-size: smaller;
    border-left: 2px solid $clr-quaternary;
    &.active{
      border-left-color: $clr-accent-secondary;
      li.article{
        a{
          background: white !important;
        }
      }
    }
    li.article{
      &.active{
        a {
          color: white;
          background: $clr-accent-secondary !important;
        }
      }
      a{
        padding: 0 15px;
        display: block;
        text-decoration: none;
        background: gray;
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
