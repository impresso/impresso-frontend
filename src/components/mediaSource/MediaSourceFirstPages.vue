<template>
  <ListOfFindResponseItems v-if="props.mediaSource" :service="pagesService" :params="listParams">
    <template #header="{ total, isLoading }">
      {{ total }}, {{ isLoading }} {{ listParams }}</template
    >
    <template #default="{ items, isSuccess }">
      <div>
        <div v-for="item in items" :key="item.id">
          <pre>{{ item }}</pre>
          <IIIFFragment :iiif="item.iiif" size=",250" :scale="1" />
        </div>
      </div>
    </template>
  </ListOfFindResponseItems>
</template>

<script setup lang="ts">
import { pages as pagesService } from '@/services'
import ListOfFindResponseItems from '../ListOfFindResponseItems.vue'
import IIIFFragment from '../IIIFFragment.vue'
import { computed } from 'vue'
import { MediaSource } from '@/models/generated/canonical.js'

export interface MediaSourceFirstPagesProps {
  mediaSource?: MediaSource
}

const props = defineProps<MediaSourceFirstPagesProps>()

const listParams = computed(() => {
  return {
    query: {
      num: [1],
      mediaSourceId: props.mediaSource?.id,
      limit: 10,
      order_by: 'date_asc'
    }
  }
})
</script>
