<template lang="html">
  <div class="toc" ref="TableOfContents">
    <div v-if="flatten">
      <b-media
        :ref="`article-${art.uid}`"
        class="article flatten"
        v-for="(art, idx) in articles"
        v-bind:key="idx"
        v-bind:class="{active: art.uid === selectedArticleUid}"
        v-on:click.prevent="onClick(art, art.pages[0])">
        <image-item :item="article" v-if="art.type === 'image'" class="my-2 ml-3"/>
        <article-item :item="art" class="p-3 clearfix"
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
      <div v-for="(pag, index) in tableOfContents.pages"
           v-bind:key="index"
           class="mb-2 pb-1px page "
           v-bind:class="{activepage: pag.uid === selectedPageUid}">
        <div class="d-block text-bold pagenumber"
        :ref="`page-${pag.uid}`" :data-id='pag.uid'>
          <div class="p-3 border-bottom"><b>{{$t('page')}} {{pag.num}}</b></div>
          <b-media
            :ref="`article-${art.uid}`"
            class="article"
            v-for="(art, idx) in pag.articles"
            v-bind:key="idx"
            v-bind:class="{activepage: pag.uid === selectedPageUid, active: art.uid === selectedArticleUid}"
            v-on:click.prevent="onClick(art, pag)">
            <div>
              <image-item
                :height="200"
                :item="article"
                v-if="art.type === 'image'"
                class="my-2 ml-3"
                />
              <article-item :item="art" class="p-3"
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
                v-for="(image, i) in art.images"
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
    // if all pages have been loaded.
    retryTimer: 0,
    selectedArticleUid: '',
    selectedPageUid: '',
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
    },
    article: {
      type: Object
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
    scrollToActivePage() {
      if (!this.$refs[`page-${this.selectedPageUid}`]) {
        console.warn(`Cannot scrollToActivePage: ${this.selectedPageUid} not ready or not found`);
        clearTimeout(this.retryTimer);
        this.retryTimer = setTimeout(this.scrollToActivePage, 500);
      } else {
        console.info('scroll to page', this.selectedPageUid);
        const elm = this.$refs[`page-${this.selectedPageUid}`][0];
        const parent = this.$refs.TableOfContents.parentNode;
        console.info('ELM', elm.offsetTop);
        const elmRelativeTop = elm.offsetTop - parent.offsetTop;
        parent.scrollTo({ top: elmRelativeTop - 1, behavior: 'smooth' });
      }
    },
    scrollToActiveArticle() {
      if (!this.$refs[`article-${this.selectedArticleUid}`]) {
        console.warn(`Cannot scrollToActiveArticle: ${this.selectedArticleUid} not ready or not found;`);
        clearTimeout(this.retryTimer);
        this.retryTimer = setTimeout(this.scrollToActiveArticle, 500);
      } else {
        const elm = this.$refs[`article-${this.selectedArticleUid}`][0];
        const parent = this.$refs.TableOfContents.parentNode;
        const elmRelativeTop = elm.offsetTop - parent.offsetTop;
        if (parent.scrollTop > elmRelativeTop ||
          (elm.offsetTop + elm.offsetHeight) - parent.scrollTop >
          parent.offsetTop + parent.offsetHeight) {
          parent.scrollTo({ top: elmRelativeTop - 1, behavior: 'smooth' });
        }
      }
      // if (this.article) {
      //   if (!this.$refs[`article-${this.article.uid}`]) {
      //     console.error(`Cannot scrollToActiveArticle: ${this.article.uid} not ready or not found`);
      //   } else {
      //     const elm = this.$refs[`article-${this.article.uid}`][0];
      //     const parent = this.$refs.TableOfContents.parentNode;
      //     const elmRelativeTop = elm.offsetTop - parent.offsetTop;
      //     if (parent.scrollTop > elmRelativeTop ||
      //       (elm.offsetTop + elm.offsetHeight) - parent.scrollTop >
      //       parent.offsetTop + parent.offsetHeight) {
      //       parent.scrollTo({ top: elmRelativeTop - 1, behavior: 'smooth' });
      //     }
      //   }
      // }
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
  watch: {
    $route: {
      immediate: true,
      handler({ name, params }) {
        if (name === 'article') {
          this.selectedArticleUid = params.article_uid;
          this.scrollToActiveArticle();
        } else if (name === 'page') {
          console.info(params);
          this.selectedPageUid = params.page_uid;
          this.scrollToActivePage();
        }
      },
    },
  }
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
