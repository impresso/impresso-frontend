<template>
  <i-layout>
    <SearchSidebar
      width="350px"
      :filters="allowedFiltersWithItems"
      :facets="facets"
      contextTag="search"
      @changed="props.onFiltersChanged"
    >
    </SearchSidebar>
    <i-layout-section main>
      <template v-slot:header>
        <PageNavbarHeading
          :label="$t('pageLabel' + (isLoading ? '-loading' : ''))"
          :title="$t('pageTitle' + (isLoading ? '-loading' : ''))"
        >
          <template #summaryActions>actions</template>
        </PageNavbarHeading>
      </template>
      <router-view></router-view>
    </i-layout-section>
  </i-layout>
</template>

<script setup lang="ts">
import SearchSidebar from '@/components/modules/SearchSidebar.vue'
import { buildEmptyFacets, DefaultFacetTypesForIndex } from '@/logic/facets'
import { SupportedFiltersByContext } from '@/logic/filters'
import Facet from '@/models/Facet'
import { computed, onMounted, ref, watch } from 'vue'
import { searchFacets as searchFacetsService } from '@/services'
import PageNavbarHeading from '@/components/PageNavbarHeading.vue'
import router from '@/router'
export interface DataProviderPageProps {
  filters?: any[]
  filtersWithItems?: any[]
  onFiltersChanged?: (filters: any[]) => void
}

const props = withDefaults(defineProps<DataProviderPageProps>(), {
  filters: () => [],
  filtersWithItems: () => [],
  onFiltersChanged: () => {}
})
const facets = ref([])

const allowedFiltersWithItems = computed(() => {
  return props.filtersWithItems.filter(({ type }) =>
    SupportedFiltersByContext.search.includes(type)
  )
})
const isLoading = ref(false)

watch(
  () => props.filters,
  async newVal => {
    isLoading.value = true
    const facetsItems = await searchFacetsService
      .find({
        query: {
          facets: DefaultFacetTypesForIndex.search.filter(f => f !== 'year'), // we get year facet separately to get all values
          filters: newVal
        }
      })
      .then(response => response.data.map(f => new Facet(f as any)))
    const timelineFacets = await searchFacetsService
      .find({
        query: {
          facets: ['year'],
          filters: newVal,
          limit: 300 // get all values
        }
      })
      .then(response => response.data.map(f => new Facet(f as any)))

    facets.value = [...facetsItems, ...timelineFacets]
    isLoading.value = false
  },
  { immediate: true }
)
onMounted(() => {
  facets.value = buildEmptyFacets(DefaultFacetTypesForIndex.search)
})
</script>
