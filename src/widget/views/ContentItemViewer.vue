<template>
  <div class="content-item-viewer d-flex" :style="backgroundStyle">
    <IIIFViewer class="h-100" :manifestUrls="manifestUrls" v-if="isViewerReady" />
    <ContentItemCitation
      v-if="!props.hideContentItem && contentItem"
      :item="contentItem"
    ></ContentItemCitation>
  </div>
</template>
<script setup lang="ts">
import IIIFViewer from '@/components/modules/IIIFViewer.vue'

import type { ContentItem as ContentItemType } from '../../models/generated/schemas/contentItem'

import { contentItems as contentItemsService } from '../../services'
import { computed, ref, watch } from 'vue'
import ContentItemCitation from '@/components/ContentItemCitation.vue'

export interface ContentItemViewerProps {
  backgroundSize?: string
  backgroundColor?: string
  cssFilter?: string
  overlayBackgroundColor?: string
  coordsMargin?: string
  coords?: string
  contentItemId: string
  alternativeTitle?: string
  hideContentItem?: boolean
}

const isViewerReady = ref<boolean>(true)
const contentItem = ref<ContentItemType | null>(null)
const props = withDefaults(defineProps<ContentItemViewerProps>(), {
  hideContentItem: false
})

const backgroundStyle = computed(() => {
  const backGroundColor = props.backgroundColor
    ? props.backgroundColor.match(/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
      ? `#${props.backgroundColor}`
      : props.backgroundColor
    : 'transparent'
  return {
    backgroundSize: props.backgroundSize || 'contain',
    backgroundColor: backGroundColor,
    filter: props.cssFilter || 'none'
  }
})

watch(
  () => props.contentItemId,
  async newContentItemId => {
    isViewerReady.value = false
    if (newContentItemId) {
      const data = (contentItem.value = await contentItemsService
        .get(newContentItemId)
        .catch(err => {
          console.error('[ContentItemViewer] error loading content item:', err)
          return null
        }))
      if (data && data.text?.title && props.alternativeTitle) {
        data.text.title = props.alternativeTitle
      }
      contentItem.value = data

      isViewerReady.value = true
    }
  },
  { immediate: true }
)
const manifestUrls = computed<string[]>(() => {
  if (
    !contentItem.value ||
    (Array.isArray(contentItem.value.image?.pages) && contentItem.value.image.pages.length === 0)
  ) {
    return []
  }
  return contentItem.value.image.pages
    .map(page => page.iiif?.manifestUrl || '')
    .filter(url => url.length > 0)
})
</script>
