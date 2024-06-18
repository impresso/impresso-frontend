<template>
  <div :class="colsClass" v-bind="$attrs">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

const props = defineProps({
  col: {
    type: Boolean,
    default: false,
  },
  cols: String,
  offsetMd: String,
  xs: String,
  sm: String,
  md: String,
  lg: String,
  xl: String,
  xxl: String,
})
const attrs = useAttrs()

const allowedAttrs = ['onClick', 'title', 'class', 'style']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BCol: Unknown attributes: ${unknownAttrs.join(', ')}`)
}


const colsClass = computed(() => ({
  'col': true,
  [`col-${props.cols}`]: props.cols,
  [`offset-md-${props.offsetMd}`]: props.offsetMd,
  [`col-xs-${props.xs}`]: props.xs,
  [`col-sm-${props.sm}`]: props.sm,
  [`col-md-${props.md}`]: props.md,
  [`col-lg-${props.lg}`]: props.lg,
  [`col-xl-${props.xl}`]: props.xl,
  [`col-xxl-${props.xxl}`]: props.xxl,
}))
</script>
