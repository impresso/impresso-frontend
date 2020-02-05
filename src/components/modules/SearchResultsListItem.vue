<template lang="html">
  <b-media class="py-3 border-bottom overflow-hidden">
    <div
      v-if="isAvailable()"
      class="thumbnail bg-light border"
      slot="aside" >
      <open-seadragon-viewer
        v-bind:handler="handler">
      </open-seadragon-viewer>
    </div>
    <div
      v-else
      class="error bg-light border"
      slot="aside" >
      <p class="message">{{$t('login_message')}}</p>
    </div>
    <div class="d-flex">
      <div class="list-item-details">
        <!-- if article -->
        <article-item :item="article" show-meta show-excerpt show-entities show-matches show-link class="mb-2" />
        <b-badge
          class="mb-2"
          pill
          v-for="tag in article.tags"
          variant="secondary"
          v-bind:key="tag.uid">{{tag.name}}</b-badge>
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

        <router-link :to="{ name: 'article', params: {
          issue_uid: article.issue.uid,
          page_uid: article.pages[0].uid,
          article_uid: article.uid,
        } }" class="btn btn-sm btn-outline-primary mr-1">
          {{$t('view')}}
        </router-link>

        <collection-add-to
          v-bind:item="article"
          v-bind:text="$t('add_to_collection')" />
      </div>
      <div v-if="isAvailable() && checkbox" class="ml-auto pl-2">
        <b-checkbox
          class="mr-0 select-item"
          v-bind:checked="checked"
          v-on:change="toggleSelected" />
      </div>
    </div>

  </b-media>
</template>

<script>
import Vue from 'vue';
import OpenSeadragonViewer from './OpenSeadragonViewer';
import CollectionAddTo from './CollectionAddTo';
import ArticleItem from './lists/ArticleItem';

export default {
  data: () => ({
    handler: new Vue(),
  }),
  model: {
    prop: 'article',
  },
  props: ['article', 'checkbox', 'checked'],
  methods: {
    onRemoveCollection(collection, item) {
      const idx = item.collections.findIndex(c => (c.uid === collection.uid));
      if (idx !== -1) {
        this.$store.dispatch('collections/REMOVE_COLLECTION_ITEM', {
          collection,
          item,
        }).then(() => {
          item.collections.splice(idx, 1);
          // this.$forceUpdate();
        });
      }
    },
    toggleSelected() {
      this.$emit('toggleSelected');
    },
    click() {
      this.$emit('click');
    },
    init() {
      const options = {
        tileSources: [this.article.pages[0].iiif],
        showNavigator: true,
        navigatorAutoFade: false,
        navigatorBackground: '#f8f9fa',
        navigatorBottom: 0,
        navigatorRight: 0,
        navigatorSizeRatio: 0.25,
        navigatorDisplayRegionColor: 'black',
        navigatorBorderColor: '#dee2e6',
        navigatorOpacity: 1,
      };

      this.handler.$emit('init', options);
    },
    isAvailable() {
      if (this.article.issue.accessRights === 'OpenPublic') {
        return true;
      }
      return this.$store.state.user.userData;
    },
  },
  components: {
    OpenSeadragonViewer,
    CollectionAddTo,
    ArticleItem,
  },
  mounted() {
    this.init();

    this.handler.$on('tile-loaded', () => {
      if (this.article.isCC) {
        this.article.regions.forEach((region) => {
          if (region.pageUid === this.article.pages[0].uid) {
            if (region.coords.x) region.coords[0] = region.coords.x;
            if (region.coords.y) region.coords[1] = region.coords.y;
            if (region.coords.w) region.coords[2] = region.coords.w;
            if (region.coords.h) region.coords[3] = region.coords.h;
            const overlay = {
              x: region.coords[0],
              y: region.coords[1],
              w: region.coords[2],
              h: region.coords[3],
              class: 'overlay-region selected',
            };

            this.handler.$emit('add-overlay', overlay);
          }
        });

        this.article.matches.forEach((match) => {
          if (match.pageUid === this.article.pages[0].uid) {
            const overlay = {
              x: match.coords[0],
              y: match.coords[1],
              w: match.coords[2],
              h: match.coords[3],
              class: 'overlay-match',
            };

            this.handler.$emit('add-overlay', overlay);
          }
        });

        this.handler.$emit('fit-bounds-to-overlays');
      }
    });
  },
  watch: {
    article: {
      handler() {
        this.handler.$emit('destroy');
        this.init();
      },
    },
  },
};
</script>

<style lang="scss">
@import "impresso-theme/src/scss/variables.sass";

.thumbnail {
    width: 215px;
    height: 240px;
    position: relative;
    cursor: move;
}
.error {
    width: 215px;
    height: 240px;
    position: relative;
    text-align: center;
    .message{
      margin-top: 114px;
    }
}
h2 {
  font-size: 1.2em;
  font-weight: 500;
  a {
    text-decoration: underline;
    text-decoration-color:#ccc;
    &:hover {
      text-decoration-color: transparent;
    }
  }
}
.article-matches,
.article-meta,
.article-excerpt {
  font-size: 0.9em;
}
ul.article-matches {
  list-style: none;
  padding: 0;
  li {
    border-left: 2px solid black;
    margin: 1em 0;
    padding-left: 1em;
  }
}
</style>

<i18n>
{
  "en": {
    "view": "View",
    "add_to_collection": "Add to Collection ...",
    "login_message": "Login to view image"
  }
}
</i18n>
