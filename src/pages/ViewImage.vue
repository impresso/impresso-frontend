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
            <ImageContentItem
              v-if="image"
              :image="image"
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
        <router-view :image="image" :user-plan="userPlan"></router-view>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { images as imagesService, contentItems as contentItemService } from '@/services'
import ImageContentItem from '@/components/images/ImageContentItem.vue'
import { useUserStore } from '@/stores/user'
import { IImage } from '@/models'
import { Routes } from '@/router/routes'
import ListOfFindResponseItems from '@/components/ListOfFindResponseItems.vue'
import ContentItem from '@/components/modules/lists/ContentItem.vue'

const route = useRoute()
const userStore = useUserStore()

const AvailableNestedRoutes = [
  Routes.viewImage.children.facsimile
  // Routes.viewImage.children.citeAs,
  // Routes.viewImage.children.similarItems
] as const

const image = ref<IImage | null>(null)

const userPlan = computed(() => userStore.userPlan)
const imageId = computed(() => route.params.image_id as string)

const title = computed(() => {
  if (!image.value) return ''
  return image.value.caption || image.value.id
})

const loadImage = async (id: string) => {
  if (id) {
    try {
      image.value = (await imagesService.get(id)) as IImage
      console.log('Loaded image:', image.value)
    } catch (error) {
      console.error('Failed to load image:', error)
    }
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

onMounted(async () => {
  if (imageId.value) {
    await loadImage(imageId.value)
    // imagesService
    //   .find({
    //     query: {
    //       filters: [
    //         {
    //           type: 'issue',
    //           q: [image.value?.issueId]
    //         },
    //         {
    //           type: 'pageNumber',
    //           q: image.value?.pageNumbers.map((pageNum: number) => String(pageNum))
    //         }
    //       ]
    //     }
    //   })
    //   .then(response => {
    //     console.log('Image find response:', response)
    //   })
    //   .catch(error => {
    //     console.error('Error fetching image:', error)
    //   })
  }
})
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
