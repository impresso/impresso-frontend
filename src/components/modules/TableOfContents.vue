<template lang="html">
  <div class="toc" ref="TableOfContents">
    <div v-if="flatten">
      <b-media
        :ref="`article-${article.uid}`"
        class="article flatten"
        v-for="article in articles"
        v-bind:class="{active: article.uid === selectedArticleUid}"
        v-on:click.prevent="onClick(article, page)">
        <article-item :item="article" class="p-3 clearfix"
          show-excerpt
          show-link
          show-entities
          show-size
          show-pages
          show-matches
          />
      </b-media>
    </div>
    <div v-else>
      <div v-for="page in tableOfContents.pages" class="mb-2 pb-1px page border-bottom">
        <span class="p-3 d-block text-bold pagenumber">{{$t('page')}} {{page.num}}</span>
          <b-media
            :ref="`article-${article.uid}`"
            class="article"
            v-for="article in page.articles"
            v-bind:class="{active: article.uid === selectedArticleUid}"
            v-on:click.prevent="onClick(article, page)">
            <article-item :item="article" class="p-3 clearfix"
              show-excerpt
              show-link
              show-entities
              show-size
              show-pages
              />
            <!--
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

            <span class="title"
              v-if="article.title">
              <span v-html="article.title" /> &mdash;
            </span>
            <span
              class="excerpt">{{ article.excerpt }}</span>
            <span class="badge badge-secondary mr-1 pt-1">
              <span v-if="article.size > 1200" >{{ $t('readingTime', { min: parseInt(article.size / 1200) }) }} / </span>
              {{ $tc('pp', article.nbPages, { pages: article.pages.map(d => d.num).join(',') }) }}
            </span>

            <span v-if="article.type !== 'ar'" class="badge badge-secondary mr-1 pt-1">
              {{ article.type.toUpperCase() }}
            </span>
            {{ article.isCC }}
            <div v-if="article.locations.length" class="article-locations">
              <span
                v-for="location in article.locations"
                v-bind:key="location.uid">
                {{location.name}}
                <item-selector :uid="location.uid" :item="location" type="location"/>,
              </span>

            </div>

            <div v-if="article.persons.length" class="article-persons">
              <span
                v-for="person in article.persons"
                v-bind:key="person.uid">
                {{person.name}}
                <item-selector :uid="person.uid" :item="person" type="person"/>,
              </span>
            </div>
            <div class="collapased">

              <div v-if="article.collections && article.collections.length > 0" class="article-collections mb-2">
                <b-badge
                  v-for="(collection, i) in article.collections"
                  v-bind:key="`${article.article_uid}_col${i}`"
                  variant="info"
                  class="mt-1 mr-1">
                    {{ collection.name }}
                </b-badge>
              </div>

              <collection-add-to
              class="mt-2"
                v-bind:item="article"
                v-bind:text="$t('add_to_collection')" />

              <ul v-if="article.matches.length > 0" class="article-matches mb-1">
                <li
                  v-for="(match, i) in article.matches"
                  v-bind:key="i"
                  v-html="match.fragment"
                  v-show="match.fragment.trim().length > 0" />
              </ul> -->

              <!-- <ul v-if="article.topics.length > 0" class="article-topics mb-1">
                <li
                  v-for="topic in article.topics"
                  v-bind:key="topic.topicUid">
                  {{topic.topicUid}} ({{topic.relevance}})
                </li>
              </ul> -->


<!--
            </div>

            </a> -->
          </b-media>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import ArticleItem from './lists/ArticleItem';
import CollectionAddTo from './CollectionAddTo';
import ItemSelector from './ItemSelector';

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
      default: '',
    },
    article: {
      type: Object,
      default: '',
    },
  },
  computed: {
    articleUid() {
      return this.article.uid;
    },
  },
  components: {
    CollectionAddTo,
    ItemSelector,
    ArticleItem,
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
  .article{
    h2 {
      font-size: inherit;
    }
    &.active {
      background: white;
      box-shadow: inset 6px 0px #56CCF2, inset 0px 1px 0px #343a4063;
    }
    &.active {
      background: white;
      box-shadow: inset 6px 0px gold, inset 0px 1px 0px #343a4063;
    }
  }
}

.oTableOfContents{
  .page{
    font-size: smaller;

    .article{
      &.active{
        // border-bottom: 1px solid #343a40 !important;
        background: white;
        box-shadow: inset 6px 0px #56CCF2, inset 0px 1px 0px #343a4063;

        a{
          // box-shadow: inset 1px 0px #343a40, 0px -1px #343a40, inset -1px 0px #343a40;
          background: white; // #f8f9fa;
          .collapased {
            height: auto;
            max-height: 1200px;
            overflow: visible;
            .collection-add-to {
            }
          }
        }
      }
      a{
        text-decoration: none;
        display: block;
        .collapased {
          height: 0;
          max-height: 0;
          overflow: hidden;
          transition: max-height 400ms ease-in-out;
        }
        .title{
          font-weight: bold;
        }
        .excerpt{
          color: $clr-secondary;
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
    "add_to_collection": "Add to Collection ..."
  },
  "nl": {
    "page": "Pagina",
    "no_title": "Zonder titel"
  }
}
</i18n>
