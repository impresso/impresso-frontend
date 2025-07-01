<script setup lang="ts">
/**
 * AuthImg Component
 *
 * A drop-in replacement for the <img> tag that fetches the image from a given URL.
 * It automatically appends an Authorization header (unless the 'authCondition' prop allows skipping).
 * The image is lazy-loaded when it becomes visible in the viewport.
 *
 * Props:
 *  - src: string (required): The URL of the image to load.
 *  - authCondition?: (imageUrl: string) => boolean: Optional condition to determine if auth header is needed.
 *
 * The component fetches the image, converts it to a blob, creates an object URL,
 * and binds it to the underlying <img> tag. It also cleans up the object URL when unmounted.
 */

import { getAuthenticationToken } from '@/services'
import { getAuthHeaders } from '@/util/auth'
import { defaultAuthCondition } from '@/util/imageAuth'
import { onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'

const props = defineProps<{ src: string; authCondition?: (imageUrl: string) => boolean }>()
const emit = defineEmits(['load', 'error'])
const attrs = useAttrs()
const imageSrc = ref('')
const imgRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const observer = ref<IntersectionObserver | null>(null)

const loadImage = async () => {
  if (!props.src || !isVisible.value) return
  try {
    const authCondition = props.authCondition ?? defaultAuthCondition
    const headers = authCondition(props.src) ? getAuthHeaders(getAuthenticationToken()) : {}

    const res = await fetch(props.src, { headers })
    if (!res.ok) {
      const err = new Error(res.statusText)
      err['status'] = res.status
      throw err
    }

    const blob = await res.blob()
    if (imageSrc.value) URL.revokeObjectURL(imageSrc.value)
    imageSrc.value = URL.createObjectURL(blob)
  } catch (error) {
    emit('error', error)
  }
}

const handleLoad = (e: Event) => {
  emit('load', e)
}

const setupIntersectionObserver = () => {
  if (!imgRef.value) return

  // Check if IntersectionObserver is supported in the browser
  if ('IntersectionObserver' in window) {
    observer.value = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          isVisible.value = true
          loadImage()
          // Once the image is loaded, we can stop observing
          if (observer.value && imgRef.value) {
            observer.value.unobserve(imgRef.value)
          }
        }
      },
      {
        rootMargin: '50px', // Load images a bit before they enter the viewport
        threshold: 0.1
      }
    )

    observer.value.observe(imgRef.value)
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    isVisible.value = true
    loadImage()
  }
}

onMounted(() => {
  setupIntersectionObserver()
})

watch(
  () => props.src,
  () => {
    // Reset visibility state and observe again when src changes
    if (observer.value && imgRef.value) {
      observer.value.unobserve(imgRef.value)
    }
    isVisible.value = false
    setupIntersectionObserver()
  }
)

onBeforeUnmount(() => {
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value)
  if (observer.value && imgRef.value) {
    observer.value.unobserve(imgRef.value)
    observer.value.disconnect()
  }
})
</script>

<template>
  <img ref="imgRef" :src="imageSrc" v-bind="attrs" @load="handleLoad" />
</template>
