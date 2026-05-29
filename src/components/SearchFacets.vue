<template>
  <div id="search-facets">
    <filter-timeline
      v-if="containsTimelineFacets"
      class="border-top mx-3 py-2 mb-2"
      :filters="daterangeFilters"
      :values="timelineValues"
      :min-date="minDate"
      :max-date="maxDate"
      :start-year="startYear"
      :end-year="endYear"
      :group-by="groupBy"
      @reset-filters="resetFilters"
      @changed="updateDaterangeFilters"
    />
    <filter-decimal-range
      v-for="(facet, index) in decimalRangeFacets"
      class="border-top py-2 mx-3"
      :key="`dr-${index}`"
      :facetType="facet.type"
      :facet-filters="filters"
      :isFiltered="filters.some(({ type }) => type === facet.type)"
      @changed="handleDynamicRangeChanged"
      @clicked="handleFacetFilterRangeClicked"
      count-label="numbers.contentItems"
      :info-button-id="getFacetInfoButtonContent(facet)"
    >
      <template #description>
        <div v-html="$t(`label.${facet.type}.description`)" />
      </template>
    </filter-decimal-range>
    <filter-dynamic-range
      v-for="(facet, index) in dynamicRangeFacets"
      class="border-top py-2 mx-3"
      :key="`rd-${index}`"
      :facetType="facet.type"
      :facet-filters="filters"
      :isFiltered="filters.some(({ type }) => type === facet.type)"
      :isPercentage="facet.type === 'ocrQuality'"
      @changed="handleDynamicRangeChanged"
      @clicked="handleFacetFilterRangeClicked"
      count-label="numbers.contentItems"
    >
      <template #description>
        <div v-html="$t(`label.${facet.type}.description`)" />
      </template>
    </filter-dynamic-range>
    <filter-range
      v-for="(facet, index) in rangeFacets"
      class="border-top py-2 mx-3"
      :key="`rs-${index}`"
      :facet="facet"
      :facetType="facet.type"
      :facet-filters="filters"
      :isFiltered="filters.some(({ type }) => type === facet.type)"
      @changed="filters => facetFiltersUpdated(facet.type, filters)"
      count-label="numbers.contentItems"
    >
    </filter-range>
    <FilterFacet
      class="border-top py-2 mx-3"
      v-for="(facet, index) in standardFacets"
      :key="index"
      :facet="facet"
      :context-filters="filters"
      :facet-filters="getFacetFilters(facet.type)"
      @changed="filters => facetFiltersUpdated(facet.type, filters)"
      collapsible
    />
  </div>
</template>

<script setup lang="ts">
import FilterFacet from '@/components/modules/FilterFacet.vue'
import FilterRange from '@/components/modules/FilterRange.vue'
import FilterDynamicRange from '@/components/modules/FilterDynamicRange.vue'
import FilterTimeline from '@/components/modules/FilterTimeline.vue'

import type { Entity, FacetType, Facet, Filter, FilterWithItems } from '@/models'
import FilterFactory from '@/models/FilterFactory'
import { getImpressoMetadata } from '@/models/ImpressoMetadata'
import {
  DecimalRangeDisplayFacetTypes,
  DynamicRangeDisplayFacetTypes,
  facetToTimelineValues,
  RangeFacetTypes,
  TimelineDisplayFacetTypes
} from '@/logic/facets'
import { computed } from 'vue'
import FilterDecimalRange from './modules/FilterDecimalRange.vue'
import { State, useSelectionMonitorStore } from '@/stores/selectionMonitor'
import { includes } from '@/util/fn.js'

const selectionMonitorStore = useSelectionMonitorStore()

type DaterangeFilterItem = Entity & {
  start?: string | number | Date
  end?: string | number | Date
}

export interface SearchFacetsProps {
  groupBy?: 'contentItems' | 'images'
  filters?: Filter[]
  facets?: Facet[]
  startYear?: number
  endYear?: number
  searchIndex?: string
}

const props = withDefaults(defineProps<SearchFacetsProps>(), {
  groupBy: 'contentItems',
  filters: () => [],
  facets: () => [],
  startYear: () => getImpressoMetadata()?.impressoDocumentsYearSpan?.firstYear ?? 1700,
  endYear: () =>
    getImpressoMetadata()?.impressoDocumentsYearSpan?.lastYear ?? new Date().getFullYear(),
  searchIndex: 'search'
})

const emit = defineEmits<{
  (e: 'changed', filters: Filter[]): void
}>()

const standardFacets = computed(() => {
  return props.facets
})

const rangeFacets = computed(() => {
  return props.facets.filter(({ type }) => includes(RangeFacetTypes, type))
})

