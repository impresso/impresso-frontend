<template>
  <div class="container-fluid" v-if="props.mediaSource">
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
const props = defineProps<{
  mediaSource: MediaSource
}>()

const filters = computed<Filter[]>(() => [
  {
    type: 'newspaper',
    q: props.mediaSource.id
  }
])
</script>
