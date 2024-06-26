<template>
  <button type="button" :class="buttonClass" :disabled="props.disabled ? true : undefined" v-bind="$attrs"
    :data-testid="dataTestid">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

const props = defineProps({
  variant: String,
  size: String,
  block: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  pill: {
    type: Boolean,
    default: false,
  },
  dataTestid: {
    type: String,
    default: undefined,
  },
})
const attrs = useAttrs()
Object.keys(attrs)

const allowedAttrs = ['onClick', 'title', 'class', 'style']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BButton: Unknown attributes: ${unknownAttrs.join(', ')}`)
}


const buttonClass = computed(() => ({
  'btn': true,
  [`btn-${props.variant || 'secondary'}`]: true,
  [`btn-${props.size}`]: props.size,
  'btn-block': props.block,
  'disabled': props.disabled,
  'rounded-pill': props.pill,
}))
</script>
