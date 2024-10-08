<template>
  <span :class="bClass" v-bind="$attrs">
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'secondary',
  },
  pill: Boolean,
  active: Boolean,
  disabled: Boolean,
})
const attrs = useAttrs()

const allowedAttrs = ['onClick', 'title', 'class', 'style']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BBadge: Unknown attributes: ${unknownAttrs.join(', ')}`)
}


const bClass = computed(() => ({
  badge: true,
  [`badge-${props.variant}`]: props.variant != null,
  'badge-pill': props.pill,
  'active': props.active,
  'disabled': props.disabled,
}))
</script>
