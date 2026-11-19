<script setup lang="ts">
/**
 * AuthImg Component
 *
 * Loads an image through fetch() so an Authorization header can be attached,
 * then displays it from a blob: URL. The fetch starts once the component is
 * (nearly) visible in the viewport.
 *
 * Props:
 *  - src: string (required): The URL of the image to load.
 *  - authCondition?: (imageUrl: string) => boolean: Decides whether the auth header is sent.
 *  - class?: applied to the root element. All other attributes (alt, width, style, ...)
 *    go to the underlying <img>.
 *
 * Emits:
 *  - load: the <img> finished rendering the image
 *  - error: the fetch failed, the response was not an image, or the <img> could not decode it
 */

import { getAuthenticationToken } from '@/services'
import { getAuthHeaders } from '@/util/auth'
import { defaultAuthCondition, requiresCredentials } from '@/util/imageAuth'
import { onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'

// Attributes go to the <img> only, not to the root <div> as well.
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  src: string
  authCondition?: (imageUrl: string) => boolean
  class?: string | unknown[] | Record<string, unknown>
}>()
const emit = defineEmits<{
  (e: 'load', event: Event): void
  (e: 'error', error: unknown): void
}>()
const attrs = useAttrs()

type ErrorKind = 'unauthenticated' | 'forbidden' | 'failed'

// The root element is always rendered, so the observer always has something to observe,
// even after an error has replaced the <img>.
const rootRef = ref<HTMLElement | null>(null)
const imageSrc = ref('')
const isLoading = ref(false)
const errorKind = ref<ErrorKind | null>(null)

let isVisible = false
let observer: IntersectionObserver | null = null
let controller: AbortController | null = null

class HttpError extends Error {
  constructor(
    public readonly status: number,
    statusText: string
  ) {
    super(statusText || `HTTP ${status}`)
    this.name = 'HttpError'
  }
}

const releaseImage = () => {
  if (imageSrc.value) {
    URL.revokeObjectURL(imageSrc.value)
    imageSrc.value = ''
  }
}

const loadImage = async () => {
  if (!props.src || !isVisible) return

  // Cancel any request that is still in flight; its result would be stale.
  controller?.abort()
  const ctrl = (controller = new AbortController())

  isLoading.value = true
  errorKind.value = null

  try {
    const authCondition = props.authCondition ?? defaultAuthCondition
    const headers = authCondition(props.src) ? getAuthHeaders(getAuthenticationToken()) : {}

    const res = await fetch(props.src, {
      headers,
      credentials: requiresCredentials(props.src) ? 'include' : 'same-origin',
      signal: ctrl.signal
    })
    if (!res.ok) throw new HttpError(res.status, res.statusText)

    const blob = await res.blob()
    if (ctrl.signal.aborted) return // src changed or component unmounted meanwhile

    // Reject obvious non-images (an HTML login page, a JSON error body, ...).
    // application/octet-stream is allowed because some servers send images that way;
    // the <img> @error handler catches anything that still can't be decoded.
    if (blob.type && !blob.type.startsWith('image/') && blob.type !== 'application/octet-stream') {
      throw new Error(`Unexpected content type: ${blob.type}`)
    }

    releaseImage()
    imageSrc.value = URL.createObjectURL(blob)
  } catch (error) {
    if (ctrl.signal.aborted) return // an aborted request is not an error
    console.error('Error loading image:', error, 'for:', props.src)
    errorKind.value =
      error instanceof HttpError && error.status === 401
        ? 'unauthenticated'
        : error instanceof HttpError && error.status === 403
          ? 'forbidden'
          : 'failed'
    emit('error', error)
  } finally {
    if (controller === ctrl) isLoading.value = false
  }
}

const handleLoad = (e: Event) => emit('load', e)

// Fetch succeeded but the browser could not decode the image.
const handleImgError = (e: Event) => {
  console.error('Image could not be decoded for:', props.src)
  errorKind.value = 'failed'
  emit('error', e)
}

const stopObserving = () => {
  observer?.disconnect()
  observer = null
}

const setupIntersectionObserver = () => {
  if (!rootRef.value) return

  if (!('IntersectionObserver' in window)) {
    // No lazy loading support: load right away.
    isVisible = true
    loadImage()
    return
  }

  observer = new IntersectionObserver(
    entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        isVisible = true
        stopObserving() // visibility is only needed once
        loadImage()
      }
    },
    { rootMargin: '50px' } // start loading slightly before the image enters the viewport
  )
  observer.observe(rootRef.value)
}

onMounted(setupIntersectionObserver)

watch(
  () => props.src,
  () => {
    controller?.abort()
    releaseImage()
    errorKind.value = null
    isLoading.value = false
    // If the component is already visible, load the new image straight away.
    // Otherwise the observer that is still running will trigger the load.
    loadImage()
  }
)

onBeforeUnmount(() => {
  controller?.abort()
  stopObserving()
  releaseImage()
})
</script>

<template>
  <div ref="rootRef" :class="props.class">
    <div
      v-if="errorKind === 'unauthenticated'"
      class="error p-2 d-flex align-items-center justify-content-center"
    >
      {{ $t('login_message') }}
    </div>
    <div
      v-else-if="errorKind === 'forbidden'"
      class="error p-2 d-flex align-items-center justify-content-center"
    >
      {{ $t('forbidden_message') }}
    </div>
    <div
      v-else-if="errorKind === 'failed'"
      class="error p-2 d-flex align-items-center justify-content-center"
    >
      {{ $t('error_loading_image') }}
    </div>
    <div v-else class="position-relative" :style="{ minHeight: imageSrc ? undefined : '4rem' }">
      <img
        v-bind="attrs"
        :src="imageSrc || undefined"
        :class="{ invisible: !imageSrc }"
        @load="handleLoad"
        @error="handleImgError"
      />
      <div
        v-if="isLoading && !imageSrc"
        class="position-absolute text-muted p-2 top-0 start-0 d-flex align-items-center justify-content-center h-100 w-100"
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
    "forbidden_message": "You don't have permission to view this image",
    "error_loading_image": "The image could not be loaded",
    "loading_image": "Loading image…"
  }
}
</i18n>
