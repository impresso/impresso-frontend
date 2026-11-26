<template>
  <i-layout class="ContentItemPage">
    <i-layout-section width="380px">
      <template #header>
        <ul class="nav nav-pills mx-2 mt-2">
          <li class="nav-item">
            <router-link
              :to="{
                name: Routes.contentItem.name,
                params: { content_item_id: route.params.content_item_id }
              }"
              active-class=""
              exact-active-class=""
              class="nav-link"
              :class="{ active: listType === 'contentItems' }"
            >
              {{ $t('inPrintSameDay') }}
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              :to="{
                name: Routes.contentItem.name,
                params: { content_item_id: route.params.content_item_id },
                query: { ...route.query, list: 'images' }
              }"
              active-class=""
              exact-active-class=""
              class="nav-link"
              :class="{ active: listType === 'images' }"
            >
              {{ $t('images') }}
            </router-link>
          </li>
        </ul>
      </template>

      <ListOfFindResponseItems
        v-if="showSidebar && contentItem"
        :key="listType"
        :service="listService"
        :params="listParams"
        :order-by="listType === 'images' ? undefined : '-readingOrder'"
        :list-is-empty-message="listType === 'images' ? $t('noImages') : $t('noContentItems')"
        :error-loading-items-message="
          listType === 'images' ? $t('errorLoadingImages') : $t('errorLoadingContentItems')
        "
        items-class="p-0"
        @items-rendered="scrollSidebarSelectedItemIntoView"
      >
        <template #header="{ total, isLoading }">
          <div class="my-3 mx-3">
            <SearchResultsSummary
              :is-loading="isLoading"
              :groupBy="listType === 'images' ? 'images' : 'articles'"
              :totalRows="total"
              :searchQuery="{ filters: sidebarFiltersWithItems }"
            />
          </div>
        </template>
        <template #default="{ items }">
          <div v-if="listType === 'images'" ref="sidebarItemsContainerRef">
            <div
              v-for="item in items"
              :key="item.id"
              :data-content-item-id="item.contentItemId"
              class="m-3 p-2 rounded-md border shadow-sm mb-4"
              :class="{ 'border-dark': item.contentItemId === contentItem.id }"
            >
              <ImageContentItem
                :showMediaSource="false"
                :showLink="true"
                :showPreview="true"
                :showImageTypes="true"
                :showIcon="true"
                :image="item"
              />
            </div>
          </div>
          <div v-else ref="sidebarItemsContainerRef">
            <ContentItem
              v-for="item in items"
              :key="item.id"
              :data-content-item-id="item.id"
              :contentItem="item"
              class="m-3 p-2 rounded-md border shadow-sm mb-4"
              :class="{ 'border-dark': item.id === contentItem.id }"
              :showDate="item.id !== contentItem.id"
              showLink
              showIcon
              :showMeta="item.id !== contentItem.id"
              :showSnippet="item.id !== contentItem.id"
              :showType="item.id !== contentItem.id"
            />
          </div>
        </template>
      </ListOfFindResponseItems>
    </i-layout-section>

    <i-layout-section main>
      <template v-slot:header>
        <b-navbar class="py-3 d-block container ml-0">
          <section class="py-1">
            <div class="label small-caps">{{ $t('contentItem') }}</div>
            <h3 class="mb-1">{{ title }}</h3>
            <ContentItem
              v-if="contentItem"
              :content-item="contentItem"
              :showTopics="false"
              :showTitle="false"
              show-content-item-access
              showDate
              showId
              showMediaSource
              showOcrQuality
              showProvider
              showSpecs
              showType
              enableShare
              enableAddToCollection
            />
          </section>
        </b-navbar>
        <div class="container ml-0 pb-2">
          <div class="d-flex align-items-center justify-content-between w-100">
            <ul class="nav nav-pills border-0">
              <li
                class="nav-item px-3"
                v-for="nestedRoute in AvailableNestedRoutes"
                :key="nestedRoute.name"
              >
                <router-link
                  :to="{ name: nestedRoute.name }"
                  exact-active-class="active"
                  active-class=""
                  :active="route.name === nestedRoute.name"
                  class="nav-link"
                >
                  <span>{{ $t('routes.' + nestedRoute.name) }}</span>
                </router-link>
              </li>
            </ul>
            <div class="d-flex align-items-center flex-wrap gap-2">
              <div>
                <AddContentItemToSearchButton
                  v-if="contentItem"
                  :content-item-id="contentItem.id"
                />
              </div>
              <router-link
                :to="issueLink"
                class="btn btn-sm btn-outline-secondary"
                v-if="issueLink"
              >
                <span>{{ $t('actions.viewInIssue') }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </template>

      <div class="container ml-0 pb-4 pr-5">
        <router-view :content-item="contentItem"></router-view>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useContentItem } from '@/composables/useContentItem'
