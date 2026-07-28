<template>
  <button
    class="ItemSelector d-inline btn btn-link"
    @click.prevent.stop="selectItem"
    title="See details"
  >
    <slot></slot>
    <span v-if="label" class="ItemSelector_label">{{ label }}</span>
    <Icon name="arrowEnlargeTag" v-if="!hideIcon" class="ml-1"></Icon>
  </button>
</template>

<script setup lang="ts">
import { useSelectionMonitorStore } from '@/stores/selectionMonitor'
import Icon from '../base/Icon.vue'

export interface ItemSelectorProps {
  id: string
  item: Record<string, any> // Using a generic object type here. You might want to define a more specific type for 'item'
  type: string
  defaultClickActionDisabled?: boolean
  label?: string
  searchIndex?: string
  hideIcon?: boolean
}

const props = withDefaults(defineProps<ItemSelectorProps>(), {
  defaultClickActionDisabled: false,
  searchIndex: 'search',
  hideIcon: false
})

export interface Emits {
  (
    e: 'click',
    payload: { params: { item: Record<string, any>; type: string }; defaultActionExecuted: boolean }
  ): void
}

const emit = defineEmits<Emits>()

const selectionMonitorStore = useSelectionMonitorStore()

function selectItem(): void {
  // @warning: permissionExplore and permissionGetTranscript are special cases as the ID in solr is different from the ID in the db
  const itemToSelect = { ...props.item, id: props.id }
  if (props.type === 'permissionExplore' || props.type === 'permissionGetTranscript') {
    itemToSelect.id = props.item.bitmapPosition
  }
  const params = {
    item: itemToSelect,
    type: props.type
  }

  if (!props.defaultClickActionDisabled) {
    selectionMonitorStore.show({
      item: itemToSelect,
      searchIndex: props.searchIndex,
      type: props.type,
      applyCurrentSearchFilters: true,
      displayCurrentSearchFilters: true
    })
  }

  // The payload's type is inferred from the defineEmits definition
  emit('click', {
    params,
    defaultActionExecuted: !props.defaultClickActionDisabled
  })
}
</script>
