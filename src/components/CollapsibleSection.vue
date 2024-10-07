<template>
  <CollapsiblePanel
    class="CollapsibleSection border border-dark"
    v-model="isOpen"
    :subtitle="subtitle"
    :title="title"
    :style="{ height: isOpen ? `${offsetHeight}px` : `${headerHeight}px` }"
  >
    <template v-slot:header>
      <div class="p-3">
        <h3 class="mb-0">{{ title }}</h3>
        <span class="text-muted">{{ subtitle }}</span>
      </div>
    </template>
    <ol>
      <li v-for="(paragraph, idx) in paragraphs" :key="paragraph.id">
        <CollapsibleParagraph
          :modelValue="currentOpenTaskId === paragraph.id"
          :paragraph="paragraph"
          :taskNum="idx + 1"
          @update:modelValue="(value: boolean) => (currentOpenTaskId = value ? task.id : null)"
          @heightChanged="(e: string) => updateHeight(paragraph.id, e)"
        >
        </CollapsibleParagraph>
      </li>
    </ol>
  </CollapsiblePanel>
</template>
<script setup lang="ts">
import { computed, PropType, ref, watch } from 'vue'
import CollapsiblePanel from './CollapsiblePanel.vue'
import CollapsibleParagraph from './CollapsibleParagraph.vue'
import type { ICollapsibleParagraph } from '../models/CollapsibleParagraph'

// TODO: Get from the element?
const headerHeight = 50

const offsetHeights = ref<Record<string, number>>({})
const offsetHeight = computed(
  () => headerHeight + Object.values(offsetHeights.value).reduce((a, b) => a + b, 0)
)

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  isCollapsed: {
    type: Boolean,
    default: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  paragraphs: {
    type: Array as PropType<ICollapsibleParagraph[]>,
    required: true
  },
  initialOpenedParagraphId: {
    type: String,
    default: null
  }
})

const isOpen = ref(!props.isCollapsed)
const currentOpenTaskId = ref<string | null>(props.initialOpenedParagraphId)

watch(
  () => props.isCollapsed,
  isCollapsed => {
    isOpen.value = !isCollapsed
  }
)

const updateHeight = (id: string, height: string) => {
  const heightAsNumber = parseInt(height.replace('px', ''))
  offsetHeights.value[id] = isNaN(heightAsNumber) ? 0 : heightAsNumber
}

// const onTutorialTaskToggled = (idx: number, payload: CollapsiblePanelData) => {
//   console.debug('[CollapsibleSection] idx', idx, '@onTutorialTaskToggled', payload)
//   offsetHeights[idx] = payload.value ? 50 : payload.expandedHeight
// }
</script>

<style>
.CollapsibleSection.CollapsiblePanel {
  box-shadow: var(--bs-box-shadow-sm);
  border-radius: var(--border-radius-lg);
}

.CollapsibleSection ol {
  list-style-type: none;
  padding-inline-start: 0;
  padding-inline-end: 0;
  margin-inline-start: var(--spacing-2);
  margin-inline-end: var(--spacing-2);

  margin-bottom: var(--spacing-1);
}

.CollapsibleSection li {
  border-top: 1px solid var(--clr-grey-200);
}

.CollapsibleSection li:first-of-type {
  border-top-width: 0px;
}

.CollapsibleSection h3 {
  font-size: var(--impresso-font-size-smallcaps);
  font-family: var(--bs-font-sans-serif);
  text-transform: uppercase;
  letter-spacing: var(--impresso-letter-spacing-smallcaps);
  font-weight: var(--impresso-wght-smallcaps);
  font-variation-settings: 'wght' var(--impresso-wght-smallcaps);
}
</style>
