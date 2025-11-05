<template>
  <div>
    <div class="d-flex align-items-center">
      <div
        class="mr-2 small-caps"
        v-if="props.showPercent"
        v-html="$t('numbers.resultsPercent', { n: $n(props.percent) })"
      ></div>
      <div class="flex-grow-1">
        <ItemLabel :item="props.item" :type="props.type" class="mr-1 small" />
        <ItemSelector
          :uid="props.uid"
          :item="props.item"
          :type="props.type"
          :search-index="props.searchIndex"
          :default-click-action-disabled="props.defaultClickActionDisabled"
          @click="handleClick"
        />
      </div>
      <div v-if="props.count">{{ $n(props.count) }}</div>
    </div>
    <div class="bg-white w-100" :class="{ 'border-bottom border-dark': props.showBorder }">
      <div class="bg-dark VizBar" :style="barStyle" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ItemLabel from '../modules/lists/ItemLabel.vue'
import ItemSelector from '../modules/ItemSelector.vue'
import { FacetType } from '@/models/Facet'
/**
 * Define the TypeScript interface for the component's props.
 */
export interface ItemSelectorBarProps {
  showBorder?: boolean
  showPercent?: boolean
  percent?: number
  count?: number
  uid?: string
  type: FacetType // Assuming 'type' is required in the original component due to lack of default
  item?: Record<string, any>
  defaultClickActionDisabled?: boolean
  searchIndex?: string
}

// 1. Define Props with Defaults using TypeScript
const props = withDefaults(defineProps<ItemSelectorBarProps>(), {
  showBorder: false,
  showPercent: false,
  percent: 0,
  count: 0,
  uid: '',
  item: () => ({}), // Factory function for object defaults
  defaultClickActionDisabled: false,
  searchIndex: 'search'
})

// 2. Define Emits with TypeScript for strong typing
// The original component emits the event parameter from the ItemSelector click event.
const emit = defineEmits<{
  (e: 'click', payload: any): void // Using 'any' for the payload for simplicity, but define the exact type if known.
}>()

const barStyle = computed(() => {
  return `width:${props.percent}%;`
})

// 5. Handle the emitted event and forward it
const handleClick = (param: any) => {
  emit('click', param)
}

// Components are automatically available in the template and don't need to be declared.
</script>

<style>
.VizBar {
  /* Add any necessary styles for the bar here */
  height: 3px; /* Example height */
}
</style>
