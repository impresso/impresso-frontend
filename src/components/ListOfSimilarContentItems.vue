<template>
  <div
    :style="{
      minHeight: `${minHeight}px`
    }"
  >
    <LazyObserver @onIntersect="fetchSimilarItems" />
    <ContentItem v-for="item in similarItems" :key="item.id" :item="item" />
    <LoadingBlock
      v-if="isLoading || !isFetched"
      :label="$t(isLoading ? 'loading' : 'fetching')"
      :height="minHeight"
    />
    <FeathersErrorManager v-if="error" :error="error" />
  </div>
</template>
<script lang="ts" setup>
import ContentItem from '@/components/modules/lists/ContentItem.vue'
import { contentItems as ContentItemsService } from '@/services'
import type { ContentItem as ContentItemType } from '@/models/generated/schemas/contentItem'
import LazyObserver from './LazyObserver.vue'
import { ref } from 'vue'
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
const isFetched = ref(false)
const isLoading = ref(false)
const error = ref<Error | null>(null)

const fetchSimilarItems = async () => {
  if (isFetched.value) return
  isFetched.value = true
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

  isLoading.value = false

  if (!embedding) {
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
      limit: 6
    }
  }).then(res => {
    res.data
    return res.data
  })
}
</script>
