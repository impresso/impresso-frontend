<template>
  <div class="ContentItemTopicItem">
    <VizBar
      show-percent
      type="topic"
      :percent="item.relevance * 100"
      :id="item.id"
      :item="{
        ...item,
        id: item.id,
        name: item.label
      }"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * This component visualizes the Content Item Topics in relation to a Content Item.
 */
import VizBar from '@/components/base/VizBar.vue'
import { ContentItemTopic } from '@/models/generated/canonical/contentItem'

export interface ContentItemTopicItemProps {
  item: ContentItemTopic
}
defineProps<ContentItemTopicItemProps>()
</script>
