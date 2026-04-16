<template>
  <div>
    <div class="container-fluid my-3">
      <ListOfSearchFacetsStackedBars
        :facet-types="facetTypes"
        :filters="filters"
        :search-index="searchIndex"
        :items-class="''"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Filter } from '@/models'
import type { FacetType } from '@/models/Facet'
import ListOfSearchFacetsStackedBars from '@/components/ListOfSearchFacetsStackedBars.vue'

withDefaults(
  defineProps<{
    filters?: Filter[]
    loading?: boolean
    searchIndex?: string
  }>(),
  {
    filters: () => [],
    loading: false,
    searchIndex: 'tr_passages'
  }
)

const facetTypes: FacetType[] = [
  'newspaper',
  'country',
  'language',
  'person',
  'location',
  'topic',
  'organisation',
  'nag'
]
</script>
