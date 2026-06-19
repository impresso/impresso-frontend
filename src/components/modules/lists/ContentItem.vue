<template>
  <div class="ContentItem d-flex gap-3" @click="emit('click', contentItem)">
    <div v-if="shouldShowIIIFThumbnail" class="thumbnail">
      <IIIFFragment
        :iiif="thumbnailIiif"
        size="250,"
        :scale="1"
        fit-to-regions
        :regions="regions"
      />
    </div>
    <div>
      <ContentItemCommon
        v-if="props.contentItem"
        :contentItem="props.contentItem"
        iconName="journalPage"
        :enableAddToCollection="props.enableAddToCollection"
        :showCollections="props.showCollections"
        :showDate="props.showDate"
        :showIcon="props.showIcon"
        :showLink="props.showLink"
        :showTitle="props.showTitle"
        :showMeta="props.showMeta"
        :showSnippet="props.showSnippet"
        :showMatches="props.showMatches"
        :showMediaSource="props.showMediaSource"
        :showProvider="props.showProvider"
        :showType="props.showType"
        :showTopics="props.showTopics"
        :showSpecs="props.showSpecs"
        :showContentItemAccess="props.showContentItemAccess"
        :showSemanticEnrichments="props.showSemanticEnrichments"
      ></ContentItemCommon>

      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import IIIFFragment from '@/components/IIIFFragment.vue'
import type { ContentItem } from '@/models/generated/canonical/contentItem'
import { computed } from 'vue'
import ContentItemCommon, {
  ContentItemCommonProps
} from '@/components/contentItem/ContentItemCommon.vue'

export interface ContentItemProps extends ContentItemCommonProps {
  showIIIFThumbnail?: boolean
}

const props = withDefaults(defineProps<ContentItemProps>(), {
  showTitle: true,
  showType: true
})
const emit = defineEmits<{
  click: [item: ContentItem]
}>()

const isThumbnailAvailable = computed(() => {
  return (
    props.contentItem?.facsimile?.pages?.length > 0 &&
    props.contentItem?.facsimile?.pages?.[0]?.iiif
  )
})

const shouldShowIIIFThumbnail = computed(() => {
  return props.showIIIFThumbnail && isThumbnailAvailable.value
})
const thumbnailIiif = computed(() => {
  return props.contentItem?.facsimile?.pages?.[0]?.iiif.manifestUrl
})
const regions = computed(() => {
  const firstPage = props.contentItem.facsimile?.pages?.[0]
  const regionCoordinates = firstPage?.regionCoordinates ?? []

  return regionCoordinates.map((coords, index) => ({
    id: `${firstPage?.id ?? 'page-0'}-${index}`,
    coords: {
      x: coords[0],
      y: coords[1],
      w: coords[2],
      h: coords[3]
    }
  }))
})
</script>
<style>
.ContentItem .thumbnail {
  width: 250px;
  min-width: 250px;
  flex: 0 0 250px;
  max-height: 300px;
  overflow: hidden;
  position: relative;
}

.ContentItem .thumbnail .IIIFFragment__region {
  background-color: transparent;
}
</style>
