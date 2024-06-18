<template>
  <ul :class="colsClass" v-bind="$attrs">
    <slot></slot>
  </ul>
</template>

<script setup lang="ts">
/**
 * @deprecated Use pure Bootstrap CSS instead
 */

import { computed, useAttrs } from 'vue'

const props = defineProps({})
const attrs = useAttrs()

const allowedAttrs = ['onClick', 'title', 'id', 'class', 'style']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BNavbarNav: Unknown attributes: ${unknownAttrs.join(', ')}`)
}

const colsClass = computed(() => ({
  'navbar-nav': true,
}))
</script>
