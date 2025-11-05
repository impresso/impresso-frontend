<template>
  <div class="Ellipsis">
    <div ref="contentsRef" class="contents" :style="contentStyle">
      <slot></slot>
    </div>
    <div
      v-if="contentHeight > initialHeight"
      class="more w-100 pe-none"
      :class="moreClass"
      :style="gradientStyle"
    >
      <button class="btn btn-sm btn-outline-secondary pe-auto" @click.prevent.stop="onClick">
        {{ $t(isCollapsed ? 'more' : 'less') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Ellipsis Component
 *
 * A collapsible content container that shows/hides content with expand/collapse functionality.
 * Features:
 * - Automatically detects if content exceeds initial height
 * - Shows "more" button with gradient overlay when collapsed
 * - Smoothly expands to show full content (or max height)
 * - Customizable background color for gradient effect
 *
 * @example
 * ```vue
 * <Ellipsis
 *   :initial-height="100"
 *   :max-height="500"
 *   :additional-height="50"
 *   background-color="#ffffff"
 *   more-class="custom-more-class"
 * >
 *   <p>Your long content here...</p>
 * </Ellipsis>
 * ```
 */
import { ref, computed, onMounted, onUpdated } from 'vue'

export interface EllipsisProps {
  initialHeight?: number
  maxHeight?: number
  additionalHeight?: number
  backgroundColor?: string
  moreClass?: string
}

// Define props with defaults
const props = withDefaults(defineProps<EllipsisProps>(), {
  initialHeight: 50,
  maxHeight: 0,
  additionalHeight: 50,
  backgroundColor: '#f8f9fa',
  moreClass: ''
})

const contentsRef = ref<HTMLDivElement | null>(null)
const isCollapsed = ref(true)
const height = ref(0)
const collapsedHeight = ref(0)
// this is the final content height
const contentHeight = ref(0)

const gradientStyle = computed(() => {
  if (!isCollapsed.value) {
    return {
      background: 'transparent'
    }
  }
  return {
    background: `linear-gradient(${props.backgroundColor}00 20%, ${props.backgroundColor})`
  }
})

const contentStyle = computed(() => {
  const overflow = props.maxHeight && isCollapsed.value ? 'hidden' : 'auto'
  return isCollapsed.value
    ? {
        maxHeight: `${height.value}px`,
        overflow
      }
    : {
        height: `${height.value}px`,
        overflow: 'auto'
      }
})
const updateContentHeight = () => {
  if (contentsRef.value) {
    contentHeight.value = contentsRef.value.scrollHeight
  }
}

/**
 * Handles expand/collapse toggle
 * - Caches collapsed height on first expansion
 * - Calculates expanded height based on maxHeight or window height
 * - Respects additionalHeight for padding
 */
const onClick = () => {
  isCollapsed.value = !isCollapsed.value

  if (!collapsedHeight.value && contentsRef.value) {
    collapsedHeight.value = contentsRef.value.clientHeight
  }

  if (isCollapsed.value) {
    // Collapse to original height
    height.value = collapsedHeight.value
  } else {
    // Expand to content height or max allowed height
    if (contentsRef.value) {
      const contentScrollHeight = contentsRef.value.scrollHeight

      if (props.maxHeight !== 0) {
        // Use specified max height
        height.value = Math.min(contentScrollHeight, props.maxHeight) + props.additionalHeight
      } else {
        // Use half of window height as max
        height.value =
          Math.min(contentScrollHeight, window.innerHeight / 2) + props.additionalHeight
      }
    }
  }
}

onMounted(() => {
  height.value = props.initialHeight
  updateContentHeight()
})

onUpdated(() => {
  updateContentHeight()
})
</script>

<i18n lang="json">
{
  "en": {
    "more": "(more ...)",
    "less": "less ..."
  },
  "it": {
    "more": "(espandi ...)",
    "less": "less ..."
  }
}
</i18n>

<style scoped>
.Ellipsis {
  position: relative;
}

.Ellipsis .contents {
  height: 100%;
  overflow: hidden;
}
.Ellipsis :deep(.btn) {
  background-color: #f8f9fa;
}
.Ellipsis :deep(.btn:hover) {
  color: var(--impresso-color-black);
}

/**
 * Gradient overlay container for the "more" button
 * - Positioned at bottom-right
 * - Pointer-events disabled except for button (pe-none/pe-auto)
 */
.Ellipsis .more {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 150px;
  text-align: right;
  background: linear-gradient(#f8f9fa00 20%, #f8f9fa);
}
</style>
