<template>
  <li class="nav-item b-nav-dropdown dropdown" :class="ddClasses">
    <a
      :class="linkClasses"
      href="#"
      target="_self"
      @click="handleChanged"
      :id="elementId"
      aria-haspopup="true"
      aria-expanded="false"
    >
      <slot name="button-content"></slot>
    </a>
    <ul
      tabindex="-1"
      class="dropdown-menu dropdown-menu-right"
      :class="menuClasses"
      x-placement="top-end"
      :style="menuStyle"
      :aria-labelledby="elementId"
    >
      <slot></slot>
    </ul>
  </li>
</template>

<script setup lang="ts">
/**
 * @deprecated Use pure Bootstrap CSS instead
 */

import { computed, useAttrs, ref, watch } from 'vue'
import { v4 } from 'uuid'

const props = defineProps({
  to: {
    type: Object
  },
  activeClass: {
    type: String,
    default: 'active'
  },
  active: Boolean
})
const attrs = useAttrs()
const emit = defineEmits(['hidden'])

const allowedAttrs = ['onClick', 'title', 'id', 'class', 'style']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BNavItem: Unknown attributes: ${unknownAttrs.join(', ')}`)
}

const isDisplayed = ref(false)

const handleChanged = (e: Event) => {
  e.preventDefault()
  isDisplayed.value = !isDisplayed.value
}

watch(isDisplayed, value => {
  if (!value) {
    emit('hidden')
  }
})

const linkClasses = computed(() => ({
  'nav-link': true,
  'dropdown-toggle': true,
  'dropdown-toggle-no-caret': true,
  [String(props.activeClass)]: isDisplayed.value
}))

const ddClasses = computed(() => ({
  show: isDisplayed.value
}))

const menuClasses = computed(() => ({
  show: isDisplayed.value
}))

const menuStyle = computed(() =>
  isDisplayed.value
    ? 'position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(0px, -3px, 0px);'
    : ''
)

const elementId = computed(() => v4())

interface Showable {
  show: () => void
}

defineExpose({
  show: () => {
    isDisplayed.value = true
  }
})
</script>
