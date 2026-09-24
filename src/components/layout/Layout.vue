<template>
  <main :style="computedStyle">
    <slot />
  </main>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

/*
<i-layout id="SearchPage" width="800px" />
<i-layout id="SearchPage" min-width="500px" max-width="800px" />
*/

interface Props {
  width?: string | false // 50vw, 768px, 80%
  minWidth?: string | false
  maxWidth?: string | false
}

const props = withDefaults(defineProps<Props>(), {
  width: false,
  minWidth: false,
  maxWidth: false
})

const computedStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    width: props.width || '100%'
  }
  if (props.minWidth) {
    style.minWidth = props.minWidth
  }
  if (props.maxWidth) {
    style.maxWidth = props.maxWidth
  }
  return style
})
</script>

<style scoped lang="scss">
main {
  height: 100%;
  width: 100%;
  display: flex;
  margin: 0 auto; // center if width is not 100% of viewport
}
</style>
