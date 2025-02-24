<script setup lang="ts">
/**
 * AuthImg Component
 *
 * A drop-in replacement for the <img> tag that fetches the image from a given URL.
 * It automatically appends an Authorization header (unless the 'authCondition' prop allows skipping).
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

const loadImage = async () => {
  if (!props.src) return
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
  // const target = e.target as HTMLImageElement
  emit('load', e)
}

onMounted(loadImage)
watch(() => props.src, loadImage)
onBeforeUnmount(() => {
  if (imageSrc.value) URL.revokeObjectURL(imageSrc.value)
})
</script>

<template>
  <img :src="imageSrc" v-bind="attrs" @load="handleLoad" />
</template>
