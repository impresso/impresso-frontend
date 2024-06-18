<template>
  <div :class="colsClass" v-bind="$attrs">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'light',
  },
  variant: String,
  toggleable: {
    type: [Boolean, String],
    default: false,
  },
})
const attrs = useAttrs()

const allowedAttrs = ['onClick', 'title', 'id', 'class', 'style']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BNavbar: Unknown attributes: ${unknownAttrs.join(', ')}`)
}

let breakpoint: string | null = null
if (props.toggleable && props.toggleable !== 'xs') {
  breakpoint = `navbar-expand-${props.toggleable}`
} else if (props.toggleable === false) {
  breakpoint = 'navbar-expand'
}

const colsClass = computed(() => ({
  'navbar': true,
  [`${breakpoint}`]: breakpoint != null,
  [`navbar-${props.type}`]: !!props.type,
  [`bg-${props.variant}`]: !!props.variant,
}))
</script>
