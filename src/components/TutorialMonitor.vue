<template>
  <div ref="rootRef" class="TutorialMonitor">
    <div ref="headerRef" class="d-flex justify-content-between align-items-center p-4">
      <div>
        <h3>Hello! {{ title }}</h3>
        <p class="mb-0">subtitle</p>
      </div>
      <button
        class="btn btn-sm"
        :class="{
          active: !isCollapsed
        }"
        @click="toggleCollapse"
      >
        <Icon name="chevron" />
      </button>
    </div>
    <div class="TutorialMonitor__body position-absolute">
      ciccio pasticcio
      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps, ref, onMounted } from 'vue'
import Icon from './base/Icon.vue'

const rootRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const isCollapsed = ref(true)
const props = defineProps({
  /** @type {string} */
  title: {
    type: String,
    required: true
  }
})

// at the very beginning, we want the height of rootRef equals headerRef only
// then, we want to animate the height of rootRef to the full height of the body

onMounted(() => {
  const root = rootRef.value
  const header = headerRef.value
  if (root && header) {
    root.style.height = `${header.offsetHeight}px`
    // hidden
    root.style.overflow = 'hidden'
  }
})

const toggleCollapse = () => {
  const root = rootRef.value
  const header = headerRef.value
  if (root && header) {
    if (isCollapsed.value) {
      root.style.height = `${root.scrollHeight}px`
      isCollapsed.value = false
    } else {
      root.style.height = `${header.offsetHeight}px`
      isCollapsed.value = true
    }
  }
}
</script>
<style>
.TutorialMonitor {
  box-shadow: var(--bs-box-shadow-sm);
  border-radius: var(--border-radius-lg);
  position: relative;
  overflow: hidden;
  will-change: height;
  transition: height 0.6s;
  transition-timing-function: var(--impresso-transition-ease);
}

.TutorialMonitor h3 {
  font-family: var(--bs-font-sans-serif);
}
.TutorialMonitor__body {
  height: 100px;
  background: var(--clr-grey-500);
}
.TutorialMonitor button {
  transition: transform 0.6s;
  transition-timing-function: var(--impresso-transition-ease);
}
.TutorialMonitor button.active {
  transform: rotate(180deg);
}
</style>
