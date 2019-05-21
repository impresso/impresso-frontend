<template lang="html">
  <div id="TableOfContents" ref="TableOfContents">
    <div v-for="page in tableOfContents.pages" class="mb-5 page">
      <span class="p-3 d-block text-bold pagenumber">{{$t('page')}} {{page.num}}</span>
        <b-media
          :ref="`article-${article.uid}`"
          class="border-bottom article"
          v-for="article in page.articles"
          v-bind:class="{active: article.uid === articleUid}">
          <a
            class="p-3"
            href="#"
            v-on:click.prevent="onClick(article, page)">
          <div
            v-if="article.images.length"
            class="mr-3 images">
            <b-img
            fluid-grow
            class="mb-1 image"
              v-for="image in article.images"
              v-bind:src="image.regions[0].iiifFragment" />
          </div>
          <span
            class="title"
            v-html="article.title" />
          <span
            class="excerpt">{{article.excerpt | substring(100)}}</span>
          </a>
        </b-media>
    </div>
  </div>
</template>

<script>
import Issue from '@/models/Issue';

export default {
  props: {
    tableOfContents: {
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
    scrollToActiveArticle() {
      if (this.articleUid !== '') {
        const elm = this.$refs[`article-${this.articleUid}`][0];
        const parent = this.$refs.TableOfContents.parentNode;
        if (parent.scrollTop > elm.offsetTop ||
          (elm.offsetTop - parent.scrollTop) > parent.offsetHeight) {
          parent.scrollTo({ top: elm.offsetTop - 50, behavior: 'smooth' });
        }
      }
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
  watch: {
    articleUid() {
      this.scrollToActiveArticle();
    },
    tableOfContents: {
      handler() {
        window.setTimeout(() => {
          this.scrollToActiveArticle();
        }, 500);
      },
    },
  },
};
</script>

<style scoped lang="scss">
@import "impresso-theme/src/scss/variables.sass";

#TableOfContents{
  .page{
    font-size: smaller;
    .pagenumber{
      text-align: center;
    }

    .article{
      &.active{
        a{
          background: lighten($clr-primary, 88);
          font-weight: bold;
        }
      }
      a{
        text-decoration: none;
        display: block;
        .title{
          font-weight: bold;
        }
        .excerpt{
          color: lighten($clr-primary, 25);
        }
        .images{
          width:80px;
          float:left;
          .image{

          }
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
