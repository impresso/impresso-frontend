<template>
  <CollapsiblePanel
    class="TutorialTask"
    :title="task.title"
    @toggled="(payload: CollapsiblePanelData) => $emit('toggled', payload)"
  >
    <div v-html="task.description"></div>
  </CollapsiblePanel>
</template>
<script setup lang="ts">
import CollapsiblePanel, { CollapsiblePanelData } from './CollapsiblePanel.vue'
defineEmits(['toggled'])
defineProps({
  /** @type {import('@/models').TutorialTask} */
  task: {
    type: Object,
    required: true
  }
})
</script>
