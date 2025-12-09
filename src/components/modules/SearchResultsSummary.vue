<template>
  <section
    class="SearchResultsSummary search-results-summary text-serif textbox-fancy border-tertiary"
    :class="{ loading: isLoading }"
  >
    <span
      v-html="
        props.isLoading
          ? $t(`loading.${props.groupBy}`)
          : $tc('incipit', props.totalRows, {
              n: $n(props.totalRows),
              groupByLabel: $tc(`numbers.${props.groupBy}`, props.totalRows, {
                n: $n(props.totalRows)
              })
            })
      "
    />
    {{ ' ' }}
    <SearchQuerySummary
      class="d-inline"
      :search-query="searchQuery"
      @updated="(summary: string) => emit('onSummary', summary)"
    />
  </section>
</template>

<script setup lang="ts">
/**
 * SearchResultsSummary Component
 *
 * Displays a formatted summary of search results, including:
 * - Total number of results found
 * - Grouped results label (e.g., "articles", "items")
 * - Loading state with visual feedback
 * - Embedded search query summary component
 *
 * @example
 * ```vue
 * <SearchResultsSummary
 *   :total-rows="42"
 *   group-by="articles"
 *   :search-query="{ query: 'example', filters: {...} }"
 *   :is-loading="false"
 *   @on-summary="handleSummaryUpdate"
 * />
 * ```
 */
import SearchQuerySummary from './SearchQuerySummary.vue'
import type { Filter } from '@/models'

export interface SearchResultsSummaryProps {
  totalRows: number
  groupBy: string
  searchQuery: {
    filters: Filter[]
  }
  isLoading?: boolean
}

const props = defineProps<SearchResultsSummaryProps>()
const emit = defineEmits<{
  (e: 'onSummary', summary: string): void
}>()
</script>

<i18n lang="json">
{
  "en": {
    "incipit": "Sorry, {groupByLabel} found | {groupByLabel} found | {groupByLabel} found",
    "loading": {
      "articles": "... loading matching content items"
    }
  }
}
</i18n>

<style>
.SearchResultsSummary {
  transition: opacity 0.5s;
}

.SearchResultsSummary.loading {
  opacity: 0.5;
}
</style>
