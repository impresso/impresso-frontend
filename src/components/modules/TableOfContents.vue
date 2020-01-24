<template lang="html">
  <div class="toc" ref="TableOfContents">
    <div v-if="flatten">
      <b-media
        :ref="`article-${article.uid}`"
        class="article flatten"
        v-for="(article, idx) in articles"
        v-bind:key="idx"
        v-bind:class="{activepage: page.num === currentPageNum, active: article.uid === selectedArticleUid}"
        v-on:click.prevent="onClick(article, page)">
        <image-item :item="article" v-if="article.type === 'image'" class="my-2 ml-3"/>
        <article-item :item="article" class="p-3 clearfix"
          show-excerpt
          show-entities
          show-size
          show-pages
          show-matches
          show-type
        />
      </b-media>
    </div>

    <div v-else>
      <div v-for="(page, index) in tableOfContents.pages"
           v-bind:key="index"
           class="mb-2 pb-1px page "
           v-bind:class="{activepage: page.num === currentPageNum}">
        <div class="p-3 d-block text-bold pagenumber">
          {{$t('page')}} {{page.num}}
          <b-media
            :ref="`article-${article.uid}`"
            class="article "
            v-for="(article, idx) in page.articles"
            v-bind:key="idx"
            v-bind:class="{activepage: page.num === currentPageNum, active: article.uid === selectedArticleUid}"
            v-on:click.prevent="onClick(article, page)">
            <div>
              <image-item
                :height="200"
                :item="article"
                v-if="article.type === 'image'"
                class="my-2 ml-3"
                />
              <article-item :item="article" class="p-3"
                show-excerpt
                show-entities
                show-size
                show-pages
                show-type
              />
              <image-item
                :height="200"
                class="mx-3 mb-2"
                :item="image"
                v-for="(image, i) in article.images"
                v-bind:key="i"
              />
            </div>
          </b-media>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import ArticleItem from './lists/ArticleItem';
import ImageItem from './lists/ImageItem';

export default {
  data: () => ({
    selectedArticleUid: '',
  }),
  props: {
    articles: {
      type: Array,
    },
    flatten: {
      type: Boolean,
    },
    tableOfContents: {
      type: Object,
      required: true,
    },
    page: {
      type: Object,
      default: () => '',
    },
    article: {
      type: Object,
      default: () => '',
    },
  },
  computed: {
    articleUid() {
      return this.article.uid;
    },
    currentPageNum() {
      return this.page.num;
    },
  },
  components: {
    ArticleItem,
    ImageItem,
  },
  methods: {
    orderedTopics(topics) {
      return topics.sort((a, b) => b.relevance - a.relevance);
    },
    onClick(article, page) {
      this.selectedArticleUid = article.uid;
      this.$emit('click', {
        article,
        page,
      });
    },
    scrollToActiveArticle() {
      console.info('scrollToActiveArticle uid:', this.article.uid);
      if (this.article.uid !== '') {
        if (!this.$refs[`article-${this.article.uid}`]) {
          console.error(`Cannot scrollToActiveArticle: ${this.article.uid} not ready or not found`);
          return;
        }
        const elm = this.$refs[`article-${this.article.uid}`][0];
        const parent = this.$refs.TableOfContents.parentNode;
        const elmRelativeTop = elm.offsetTop - parent.offsetTop;
        if (parent.scrollTop > elmRelativeTop ||
          (elm.offsetTop + elm.offsetHeight) - parent.scrollTop >
          parent.offsetTop + parent.offsetHeight) {
          parent.scrollTo({ top: elmRelativeTop - 1, behavior: 'smooth' });
        }
      }
    },
    isLoggedIn() {
      return this.$store.state.user.userData;
    },
    onRemoveCollection(collection, item) {
      const idx = item.collections.findIndex(c => (c.uid === collection.uid));
      if (idx !== -1) {
        this.$store.dispatch('collections/REMOVE_COLLECTION_ITEM', {
          collection,
          item,
        }).then(() => {
          item.collections.splice(idx, 1);
          this.$forceUpdate();
        });
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
  mounted() {
    if (this.article) {
      this.selectedArticleUid = this.article.uid;
      this.scrollToActiveArticle();
    }
  },
  watch: {
    article: {
      deep: true,
      handler(article) {
        this.selectedArticleUid = article.uid;
        this.scrollToActiveArticle();
      },
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

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";
.toc{
  margin-left: 1px;
  .article{
    transition: all 0.2s ease-in-out;
    cursor: pointer;

    &:hover {
      background-color: $clr-bg-secondary;
    }

    h2 {
      font-size: inherit;
    }
    &.activepage {
      box-shadow: inset 1px 0 $clr-primary;
    }
    &.active {
      box-shadow: inset .25em 0 $clr-accent-secondary;
      background-color: $clr-bg-secondary;
      cursor: inherit;
    }
  }
}
</style>

<i18n>
{
  "en": {
    "page": "Page",
    "no_title": "No title",
    "add_to_collection": "Add to Collection ..."
  },
  "nl": {
    "page": "Pagina",
    "no_title": "Zonder titel"
  }
}
</i18n>
