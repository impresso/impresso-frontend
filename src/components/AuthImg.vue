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
import { defaultAuthCondition, requiresCredentials } from '@/util/imageAuth'
import { onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'

const props = defineProps<{
  src: string
  authCondition?: (imageUrl: string) => boolean
  class?: string
}>()
const emit = defineEmits(['load', 'error'])
const attrs = useAttrs()
const imageSrc = ref('')
const imgRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const observer = ref<IntersectionObserver | null>(null)
const isForbidden = ref(false)
const loadError = ref<string | null>(null)

const loadImage = async () => {
  if (!props.src || !isVisible.value) return
  try {
    const authCondition = props.authCondition ?? defaultAuthCondition
    const headers = authCondition(props.src) ? getAuthHeaders(getAuthenticationToken()) : {}

    const res = await fetch(props.src, {
      headers,
      credentials: requiresCredentials(props.src) ? 'include' : 'same-origin'
    })
    if (!res.ok) {
      if (res.status === 403) isForbidden.value = true
      const err = new Error(res.statusText)
      err['status'] = res.status
      throw err
    }
    isForbidden.value = false
    loadError.value = null

    const blob = await res.blob()
    if (imageSrc.value) URL.revokeObjectURL(imageSrc.value)
    imageSrc.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error('Error loading image:', error, 'for:', props.src)
    if (!isForbidden.value) {
      loadError.value = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    }
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
    loadError.value = null
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
  <div :class="props.class">
    <div v-if="isForbidden" class="error p-2 d-flex align-items-center justify-content-center">
      {{ $t('login_message') }}
    </div>
    <div
      v-else-if="loadError"
      class="error p-2 d-flex flex-column align-items-center justify-content-center"
    >
      <span>{{ $t('error_loading_image') }}</span>
      <small class="text-muted">{{ loadError }}</small>
    </div>
    <div v-else class="position-relative" :style="{ minHeight: imageSrc ? undefined : '4rem' }">
      <img
        ref="imgRef"
        :src="imageSrc"
        v-bind="attrs"
        :class="{ invisible: !imageSrc }"
        @load="handleLoad"
        crossorigin="use-credentials"
      />
      <div
        v-if="!imageSrc"
        class="position-absolute text-muted p-2 top-0 left-0 d-flex align-items-center justify-content-center h-100 w-100"
      >
        {{ $t('loading_image') }}
      </div>
    </div>
  </div>
</template>

<i18n lang="json">
{
  "en": {
    "login_message": "You need to be signed in to view this image",
    "error_loading_image": "The image could not be loaded",
    "loading_image": "Loading image…"
  }
}
</i18n>
