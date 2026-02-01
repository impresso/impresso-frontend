<template>
  <div
    ref="navigatorRef"
    class="SourceOverviewNavigator bg-light border border-dark rounded shadow"
    :style="navigatorStyle"
    @pointerdown="onPointerDown"
  >
    <div
      class="SourceOverviewNavigator__handle p-2 d-flex justify-content-center align-items-center bg-dark text-white border-bottom border-dark rounded-top"
    >
      <span class="very-small-caps-bold">{{ $t('sourcesOverviewNavigator.title') }}</span>
      <icon name="dots" :scale="0.3" :stroke-width="8" class="m-1" color="white" />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import Icon from '../base/Icon.vue'

export interface SourceOverviewNavigatorProps {
  width?: number
  height?: number
  initialX?: number
  initialY?: number
  zIndex?: number
}

const props = withDefaults(defineProps<SourceOverviewNavigatorProps>(), {
  width: 200,
  height: 200,
  initialX: 0,
  initialY: 0,
  zIndex: 2
})

const navigatorRef = ref<HTMLElement | null>(null)
const position = ref({
  x: props.initialX,
  y: props.initialY
})
const lastPointer = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const activePointerId = ref<number | null>(null)

const navigatorStyle = computed(() => {
  return {
    width: `${props.width}px`,
    height: `${props.height}px`,
    transform: `translate(${position.value.x}px, ${position.value.y}px)`,
    zIndex: props.zIndex
  }
})

const onPointerMove = (event: PointerEvent) => {
  if (!isDragging.value) {
    return
  }

  if (activePointerId.value !== null && event.pointerId !== activePointerId.value) {
    return
  }

  const deltaX = event.clientX - lastPointer.value.x
  const deltaY = event.clientY - lastPointer.value.y

  position.value = {
    x: position.value.x + deltaX,
    y: position.value.y + deltaY
  }

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

  const element = navigatorRef.value
  if (element && event.pointerId !== undefined) {
    element.releasePointerCapture(event.pointerId)
  }
}

const onPointerDown = (event: PointerEvent) => {
  if (event.pointerType === 'mouse' && event.button !== 0) {
    return
  }

  // Don't start dragging if clicking on interactive elements
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

  const element = navigatorRef.value
  if (!element) {
    return
  }

  isDragging.value = true
  activePointerId.value = event.pointerId
  lastPointer.value = { x: event.clientX, y: event.clientY }

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
</script>

<style>
.SourceOverviewNavigator {
  position: absolute;

  cursor: grab;
  touch-action: none;
  user-select: none;
  display: flex;
  flex-direction: column;
}
.SourceOverviewNavigator button {
  cursor: pointer;
  pointer-events: all;
}

.SourceOverviewNavigator:active {
  cursor: grabbing;
}

.SourceOverviewNavigator__handle {
  height: 30px;
  flex: 0 0 auto;
}
</style>

<i18n lang="json">
{
  "en": {
    "sourcesOverviewNavigator": {
      "title": "Sources Overview Navigator"
    }
  }
}
</i18n>
