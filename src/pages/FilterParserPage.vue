<template>
  <i-layout id="FilterParserPage" class="filter-parser-page">
    <i-layout-section class="bg-light p-3">
      <div class="container-md">
        <h1 class="mb-4">Impresso Filters Parser</h1>

        <div class="mb-4">
          <h2 class="h5 mb-3">Input Filters</h2>
          <p class="text-muted">
            Enter a Base64-encoded filter string or an Impresso URL containing filters. The parser
            accepts both a raw Base64 string and a complete URL with filters in the query
            parameters.
          </p>
          <FilterTextInput
            v-model="inputValue"
            class="mb-3"
            @update:filterString="handleFilterStringUpdate"
          />
        </div>

        <div class="mb-4">
          <h2 class="h5 mb-3">Parsed Result</h2>
          <p class="text-muted">
            The parsed filters are displayed below. The JSON structure shows all filters with their
            types and values.
          </p>
          <FiltersRenderPanel :modelValue="currentFilterString" />
        </div>
      </div>
    </i-layout-section>
  </i-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import FilterTextInput from '@/components/modules/filters/FilterTextInput.vue'
import FiltersRenderPanel from '@/components/modules/filters/FiltersRenderPanel.vue'

const inputValue = ref('')
const currentFilterString = ref('')

/**
 * Handle filter string update from FilterTextInput
 * The component emits both the original input value and the extracted filter string
 */
const handleFilterStringUpdate = (filterString: string) => {
  currentFilterString.value = filterString
}

// Set initial state if any
watch(
  inputValue,
  newValue => {
    if (newValue && !currentFilterString.value) {
      // This will trigger the input field to attempt to extract filters
      // The component will emit the extracted filter string which we handle above
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.filter-parser-page {
  h1 {
    font-size: 2rem;
  }

  h2 {
    font-weight: 600;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "title": "Impresso Filters Parser"
  },
  "fr": {
    "title": "Analyseur de filtres Impresso"
  },
  "de": {
    "title": "Impresso Filter-Parser"
  }
}
</i18n>
