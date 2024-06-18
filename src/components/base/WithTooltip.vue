<template>
  <div>
    <div ref="anchorRef" @mouseenter="isOpen = true" @mouseleave="isOpen = false">
      <slot></slot>
    </div>
    <Transition name="fade">
      <div v-if="isOpen" ref="tooltipRef" role="tooltip" tabindex="-1" :class="tClasses" :style="floatingStyles">
        <div ref="floatingArrow" :class="arrowClasses" :style="arrowStyles"></div>
        <div v-if="props.isHtml" class="tooltip-inner" v-html="props.content"></div>
        <div v-else class="tooltip-inner">{{  props.content }}</div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {
  arrow,
  useFloating,
  autoUpdate,
  Placement,
  shift,
} from '@floating-ui/vue'
import { PropType, computed, ref } from 'vue';

const props = defineProps({
  content: String,
  placement: {
    type: String as PropType<Placement>,
    default: 'bottom',
  },
  delay: {
    type: Boolean,
    default: false,
  },
  isHtml: {
    type: Boolean,
    default: false,
  },
})


const isOpen = ref(false)
const tooltipRef = ref<HTMLElement | null>(null)
const anchorRef = ref<HTMLElement | null>(null)
const floatingArrow = ref<HTMLElement | null>(null)

const { floatingStyles, middlewareData } = useFloating(anchorRef, tooltipRef, {
  open: isOpen,
  placement: props.placement,
  middleware: [shift({ padding: 5 }), arrow({element: floatingArrow})],
  whileElementsMounted: autoUpdate,
});

const arrowStyles = computed(() => {
  const { x, y } = middlewareData.value.arrow ?? { x: null, y: null, centerOffset: null }
  return {
    position: 'absolute' as const,
    left: x != null ? `${x}px` : '',
    top: y != null ? `${y}px` : '',
  }
})

const arrowClasses = computed(() => ({
  'arrow': true,
}))

const tClasses = computed(() => ({
  'tooltip': true,
  'b-tooltip': true,
  [`bs-tooltip-${props.placement}`]: props.placement != null,
  'delay500': props.delay,
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
