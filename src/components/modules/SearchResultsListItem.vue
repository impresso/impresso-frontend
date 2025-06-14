<template>
  <div
    class="media py-3 border-bottom search-result-list-item SearchResultListItem"
    data-testid="search-results-list-item"
  >
    <div class="media-aside align-self-start overflow-hidden">
      <div v-if="isAvailable()" class="thumbnail">
        <IIIFFragment
          @selected="goToArticle"
          v-if="article?.pages?.length"
          :iiif="article.pages[0].iiif"
          size="!496,480"
          :scale="0.5"
          fit-to-regions
          :regions="computedRegionsInArticleFirstPage"
        />
      </div>
      <div v-else class="error bg-light border">
        <p class="message">{{ $t('login_message') }}</p>
      </div>
    </div>
    <div class="media-body">
      <div class="d-flex">
        <div class="list-item-details me-3 mr-3">
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

          <!-- <router-link :to="computedArticleRouterLink" class="btn btn-sm btn-outline-primary mr-1">
            {{ $t('view') }}
          </router-link> -->

          <slot name="secondary-action">
            <collection-add-to v-bind:item="article" v-bind:text="$t('add_to_collection')" />
          </slot>

          <div
            v-if="article.accessRight === 'OpenPublic'"
            class="shareArticleControl d-inline ml-1"
          >
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
        <div v-if="showContext && computedRegionsInArticleFirstPage">
          <IIIFFragment
            @click="goToArticle"
            :iiif="article.pages[0].iiif"
            size="!248,240"
            :regions="computedRegionsInArticleFirstPage"
          />
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
    </div>
  </div>
</template>

<script lang="ts">
import { mapStores } from 'pinia'
import CollectionAddTo from './CollectionAddTo.vue'
import ArticleItem from './lists/ArticleItem.vue'
import CopyToClipboard from '../modals/CopyToClipboard.vue'
import IIIFFragment from '../IIIFFragment.vue'
import { useCollectionsStore } from '@/stores/collections'
import { useUserStore } from '@/stores/user'
import { defineComponent, PropType } from 'vue'
import { ContentItem } from '@/models/generated/schemas/contentItem'
import Article from '@/models/Article'

const RegionOverlayClass = 'overlay-region selected'
const MatchOverlayClass = 'overlay-match'

export interface IData {
  showModalShare: boolean
  coordsFromArticleRegion?: { x: number; y: number; w: number; h: number } | null
}

export default defineComponent({
  data(): IData {
    return {
      showModalShare: false,
      coordsFromArticleRegion: undefined
    } satisfies IData
  },
  props: {
    modelValue: {
      type: Object as PropType<ContentItem>
      // default: () => ({})
    },
    checkbox: {
      type: Boolean,
      default: false
    },
    checked: {
      type: Boolean,
      default: false
    },
    showContext: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapStores(useCollectionsStore, useUserStore),
    contentItem(): ContentItem {
      return this.modelValue
    },
    article() {
      return Article.fromContentItem(this.contentItem)
    },
    pageViewerOptions() {
      return {
        tileSources: [this.article?.pages[0]?.iiif],
        showNavigator: true,
        navigatorAutoFade: false,
        navigatorBackground: '#f8f9fa',
        navigatorBottom: 0,
        navigatorRight: 0,
        navigatorSizeRatio: 0.25,
        navigatorDisplayRegionColor: 'black',
        navigatorBorderColor: '#dee2e6',
        navigatorOpacity: 1
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
    computedRegionsInArticleFirstPage() {
      if (this.article.pages.length > 0 && this.article.regions.length > 0) {
        return this.article.regions.filter(({ pageUid }) => pageUid === this.article.pages[0].uid)
      }
      console.warn('[SearchResultsListItem] No regions found for article', this.article)
      return []
    },
    computedArticleRouterLink() {
      if (this.article.pages.length === 0) {
        return {
          name: 'issue',
          params: {
            issue_uid: this.article.issue.uid
          }
        }
      }
      return {
        name: 'article',
        params: {
          issue_uid: this.article.issue.uid,
          page_uid: this.article.pages.length > 0 ? this.article.pages[0].uid : undefined,
          article_uid: this.article.uid
        }
      }
    }
  },
  methods: {
    onRemoveCollection(collection, item) {
      const idx = item.collections.findIndex(c => c.uid === collection.uid)
      if (idx !== -1) {
        this.collectionsStore
          .removeCollectionItem({
            collection,
            item
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
      return this.userStore.userData
    },
    showModalShareArticle() {
      this.showModalShare = true
    },
    hideModalShareArticle() {
      this.showModalShare = false
    },
    goToArticle() {
      this.$router.push(this.computedArticleRouterLink)
    },
    getCoordsFromArticleRegions() {
      let x0 = Infinity
      let x1 = 0
      let y0 = Infinity
      let y1 = 0

      this.article.regions.forEach(d => {
        if (d.coords.x < x0) {
          x0 = d.coords.x
        }
        if (d.coords.y < y0) {
          y0 = d.coords.y
        }
        if (d.coords.x + d.coords.w > x1) {
          x1 = d.coords.x + d.coords.w
        }
        if (d.coords.y + d.coords.h > y1) {
          y1 = d.coords.y + d.coords.h
        }
      })
      return {
        x: x0,
        y: y0,
        w: x1 - x0,
        h: y1 - y0
      }
    }
  },
  mounted() {
    if (this.article?.pages?.length > 0 && this.article?.regions?.length > 0) {
      this.coordsFromArticleRegion = this.getCoordsFromArticleRegions()
    }
  },
  components: {
    CollectionAddTo,
    ArticleItem,
    CopyToClipboard,
    IIIFFragment
  }
})
</script>

<style lang="scss">
.SearchResultListItem .list-item-details {
  max-width: 800px;
}

.SearchResultListItem {
  .thumbnail {
    width: 250px;
    height: 240px;
    position: relative;
    cursor: move;
  }

  .error {
    width: 250px;
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

    a {
      text-decoration: underline;

      // text-decoration-color:#ccc;
      &:hover {
        text-decoration-color: transparent;
      }
    }
  }

  .article-collections .badge {
    font-size: inherit;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "view": "View",
    "add_to_collection": "Save to Collection ...",
    "login_message": "Login to view image",
    "share_article": "Share ..."
  }
}
</i18n>