const decimalRangeFacets = computed(() => {
  return props.facets.filter(({ type }) => includes(DecimalRangeDisplayFacetTypes, type))
})
const dynamicRangeFacets = computed(() => {
  return props.facets.filter(({ type }) => includes(DynamicRangeDisplayFacetTypes, type))
})

const containsTimelineFacets = computed(() => {
  return props.facets.some(({ type }) => includes(TimelineDisplayFacetTypes, type))
})

const daterangeFilters = computed(() => {
  return props.filters
    .filter(({ type }) => type === 'daterange')
    .map(filter => FilterFactory.create(filter) as FilterWithItems<DaterangeFilterItem>)
})

const timelineValues = computed(() => {
  const yearFacet = props.facets.find(({ type }) => type === 'year')
  if (!yearFacet || !yearFacet.buckets.length) return []
  return facetToTimelineValues(yearFacet)
})

const minDate = computed(() => {
  if (timelineValues.value.length) {
    const y = timelineValues.value.reduce(
      (min, d) => (d.t < min ? d.t : min),
      timelineValues.value[0].t
    )
    return new Date(`${y}-01-01`)
  }
  return new Date(`${props.startYear}-01-01`)
})

const maxDate = computed(() => {
  if (timelineValues.value.length) {
    const y = timelineValues.value.reduce(
      (max, d) => (d.t > max ? d.t : max),
      timelineValues.value[0].t
    )
    return new Date(`${y}-12-31`)
  }
  return new Date(`${props.endYear}-12-31`)
})

function getFacetInfoButtonContent(facet: Facet) {
  const LookUp = {
    ocrQuality: 'What-does-OCR-filter-mean'
  } as const
  if (facet.type in LookUp) {
    return LookUp[facet.type as keyof typeof LookUp]
  }
  return null
}

function getFacetFilters(type: string) {
  return props.filters.filter(d => d.type === type).map(filter => FilterFactory.create(filter))
}

function resetFilters(type: string) {
  emit(
    'changed',
    props.filters.filter(d => d.type !== type)
  )
}

function updateDaterangeFilters(updatedDaterangeFilters: Filter[]) {
  emit(
    'changed',
    props.filters.filter(({ type }) => type !== 'daterange').concat(updatedDaterangeFilters)
  )
}

function facetFiltersUpdated(type: string, updatedFilters: Filter[]) {
  let updatedFiltersIndex = 0

  const mergedFilters = props.filters
    .map(filter => {
      if (filter.type === type) {
        if (updatedFiltersIndex < updatedFilters.length - 1) {
          updatedFiltersIndex += 1
          return updatedFilters[updatedFiltersIndex - 1]
        }
        return undefined
      }
      return filter
    })
    .filter(filter => filter != null)
  const remainingUpdatedFilters = updatedFilters.slice(updatedFiltersIndex)

  emit('changed', mergedFilters.concat(remainingUpdatedFilters))
}

function handleDynamicRangeChanged(changedFilters: Filter[]) {
  emit('changed', changedFilters)
}

function handleFacetFilterRangeClicked(filter: Filter) {
  console.debug('[SearchFacets] Facet filters clicked:', filter)
  const itemRangeProps: {
    itemFilterRangeMin?: State['itemFilterRangeMin']
    itemFilterRangeMax?: State['itemFilterRangeMax']
    itemFilterRangeStep?: State['itemFilterRangeStep']
  } = {}
  if (filter.type === 'ocrQuality') {
    itemRangeProps.itemFilterRangeMin = 0
    itemRangeProps.itemFilterRangeMax = 1
    itemRangeProps.itemFilterRangeStep = 0.01
  } else if (filter.type === 'contentLength') {
    itemRangeProps.itemFilterRangeMin = 0
    itemRangeProps.itemFilterRangeMax = 1000000
    itemRangeProps.itemFilterRangeStep = 10
  }
  // open selection monitor
  selectionMonitorStore.show({
    item: filter,
    searchIndex: props.searchIndex,
    type: filter.type,
    scope: 'closeUp',
    applyCurrentSearchFilters: true,
    displayCurrentSearchFilters: true,
    ...itemRangeProps
  })
}
</script>

<style scoped lang="scss">
.facet-filter {
  display: grid;
  grid-template-columns: auto min-content;
  grid-template-areas: 'left' 'right';

  .left {
    grid-area: 'left';
  }

  .right {
    opacity: 0;
    grid-area: 'right';
  }

  &:hover {
    .right {
      opacity: 1;
    }
  }
}

.filter-opts {
  position: absolute;
  width: 240px;
  left: auto;
  right: -1px;
  top: -2px;
  background: white;
  border: 1px solid;
  box-shadow: 0.3em 0.3em 0 rgba(17, 17, 17, 0.2);
}
</style>
<i18n lang="json">
{
  "en": {
    "groupBy": {
      "articles": "articles",
      "images": "images"
    }
  }
}
</i18n>
