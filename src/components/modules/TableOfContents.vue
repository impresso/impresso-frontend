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
            class="p-3 clearfix"
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
            v-html="article.title" /> &mdash;
          <span
            class="excerpt">{{ article.excerpt }}</span>
          <span v-if="article.size > 1000" class="badge badge-primary">
            {{ $t('readingTime', { min: parseInt(article.size / 1200) }) }}
          </span>

          <ul v-if="article.matches.length > 0" class="article-matches mb-1">
            <li
              v-for="(match, i) in article.matches"
              v-bind:key="i"
              v-html="match.fragment"
              v-show="match.fragment.trim().length > 0" />
          </ul>

          <ul v-if="article.topics.length > 0" class="article-topics mb-1">
            <li
              v-for="topic in article.topics"
              v-bind:key="topic.topicUid">
              {{topic.topicUid}} ({{topic.relevance}})
            </li>
          </ul>

          <ul v-if="article.locations && article.locations.length > 0" class="article-locations mb-1">
            <li
              v-for="location in article.locations"
              v-bind:key="location.uid">
              {{location.uid}} ({{location.relevance}})
            </li>
          </ul>

          <ul v-if="article.persons && article.persons.length > 0" class="article-persons mb-1">
            <li
              v-for="location in article.persons"
              v-bind:key="person.uid">
              {{person.uid}} ({{person.relevance}})
            </li>
          </ul>

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
        if (!this.$refs[`article-${this.articleUid}`]) {
          console.error(`Cannot scrollToActiveArticle: ${this.articleUid} not ready or not found`);
          return;
        }
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
    "no_title": "No title",
    "readingTime": "{min} min read"
  },
  "nl": {
    "page": "Pagina",
    "no_title": "Zonder titel"
  }
}
</i18n>
