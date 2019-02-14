<template lang="html">
  <div id="TableOfContents">
    <ul class="list-unstyled page border-bottom" v-for="page in toc.pages" v-bind:class="{active: page.uid === pageUid}">
      <li class="article border-bottom" v-for="article in page.articles" v-bind:class="{active: article.uid === articleUid}">
          <a href="#" v-on:click.prevent="onClick(article, page)" class="p-3">
            <div class="title">
              <span v-html="article.title || `${article.excerpt.substring(0, 35)} ... (${$t('no_title')})`"></span>
            </div>
            <div class="page">
              {{page.num}}
            </div>
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
    margin-bottom: 0;

    .article {
      a{
        display: flex;
        .title{
          flex: auto;
        }
        .page{
          flex: min-content;
        }
      }
      &.active{
        a {
          background: lighten($clr-primary, 88);
          font-weight: bold;
        }
      }
      a{
        // text-decoration: none;
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
