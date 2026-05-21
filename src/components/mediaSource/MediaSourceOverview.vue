<template>
  <div class="MediaSourceOverview" v-if="props.mediaSource">
    <ListOfSearchFacetsStackedBars
      :facet-types="['type', 'language', 'person', 'location', 'topic', 'organisation', 'nag']"
      :filters="filters"
      :items-class="''"
      :default-click-action-disabled="true"
      @bar-item-click="onBarItemClick"
    />
  </div>

  <LoadingBlock v-else />
</template>
<script setup lang="ts">
import type { MediaSource } from '@/models/generated/canonical'
import ListOfSearchFacetsStackedBars, {
  BarItemClickPayload
} from '../ListOfSearchFacetsStackedBars.vue'
import { computed } from 'vue'
import type { Filter } from '@/models'
import LoadingBlock from '../LoadingBlock.vue'
import { useSelectionMonitorStore } from '@/stores/selectionMonitor'

export interface MediaSourceOverviewProps {
  mediaSource?: MediaSource
}

const props = defineProps<MediaSourceOverviewProps>()
const selectionMonitorStore = useSelectionMonitorStore()
const filters = computed<Filter[]>(() => {
  if (!props.mediaSource) return []
  return [
    {
      type: 'newspaper',
      q: props.mediaSource.id
    }
  ]
})

const onBarItemClick = ({ event, facetType }: BarItemClickPayload) => {
  console.debug('Bar item clicked:', { event, facetType })
  selectionMonitorStore.show({
    item: event.params.item,
    searchIndex: 'search',
    type: facetType,
    applyCurrentSearchFilters: true,
    displayCurrentSearchFilters: true,
    initialSearchFilters: filters.value
  })
}
</script>
<i18n lang="json">
{
  "en": {
    "contentItemsOverTime": "Content items over time"
  }
}
</i18n>
