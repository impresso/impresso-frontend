<template>
  <CollapsiblePanel
    class="TutorialMonitor border border-dark"
    :subtitle="subtitle"
    :title="title"
    :isCollapsedOnMounted="isCollapsed"
    :offsetHeight="offsetHeight"
  >
    <template v-slot:header>
      <div class="p-3">
        <h3 class="mb-0">{{ title }}</h3>
        <span class="text-muted">{{ subtitle }}</span>
      </div>
    </template>
    <ol>
      <li v-for="(task, idx) in tasks">
        <TutorialTask
          :task="task"
          :taskNum="idx + 1"
          @toggled="(payload: CollapsiblePanelData) => onTutorialTaskToggled(idx, payload)"
        ></TutorialTask>
      </li>
    </ol>
  </CollapsiblePanel>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import CollapsiblePanel, { CollapsiblePanelData } from './CollapsiblePanel.vue'
import TutorialTask from './TutorialTask.vue'

const offsetHeights = ref({})
const offsetHeight = computed(() =>
  Object.keys(offsetHeights.value).reduce((acc, k) => acc + offsetHeights[k], 0)
)

defineProps({
  /** @type {string} */
  title: {
    type: String,
    required: true
  },
  isCollapsed: {
    type: Boolean,
    default: true
  },
  /** @type {string} */
  subtitle: {
    type: String,
    default: ''
  },
  /** @type {import('@/models').TutorialTask[]} */
  tasks: {
    type: Array,
    required: true
  }
})

const onTutorialTaskToggled = (idx: number, payload: CollapsiblePanelData) => {
  console.debug('[TutorialMonitor] idx', idx, '@onTutorialTaskToggled', payload)
  offsetHeights[idx] = payload.value ? 50 : payload.expandedHeight
}
</script>
<style>
.TutorialMonitor.CollapsiblePanel {
  box-shadow: var(--bs-box-shadow-sm);
  border-radius: var(--border-radius-lg);
}
.TutorialMonitor ol {
  list-style-type: none;
  padding-inline-start: 0;
  padding-inline-end: 0;
  margin-inline-start: var(--spacing-2);
  margin-inline-end: var(--spacing-2);

  margin-bottom: var(--spacing-1);
}
.TutorialMonitor li {
  border-top: 1px solid var(--clr-grey-200);
}
.TutorialMonitor li:first-of-type {
  border-top-width: 0px;
}
.TutorialMonitor h3 {
  font-size: var(--impresso-font-size-smallcaps);
  font-family: var(--bs-font-sans-serif);
  text-transform: uppercase;
  letter-spacing: var(--impresso-letter-spacing-smallcaps);
  font-weight: var(--impresso-wght-smallcaps);
  font-variation-settings: 'wght' var(--impresso-wght-smallcaps);
}
</style>
