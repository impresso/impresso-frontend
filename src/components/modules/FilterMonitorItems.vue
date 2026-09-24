<template>
  <b-form-group>
    <div class="custom-control custom-checkbox" v-for="item in normalizedItems" :key="item.id">
      <input
        :id="`item-check-${item.id}`"
        type="checkbox"
        class="custom-control-input"
        :value="item.id"
        :checked="selectedSet.has(item.id)"
        @change="toggleId(item.id)"
      />
      <label class="custom-control-label" :for="`item-check-${item.id}`">
        <ItemSelector hide-icon :id="item.id" :item="item.raw" :type="filter.type">
          <ItemLabel
            :item="item.raw"
            :type="filter.type"
            :show-type="false"
            :show-item-selector="false"
          />
        </ItemSelector>
      </label>
    </div>
  </b-form-group>
</template>

<script lang="ts" setup>
import type { FilterMonitorFilter } from '@/components/modules/FilterMonitor.vue'
import { computed } from 'vue'
import ItemLabel from './lists/ItemLabel.vue'
import ItemSelector from './ItemSelector.vue'

export type FilterMonitorItem = Record<string, any>

export interface FilterMonitorItemsProps {
  /** The filter object to update */
  filter: FilterMonitorFilter
  /** Complete list of selectable items */
  items: FilterMonitorItem[]
  /** Custom function to extract a unique string ID from an item */
  idAccessor?: (item: FilterMonitorItem) => string
}

const props = withDefaults(defineProps<FilterMonitorItemsProps>(), {
  idAccessor: (item: FilterMonitorItem) => String(item.id),
  items: () => []
})

const emit = defineEmits<{
  (e: 'update:filter', filter: FilterMonitorFilter): void
}>()

// 1. Pre-calculate item IDs once when items/idAccessor change (avoids fn calls during template renders)
const normalizedItems = computed(() => {
  return props.items.map(raw => ({
    id: props.idAccessor(raw),
    raw
  }))
})

// 2. Use a Set for O(1) lookups during template rendering
const selectedSet = computed(() => {
  const currentIds = Array.isArray(props.filter.q) ? props.filter.q : []
  return new Set(currentIds)
})

// 3. Toggle selection and emit updated q array
const toggleId = (id: string) => {
  const currentSet = new Set(selectedSet.value)

  if (currentSet.has(id)) {
    currentSet.delete(id)
  } else {
    currentSet.add(id)
  }

  emit('update:filter', {
    ...props.filter,
    q: Array.from(currentSet)
  })
}
</script>
