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
  (e: 'update:scrollTop', value: number): void
  (e: 'update:scrollLeft', value: number): void
}>()

// Minimap dimensions
const minimapWidth = 200
const minimapHeight = 150

// Scale factors
const scaleX = computed(() => minimapWidth / props.scrollWidth)
const scaleY = computed(() => minimapHeight / props.scrollHeight)

// Viewport indicator dimensions and position
const viewportWidth = computed(() => props.clientWidth * scaleX.value)
const viewportHeight = computed(() => props.clientHeight * scaleY.value)
const viewportX = computed(() => props.scrollLeft * scaleX.value)
const viewportY = computed(() => props.scrollTop * scaleY.value)

const isDragging = ref(false)

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  updateScrollPosition(e)

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
  if (!e.currentTarget) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()

  // Get click position relative to minimap
  let x = e.clientX - rect.left
  let y = e.clientY - rect.top

  // Center the viewport on the click point
  x -= viewportWidth.value / 2
  y -= viewportHeight.value / 2

  // Convert minimap coordinates to scroll coordinates
  const newScrollLeft = x / scaleX.value
  const newScrollTop = y / scaleY.value

  // Clamp values to valid scroll range
  const clampedScrollLeft = Math.max(
    0,
    Math.min(newScrollLeft, props.scrollWidth - props.clientWidth)
  )
  const clampedScrollTop = Math.max(
    0,
    Math.min(newScrollTop, props.scrollHeight - props.clientHeight)
  )

  emit('update:scrollLeft', clampedScrollLeft)
  emit('update:scrollTop', clampedScrollTop)
}
</script>

<template>
  <div
    class="minimap"
    :style="{ width: minimapWidth + 'px', height: minimapHeight + 'px' }"
    @mousedown="handleMouseDown"
  >
    <div
      class="viewport-indicator"
      :style="{
        width: viewportWidth + 'px',
        height: viewportHeight + 'px',
        left: viewportX + 'px',
        top: viewportY + 'px'
      }"
    />
  </div>
</template>

<style scoped>
.minimap {
  position: relative;
  background: #f0f0f0;
  border: 1px solid #ccc;
  cursor: pointer;
  user-select: none;
}

.minimap:active {
  cursor: grabbing;
}

.viewport-indicator {
  position: absolute;
  background: rgba(66, 135, 245, 0.3);
  border: 2px solid #4287f5;
  box-sizing: border-box;
  pointer-events: none;
}
</style>
