<template>
  <div class="FilterMonitor">
    <FilterMonitorOptions
      class="my-2"
      :asDropdown="!props.checkbox"
      :filter="editedFilter"
      @update:filter="editedFilter = $event"
    />
    <FilterMonitorItems
      :idAccessor="idAccessorByType"
      :items="filter.items"
      :filter="editedFilter"
      @update:filter="editedFilter = $event"
    />
    <button
      className="btn btn-sm w-100 btn-outline-primary"
      :disabled="!hasChanges"
      @click="$emit('changed', editedFilter)"
    >
      <span>{{ $t(`actions.applyChanges`) }}</span>
    </button>
  </div>
</template>
<script lang="ts" setup>
const StringTypes = ['string', 'title'] as const
const EntityTypes = ['person', 'location', 'entity'] as const
const IntegerTypes = ['year', 'page'] as const
import type { Entity, FilterWithItems, FacetType } from '@/models'
import FilterMonitorOptions from './FilterMonitorOptions.vue'
import { computed, ref } from 'vue'
import { toCanonicalFilter, toSerializedFilter } from '@/logic/filters'
import FilterMonitorItems from './FilterMonitorItems.vue'

export interface FilterMonitorItem extends Entity {
  id: string
  name?: string
  htmlExcerpt?: string
  uid?: string
  bitmapPosition?: number
  checked?: boolean
  count?: number
  start?: string | number | Date
  end?: string | number | Date
  y?: number
}

type StringType = (typeof StringTypes)[number]
type IntegerType = (typeof IntegerTypes)[number]
export type FilterMonitorFilter = FilterWithItems<FilterMonitorItem>
type FilterContext = NonNullable<FilterMonitorFilter['context']>
type FilterOperator = NonNullable<FilterMonitorFilter['op']>
type FilterPrecision = NonNullable<FilterMonitorFilter['precision']>

export interface FilterMonitorProps {
  operators?: FilterOperator[]
  contexts?: FilterContext[]
  precisions?: FilterPrecision[]
  checkbox?: boolean
  filter: FilterMonitorFilter
  itemsToAdd?: FilterMonitorItem[]
  minDate?: Date
  maxDate?: Date
}

const props = withDefaults(defineProps<FilterMonitorProps>(), {
  operators: () => ['OR'],
  contexts: () => ['include', 'exclude'],
  precisions: () => ['fuzzy', 'exact', 'soft'],
  checkbox: false,
  itemsToAdd: () => []
})

const getCanonicalFilter = (filter?: FilterMonitorFilter): FilterMonitorFilter => {
  const canonicalFilter = toCanonicalFilter(filter)
  if (canonicalFilter.type) {
    return canonicalFilter
  }
  return {
    type: 'string',
    q: []
  }
}

const editedFilter = ref<FilterMonitorFilter>(getCanonicalFilter(props.filter))

const hasChanges = computed(() => {
  const canonicalFilter = getCanonicalFilter(props.filter)
  return toSerializedFilter(canonicalFilter) !== toSerializedFilter(editedFilter.value)
})

const idAccessorByType = computed(() => {
  const type = editedFilter.value.type
  if (['permissionExplore', 'permissionGetTranscript', 'permissionGetImage'].includes(type)) {
    return (item: FilterMonitorItem) => String(item.bitmapPosition)
  }
  return (item: FilterMonitorItem) => String(item.id)
})

const emit = defineEmits<{
  (e: 'changed', filter: FilterMonitorFilter): void
}>()
</script>
<i18n lang="json"></i18n>
