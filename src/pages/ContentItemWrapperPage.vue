<script setup lang="ts">
import { ContentItem } from '@/models/generated/canonical/contentItem'
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { contentItems as contentItemsService } from '@/services'
const route = useRoute()

const serviceResponse = ref<{
  data: ContentItem
  status: 'idle' | 'loading' | 'success' | 'error' | 'notfound'
}>({
  status: 'idle',
  data: null
})

const fetchContentItem = async (id: string) => {
  try {
    serviceResponse.value.status = 'loading'
    const response = await contentItemsService.get(id)
    serviceResponse.value.data = response

    if (serviceResponse.value.data == null) {
      serviceResponse.value.status = 'notfound'
      return
    }
    serviceResponse.value.status = 'success'
  } catch (e) {
    serviceResponse.value.status = 'error'
    throw e
  }
}

// Lazy-load the specific views dynamically
const AudioContentItemPageComponent = defineAsyncComponent(
  () => import('@/pages/AudioContentItemPage.vue')
)

// Determine which component to show based on the data type
const currentComponent = computed(() => {
  if (!serviceResponse.value?.data) return null

  switch (serviceResponse.value?.data.meta?.sourceMedium) {
    case 'audio':
      return AudioContentItemPageComponent
    default:
      return null
  }
})

watch(
  () => route.params.content_item_id as string,
  async (newId: string, oldId: string | undefined) => {
    // react to route changes...
    if (newId !== oldId) {
      await fetchContentItem(newId)
    }
  },
  { immediate: true }
)
</script>

<template>
  <div v-if="serviceResponse.status === 'loading'" class="loading-state">
    <p>Loading content item...</p>
  </div>

  <template v-else-if="currentComponent">
    <component :is="currentComponent" :contentItem="serviceResponse.data" />
  </template>

  <div v-else class="error-state">
    <p>Item not found or unsupported format.</p>
  </div>
</template>
