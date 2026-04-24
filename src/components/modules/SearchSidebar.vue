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
          <span class="d-block mb-2" v-if="filters.length && ignoredFilterTypes.length">
            <i
              class="small"
              v-html="
                $t(
                  'numbers.ignoredFilterTypes',
                  {
                    n: ignoredFilterTypes.length
                  },
                  ignoredFilterTypes.length
                )
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
        :facets="includedFacets"
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
/**
 * SearchSidebar provides the filtering panel used in search pages: it renders active filter pills,
 * facet controls, and optional contextual help while honoring ignored facet/filter types and
 * relaying filter updates to parent views through the changed event.
 */
import { computed, ref } from 'vue'
import SearchPills from '@/components/SearchPills.vue'
import SearchTabs from '@/components/modules/SearchTabs.vue'
import InfoButton from '@/components/base/InfoButton.vue'
import SearchFacets from '@/components/SearchFacets.vue'
import type { Facet, Filter } from '@/models'
import { getImpressoMetadata } from '@/models/ImpressoMetadata'
import { FacetType } from '@/models/Facet'
import { FilterType } from 'impresso-jscommons'

export interface SearchSidebarProps {
  /** Used for helper button */
  contextTag?: string
  width?: string
  filters?: Filter[]
  /** facets to visualize */
  facets?: Facet[]
  /** filter types to ignore */
  ignoredFilterTypes?: FilterType[]
  /** facet types to ignore (this could be a subset of Facets)*/
  ignoredFacetTypes?: FacetType[]
}

const props = withDefaults(defineProps<SearchSidebarProps>(), {
  width: '400px',
  filters: () => [],
  facets: () => [],
  ignoredFilterTypes: () => [],
  ignoredFacetTypes: () => []
})

const emit = defineEmits<{
  changed: [filters: Filter[]]
}>()

const hasFocus = ref(false)
/**
 * Included facets are the ones that will be rendered in the sidebar. They are the ones that are not ignored (by filter type) and not explicitly excluded by facet type.
 */
const includedFacets = computed<Facet[]>(() => {
  // combine ignored filterType and explicitely mentioned ignoredFacetTypes
  const excludedTypes = new Set([...props.ignoredFilterTypes, ...props.ignoredFacetTypes])
  if (!excludedTypes.size) return props.facets

  return props.facets.filter(({ type }) => !excludedTypes.has(type as FacetType))
})

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
