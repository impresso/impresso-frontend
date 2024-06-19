<template>
  <div ref="rootRef" class="CollapsiblePanel" :class="className" :style="rootStyles">
    <div
      ref="headerRef"
      class="CollapsiblePanel__header d-flex justify-content-between align-items-center"
      @click="togglePanelState"
    >
      <slot name="header">
        <div class="p-3">
          <h4 class="m-0">{{ title }}</h4>
          <p v-if="subtitle.length" class="mb-0">subtitle</p>
        </div>
      </slot>
      <button
        class="btn btn-sm btn-icon mx-2"
        :class="{
          active: modelValue
        }"
      >
        <Icon name="chevron" />
      </button>
    </div>
    <div class="CollapsiblePanel__body position-absolute">
      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
/**
 * Model value is used to control the visibility of the panel.
 */

import { ref, computed, watch } from 'vue'
import Icon from './base/Icon.vue'

const emit = defineEmits(['update:modelValue', 'heightChanged'])

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  className: {
    type: String,
    default: ''
  }
})

const rootRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)

const togglePanelState = () => {
  emit('update:modelValue', !props.modelValue)
}

const collapsedHeight = computed(() => {
  const header = headerRef.value
  return header ? `${header.offsetHeight}px` : 'auto'
})

const expandedHeight = computed(() => {
  const root = rootRef.value
  const parsedOffset = parseInt(collapsedHeight.value)
  const offset = isNaN(parsedOffset) ? 0 : parsedOffset
  return root ? `${root.scrollHeight + offset}px` : 'auto'
})

const rootStyles = computed(() => {
  return {
    height: props.modelValue ? expandedHeight.value : collapsedHeight.value
  }
})

watch(
  () => rootStyles.value.height,
  (height) => {
    emit('heightChanged', height)
  },
  { immediate: true }
)
</script>

<style>
.CollapsiblePanel {
  position: relative;
  overflow: hidden;
  will-change: height;
  transition: height 0.6s;
  transition-timing-function: var(--impresso-transition-ease);
}

.CollapsiblePanel__header {
  cursor: pointer;
  user-select: none;
  box-sizing: border-box;
}

.CollapsiblePanel h3 {
  font-family: var(--bs-font-sans-serif);
}

.CollapsiblePanel__body {
  min-height: 50px;
  width: 100%;
}

.CollapsiblePanel button {
  transition: transform 0.3s;
  transition-timing-function: var(--impresso-transition-ease);
}

.CollapsiblePanel button.active {
  transform: rotate(180deg);
}
</style>
