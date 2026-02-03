<template>
  <div class="Minimap" ref="minimapRef" @mousedown="handleMouseDown">
    <div
      class="Minimap__viewportIndicator"
      :style="{
        width: viewportWidthPercent + '%',
        height: viewportHeightPercent + '%',
        left: viewportXPercent + '%',
        top: viewportYPercent + '%'
      }"
    />
    <div class="Minimap__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * Props for the Minimap component
 */
export interface MinimapProps {
  clientHeight: number
  clientWidth: number
  scrollHeight: number
  scrollWidth: number
  scrollTop?: number
  scrollLeft?: number
}

const props = withDefaults(defineProps<MinimapProps>(), {
  scrollTop: 0,
  scrollLeft: 0
})

const emit = defineEmits<{
  (e: 'updateScroll', value: { scrollLeft: number; scrollTop: number }): void
}>()

const minimapRef = ref<HTMLElement>()

// Calculate viewport indicator dimensions as percentages
const viewportWidthPercent = computed(() => (props.clientWidth / props.scrollWidth) * 100)
const viewportHeightPercent = computed(() => (props.clientHeight / props.scrollHeight) * 100)

// Calculate viewport indicator position as percentages
const viewportXPercent = computed(() => (props.scrollLeft / props.scrollWidth) * 100)
const viewportYPercent = computed(() => (props.scrollTop / props.scrollHeight) * 100)

const isDragging = ref(false)

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  updateScrollPosition(e)
  console.debug('[Minimap] @mousedown')

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.value) {
      updateScrollPosition(e)
    }
  }

  const handleMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const updateScrollPosition = (e: MouseEvent) => {
  if (!minimapRef.value) return

  const rect = minimapRef.value.getBoundingClientRect()

  // Get click position relative to minimap as percentages
  let xPercent = ((e.clientX - rect.left) / rect.width) * 100
  let yPercent = ((e.clientY - rect.top) / rect.height) * 100

  // Center the viewport on the click point
  xPercent -= viewportWidthPercent.value / 2
  yPercent -= viewportHeightPercent.value / 2

  // Convert percentage coordinates to scroll coordinates
  const newScrollLeft = (xPercent / 100) * props.scrollWidth
  const newScrollTop = (yPercent / 100) * props.scrollHeight

  // Clamp values to valid scroll range
  const clampedScrollLeft = Math.max(
    0,
    Math.min(newScrollLeft, props.scrollWidth - props.clientWidth)
  )
  const clampedScrollTop = Math.max(
    0,
    Math.min(newScrollTop, props.scrollHeight - props.clientHeight)
  )
  emit('updateScroll', {
    scrollLeft: clampedScrollLeft,
    scrollTop: clampedScrollTop
  })
}
</script>

<style>
.Minimap {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  border: 1px solid #ccc;
  cursor: pointer;
  user-select: none;
}

.Minimap:active {
  cursor: grabbing;
}

.Minimap__viewportIndicator {
  position: absolute;
  background: rgba(66, 135, 245, 0.3);
  border: 2px solid #4287f5;
  box-sizing: border-box;
  pointer-events: none;
}
.Minimap__content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}
</style>
