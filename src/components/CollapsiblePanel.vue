<template>
  <div ref="rootRef" class="CollapsiblePanel" :class="className">
    <div ref="headerRef" class="d-flex justify-content-between align-items-center">
      <slot name="header">
        <div class="p-3">
          <h4 class="m-0">{{ title }}</h4>
          <p v-if="subtitle.length" class="mb-0">subtitle</p>
        </div>
      </slot>
      <button
        class="btn btn-sm mx-2"
        :class="{
          active: !isCollapsed
        }"
        @click="toggleCollapseOnClick"
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
import { ref, onMounted, watch } from 'vue'
import Icon from './base/Icon.vue'

const emit = defineEmits(['toggled'])

const props = defineProps({
  /** @type {string} */
  title: {
    type: String,
    required: true
  },
  /** @type {string} */
  subtitle: {
    type: String,
    default: ''
  },
  /** @type {boolean} */
  isCollapsedOnMounted: {
    type: Boolean,
    default: true
  },
  /** @type {string} */
  className: {
    type: String,
    default: ''
  },
  /** @type {number} */
  offsetHeight: {
    type: Number,
    default: 0
  }
})

const rootRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const isPristine = ref(true)
const isCollapsed = ref(true)
// at the very beginning, we want the height of rootRef equals headerRef only
// then, we want to animate the height of rootRef to the full height of the body
onMounted(() => {
  render()
})

const toggleCollapseOnClick = () => {
  isPristine.value = false
  isCollapsed.value = !isCollapsed.value
  render(true)
}

export interface CollapsiblePanelData {
  value: boolean
  collapsedHeight: number
  expandedHeight: number
}

// Watch prop value change and assign to value 'selected' Ref
watch(
  () => props.isCollapsedOnMounted,
  (a) => {
    console.log('isCollapsedOnMounted', a)
    isPristine.value = true
    render()
  }
)

watch(
  () => props.offsetHeight,
  () => {
    console.debug('[CollapsiblePanel] offsetHeight updated!')
    render()
  }
)

const render = (isEmittingEvent: boolean = false) => {
  const root = rootRef.value
  const header = headerRef.value
  if (!root || !header) {
    return
  }
  const collapsedHeight = `${header.offsetHeight}px`
  const expandedHeight = `${root.scrollHeight + props.offsetHeight}px`

  if (isPristine.value) {
    if (props.isCollapsedOnMounted) {
      root.style.height = collapsedHeight
      isCollapsed.value = true
    } else {
      root.style.height = expandedHeight
      isCollapsed.value = false
    }
  } else {
    if (isCollapsed.value) {
      root.style.height = collapsedHeight
    } else {
      root.style.height = expandedHeight
    }
  }
  isEmittingEvent &&
    emit('toggled', {
      value: isCollapsed.value,
      collapsedHeight: header.offsetHeight,
      expandedHeight: root.scrollHeight + props.offsetHeight
    })
}
</script>
<style>
.CollapsiblePanel {
  position: relative;
  overflow: hidden;
  will-change: height;
  transition: height 0.6s;
  transition-timing-function: var(--impresso-transition-ease);
}

.CollapsiblePanel h3 {
  font-family: var(--bs-font-sans-serif);
}
.CollapsiblePanel__body {
  min-height: 100px;
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
