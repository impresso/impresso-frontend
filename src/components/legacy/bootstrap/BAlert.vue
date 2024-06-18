<template>
  <div
    v-if="!dismissed"
    role="alert"
    aria-live="polite"
    aria-atomic="true"
    :class="aClass"
    v-bind="$attrs">
      <button v-if="props.dismissible" type="button" aria-label="Close" class="close" @click="dismiss">×</button>
      <div>
        <slot></slot>
      </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  dismissible: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'info',
  },
  fade: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['dismissed'])
const attrs = useAttrs()

const dismissed = ref(false)

watch(() => props.show, (value) => {
  dismissed.value = !value
}, { immediate: true })

const allowedAttrs = ['onClick', 'class', 'style']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BAlert: Unknown attributes: ${unknownAttrs.join(', ')}`)
}

const aClass = computed(() => ({
  'alert': true,
  'alert-dismissible': props.dismissible,
  [`alert-${props.variant}`]: true,
  'fade': props.fade,
}))

const dismiss = () => {
  dismissed.value = true
  emit('dismissed')
}
</script>
