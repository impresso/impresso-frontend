<template>
  <CollapsiblePanel
    class="CollapsibleParagraph"
    v-model="state"
    :title="paragraph.title"
    @heightChanged="e => emit('heightChanged', e)"
  >
    <template v-slot:header>
      <div class="d-flex align-items-center">
        <h4 class="mb-0">{{ paragraph.title }}</h4>
      </div>
    </template>
    <div v-html="paragraph.description"></div>
    <ol v-if="paragraph.paragraphs.length">
      <li
        v-for="(subtask, idx) in paragraph.paragraphs"
        :key="subtask.id"
        class="pt-2 mb-2 mx-2 d-flex align-items-center"
      >
        <div class="p-1 flex-grow-1">
          {{ subtask.title }}
        </div>
      </li>
    </ol>
  </CollapsiblePanel>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import CollapsiblePanel from './CollapsiblePanel.vue'
import type { ICollapsibleParagraph } from '@/models/CollapsibleParagraph'

const emit = defineEmits(['update:modelValue', 'heightChanged'])

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
    required: true
  },
  paragraph: {
    type: Object as PropType<ICollapsibleParagraph>,
    required: true
  },
  taskNum: {
    type: Number,
    required: true
  }
})

const state = computed({
  set(value: boolean) {
    emit('update:modelValue', value)
  },
  get() {
    return props.modelValue
  }
})
</script>
<style>
.CollapsibleParagraph h4 {
  font-family: var(--bs-font-sans-serif);
  font-size: inherit;
}

.CollapsibleParagraph__num {
  font-size: var(--impresso-font-size-smallcaps);
  font-family: var(--bs-font-sans-serif);
  text-transform: uppercase;
  letter-spacing: var(--impresso-letter-spacing-smallcaps);
  font-weight: var(--impresso-wght-smallcaps);
  font-variation-settings: 'wght' var(--impresso-wght-smallcaps);
}

.CollapsibleParagraph.CollapsiblePanel {
  box-shadow: none;
  border-radius: 0;
}
</style>
