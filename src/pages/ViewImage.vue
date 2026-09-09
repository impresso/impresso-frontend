<template>
  <i-layout class="ViewImage">
    <i-layout-section width="380px">
      <template #header> </template>
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
import { images as imagesService } from '@/services'
import ImageContentItem from '@/components/images/ImageContentItem.vue'
import { useUserStore } from '@/stores/user'
import { IImage } from '@/models'
import { Routes } from '@/router/routes'

const route = useRoute()
const userStore = useUserStore()

const AvailableNestedRoutes = [
  Routes.viewImage.children.facsimile,
  Routes.viewImage.children.citeAs,
  Routes.viewImage.children.similarItems
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

watch(imageId, loadImage, { immediate: true })

onMounted(() => {
  if (imageId.value) {
    loadImage(imageId.value)
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
