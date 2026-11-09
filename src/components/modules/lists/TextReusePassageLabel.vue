<template>
  <span>
    <span class="small-caps">{{ $d(summary.date, 'long').toLowerCase() }}</span>
    "{{ summary.excerpt }}"
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'TextReusePassageLabel' })

const props = defineProps<{
  item: Record<string, any>
}>()

const summary = computed(() => {
  const { date, content } = props.item
  return {
    date: date instanceof Date ? date : new Date(date),
    // ellipsis at the end if needed
    excerpt: content.length > 50 ? `${content.substring(0, 50)}…` : content
  }
})
</script>
