<template>
  <div class="MediaSourceOverview" v-if="props.mediaSource">
    <ListOfSearchFacetsStackedBars
      :facet-types="['type', 'language', 'person', 'location', 'topic', 'organisation', 'nag']"
      :filters="filters"
      :items-class="''"
    />
  </div>

  <LoadingBlock v-else />
</template>
<script setup lang="ts">
import type { MediaSource } from '@/models/generated/canonical'
import ListOfSearchFacetsStackedBars from '../ListOfSearchFacetsStackedBars.vue'
import { computed } from 'vue'
import type { Filter } from '@/models'
import LoadingBlock from '../LoadingBlock.vue'

export interface MediaSourceOverviewProps {
  mediaSource?: MediaSource
}

const props = defineProps<MediaSourceOverviewProps>()

const filters = computed<Filter[]>(() => {
  if (!props.mediaSource) return []
  return [
    {
      type: 'newspaper',
      q: props.mediaSource.id
    }
  ]
})
</script>
<i18n lang="json">
{
  "en": {
    "contentItemsOverTime": "Content items over time"
  }
}
</i18n>
