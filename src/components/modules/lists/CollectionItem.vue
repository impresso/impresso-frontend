<template lang="html">
  <div class="CollectionItem">
    <div class="d-flex align-items-center gap-2 mb-0">
      <Icon v-if="showIcon" name="curveArray" :stroke-width="2" :width="16" :height="16" />
      <h3 class="m-0 font-size-inherit font-weight-bold line-height-inherit">
        <RouterLink v-if="showLink" :to="routerLinkUrl">
          {{ item.title }}
        </RouterLink>
        <span v-else>{{ item.title }}</span>
        <label class="badge badge-light ml-2">{{ $n(item.totalItems || 0) }}</label>
      </h3>
    </div>

    <div>
      <label class="text-muted small-caps">{{ $t('dates.lastModifiedDate') }}</label>
      {{ ' ' }}
      <TimeAgo class="small" :date="item.updatedAt" />
    </div>

    <blockquote class="text-muted" v-if="showDescription">
      {{ item.description }}
    </blockquote>
    <ContentItemIdLabel v-if="showId" :id="item.id"></ContentItemIdLabel>
  </div>
</template>

<script setup lang="ts">
import type { Collection } from '@/models/generated/canonical'
import ItemLabel from './ItemLabel.vue'
import Icon from '@/components/base/Icon.vue'
import TimeAgo from '@/components/TimeAgo.vue'
import { computed } from 'vue'
import { Routes } from '@/router/routes'
import ContentItemIdLabel from '@/components/ContentItemIdLabel.vue'

const props = defineProps<{
  item: Collection
  showIcon?: boolean
  showId?: boolean
  showDescription?: boolean
  showLink?: boolean
}>()

const routerLinkUrl = computed(() => {
  return {
    name: Routes.collections.children.collection.name,
    params: { collection_id: props.item.id }
  }
})
</script>
