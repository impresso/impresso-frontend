<template>
  <BDropdown
    right
    size="sm"
    variant="outline-primary"
    class="OpenInSearchButton"
    :disabled="isDisabled"
  >
    <template #button-content>
      {{ $t('openInSearch') }}
    </template>

    <BDropdownItem :to="openFiltersInSearchPageLink">
      {{ $t('openFiltersInSearchPage') }}
    </BDropdownItem>
    <BDropdownItem :to="addToCurrentSearchLink">
      {{ $t('addToCurrentSearch') }}
    </BDropdownItem>
  </BDropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Filter } from '@/models'
import { deserializeFilters, optimizeFilters, serializeFilters } from '@/logic/filters'
import { CommonQueryParameters } from '@/router/util'
import { useSearchQueriesStore } from '@/stores/searchQueries'

export interface OpenInSearchButtonProps {
  filters: Filter[]
}

const props = withDefaults(defineProps<OpenInSearchButtonProps>(), {
  filters: () => []
})

const searchQueriesStore = useSearchQueriesStore()

const latestSearchHash = computed(() => {
  return searchQueriesStore.latest?.hash
})

const isDisabled = computed(() => {
  return props.filters.length === 0 || !latestSearchHash.value
})

const currentSearchFilters = computed<Filter[]>(() => deserializeFilters(latestSearchHash.value))

const openFiltersInSearchPageLink = computed(() => {
  return {
    name: 'search',
    query: {
      [CommonQueryParameters.SearchFilters]: serializeFilters(props.filters)
    }
  }
})

const addToCurrentSearchLink = computed(() => {
  const mergedFilters = optimizeFilters([...currentSearchFilters.value, ...props.filters])
  return {
    name: 'search',
    query: {
      [CommonQueryParameters.SearchFilters]: serializeFilters(mergedFilters)
    }
  }
})
</script>

<i18n lang="json">
{
  "en": {
    "openInSearch": "Open in Search Page ...",
    "openFiltersInSearchPage": "Explore in search page",
    "addToCurrentSearch": "Add to your current search"
  }
}
</i18n>
