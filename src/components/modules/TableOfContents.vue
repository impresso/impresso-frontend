<template lang="html">
  <div id="TableOfContents">
    <div v-for="page in toc.pages" class="mb-5">
      <span class="p-3 d-block text-bold pagenumber">{{$t('page')}} {{page.num}}</span>
      <ul class="list-unstyled page border-bottom border-top" v-bind:class="{active: page.uid === pageUid}">
        <li class="article border-bottom" v-for="article in page.articles" v-bind:class="{active: article.uid === articleUid}">
            <a href="#" v-on:click.prevent="onClick(article, page)" class="p-3">
              <div class="info">
                <span class="d-block title" v-html="article.title || $t('no_title')"></span>
                <span class="excerpt">{{article.excerpt | substring(100)}}</span>
              </div>
              <div class="page">
                {{page.num}}
              </div>
            </a>
        </li>
      </ul>
    </div>
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
  filters: {
    substring: (val, count = 10) => {
      val = val.trim();
      if (val.length >= count - 3) {
        return `${val.substring(0, count)}...`;
      }
      return val;
    },
  },
};
</script>

<style scoped lang="scss">
@import "impresso-theme/src/scss/variables.sass";

#TableOfContents{
  .pagenumber {
    font-size: 1.4em;
    color: lighten($clr-primary, 75);
  }

  ul.page {
    list-style: none;
    font-size: smaller;
    margin-bottom: 0;
    .article {
      a{
        text-decoration: none;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        .info{
          flex: auto;
          .title{
            font-size: 1.2em;
            font-weight: bold;
          }
          .excerpt{
            color: lighten($clr-primary, 25);
          }
        }
        .page{
          flex: min-content;
          font-size: 1.2em;
          font-weight: bold;
          color: lighten($clr-primary, 75);
        }
      }
      &.active{
        a {
          background: lighten($clr-primary, 88);
          font-weight: bold;
        }
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
