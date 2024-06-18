<template>
  <div :class="rowClass" v-bind="$attrs">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

const props = defineProps({
  noGutters: {
    type: Boolean,
    default: false,
  }
})
const attrs = useAttrs()

const allowedAttrs = ['onClick', 'title', 'class', 'style']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BRow: Unknown attributes: ${unknownAttrs.join(', ')}`)
}


const rowClass = computed(() => ({
  'row': true,
  'no-gutters': props.noGutters,
}))
</script>