import { useRoute } from 'vue-router'
import { Routes } from '@/router/routes'
import { contentItems as contentItemService, images as imagesService } from '@/services'
import ImageContentItem from '@/components/images/ImageContentItem.vue'
import ListOfFindResponseItems from '@/components/ListOfFindResponseItems.vue'
import FilterFactory from '@/models/FilterFactory'
import AddContentItemToSearchButton from '@/components/contentItem/AddContentItemToSearchButton.vue'
import ContentItem from '@/components/modules/lists/ContentItem.vue'
import { Filter } from '@/models'
import SearchResultsSummary from '@/components/modules/SearchResultsSummary.vue'
import { filtersItems as filterItemsService } from '@/services'
import { joinFiltersWithItems, serializeFilters } from '@/logic/filters'
import { getShortArticleId } from '@/logic/ids'
import { CommonQueryParameters } from '@/router/util'

const route = useRoute()

export interface ContentItemPageProps {
  showSidebar?: boolean
}

const props = withDefaults(defineProps<ContentItemPageProps>(), {
  showSidebar: true
})

const AvailableNestedRoutes = [
  Routes.contentItem.children.transcript,
  Routes.contentItem.children.citeAs
  // Routes.contentItem.children.similarItems
] as const

const { contentItem, fetchContentItem } = useContentItem()

const listType = computed<'contentItems' | 'images'>(() =>
  route.query.list === 'images' ? 'images' : 'contentItems'
)

const listService = computed(() =>
  listType.value === 'images' ? imagesService : contentItemService
)

const sidebarItemsContainerRef = ref<HTMLElement | null>(null)

const title = computed(() => {
  if (!contentItem.value) return ''
  return contentItem.value.text.title || contentItem.value.id
})

const sidebarFilters = computed<Filter[]>(() => {
  if (!contentItem.value?.meta?.date || !contentItem.value?.meta?.mediaId) {
    return []
  }

  return [
    FilterFactory.create({
      type: 'issue',
      q: contentItem.value.issueId
    })
  ]
})

const sidebarFiltersWithItems = ref<Filter[]>([])

const listParams = computed(() => ({
  query: {
    limit: 10,
    offset: 0,
    filters: [...sidebarFilters.value],
    ...(listType.value === 'images' ? {} : { order_by: 'readingOrder' })
  }
}))

/**
 * Called by ListOfFindResponseItems via @items-rendered, which fires only after
 * nextTick inside the child — meaning the DOM is guaranteed to be up to date.
 * No polling, no retries, no stale-ref risk.
 *
 * We still capture the target id at call time so that a rapid route change
 * that updates contentItem before this runs doesn't scroll to the wrong element.
 */
const scrollSidebarSelectedItemIntoView = () => {
  const targetId = contentItem.value?.id
  if (!targetId || !sidebarItemsContainerRef.value) return

  const selector = `[data-content-item-id="${targetId}"]`
  const el = sidebarItemsContainerRef.value.querySelector(selector)
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const issueLink = computed(() => {
  const item = contentItem.value
  if (!item?.issueId) return null

  return {
    name: Routes.issuePage.children.viewer.name,
    params: {
      issue_id: item.issueId
    },
    query: {
      [CommonQueryParameters.ContentItemId]: getShortArticleId(item.id),
      [CommonQueryParameters.PageNumber]: item.facsimile?.pages?.[0]?.number
    }
  }
})

watch(
  () => route.params.content_item_id as string,
  async newId => {
    if (newId) await fetchContentItem(newId)
  },
  { immediate: true }
)

watch(
  () => sidebarFilters.value,
  async newFilters => {
    if (!newFilters.length) {
      sidebarFiltersWithItems.value = []
      return
    }
    sidebarFiltersWithItems.value = await filterItemsService
      .find({ query: { filters: serializeFilters(newFilters) } })
      .then(joinFiltersWithItems)
  },
  { immediate: true }
)
</script>

<i18n lang="json">
{
  "en": {
    "contentItem": "Content Item",
    "inPrintSameDay": "Articles, same issue",
    "noEmbeddings": "No semantic embeddings available for this content item.",
    "images": "Images, same issue",
    "noImages": "No images found",
    "errorLoadingImages": "Error loading images",
    "noContentItems": "No content items found",
    "errorLoadingContentItems": "Error loading content items",
    "routes": {
      "contentItemTranscript": "Transcript",
      "contentItemCiteAs": "Cite As",
      "contentItemSimilarItems": "Similar Items"
    },
    "actions": {
      "viewInIssue": "View in issue"
    }
  }
}
</i18n>
