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
          <span v-if="article.size > 1200" class="badge badge-secondary mr-1 pt-1">
            {{ $t('readingTime', { min: parseInt(article.size / 1200) }) }}
          </span>
          <span v-if="article.type !== 'ar'" class="badge badge-secondary mr-1 pt-1">
            {{ article.type.toUpperCase() }}
          </span>

          <div class="collapased">

            <div v-if="article.collections && article.collections.length > 0" class="article-collections mb-2">
              <b-badge
                v-for="(collection, i) in article.collections"
                v-bind:key="i"
                variant="info"
                class="mr-1">
                <router-link
                  class="text-white"
                  v-bind:to="{name: 'collection', params: {collection_uid: collection.uid}}">
                  {{ collection.name }}
                </router-link>
                <a class="dripicons dripicons-cross" v-on:click="onRemoveCollection(collection, article)" />
              </b-badge>
            </div>

            <collection-add-to
            class="mt-2"
              v-if="isLoggedIn()"
              v-bind:item="article"
              v-bind:text="$t('add_to_collection')" />

            <ul v-if="article.matches.length > 0" class="article-matches mb-1">
              <li
                v-for="(match, i) in article.matches"
                v-bind:key="i"
                v-html="match.fragment"
                v-show="match.fragment.trim().length > 0" />
            </ul>

            <!-- <ul v-if="article.topics.length > 0" class="article-topics mb-1">
              <li
                v-for="topic in article.topics"
                v-bind:key="topic.topicUid">
                {{topic.topicUid}} ({{topic.relevance}})
              </li>
            </ul> -->

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

          </div>

          </a>
        </b-media>
    </div>
  </div>
</template>

<script>
import Issue from '@/models/Issue';
import CollectionAddTo from './CollectionAddTo';

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
  components: {
    CollectionAddTo,
  },
  methods: {
    orderedTopics(topics) {
      return topics.sort((a, b) => b.relevance - a.relevance);
    },
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
        const elmRelativeTop = elm.offsetTop - parent.offsetTop;
        if (parent.scrollTop > elmRelativeTop ||
          (elm.offsetTop + elm.offsetHeight) - parent.scrollTop >
          parent.offsetTop + parent.offsetHeight) {
          parent.scrollTo({ top: elmRelativeTop, behavior: 'smooth' });
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
        border-bottom: 1px solid #343a40 !important;
        a{
          box-shadow: inset 1px 0px #343a40, 0px -1px #343a40, inset -1px 0px #343a40;
          background: #f8f9fa;
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
    "readingTime": "{min} min read",
    "add_to_collection": "Add to Collection ..."
  },
  "nl": {
    "page": "Pagina",
    "no_title": "Zonder titel"
  }
}
</i18n>
