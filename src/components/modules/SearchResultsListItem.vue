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
          :scale="1"
          fit-to-regions
          :regions="computedRegionsInArticleFirstPage"
        />
      </div>
      <div
        v-else
        class="error rounded bg-light border p-4 d-flex align-items-center justify-content-center"
      >
        {{ $t('login_message') }}
      </div>
    </div>
    <div class="media-body">
      <div class="d-flex">
        <div class="list-item-details me-3 mr-3">
          <!-- if article -->
          <ContentItem
            :item="contentItem"
            show-meta
            showSnippet
            show-semantic-enrichments
            show-matches
            show-link
            class="mb-2"
          />

          <div v-if="contentItemCollections.length > 0" class="d-flex flex-wrap align-items-center">
            <div class="badge badge-light my-1 mr-1 very-small-caps">collections</div>

            <b-badge
              v-for="(collection, i) in contentItemCollections"
              v-bind:key="i"
              variant="info"
              class="m-1 font-size-inherit"
            >
              <router-link
                v-bind:to="{ name: 'collection', params: { collection_uid: collection.uid } }"
                title="View collection"
              >
                {{ collection.name }}
              </router-link>

              <a
                class="ml-1 dripicons dripicons-cross text-decoration-none"
                title="Remove from collection"
                v-on:click="onRemoveCollection(collection.uid)"
              />
            </b-badge>
          </div>

          <!-- <router-link :to="computedArticleRouterLink" class="btn btn-sm btn-outline-primary mr-1">
            {{ $t('view') }}
          </router-link> -->

          <slot name="secondary-action">
            <div class="my-2">
              <CollectionAddTo
                right
                @change="onCollectionsAddToChangeHandler"
                :items="ciAsCollectableItems"
                :text="$t('add_to_collection')"
              />
            </div>
          </slot>

          <ContentItemAccess :item="contentItem" class="mr-3" />

          <div
            v-if="contentItem.access?.copyright === 'pbl'"
            class="shareArticleControl d-inline ml-1"
          >
            <b-button
              variant="outline-success"
              size="sm"
              v-on:click="showShareContentItemModal()"
              :title="$t('actions.share')"
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
      <ShareContentItemModal
        :isVisible="showModalShare"
        :item="contentItem"
        @dismiss="hideShareContentItemModal"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { mapStores } from 'pinia'
import CollectionAddTo from './CollectionAddTo.vue'
import IIIFFragment from '../IIIFFragment.vue'
import { useCollectionsStore } from '@/stores/collections'
import { useUserStore } from '@/stores/user'
import { useNotificationsStore } from '@/stores/notifications'
import { defineComponent, PropType } from 'vue'
import { ContentItem as ContentItemSchema } from '@/models/generated/schemas/contentItem'
import Article from '@/models/Article'
import ContentItemAccess from '../ContentItemAccess.vue'
import { ItemWithCollections } from './CollectionAddToList.vue'
import Collection from '@/models/Collection'
import ContentItem from './lists/ContentItem.vue'
import ShareContentItemModal from '../modals/ShareContentItemModal.vue'

const RegionOverlayClass = 'overlay-region selected'
const MatchOverlayClass = 'overlay-match'

export interface IData {
  showModalShare: boolean
  coordsFromArticleRegion?: { x: number; y: number; w: number; h: number } | null
  collections: Collection[]
}

export default defineComponent({
  data(): IData {
    return {
      showModalShare: false,
      coordsFromArticleRegion: undefined,
      collections: []
    } satisfies IData
  },
  props: {
    modelValue: {
      type: Object as PropType<ContentItemSchema>
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
  emits: ['toggleSelected', 'click'],
  computed: {
    ...mapStores(useCollectionsStore, useUserStore, useNotificationsStore),
    contentItem(): ContentItemSchema {
      return this.modelValue
    },
    contentItemCollections(): Collection[] {
      const collections = this.contentItem.semanticEnrichments?.collections || []
      return collections.map(
        (c: any) =>
          new Collection({
            ...c,
            name: c.title || (c as any)?.name,
            uid: c.uid
          })
      )
    },
    article() {
      return Article.fromContentItem(this.contentItem)
    },
    ciAsCollectableItems() {
      return [
        {
          itemId: this.contentItem.id,
          collectionIds: this.contentItem.semanticEnrichments?.collections?.map(c => c.uid)
        }
      ] as ItemWithCollections[]
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
    onCollectionsAddToChangeHandler(payload: {
      items: ItemWithCollections[]
      collection: Collection
    }) {
      console.info('[SearchResultsListItem] onCollectionsAddToChangeHandler', payload)
      const currentContentItem = this.modelValue
      const currentContentItemId = currentContentItem?.id
      if (!currentContentItemId) return
      const updatedItem = payload.items.find(i => i.itemId === currentContentItemId)
      if (!updatedItem || !updatedItem.collectionIds) return

      if (updatedItem.added) {
        this.modelValue.semanticEnrichments.collections = [
          ...(this.modelValue?.semanticEnrichments?.collections ?? []),
          payload.collection as any
        ]
      } else if (updatedItem.removed) {
        this.modelValue.semanticEnrichments.collections =
          this.modelValue?.semanticEnrichments?.collections?.filter(
            c => c.uid !== payload.collection.uid
          ) ?? []
      }
    },
    async onRemoveCollection(collectionId: string) {
      const item = this.modelValue
      const itemId = item?.id
      const collections = item?.semanticEnrichments?.collections ?? []
      const collection = collections.find(c => c.uid === collectionId)

      if (!itemId || !collection) return
      await this.collectionsStore.removeCollectionItem({
        item: { uid: itemId },
        collection: { uid: collectionId }
      })
      this.notificationsStore.addNotification({
        type: 'info',
        title: 'Collection',
        message: `Removed from collection "${collection.title || (collection as any)?.name}"`
      })
      if (this.modelValue?.semanticEnrichments?.collections) {
        this.modelValue.semanticEnrichments.collections =
          this.modelValue.semanticEnrichments.collections.filter(c => c.uid !== collectionId)
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
    showShareContentItemModal() {
      this.showModalShare = true
    },
    hideShareContentItemModal() {
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
    IIIFFragment,
    ContentItemAccess,
    ContentItem,
    ShareContentItemModal
  }
})
</script>

<style lang="css">
.SearchResultListItem .list-item-details {
  max-width: 800px;
}

.SearchResultListItem .thumbnail {
  width: 250px;
  height: 240px;
  position: relative;
  cursor: move;
}

.SearchResultListItem .error {
  width: 250px;
  height: 240px;
  position: relative;
  text-align: center;
}

.SearchResultListItem h2 {
  font-size: inherit;
}

.SearchResultListItem .article-collections .badge {
  font-size: inherit;
}
.SearchResultListItem .ContentItem h2 {
  font-weight: var(--impresso-wght-bold);
  font-variation-settings: 'wght' var(--impresso-wght-bold);
}
</style>

<i18n lang="json">
{
  "en": {
    "view": "View",
    "add_to_collection": "Save to Collection ...",
    "login_message": "You need to be signed in to view this image"
  }
}
</i18n>
