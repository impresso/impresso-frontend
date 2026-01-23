<template>
  <i-layout-section :width="width">
    <!--  header -->
    <template v-slot:header>
      <div class="border-bottom bg-light">
        <slot name="tabs">
          <SearchTabs />
        </slot>
        <div class="my-3 mx-3" :class="{ focus: hasFocus }">
          <SearchPills :filters="filters" @changed="handleFiltersChanged" />
          <span class="d-block mb-2" v-if="filters.length && ignoredFilters.length">
            <i
              class="small"
              v-html="
                $tc('numbers.ignoredFilters', ignoredFilters.length, {
                  n: ignoredFilters.length
                })
              "
            />{{ ' ' }}<InfoButton :name="infoButtonName" />
          </span>
          <slot name="header" :focusHandler="focusHandler">
            <!-- extra header -->
          </slot>
        </div>
      </div>
    </template>
    <!-- body (aka) facets -->
    <div class="pt-3 pb-5">
      <slot>
        <!-- slot here for extra facets -->
      </slot>
      <SearchFacets
        :facets="facets"
        :filters="filters"
        :start-year="startYear"
        :end-year="endYear"
        @changed="handleFiltersChanged"
      />
      <slot name="after-facets">
        <!-- slot for extras at the end -->
      </slot>
    </div>
  </i-layout-section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import SearchPills from '@/components/SearchPills.vue'
import SearchTabs from '@/components/modules/SearchTabs.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import SearchFacets from '@/components/SearchFacets.vue'
import type { Facet, Filter } from '@/models'
import { getImpressoMetadata } from '@/models/ImpressoMetadata'

export interface SearchSidebarProps {
  /** Used for helper button */
  contextTag?: string
  width?: string
  filters?: Filter[]
  facets?: Facet[]
  ignoredFilters?: Filter[]
}

const props = withDefaults(defineProps<SearchSidebarProps>(), {
  width: '400px',
  filters: () => [],
  facets: () => [],
  ignoredFilters: () => []
})

const emit = defineEmits<{
  changed: [filters: Filter[]]
}>()

const hasFocus = ref(false)

const handleFiltersChanged = (filters: Filter[]) => {
  emit('changed', filters)
}

const focusHandler = (value: boolean) => {
  hasFocus.value = !!value
}

const infoButtonName = computed(() => {
  if (props.contextTag === 'search-images') {
    return 'why-does-the-image-search-have-limited-filters'
  }
  return `how-${props.contextTag}-work-with-search-filters`
})

const startYear = computed(() => {
  return getImpressoMetadata()?.impressoDocumentsYearSpan?.firstYear
})

const endYear = computed(() => {
  return getImpressoMetadata()?.impressoDocumentsYearSpan?.lastYear
})
</script>

<style>
.search-box {
  border: 1px solid #777;
}
.search-box.focus {
  box-shadow: 0 0 0 0.2rem rgba(17, 17, 17, 0.5);
  border-color: black;
  border-radius: 2px;
}
.bg-dark .search-box.focus {
  box-shadow: 0 0 0 0.2rem rgba(17, 17, 17, 0.5);
  border-color: white;
}
</style>
