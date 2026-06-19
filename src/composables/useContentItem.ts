import { ref, computed } from 'vue'
import { ContentItem } from '@/models/generated/canonical/contentItem'
import { contentItems as contentItemsService } from '@/services'

export type ContentItemServiceResponse = {
  data: ContentItem | null
  status: 'idle' | 'loading' | 'success' | 'error' | 'notfound'
}

export function useContentItem() {
  const serviceResponse = ref<ContentItemServiceResponse>({
    status: 'idle',
    data: null
  })

  const fetchContentItem = async (id: string) => {
    console.debug(`[composables/useContentItem] Fetching content item with id: ${id}`)
    try {
      serviceResponse.value.status = 'loading'
      const response = await contentItemsService.get(id)
      serviceResponse.value.data = response
      serviceResponse.value.status = response == null ? 'notfound' : 'success'
    } catch (e) {
      serviceResponse.value.status = 'error'
      serviceResponse.value.data = null
      throw e
    } finally {
      console.debug(
        `[composables/useContentItem] Finished fetching content item with id: ${id}`,
        serviceResponse.value.data
      )
    }
  }

  return {
    // ✅ computed() keeps these reactive
    contentItem: computed(() => serviceResponse.value.data),
    isLoading: computed(() => serviceResponse.value.status === 'loading'),
    isSuccess: computed(() => serviceResponse.value.status === 'success'),
    isError: computed(() => serviceResponse.value.status === 'error'),
    isNotFound: computed(() => serviceResponse.value.status === 'notfound'),
    serviceResponse,
    fetchContentItem
  }
}
