<template>
  <div class="MediaSourceItem">
    <div class="d-flex gap-3" @click="emit('click', mediaSourceItem)">
      <h2 v-if="showTitle" class="m-0 font-size-inherit font-weight-bold line-height-inherit">
        <RouterLink v-if="showLink" :to="routerLinkUrl" v-html="mediaSourceTitle"></RouterLink>
        <span v-else v-html="mediaSourceTitle"></span>
      </h2>
    </div>
    <div v-if="shouldShowType || shouldShowMedium || showProvider">
      <DataProviderLabel
        v-if="showProvider"
        :item="dataProviderItem"
        :showLink="showLink"
        class="small-caps"
      />
      <span v-if="shouldShowType" class="text-muted small-caps">
        {{ $t(`buckets.sourceType.${mediaSourceItem.type}`) }}
        {{ ' ' }}
      </span>
      <span v-if="shouldShowMedium" class="text-muted small">
        {{ $t(`buckets.sourceMedium.${mediaSourceItem.medium}`) }}
        {{ ' ' }}
      </span>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { MediaSource } from '@/models/generated/canonical'
import { Routes } from '@/router/routes'
import { computed } from 'vue'
import { RouteLocationNamedRaw } from 'vue-router'
import DataProviderLabel from './DataProviderLabel.vue'

export interface MediaSourceItemProps {
  mediaSourceItem: MediaSource
  showTitle?: boolean
  showLink?: boolean
}

const props = withDefaults(
  defineProps<{
    mediaSourceItem: MediaSource
    showTitle?: boolean
    showLink?: boolean
    showProvider?: boolean
    showType?: boolean
    showMedium?: boolean
  }>(),
  {
    showTitle: true,
    showLink: true,
    showProvider: false,
    showType: false,
    showMedium: false
  }
)
const emit = defineEmits<{
  click: [item: MediaSource]
}>()

const shouldShowType = computed(() => {
  return props.showType && props.mediaSourceItem?.type
})

const shouldShowMedium = computed(() => {
  return props.showMedium && props.mediaSourceItem?.medium
})

const mediaSourceTitle = computed(() => {
  if (!props.mediaSourceItem) {
    return '...'
  }
  if (!Array.isArray(props.mediaSourceItem?.publishedPeriodYears)) {
    return props.mediaSourceItem.name
  }
  const [startYear, endYear] = props.mediaSourceItem.publishedPeriodYears

  return (
    props.mediaSourceItem.name +
    (startYear ? ` (${startYear}` : '') +
    (endYear ? ` - ${endYear})` : startYear ? ')' : '')
  )
})

const routerLinkUrl = computed(() => {
  return {
    name: Routes.mediaSource.children.metadata.name,
    params: { media_source_id: props.mediaSourceItem?.id }
  } as RouteLocationNamedRaw
})

const dataProviderItem = computed(() => {
  return {
    id: 'fff',
    name: 'ddd'
  }
})
</script>
