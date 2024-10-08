<template>
  <div :class="gClass" v-bind="$attrs">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

const props = defineProps({
  size: String,
})
const attrs = useAttrs()

const allowedAttrs = ['onClick', 'title', 'class', 'style']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BButtonGroup: Unknown attributes: ${unknownAttrs.join(', ')}`)
}


const gClass = computed(() => ({
  'btn-group': true,
  [`btn-group-${props.size}`]: props.size != null
}))
</script>
