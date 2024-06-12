<template>
  <input ref="inputRef" :type="props.type" :class="iClass" :value="props.modelValue" @input="handleChanged" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { computed, useAttrs, onMounted, nextTick, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'text',
  },
  size: {
    type: String,
    default: 'md',
  },
})
const emit = defineEmits(['update:modelValue'])

const attrs = useAttrs()

const inputRef = ref<HTMLElement | null>(null)

const allowedAttrs = ['onClick', 'placeholder', 'class', 'style']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BFormInput: Unknown attributes: ${unknownAttrs.join(', ')}`)
}

const iClass = computed(() => ({
  'form-control': true,
  [`form-control-${props.size}`]: true,
}))

onMounted(() => {
  nextTick(() => {
    window.requestAnimationFrame(() => {
      if (props.autofocus) inputRef.value?.focus()
    })
  })
})

const handleChanged = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

</script>
