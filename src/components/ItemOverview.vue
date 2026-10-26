<template>
  <div v-if="props.item" class="ItemOverview container-xxl ml-0">
    <ListOfSearchFacetsStackedBars
      :facet-types="facetTypes"
      :filters="props.listFilters"
      items-class=""
      :default-click-action-disabled="true"
      @bar-item-click="onBarItemClick"
    />
  </div>

  <LoadingBlock v-else />
</template>

<script setup lang="ts">
import { useSelectionMonitorStore } from '@/stores/selectionMonitor'
import type { FacetType, Filter } from '@/models'
import ListOfSearchFacetsStackedBars, {
  type BarItemClickPayload
} from '@/components/ListOfSearchFacetsStackedBars.vue'
import LoadingBlock from '@/components/LoadingBlock.vue'

/** The minimum item shape required to render an overview. */
export interface ItemOverviewItem {
  id: string
}

export interface ItemOverviewProps {
  /** The item being displayed. Its absence represents the parent page's loading state. */
  item?: ItemOverviewItem
  /** Search filters that scope the overview's facets to the item. */
  listFilters?: Filter[]
}

const props = withDefaults(defineProps<ItemOverviewProps>(), {
  listFilters: () => []
})

const facetTypes = [
  'type',
  'language',
  'person',
  'location',
  'topic',
  'organisation',
  'nag'
] satisfies FacetType[]

const selectionMonitorStore = useSelectionMonitorStore()

const onBarItemClick = ({ event, facetType }: BarItemClickPayload) => {
  selectionMonitorStore.show({
    item: event.params.item,
    searchIndex: 'search',
    type: facetType,
    applyCurrentSearchFilters: true,
    displayCurrentSearchFilters: true,
    initialSearchFilters: props.listFilters
  })
}
</script>
