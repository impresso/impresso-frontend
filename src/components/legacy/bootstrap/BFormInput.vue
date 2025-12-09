<template>
  <input
    ref="inputRef"
    :type="props.type"
    :class="iClass"
    :value="props.modelValue"
    :disabled="props.disabled"
    @input="handleChanged"
    v-bind="$attrs"
    :data-testid="dataTestid"
  />
</template>

<script setup lang="ts">
import { computed, useAttrs, onMounted, nextTick, ref, onBeforeUnmount } from 'vue'

const props = defineProps<{
  modelValue?: string | number
  autofocus?: boolean
  type?: string
  size?: string
  dataTestid?: string
  disabled?: boolean
  debounce?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const attrs = useAttrs()
const inputRef = ref<HTMLInputElement | null>(null)
const debounceTimer = ref<number | null>(null)

const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

defineExpose({
  focus,
  blur,
  inputRef
})

const allowedAttrs = ['onClick', 'placeholder', 'class', 'style']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BFormInput: Unknown attributes: ${unknownAttrs.join(', ')}`)
}

const iClass = computed(() => ({
  'form-control': true,
  [`form-control-${props.size ?? 'md'}`]: true
}))

onMounted(() => {
  nextTick(() => {
    window.requestAnimationFrame(() => {
      if (props.autofocus) inputRef.value?.focus()
    })
  })
})

onBeforeUnmount(() => {
  if (debounceTimer.value !== null) {
    clearTimeout(debounceTimer.value)
  }
})

const handleChanged = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  if (props.debounce && props.debounce > 0) {
    if (debounceTimer.value !== null) {
      clearTimeout(debounceTimer.value)
    }

    debounceTimer.value = window.setTimeout(() => {
      emit('update:modelValue', value)
      debounceTimer.value = null
    }, props.debounce)
  } else {
    emit('update:modelValue', value)
  }
}
</script>
