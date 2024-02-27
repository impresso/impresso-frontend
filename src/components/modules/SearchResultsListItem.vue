<template>
  <b-media class="py-3 border-bottom  search-result-list-item">
    <div v-if="isAvailable()" class="thumbnail" slot="aside">
      <IIIFFragment
        @click="goToArticle"
        v-if="article.pages.length > 0 && article.regions.length > 0"
        :iiif="article.pages[0].iiif"
        size=",240"
        :regions="article.regions"
      />
    </div>
    <div v-else class="error bg-light border" slot="aside">
      <p class="message">{{ $t('login_message') }}</p>
    </div>
    <div class="d-flex">
      <div class="list-item-details">
        <!-- if article -->
        <article-item
          :item="article"
          show-meta
          show-excerpt
          show-entities
          show-matches
          show-link
          class="mb-2"
        />
        <b-badge
          class="mb-2"
          pill
          v-for="tag in article.tags"
          variant="secondary"
          v-bind:key="tag.uid"
          >{{ tag.name }}</b-badge
        >
        <div
          v-if="article.collections && article.collections.length > 0"
          class="article-collections mb-2"
        >
          <b-badge
            v-for="(collection, i) in article.collections"
            v-bind:key="i"
            variant="info"
            class="mr-1"
          >
            <router-link
              class="text-white"
              v-bind:to="{ name: 'collection', params: { collection_uid: collection.uid } }"
            >
              {{ collection.name }}
            </router-link>
            <a
              class="dripicons dripicons-cross"
              v-on:click="onRemoveCollection(collection, article)"
            />
          </b-badge>
        </div>

        <router-link
          :to="{
            name: 'article',
            params: {
              issue_uid: article.issue.uid,
              page_uid: article.pages.length > 0 ? article.pages[0].uid : undefined,
              article_uid: article.uid,
            },
          }"
          class="btn btn-sm btn-outline-primary mr-1"
        >
          {{ $t('view') }}
        </router-link>

        <slot name="secondary-action">
          <collection-add-to v-bind:item="article" v-bind:text="$t('add_to_collection')" />
        </slot>

        <div v-if="article.accessRight === 'OpenPublic'" class="shareArticleControl d-inline ml-1">
          <b-button
            variant="outline-success"
            size="sm"
            v-on:click="showModalShareArticle()"
            :title="$t('share_article')"
          >
            <div class="d-flex flex-row align-items-center">
              <div class="d-flex dripicons dripicons-web mr-1" />
              <div>
                {{ $t('actions.share') }}
              </div>
            </div>
          </b-button>
        </div>
      </div>
      <div v-if="isAvailable() && checkbox" class="ml-auto pl-2">
        <b-checkbox
          class="mr-0 select-item"
          v-bind:checked="checked"
          v-on:change="toggleSelected"
        />
      </div>
    </div>

    <copy-to-clipboard :article="article" v-if="showModalShare" @closed="hideModalShareArticle" />
  </b-media>
</template>

<script>
import CollectionAddTo from './CollectionAddTo'
import ArticleItem from './lists/ArticleItem'
import LazyOpenSeadragonArticlePageViewer from './vis/LazyOpenSeadragonArticlePageViewer'
import CopyToClipboard from '../modals/CopyToClipboard'
import IIIFFragment from '../IIIFFragment.vue'

const RegionOverlayClass = 'overlay-region selected'
const MatchOverlayClass = 'overlay-match'

export default {
  data: () => ({
    showModalShare: false,
  }),
  model: {
    prop: 'article',
  },
  props: ['article', 'checkbox', 'checked'],
  computed: {
    pageViewerOptions() {
      return {
        tileSources: [this.article.pages[0]?.iiif],
        showNavigator: true,
        navigatorAutoFade: false,
        navigatorBackground: '#f8f9fa',
        navigatorBottom: 0,
        navigatorRight: 0,
        navigatorSizeRatio: 0.25,
        navigatorDisplayRegionColor: 'black',
        navigatorBorderColor: '#dee2e6',
        navigatorOpacity: 1,
      }
    },
    pageViewerOverlays() {
      if (!this.article.isCC) return
      const { uid: firstPageUid } = this.article.pages[0]

      const regionsOverlays = this.article.regions
        .filter(({ pageUid }) => pageUid === firstPageUid)
        .map(({ coords }) => {
          const { x, y, w, h } = coords
          return { x, y, w, h, class: RegionOverlayClass }
        })

      const matchesOverlays = this.article.matches
        .filter(({ pageUid }) => pageUid === firstPageUid)
        .map(({ coords }) => {
          const [x, y, w, h] = coords
          return { x, y, w, h, class: MatchOverlayClass }
        })

      return regionsOverlays.concat(matchesOverlays)
    },
  },
  methods: {
    onRemoveCollection(collection, item) {
      const idx = item.collections.findIndex(c => c.uid === collection.uid)
      if (idx !== -1) {
        this.$store
          .dispatch('collections/REMOVE_COLLECTION_ITEM', {
            collection,
            item,
          })
          .then(() => {
            item.collections.splice(idx, 1)
            // this.$forceUpdate();
          })
      }
    },
    toggleSelected() {
      this.$emit('toggleSelected')
    },
    click() {
      this.$emit('click')
    },
    isAvailable() {
      if (this.article.accessRight === 'OpenPublic') {
        return true
      }
      return this.$store.state.user.userData
    },
    showModalShareArticle() {
      this.showModalShare = true
    },
    hideModalShareArticle() {
      this.showModalShare = false
    },
    goToArticle() {
      this.$router.push({
        name: 'article',
        params: {
          issue_uid: this.article.issue.uid,
          page_uid: this.article.pages.length > 0 ? this.article.pages[0].uid : undefined,
          article_uid: this.article.uid,
        },
      })
    },
  },
  components: {
    LazyOpenSeadragonArticlePageViewer,
    CollectionAddTo,
    ArticleItem,
    CopyToClipboard,
    IIIFFragment,
  },
}
</script>

<style lang="scss">
@import 'impresso-theme/src/scss/variables.sass';
.search-result-list-item {
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
    .message {
      margin-top: 114px;
    }
  }
  h2 {
    font-size: 1.2em;
    font-weight: 500;
    font-family: 'questa', serif;
    a {
      text-decoration: underline;
      // text-decoration-color:#ccc;
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
}
</style>

<i18n>
{
  "en": {
    "view": "View",
    "add_to_collection": "Add to Collection ...",
    "login_message": "Login to view image",
    "share_article": "Share ..."
  }
}
</i18n>
