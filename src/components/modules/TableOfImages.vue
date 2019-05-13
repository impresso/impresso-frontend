<template lang="html">
  <div id="TableOfImages" ref="TableOfImages">
    <div v-for="page in tableOfContents.pages" class="mb-5">
      <span class="p-3 d-block text-bold pagenumber">{{$t('page')}} {{page.num}}</span>
      <ul class="list-unstyled page border-bottom border-top" v-bind:class="{active: page.uid === pageUid}">
        <li :ref="`article-${article.uid}`" class="article" v-for="article in page.articles" v-bind:class="{active: article.uid === articleUid}">
            <a href="#" class="d-block" v-on:click.prevent="onClick(article, page)">
              <div class="image p-3">
                <b-img v-bind:src="article.regions[0].iiifFragment" fluid-grow />
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
        const parent = this.$refs.TableOfImages.parentNode;
        if (parent.scrollTop > elm.offsetTop ||
          (elm.offsetTop - parent.scrollTop) > parent.offsetHeight) {
          parent.scrollTo({ top: elm.offsetTop, behavior: 'smooth' });
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
    pageUid() {
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

#TableOfImages{
  .pagenumber {
    font-size: 1.4em;
    color: lighten($clr-primary, 75);
  }

  ul.page {
    list-style: none;
    font-size: smaller;
    margin-bottom: 0;
    .article{
      a {
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
