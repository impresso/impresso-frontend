<template>
  <div class="view-image">
    <SearchResultsImageItem
      v-if="image"
      :item="image"
      :enable-checkbox="false"
      :enable-similar-to="false"
      :userPlan="userPlan"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { images as imagesService } from '@/services'
import SearchResultsImageItem from '@/components/modules/SearchResultsImageItem.vue'
import { useUserStore } from '@/stores/user'
import { IImage } from '@/models'

const route = useRoute()
const userStore = useUserStore()

const image = ref<IImage | null>(null)

const userPlan = computed(() => userStore.userPlan)
const imageUid = computed(() => route.params.image_uid as string)

const loadImage = async (uid: string) => {
  if (uid) {
    try {
      image.value = (await imagesService.get(uid)) as IImage
      console.log('Loaded image:', image.value)
    } catch (error) {
      console.error('Failed to load image:', error)
    }
  }
}

watch(imageUid, loadImage, { immediate: true })

onMounted(() => {
  if (imageUid.value) {
    loadImage(imageUid.value)
  }
})
</script>

<style lang="scss" scoped>
.view-image {
  padding: 1rem;
}
</style>
