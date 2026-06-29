<template>
  <div>
    <div ref="anchorRef" @mouseenter="isOpen = true" @mouseleave="isOpen = false">
      <slot></slot>
    </div>
    <Transition name="fade">
      <div
        v-if="isOpen"
        ref="tooltipRef"
        role="tooltip"
        tabindex="-1"
        :class="tClasses"
        :style="floatingStyles"
      >
        <div ref="floatingArrow" :class="arrowClasses" :style="arrowStyles"></div>
        <div v-if="props.isHtml" class="tooltip-inner" v-html="props.content"></div>
        <div v-else class="tooltip-inner">{{ props.content }}</div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { arrow, useFloating, autoUpdate, shift, offset } from '@floating-ui/vue'
import type { ShiftOptions, OffsetOptions } from '@floating-ui/vue'
import { computed, ref } from 'vue'

export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'

export type TooltipStrategy = 'absolute' | 'fixed'

export interface WithTooltipProps {
  content: string
  placement?: TooltipPlacement
  strategy?: TooltipStrategy
  delay?: boolean
  isHtml?: boolean
  offsetOptions?: OffsetOptions
  shiftOptions?: ShiftOptions
  hideArrow?: boolean
}

const props = withDefaults(defineProps<WithTooltipProps>(), {
  content: '',
  placement: 'bottom',
  strategy: 'absolute',
  delay: false,
  isHtml: false,
  shiftOptions: () => ({ padding: 0 }),
  offsetOptions: () => ({ mainAxis: 0, crossAxis: 0 }),
  hideArrow: true
})

const isOpen = ref(false)
const tooltipRef = ref<HTMLElement | null>(null)
const anchorRef = ref<HTMLElement | null>(null)
const floatingArrow = ref<HTMLElement | null>(null)

// Middleware must be a computed ref so it reacts to prop changes.
// Order matters: offset first (adjusts base position), then shift
// (clamps to viewport using the already-offset position), then arrow.
const middleware = computed(() => [
  offset(props.offsetOptions),
  shift(props.shiftOptions),
  arrow({ element: floatingArrow })
])

const { floatingStyles, middlewareData } = useFloating(anchorRef, tooltipRef, {
  open: isOpen,
  placement: props.placement,
  strategy: props.strategy,
  middleware,
  whileElementsMounted: autoUpdate
})

const arrowStyles = computed(() => {
  const { x, y } = middlewareData.value.arrow ?? { x: null, y: null, centerOffset: null }
  return {
    position: 'absolute' as const,
    left: x != null ? `${x}px` : '',
    top: y != null ? `${y}px` : ''
  }
})

const arrowClasses = computed(() => ({
  arrow: true
}))

const tClasses = computed(() => ({
  tooltip: true,
  'b-tooltip': true,
  [`bs-tooltip-${props.placement}`]: props.placement != null,
  delay500: props.delay
}))
</script>

<style lang="scss" scoped>
.fade-enter-active {
  transition: opacity 0.5s ease;
  &.delay500 {
    transition-delay: 500ms;
  }
}

.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
