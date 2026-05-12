<template>
  <div
    ref="rootRef"
    class="ModalDraggable"
    :class="{ 'ModalDraggable--reduced': isReduced }"
    :style="containerStyle"
  >
    <div ref="handleRef" class="ModalDraggable__handle" @pointerdown="onPointerDown">
      <slot name="header" :isReduced="isReduced" :toggleReduced="toggleReduced" />
    </div>
    <div v-if="!isReduced" class="ModalDraggable__content">
      <slot :isReduced="isReduced" :toggleReduced="toggleReduced" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export interface ModalDraggableProps {
  initialX?: number
  initialY?: number
  zIndex?: number
  respectBoundaries?: boolean
  centerOnMount?: boolean
}

const props = withDefaults(defineProps<ModalDraggableProps>(), {
  initialX: 0,
  initialY: 0,
  zIndex: 2,
  respectBoundaries: false,
  centerOnMount: false
})

const rootRef = ref<HTMLElement | null>(null)
const handleRef = ref<HTMLElement | null>(null)
const position = ref({
  x: props.initialX,
  y: props.initialY
})
const containerSize = ref({ width: 0, height: 0 })
const modalSize = ref({ width: 0, height: 0 })
const lastPointer = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const activePointerId = ref<number | null>(null)
const isReduced = ref(false)
const hasInitializedPosition = ref(false)
const clampedPosition = computed(() => clampPosition(position.value))

const clampPosition = (nextPosition: { x: number; y: number }) => {
  if (!props.respectBoundaries) {
    return nextPosition
  }

  const maxX = Math.max(0, containerSize.value.width - modalSize.value.width)
  const maxY = Math.max(0, containerSize.value.height - modalSize.value.height)

  return {
    x: Math.min(Math.max(0, nextPosition.x), maxX),
    y: Math.min(Math.max(0, nextPosition.y), maxY)
  }
}

const updateDimensions = () => {
  const element = rootRef.value
  if (!element) {
    return
  }

  const parent = element.parentElement
  if (parent) {
    containerSize.value = {
      width: parent.clientWidth,
      height: parent.clientHeight
    }
  }

  modalSize.value = {
    width: element.offsetWidth,
    height: element.offsetHeight
  }

  if (!hasInitializedPosition.value && props.centerOnMount) {
    position.value = {
      x: Math.max(0, (containerSize.value.width - modalSize.value.width) / 2),
      y: Math.max(0, (containerSize.value.height - modalSize.value.height) / 2)
    }
    hasInitializedPosition.value = true
  }

  position.value = clampPosition(position.value)
}

const containerStyle = computed(() => {
  if (isReduced.value) {
    return {
      position: 'fixed' as const,
      transform: 'none',
      bottom: '12px',
      right: '12px',
      left: 'auto',
      top: 'auto',
      zIndex: props.zIndex
    }
  }

  return {
    transform: `translate(${clampedPosition.value.x}px, ${clampedPosition.value.y}px)`,
    zIndex: props.zIndex
  }
})

const toggleReduced = () => {
  isReduced.value = !isReduced.value
}

const onPointerMove = (event: PointerEvent) => {
  if (!isDragging.value) {
    return
  }

  if (activePointerId.value !== null && event.pointerId !== activePointerId.value) {
    return
  }

  const deltaX = event.clientX - lastPointer.value.x
  const deltaY = event.clientY - lastPointer.value.y

  const nextPosition = clampPosition({
    x: position.value.x + deltaX,
    y: position.value.y + deltaY
  })

  position.value = nextPosition

  lastPointer.value = { x: event.clientX, y: event.clientY }
}

const endDrag = (event: PointerEvent) => {
  if (activePointerId.value !== null && event.pointerId !== activePointerId.value) {
    return
  }

  isDragging.value = false
  activePointerId.value = null

  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', endDrag)
  window.removeEventListener('pointercancel', endDrag)

  const element = handleRef.value
  if (element && event.pointerId !== undefined) {
    element.releasePointerCapture(event.pointerId)
  }
}

const onPointerDown = (event: PointerEvent) => {
  if (isReduced.value) {
    return
  }

  if (event.pointerType === 'mouse' && event.button !== 0) {
    return
  }

  const target = event.target as HTMLElement
  if (
    target.tagName === 'BUTTON' ||
    target.tagName === 'A' ||
    target.tagName === 'INPUT' ||
    target.tagName === 'SELECT' ||
    target.tagName === 'TEXTAREA' ||
    target.closest('button') ||
    target.closest('a')
  ) {
    return
  }

  const element = handleRef.value
  if (!element) {
    return
  }

  isDragging.value = true
  activePointerId.value = event.pointerId
  lastPointer.value = { x: event.clientX, y: event.clientY }

  updateDimensions()

  element.setPointerCapture(event.pointerId)

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', endDrag)
  window.addEventListener('pointercancel', endDrag)
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', endDrag)
  window.removeEventListener('pointercancel', endDrag)
})

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateDimensions()

  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      updateDimensions()
    })

    if (rootRef.value) {
      resizeObserver.observe(rootRef.value)
    }

    if (rootRef.value?.parentElement) {
      resizeObserver.observe(rootRef.value.parentElement)
    }
  } else {
    window.addEventListener('resize', updateDimensions)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDimensions)

  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<style>
.ModalDraggable {
  position: absolute;

  touch-action: none;
  user-select: none;
  display: flex;
  flex-direction: column;
}

.ModalDraggable:active {
  cursor: grabbing;
}

.ModalDraggable__handle {
  flex: 0 0 auto;
  cursor: grab;
}
.ModalDraggable__handle:hover {
  opacity: 0.8;
}
.ModalDraggable__handle:active {
  cursor: grabbing;
  opacity: 0.5;
}
.ModalDraggable__content {
  flex: 1 1 auto;
  min-height: 0;
}
</style>
