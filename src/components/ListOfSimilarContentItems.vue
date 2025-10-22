<template>
  <div
    class="ListOfSimilarContentItems"
    :style="{
      minHeight: `${minHeight}px`
    }"
  >
    <LazyObserver @onIntersect="fetchSimilarItems" />
    <slot v-bind:items="similarItems"></slot>
    <LoadingBlock
      class="w-100"
      v-if="!error && (isLoading || !isObserved)"
      :label="$t(isLoading ? 'actions.loading' : 'actions.idle')"
      :height="minHeight"
    />
    <FeathersErrorManager
      class="w-100"
      :style="{
        height: 'min-content'
      }"
      v-if="error"
      :error="error"
      :defaultLabel="$t('fetchingSimilarContentItems.errorLabel')"
    />
  </div>
</template>
<i18n lang="json">
{
  "en": {
    "fetchingSimilarContentItems": {
      "errorLabel": "Error fetching similar content items. Please try again later. Received: "
    }
  }
}
</i18n>
<style>
.ListOfSimilarContentItems .ContentItem h2 {
  font-size: inherit;
  font-weight: var(--impresso-wght-bold);
  font-variation-settings: 'wght' var(--impresso-wght-bold);
}
</style>
<script lang="ts" setup>
import { contentItems as ContentItemsService } from '@/services'
import type { ContentItem as ContentItemType } from '@/models/generated/schemas/contentItem'
import LazyObserver from './LazyObserver.vue'
import { ref, watch } from 'vue'
import LoadingBlock from './LoadingBlock.vue'
import FeathersErrorManager from './FeathersErrorManager.vue'

export interface ListOfSimilarContentItemsProps {
  contentItem: ContentItemType
  minHeight?: number
}
const props = withDefaults(defineProps<ListOfSimilarContentItemsProps>(), {
  minHeight: 150
})
const similarItems = ref<ContentItemType[]>([])
const isObserved = ref(false)
const isLoading = ref(false)
const error = ref<Error | null>(null)

const fetchSimilarItems = async () => {
  if (isObserved.value) return
  isObserved.value = true
  // Logic to fetch similar content items goes here
  console.log('Fetching similar content items for:', props.contentItem.id)
  isLoading.value = true
  const embedding: string = await ContentItemsService.get(props.contentItem.id, {
    query: {
      include_embeddings: true
    }
  }).then(data => {
    console.info('Fetched similar content items:', data)
    return data.semanticEnrichments?.embeddings?.[0] || ('' as string)
  })

  if (!embedding) {
    isLoading.value = false
    error.value = new Error('No embeddings found for the content item.')
    console.warn('No embeddings found for content item:', props.contentItem.id)
    return
  }
  // if you're here, you can call your similarity search service!
  similarItems.value = await ContentItemsService.find({
    query: {
      filters: [
        {
          type: 'embedding',
          q: embedding
        }
      ],
      limit: 12
    }
  })
    .then(res => {
      return res.data
    })
    .catch(err => {
      error.value = err
      console.error('Error fetching similar content items:', err)
      return []
    })

  isLoading.value = false
}

watch(
  () => props.contentItem.id,
  async () => {
    // Reset state when content item changes, wait for the next intersection to fetch new items
    similarItems.value = []
    isLoading.value = false
    error.value = null
    if (isObserved.value) {
      isObserved.value = false
      await fetchSimilarItems()
    }
  }
)
</script>
