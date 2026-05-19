<template>
  <span class="TopicWord" :class="{ 'TopicWord--highlighted': item.h }" :style="wordStyle">
    {{ item.w }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TopicWordModel from '@/models/TopicWord'

export interface TopicWordProps {
  item: TopicWordModel
}

const props = defineProps<TopicWordProps>()

const wordStyle = computed(() => {
  const opacity = Math.max(0.35, Math.min(1, props.item.l || 0))
  return {
    opacity: `${opacity}`
  }
})
</script>

<style scoped>
.TopicWord {
  display: inline-block;
  margin-right: 0.35rem;
}

.TopicWord--highlighted {
  font-weight: 600;
}
</style>
