<template>
  <div class="content-item-debug">
    <pre>{{ JSON.stringify(contentItem, null, 2) }}</pre>
  </div>
</template>
<script setup lang="ts">
import { ContentItem } from '@/models/generated/canonical/contentItem'

const props = defineProps<{
  contentItem: ContentItem
}>()
</script>
