<template>
  <div class="content-item-viewer d-flex" :style="backgroundStyle">
    <IIIFViewer
      class="h-100"
      :manifestUrls="[
        'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f8/info.json',
        'https://iiif.eluxemburgensia.lu/image/iiif/2/ark:70795%2f4bzmz8%2fpages%2f9/info.json'
      ]"
      v-if="isViewerReady"
    />
    <ContentItem
      v-if="contentItem && !props.hideContentItem"
      showMeta
      :item="contentItem"
    ></ContentItem>
  </div>
</template>
<script setup lang="ts">
import IIIFViewer from '@/components/modules/IIIFViewer.vue'

import ContentItem from '../../components/modules/lists/ContentItem.vue'
import type { ContentItem as ContentItemType } from '../../models/generated/schemas/contentItem'

import { contentItems as contentItemsService } from '../../services'
import { computed, ref, watch } from 'vue'

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
const contentItem = ref<any>(null)
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
      contentItem.value = await contentItemsService
        .get(newContentItemId)
        .catch(err => {
          console.error('[ContentItemViewer] error loading content item:', err)
          return null
        })
        .then((data: ContentItemType) => {
          if (data.text?.title && props.alternativeTitle) {
            data.text.title = props.alternativeTitle
          }
          return data
        })

      isViewerReady.value = true
    }
  },
  { immediate: true }
)
</script>
