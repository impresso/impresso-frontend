<template>
  <div class="thumbnail-navigator d-flex drop-shadow bg-dark border-radius">
    <div ref="containerRef" class="internal-container">
      <div
        v-for="(item, i) in pages"
        :key="i"
        @click="updatePage(item.uid)"
        class="page-item d-inline-block"
        :ref="el => setActiveItemRef(el as HTMLElement, item.uid)"
      >
        <page-item
          class="thumbnail bg-dark p-2"
          :active="currentPageUid === item.uid"
          :item="item"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { IPage } from '@/models/Page'
import PageItem from '../modules/lists/PageItem.vue'

export type IPageItem = Pick<IPage, 'num' | 'iiif' | 'uid'>

withDefaults(
  defineProps<{
    pages: IPageItem[]
  }>(),
  {
    pages: () => []
  }
)

const currentPageUid = defineModel<string | undefined>('currentPageUid', {})
const containerRef = ref<HTMLElement | null>(null)
const activeItemRef = ref<HTMLElement | null>(null)

// Function to set the active item reference
const setActiveItemRef = (el: HTMLElement | null, uid: string) => {
  if (uid === currentPageUid.value) {
    activeItemRef.value = el
  }
}

const updatePage = (uid: string) => {
  currentPageUid.value = uid
}

// Scroll the active thumbnail into view
const scrollToActive = () => {
  if (!containerRef.value || !activeItemRef.value || !currentPageUid.value) return

  const container = containerRef.value
  const activeItem = activeItemRef.value

  // Get container's dimensions
  const containerRect = container.getBoundingClientRect()
  const itemRect = activeItem.getBoundingClientRect()

  // Check if the active item is outside of view
  const isInView = itemRect.left >= containerRect.left && itemRect.right <= containerRect.right

  if (!isInView) {
    // Calculate the scroll position to center the item
    const scrollPos = activeItem.offsetLeft - container.clientWidth / 2 + activeItem.offsetWidth / 2

    container.scrollTo({
      left: scrollPos,
      behavior: 'smooth'
    })
  }
}

// Watch for changes to the current page
watch(
  () => currentPageUid.value,
  () => {
    // Use nextTick to ensure the DOM is updated
    setTimeout(scrollToActive, 0)
  },
  { immediate: true }
)

// Drag to scroll functionality
let isMouseDown = false
let startX = 0
let scrollLeft = 0

const handleMouseDown = (e: MouseEvent) => {
  if (!containerRef.value) return

  isMouseDown = true
  startX = e.pageX - containerRef.value.offsetLeft
  scrollLeft = containerRef.value.scrollLeft
  containerRef.value.style.cursor = 'grabbing'
}

const handleMouseUp = () => {
  if (!containerRef.value) return

  isMouseDown = false
  containerRef.value.style.cursor = 'grab'
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isMouseDown || !containerRef.value) return

  e.preventDefault()
  const x = e.pageX - containerRef.value.offsetLeft
  const walk = (x - startX) * 1.5 // Scroll speed multiplier
  containerRef.value.scrollLeft = scrollLeft - walk
}

const handleMouseLeave = () => {
  isMouseDown = false
  if (containerRef.value) {
    containerRef.value.style.cursor = 'grab'
  }
}

// Handle mouse wheel scrolling
const handleWheel = (e: WheelEvent) => {
  if (!containerRef.value) return

  e.preventDefault() // Prevent the page from scrolling

  // Scroll horizontally instead of vertically
  containerRef.value.scrollLeft += e.deltaY + e.deltaX
}

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.style.cursor = 'grab'
    containerRef.value.addEventListener('mousedown', handleMouseDown)
    containerRef.value.addEventListener('mouseleave', handleMouseLeave)
    containerRef.value.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
  }
  // Initial scroll to active item
  setTimeout(scrollToActive, 100)
})

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('mousedown', handleMouseDown)
    containerRef.value.removeEventListener('mouseleave', handleMouseLeave)
    containerRef.value.removeEventListener('wheel', handleWheel)
    window.removeEventListener('mouseup', handleMouseUp)
    window.removeEventListener('mousemove', handleMouseMove)
  }
})
</script>

<style scoped lang="scss">
.thumbnail-navigator {
  justify-self: center;
  overflow: hidden;
  max-width: 100%;

  .internal-container {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
    max-width: 100%;
    white-space: nowrap;
    user-select: none; /* Prevent text selection during drag */
    scroll-behavior: smooth; /* Smooth scrolling behavior */

    /* Better scrolling performance */
    will-change: transform, scroll-position;

    /* Hide scrollbar completely */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */

    /* Hide scrollbar for Chrome, Safari and Opera */
    &::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
      background: transparent;
    }

    .page-item {
      display: inline-flex;
      flex-shrink: 0;
      cursor: pointer;

      &:hover {
        opacity: 0.9;
      }
    }
  }

  .thumbnail {
    min-width: 48px;
  }
}
</style>
