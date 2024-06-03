<template>
  <div :class="cClass" v-on="$listeners">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

const props = defineProps({
  fluid: {
    type: Boolean,
    default: false,
  }
})
const attrs = useAttrs()

const allowedAttrs = ['onClick', 'title']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BContainer: Unknown attributes: ${unknownAttrs.join(', ')}`)
}


const cClass = computed(() => ({
  container: !props.fluid,
  'container-fluid': props.fluid,
}))
</script>
