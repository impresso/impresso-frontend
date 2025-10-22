<template>
  <div
    class="ListOfSimilarContentItems"
    :style="{
      minHeight: `${minHeight}px`
    }"
  >
    <div :class="contentClass">
      <p>
        {{ $t('description') }}
      </p>
      <div class="d-flex align-items-center mb-3">
        <button
          class="btn btn-sm btn-outline-primary mr-3"
          :disabled="isLoading"
          @click="fetchSimilarItems"
        >
          {{ $t('actions.fetchSimilarItems') }}
        </button>
        <form class="form-inline">
          <b-form-checkbox :disabled="isLoading" v-model="addTimeframeFilter" switch>
            {{ $t('actions.addTimeframe') }}
          </b-form-checkbox>
        </form>
      </div>
    </div>
    <slot v-bind:items="similarItems"></slot>
    <LoadingBlock
      :class="contentClass"
      v-if="!error && isLoading"
      :label="$t('actions.loading')"
      :height="minHeight"
    />
    <FeathersErrorManager
      :class="contentClass"
      :style="{
        height: 'min-content'
      }"
      v-if="error"
      :error="error"
      :defaultLabel="$t('fetchingSimilarContentItems.errorLabel')"
    />
  </div>
</template>

<script lang="ts" setup>
/**
 * ListOfSimilarContentItems Component
 *
 * A Vue 3 component that displays a list of content items similar to a given content item.
 * Uses semantic embeddings to find and display related content within an optional timeframe.
 *
 * @component
 * @example
 * ```vue
 * <ListOfSimilarContentItems
 *   :contentItem="currentItem"
 *   :minHeight="200"
 *   :addTimeframeFilter="true"
 * />
 * ```
 *
 * @property {ContentItemType} contentItem - The reference content item to find similar items for (required)
 * @property {number} [minHeight=150] - Minimum height in pixels for the component container
 * @property {boolean} [addTimeframeFilter=true] - Whether to filter results within ±1 year of the content item's date
 *
 * @remarks
 * The component performs a two-step process:
 * 1. Fetches the semantic embedding for the provided content item
 * 2. Uses the embedding to query for similar content items
 *
 * When `addTimeframeFilter` is enabled, results are limited to content from one year before
 * to one year after the reference content item's publication date.
 *
 * @fires fetchSimilarItems - Async function that retrieves similar content items based on embeddings
 *
 * @see {@link ContentItemType} for the content item type definition
 * @see {@link ContentItemsService} for the API service used to fetch data
 */
import { contentItems as ContentItemsService } from '@/services'
import type { ContentItem as ContentItemType } from '@/models/generated/schemas/contentItem'
import { computed, ref, watch } from 'vue'
import LoadingBlock from './LoadingBlock.vue'
import FeathersErrorManager from './FeathersErrorManager.vue'

export interface ListOfSimilarContentItemsProps {
  contentItem: ContentItemType
  minHeight?: number
  contentClass?: string
}
const props = withDefaults(defineProps<ListOfSimilarContentItemsProps>(), {
  minHeight: 400,
  contentClass: 'col-12'
})
const similarItems = ref<ContentItemType[]>([])

const isLoading = ref(false)
const error = ref<Error | null>(null)
const addTimeframeFilter = ref<boolean>(true)
const contentItemEmbedding = ref<string>('')
/**
 * Computed property that generates a timeframe filter object for content items.
 *
 * @returns {Object|null} Returns a filter object with type and query array, or null if no timeframe is applicable.
 * @property {string} type - The filter type identifier for timeframe filtering
 * @property {string[]} q - Array of query strings representing the timeframe criteria
 */
const timeframeFilter = computed<{ type: string; q: string[] } | null>(() => {
  if (!addTimeframeFilter.value) return null
  const contentItemDate = new Date(props.contentItem.meta.date)
  const oneYearBefore = new Date(contentItemDate)
  oneYearBefore.setFullYear(contentItemDate.getFullYear() - 1)
  const oneYearAfter = new Date(contentItemDate)
  oneYearAfter.setFullYear(contentItemDate.getFullYear() + 1)
  return {
    type: 'year',
    q: [
      oneYearBefore.getFullYear().toString(),
      contentItemDate.getFullYear().toString(),
      oneYearAfter.getFullYear().toString()
    ]
  }
})

/**
 * Fetches similar content items for the current item.
 * This async function retrieves a list of content items that are similar to the one currently being displayed.
 * It typically makes an API call to fetch the data and updates the component's state with the results.
 *
 * @async
 * @function fetchSimilarItems
 * @returns {Promise<void>} A promise that resolves when the similar items have been fetched and processed
 * @throws {Error} May throw an error if the API call fails or if there are issues processing the response
 */
const fetchSimilarItems = async (): Promise<void> => {
  if (isLoading.value) return
  isLoading.value = true
  similarItems.value = []
  error.value = null
  // Add a minimum delay for smooth transitions
  await new Promise(resolve => setTimeout(resolve, 500))
  console.info('[ListOfSimilarContentItems] Fetching embedding for:', props.contentItem.id)
  if (!contentItemEmbedding.value.length) {
    contentItemEmbedding.value = await ContentItemsService.get(props.contentItem.id, {
      query: {
        include_embeddings: true
      }
    })
      .then(data => {
        return data.semanticEnrichments?.embeddings?.[0] || ('' as string)
      })
      .catch(err => {
        error.value = err
        return ''
      })
  }
  if (!contentItemEmbedding.value.length) {
    isLoading.value = false
    error.value = new Error('No embeddings found for the content item.')
    console.warn('No embeddings found for content item:', props.contentItem.id)
    return
  }
  console.info(
    '[ListOfSimilarContentItems] Fetching similar items for embedding of:',
    props.contentItem.id,
    'using timeframeFilter:',
    !!timeframeFilter.value
  )
  similarItems.value = await ContentItemsService.find({
    query: {
      filters: [
        ...(timeframeFilter.value ? [timeframeFilter.value] : []),
        {
          type: 'embedding',
          q: contentItemEmbedding.value
        }
      ],
      limit: 6
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
  () => {
    similarItems.value = []
    isLoading.value = false
    error.value = null
  },
  {
    immediate: false
  }
)
watch(
  () => addTimeframeFilter.value,
  () => {
    similarItems.value = []
    isLoading.value = false
    error.value = null
  }
)
</script>
<style>
.ListOfSimilarContentItems .ContentItem h2 {
  font-size: inherit;
  font-weight: var(--impresso-wght-bold);
  font-variation-settings: 'wght' var(--impresso-wght-bold);
}
</style>
<i18n lang="json">
{
  "en": {
    "description": "Find and display content items similar to the current one using semantic embeddings. This process may take a few moments.",
    "fetchingSimilarContentItems": {
      "errorLabel": "Error fetching similar content items. Please try again later. Received: "
    },
    "actions": {
      "fetchSimilarItems": "load Similar Items",
      "loading": "Loading similar items...",
      "addTimeframe": "Add ±1 year timeframe filter"
    }
  }
}
</i18n>
