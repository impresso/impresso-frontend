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
      <div class="d-flex align-items-center mb-3 gap-3">
        <form class="form-inline">
          <b-form-checkbox :disabled="isLoading" v-model="addTimeframeFilter" switch>
            {{ $t('actions.addTimeframe') }}
          </b-form-checkbox>
        </form>
        <button
          v-if="!loadOnMount"
          class="btn btn-sm btn-outline-primary"
          :disabled="isLoading"
          @click="fetchSimilarItems"
        >
          {{ $t('actions.fetchSimilarItems') }}
        </button>

        <AddContentItemToSearch
          :disabled="!contentItemEmbedding"
          :content-item-id="props.contentItem?.id"
          :embedding="contentItemEmbedding"
          :additional-filters="timeframeFilter ? [timeframeFilter] : []"
          :disabledReason="$t('fetchingSimilarContentItems.noEmbeddingsForThisContentItem')"
          class="ml-auto"
          >{{ $t('actions.showInSearch') }}
          <Icon name="brainElectricity" class="ml-1" :scale="0.75" :stroke-width="1.5" />
        </AddContentItemToSearch>
      </div>
    </div>
    <slot v-bind:items="similarItems">
      <div class="col-md-6 col-lg-6 col-xxl-6" v-for="item in similarItems" :key="item.id">
        <ContentItem
          :contentItem="item"
          class="p-3 rounded-md border shadow mb-4"
          showDate
          showMediaSource
          showProvider
          showLink
          showIcon
          showMeta
          showSpecs
          showSnippet
          showSemanticEnrichments
        />
      </div>
    </slot>
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
    <Alert v-if="notice" type="info" class="mt-3">
      {{ $t(`fetchingSimilarContentItems.${notice}`) }}
    </Alert>
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
 * @property {number} [minHeight=400] - Minimum height in pixels for the component container
 * @property {boolean} [loadOnMount=false] - Automatically load results and refresh when the timeframe changes
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
import { Filter } from '@/models'
import { contentItems as ContentItemsService } from '@/services'
import type { ContentItem as ContentItemType } from '@/models/generated/canonical/contentItem'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import LoadingBlock from '@/components/LoadingBlock.vue'
import FeathersErrorManager from '@/components/FeathersErrorManager.vue'
import Alert from 'impresso-ui-components/components/Alert.vue'
import ContentItem from '@/components/modules/lists/ContentItem.vue'
import AddContentItemToSearch from '@/components/contentItem/AddContentItemToSearch.vue'
import Icon from '@/components/base/Icon.vue'
export interface ListOfSimilarContentItemsProps {
  contentItem?: ContentItemType
  minHeight?: number
  contentClass?: string
  loadOnMount?: boolean
}
const props = withDefaults(defineProps<ListOfSimilarContentItemsProps>(), {
  minHeight: 400,
  contentClass: 'col-12',
  loadOnMount: false
})
const similarItems = ref<ContentItemType[]>([])

const isLoading = ref(false)
const error = ref<Error | null>(null)
const notice = ref<string | null>(null)
const addTimeframeFilter = ref<boolean>(true)
const contentItemEmbedding = ref<string>('')
let requestVersion = 0
/**
 * Computed property that generates a timeframe filter object for content items.
 *
 * @returns {Filter|null} Returns a filter object with type and query array, or null if no timeframe is applicable.
 */
const timeframeFilter = computed<Filter | null>(() => {
  if (!addTimeframeFilter.value) return null
  const contentItemDate = new Date(props.contentItem?.meta?.date)
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
  } satisfies Filter
})

/**
 * Fetches similar content items for the current item.
 * This async function retrieves a list of content items that are similar to the one currently being displayed.
 * It typically makes an API call to fetch the data and updates the component's state with the results.
 *
 * @async
 * @function fetchSimilarItems
 * @returns {Promise<void>} A promise that resolves when the similar items have been fetched and processed
 */
const fetchSimilarItems = async (): Promise<void> => {
  const contentItemId = props.contentItem?.id
  if (!contentItemId || isLoading.value) return
  const version = ++requestVersion
  isLoading.value = true
  similarItems.value = []
  error.value = null
  notice.value = null
  try {
    // Add a minimum delay for smooth transitions
    await new Promise(resolve => setTimeout(resolve, 500))
    if (version !== requestVersion) return
    console.info('[ListOfSimilarContentItems] Fetching embedding for:', contentItemId)
    if (!contentItemEmbedding.value.length) {
      const data = await ContentItemsService.get(contentItemId, {
        query: {
          include_embeddings: true
        }
      })
      if (version !== requestVersion) return
      contentItemEmbedding.value = data.semanticEnrichments?.embeddings?.[0] || ''
    }
    if (!contentItemEmbedding.value.length) {
      notice.value = 'noEmbeddingsForThisContentItem'
      console.warn('No embeddings found for content item:', contentItemId)
      return
    }
    console.info(
      '[ListOfSimilarContentItems] Fetching similar items for embedding of:',
      contentItemId,
      'using timeframeFilter:',
      !!timeframeFilter.value
    )
    const res = await ContentItemsService.find({
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
    if (version !== requestVersion) return
    similarItems.value = res.data
    console.info(
      '[ListOfSimilarContentItems] Fetched similar items for content item:',
      contentItemId,
      'Result count:',
      res.data.length
    )
  } catch (err) {
    if (version === requestVersion) {
      error.value = err instanceof Error ? err : new Error(String(err))
      console.error('Error fetching similar content items:', err)
    }
  } finally {
    if (version === requestVersion) isLoading.value = false
  }
}

watch(
  () => props.contentItem?.id,
  () => {
    requestVersion++
    similarItems.value = []
    isLoading.value = false
    error.value = null
    notice.value = null
    contentItemEmbedding.value = ''
    if (props.loadOnMount) void fetchSimilarItems()
  },
  {
    immediate: true
  }
)
watch(
  () => addTimeframeFilter.value,
  () => {
    similarItems.value = []
    isLoading.value = false
    error.value = null
    if (props.loadOnMount) void fetchSimilarItems()
  }
)

onBeforeUnmount(() => {
  requestVersion++
})
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
      "errorLabel": "Error fetching similar content items. Please try again later. Received: ",
      "noEmbeddingsForThisContentItem": "No semantic embeddings available for this content item."
    },
    "actions": {
      "fetchSimilarItems": "load Similar Items",
      "loading": "Loading similar items...",
      "addTimeframe": "Add ±1 year timeframe filter",
      "showInSearch": "Find similar items in search"
    }
  }
}
</i18n>
