<template>
  <div class="FacetExplorer" data-testid="facet-explorer">
    <div>
      <div class="position-relative">
        <div
          role="group"
          tabindex="-1"
          class="position-relative px-3 pt-2 pb-5 bv-no-focus-ring"
          style="min-height: 4em; max-height: 50vh; overflow: scroll"
          data-testid="facet-explorer-list"
        >
          <b-form-checkbox
            v-for="(bucket, idx) in buckets"
            :key="idx"
            :modelValue="selectedIds.includes(bucket.val as string)"
            class="d-block FacetExplorer_checkbox"
            @update:modelValue="isSet => handleChecked(isSet as boolean, bucket.val)"
            data-testid="facet-explorer-list-item-checkbox"
          >
            <ItemLabel v-if="bucket.item" :item="bucket.item" :type="itemType" />
            <span v-if="bucket.count > -1">
              (<span v-html="$tc('numbers.results', bucket.count, { n: $n(bucket.count) })" />)
            </span>
            <ItemSelector :uid="String(bucket.val)" :item="bucket.item" :type="filterType" />
          </b-form-checkbox>
        </div>
        <div class="fixed-pagination-footer p-1 mb-2 small">
          <slot name="pagination"> </slot>
        </div>
      </div>
    </div>
    <div class="p-2 border-top text-center" v-if="selectedIdsChanged">
      <b-button
        @click="applyFilter()"
        size="sm"
        variant="success"
        v-html="$tc('actions.addToCurrentFiltersDetailed', selectedIds.length)"
      ></b-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import ItemLabel from './lists/ItemLabel.vue'
import ItemSelector from './ItemSelector.vue'
import type { Entity, Bucket, Filter } from '@/models'
import type { FacetType } from '@/models/Facet'

// Helper function
function getEntitiesForIds(
  ids: string[],
  entities: (Entity | undefined)[] = []
): (Entity | undefined)[] {
  return ids.map(id => entities.find(entity => entity && entity.uid === id))
}

// --- Props and Emits ---
interface FacetExplorerProps {
  modelValue?: Filter // Renamed from modelValue to align with Vue 3 conventions for v-model
  filterType: string
  itemType?: FacetType
  buckets: Bucket[]
}

const props = withDefaults(defineProps<FacetExplorerProps>(), {
  buckets: () => []
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Filter): void
}>()

const selectedIds = ref<string[]>([])
const selectedIdsEntities = ref<(Entity | undefined)[]>([])
const filter = computed(() => props.modelValue)

// Get the currently applied IDs from the filter (modelValue)
const filterIds = computed<string[]>(() => {
  return filter.value && Array.isArray(filter.value.q) ? filter.value.q : []
})

// Checks if the local selection differs from the applied filter
const selectedIdsChanged = computed(() => {
  const a = JSON.stringify([...selectedIds.value].sort())
  const b = JSON.stringify([...filterIds.value].sort())
  return a !== b
})

// --- Methods ---

/**
 * Handles checkbox state changes. Adds/removes a value from selectedIds.
 * @param isSet The new state of the checkbox (checked/unchecked).
 * @param val The unique identifier of the bucket/item.
 */
function handleChecked(isSet: boolean, val: string | number): void {
  const index = selectedIds.value.indexOf(String(val))

  if (!isSet) {
    if (index > -1) {
      selectedIds.value.splice(index, 1)
    }
  } else if (index === -1) {
    selectedIds.value.push(String(val))
  }
}

/**
 * Applies the filter by emitting the updated modelValue.
 */
function applyFilter(): void {
  // Collect all known entities for the selected IDs: those passed in the filter and those in current buckets
  const allPossibleEntities = (filter.value?.items || [])
    .concat(props.buckets.map(({ item }) => item))
    .filter((item): item is Entity => !!item) // Filter out undefined/null items

  const entities = getEntitiesForIds(selectedIds.value, allPossibleEntities)

  const originalFilter = filter.value ? filter.value : { type: props.filterType, q: [] as string[] }

  const updatedFilter: Filter = {
    ...originalFilter,
    q: selectedIds.value,
    items: entities.filter((item): item is Entity => !!item) // Ensure only valid entities are passed
  }

  emit('update:modelValue', updatedFilter)
}

// --- Lifecycle Hook ---
onMounted(() => {
  // The original mounted logic for type check
  if (filter.value && filter.value.type && props.filterType !== filter.value.type) {
    // Note: The original condition filterType !== this.filterType is likely a typo in the original
    // and should probably be filter.value.type !== props.filterType
    console.error('"filter" type must be equal to "filterType"')
    // throw new Error('"filter" type must be equal to "filterType"') // Use throw for fatal error
  }
})

// --- Watcher ---

/**
 * Initializes and syncs local state from the `modelValue` (filter).
 */
watch(
  filter,
  () => {
    const entities = filter.value?.items || []
    selectedIds.value = [...filterIds.value]
    // Filter out undefined/null entities from the list
    const validEntities = entities.filter((item): item is Entity => !!item)
    selectedIdsEntities.value = getEntitiesForIds(filterIds.value, validEntities)
  },
  { immediate: true, deep: true }
)
</script>

<style>
.FacetExplorer .fixed-pagination-footer {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: #f2f2f2;
  max-width: 100%;
}
.FacetExplorer_checkbox label {
  font-size: inherit;
}
</style>
<i18n lang="json">
{
  "en": {}
}
</i18n>
