<template>
  <i-layout class="ViewImage">
    <i-layout-section width="380px">
      <template #header>
        <ul class="nav nav-pills mx-2 mt-2">
          <li class="nav-item active">
            <router-link
              :to="{
                name: Routes.viewImage.children.facsimile.name,
                params: { image_id: imageId }
              }"
              exact-active-class="active"
              active-class=""
              class="nav-link"
            >
              Other images, same page
            </router-link>
          </li>
        </ul>
      </template>

      <ListOfFindResponseItems
        v-if="image"
        :service="imagesService"
        :params="listParams"
        :list-is-empty-message="$t('no images')"
        :error-loading-items-message="$t('error loading images')"
        items-class="p-0"
      >
        <template #header="{ total, isLoading }">
          <div class="my-3 mx-3">
            <span
              v-html="isLoading ? $t('loading') : $t('numbers.contentItems', { n: total }, total)"
            />
          </div>
        </template>
        <template #default="{ items, isSuccess }">
          <div>
            <div
              v-for="item in items"
              :key="item.id"
              class="m-3 p-2 rounded-md border shadow-sm mb-4"
              :class="{ 'border-dark': item.id === image.id }"
            >
              <ImageContentItem showLink showPreview showImageTypes showIcon :image="item" />
            </div>
          </div>
        </template>
      </ListOfFindResponseItems>
    </i-layout-section>

    <i-layout-section main>
      <template #header>
        <b-navbar class="py-3 d-block container ml-0">
          <section class="py-1">
            <div class="label small-caps">Image</div>
            <h3 class="mb-1">{{ title }}</h3>
            <h4 v-if="contentItem" class="font-size-inherit">
              {{ $t('attached to content item') }}
              <router-link
                :to="{ name: Routes.contentItem.name, params: { content_item_id: contentItem.id } }"
                class="text-decoration-underline"
              >
                {{ attachedContentItemTitle }}
              </router-link>
            </h4>
            <ImageContentItem
              v-if="image"
              :image="image"
              :content-item="contentItem"
              :show-title="false"
              :show-icon="false"
              showContentItemAccess
              showImageTypes
              showId
            />
          </section>
        </b-navbar>
        <b-navbar-nav class="container ml-0 pb-2">
          <b-tabs pills class="border-0">
            <template v-slot:tabs-end>
              <li
                class="nav-item px-3"
                v-for="nestedRoute in AvailableNestedRoutes"
                :key="nestedRoute.name"
              >
                <router-link
                  :to="{ name: nestedRoute.name, params: { image_id: imageId } }"
                  exact-active-class="active"
                  active-class=""
                  :active="route.name === nestedRoute.name"
                  class="nav-link"
                >
                  <span>{{ $t('routes.' + nestedRoute.name) }}</span>
                </router-link>
              </li>
            </template>
          </b-tabs>
        </b-navbar-nav>
      </template>

      <div class="container ml-0 py-4 pr-5">
        <router-view :image="image" :user-plan="userPlan" :content-item="contentItem" :content-item-regions="contentItemRegions"></router-view>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { images as imagesService, contentItems as contentItemService } from '@/services'
import ImageContentItem from '@/components/images/ImageContentItem.vue'
import { useUserStore } from '@/stores/user'
import { IImage } from '@/models'
import { Routes } from '@/router/routes'
import ListOfFindResponseItems from '@/components/ListOfFindResponseItems.vue'
import type { ContentItem as ContentItemType } from '@/models/generated/canonical/contentItem'

const route = useRoute()
const userStore = useUserStore()

const AvailableNestedRoutes = [
  Routes.viewImage.children.facsimile
  // Routes.viewImage.children.citeAs,
  // Routes.viewImage.children.similarItems
] as const

const image = ref<IImage | null>(null)
const contentItem = ref<ContentItemType | null>(null)

const userPlan = computed(() => userStore.userPlan)
const imageId = computed(() => route.params.image_id as string)

const title = computed(() => {
  if (!image.value) return ''
  return image.value.caption || image.value.id
})

const attachedContentItemTitle = computed(() => {
  if (!contentItem.value) return ''
  const t = contentItem.value.text.title || contentItem.value.text.snippet || contentItem.value.id
  // limit the title to 100 characters and add ellipsis if it's longer
  return t.length > 100 ? t.substring(0, 100) + '...' : t
})

const contentItemRegions = computed(() => {
  const pages = contentItem.value?.facsimile?.pages
  if (!pages) return []

  const matchingPages = pages.filter(
    page => image.value?.pageNumbers?.includes(page.number ?? -1) ?? false
  )

  return matchingPages
    .flatMap(page => page.regionCoordinates ?? [])
    .map((coords, idx) => ({
      id: `ci-${idx}`,
      coords: { x: coords[0], y: coords[1], w: coords[2], h: coords[3] }
    }))
})

const loadImage = async (id: string) => {
  image.value = null
  contentItem.value = null

  if (!id) return

  try {
    const loadedImage = (await imagesService.get(id)) as IImage
    image.value = loadedImage

    if (loadedImage.contentItemId) {
      contentItem.value = await contentItemService.get(loadedImage.contentItemId)
    }
  } catch (error) {
    console.error('Failed to load image or content item:', error)
  }
}

/**
 * Get page identifier from image identifier and page number
 */
const pageIds = computed<string[]>(() => {
  if (!image.value) return null
  const match = image.value.id.match(/^(.*?)-i(\d+)?$/)
  if (!match) return null

  const [, baseId] = match

  return image.value.pageNumbers.map((pageNum: number) => {
    return `${baseId}-p${String(pageNum).padStart(4, '0')}`
  })
})

const listParams = computed(() => {
  if (!Array.isArray(image.value?.pageNumbers) || pageIds.value.length === 0)
    return {
      query: {
        filters: [
          {
            type: 'issue',
            q: [image.value?.issueId]
          }
        ]
      }
    }
  return {
    query: {
      filters: [
        {
          type: 'issue',
          q: [image.value?.issueId]
        },
        {
          type: 'pageNumber',
          q: image.value?.pageNumbers.map((pageNum: number) => String(pageNum))
        }
      ]
    }
  }
})

watch(imageId, loadImage, { immediate: true })
</script>

<i18n lang="json">
{
  "en": {
    "routes": {
      "viewImageFacsimile": "Facsimile",
      "viewImageCiteAs": "Cite As",
      "viewImageSimilarItems": "Similar Items"
    }
  }
}
</i18n>

<style lang="scss" scoped>
.view-image {
  padding: 1rem;
}
</style>
