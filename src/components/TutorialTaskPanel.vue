<template>
  <CollapsiblePanel
    class="TutorialTask"
    v-model="state"
    :title="task.title"
    @heightChanged="e => emit('heightChanged', e)"
  >
    <template v-slot:header>
      <div class="d-flex align-items-center">
        <div class="TutorialTask__num py-3 px-2 mb-0">{{ taskNum }}</div>
        <h4 class="mb-0">{{ task.title }} {{ task.getCompletion() }}</h4>
      </div>
    </template>
    <img v-if="task.coverUrl" :src="task.coverUrl" alt="task screencast video" class="img-fluid" />
    <div v-html="task.description"></div>
    <ol v-if="task.tasks.length">
      <li
        v-for="(subtask, idx) in task.tasks"
        :key="subtask.id"
        class="pt-2 mb-2 mx-2 d-flex align-items-center"
      >
        <div class="p-1 flex-grow-1">
          {{ subtask.title }}
        </div>
        <div class="pr-2 flex-shrink-1">{{ subtask.status }}</div>
      </li>
    </ol>
  </CollapsiblePanel>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import CollapsiblePanel from './CollapsiblePanel.vue'
import { ITutorialTask } from '@/models/TutorialTask'

const emit = defineEmits(['update:modelValue', 'heightChanged'])

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
    required: true
  },
  task: {
    type: Object as PropType<ITutorialTask>,
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
.TutorialTask h4 {
  font-family: var(--bs-font-sans-serif);
  font-size: inherit;
}

.TutorialTask__num {
  font-size: var(--impresso-font-size-smallcaps);
  font-family: var(--bs-font-sans-serif);
  text-transform: uppercase;
  letter-spacing: var(--impresso-letter-spacing-smallcaps);
  font-weight: var(--impresso-wght-smallcaps);
  font-variation-settings: 'wght' var(--impresso-wght-smallcaps);
}

.TutorialTask.CollapsiblePanel {
  box-shadow: none;
  border-radius: 0;
}
</style>
