<template>
  <div class="toc" ref="TableOfContents">
    <div v-if="flatten">
      <div
        :ref="`article-${art.uid}`"
        class="media article flatten"
        v-for="(art, idx) in articles"
        v-bind:key="idx"
        v-bind:class="{active: art.uid === selectedArticleUid}"
        v-on:click.stop.prevent="onClick(art, art.pages[0])">
        <div class="media-body">
          <image-item :item="article" v-if="art.type === 'image'" class="my-2 ml-3" :headers="headers"/>
          <article-item :item="art" class="mx-3 py-3 border-bottom clearfix"
            show-excerpt
            show-entities
            show-size
            show-pages
            show-matches
            show-type
          />
        </div>
      </div>
    </div>

    <div v-else>
      <div v-for="(pag, index) in tableOfContents.pages"
           v-bind:key="index"
           class="mb-2 pb-1px page "
           v-bind:class="{activepage: pag.uid === selectedPageUid}">
        <div class="d-block text-bold pagenumber"
        :ref="`page-${pag.uid}`" :data-id='pag.uid'>
          <div class="p-1 text-white rounded ml-3 border-bottom TableOfContents_page"><b>{{$t('page')}} {{pag.num}}</b></div>
          <div
            :ref="`article-${art.uid}`"
            class="media article border-bottom"
            v-for="(art, idx) in pag.articles"
            v-bind:key="idx"
            v-bind:class="{activepage: pag.uid === selectedPageUid, active: art.uid === selectedArticleUid}"
            v-on:click.stop.prevent="onClick(art, pag)">
            <div class="media-body">
              <image-item
                :height="200"
                :item="article"
                v-if="art.type === 'image'"
                class="my-2 ml-3"
                :headers="headers"
                />
              <article-item :item="art"
                show-excerpt
                show-entities
                show-size
                show-pages
                show-type
                class="mx-3 py-3"
              />
              <div v-if="isLoggedIn">
                <div v-bind:key="i" v-for="(image, i) in art.images">
                  <image-item
                    class="mx-3 mb-2"
                    :item="image"
                    :headers="headers"
                  />
                  <div class="text-right mr-3 mb-2">
                  <router-link class="btn btn-outline-secondary btn-sm "
                    :to="getSimilarImagesHref(image)">
                    get similar images
                  </router-link>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <copy-to-clipboard :article="article" v-if="showModalShare" @closed="hideModalShareArticle" />
  </div>
</template>

<script>
import { mapStores } from 'pinia'
import ArticleItem from './lists/ArticleItem.vue';
import ImageItem from './lists/ImageItem.vue';

import CopyToClipboard from '../modals/CopyToClipboard.vue';
import { getAuthenticationBearer } from '@/services';
import { useCollectionsStore } from '@/stores/collections'
import { useUserStore } from '@/stores/user'

export default {
  data: () => ({
    // if all pages have been loaded.
    retryTimer: 0,
    selectedArticleUid: '',
    selectedPageUid: '',
    showModalShare: false,
    headers: null,
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
    CopyToClipboard,
  },
  computed: {
    ...mapStores(useCollectionsStore, useUserStore),
    isLoggedIn() {
      return this.userStore.userData
    },
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
      const elementsList = this.$refs[`page-${this.selectedPageUid}`]
      const elm = elementsList ? elementsList[0] : undefined

      if (!elm) {
        console.warn(`Cannot scrollToActivePage: ${this.selectedPageUid} not ready or not found`);
        clearTimeout(this.retryTimer);
        this.retryTimer = setTimeout(this.scrollToActivePage, 500);
      } else {
        const parent = this.$refs.TableOfContents.parentNode;
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
    onRemoveCollection(collection, item) {
      const idx = item.collections.findIndex(c => (c.uid === collection.uid));
      if (idx !== -1) {
        this.collectionsStore.removeCollectionItem({
          collection,
          item,
        }).then(() => {
          item.collections.splice(idx, 1);
          this.$forceUpdate();
        });
      }
    },
    showModalShareArticle() {
      this.showModalShare = true;
    },
    hideModalShareArticle() {
      this.showModalShare = false;
    },
    getSimilarImagesHref(image) {
      return `/search/images?p=1&similarTo=${image.uid}`
    }
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
  },
  mounted() {
    this.headers = {
      Authorization: 'Bearer ' + getAuthenticationBearer() ?? ''
    }
  },
  beforeUnmount() {
    clearTimeout(this.retryTimer);
  },
};
</script>

<style lang="scss">
@import 'src/assets/legacy/bootstrap-impresso-theme-variables.scss';
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

  .TableOfContents_page{
    position: sticky;
    top: 10px;
    background: var(--dark);
    z-index:2;
    display: inline-block;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "page": "Page",
    "no_title": "No title",
    "add_to_collection": "Add to Collection ...",
    "share_article": "Share ..."
  },
  "nl": {
    "page": "Pagina",
    "no_title": "Zonder titel"
  }
}
</i18n>
