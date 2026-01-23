<template>
  <textarea
    ref="textareaRef"
    :class="iClass"
    :value="props.modelValue"
    :disabled="props.disabled"
    :rows="props.rows"
    @input="handleChanged"
    v-bind="$attrs"
    :data-testid="dataTestid"
  />
</template>

<script setup lang="ts">
import { computed, useAttrs, onMounted, nextTick, ref, onBeforeUnmount, watch } from 'vue'

const props = defineProps<{
  modelValue?: string | number
  autofocus?: boolean
  size?: string
  dataTestid?: string
  disabled?: boolean
  debounce?: number
  autosize?: boolean
  rows?: number
  minRows?: number
  maxRows?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const attrs = useAttrs()
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const debounceTimer = ref<number | null>(null)

const focus = () => {
  textareaRef.value?.focus()
}

const blur = () => {
  textareaRef.value?.blur()
}

defineExpose({
  focus,
  blur,
  textareaRef
})

const allowedAttrs = ['onClick', 'placeholder', 'class', 'style']
const unknownAttrs = Object.keys(attrs).filter(key => !allowedAttrs.includes(key))
if (unknownAttrs.length) {
  console.warn(`BTextarea: Unknown attributes: ${unknownAttrs.join(', ')}`)
}

const iClass = computed(() => ({
  'form-control': true,
  [`form-control-${props.size ?? 'md'}`]: true
}))

const adjustHeight = () => {
  if (!props.autosize || !textareaRef.value) return

  const textarea = textareaRef.value

  // Reset height to auto to get the correct scrollHeight
  textarea.style.height = 'auto'

  // Calculate new height based on content
  let newHeight = textarea.scrollHeight

  // Apply min/max constraints if provided
  if (props.minRows) {
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 20
    const minHeight = lineHeight * props.minRows
    newHeight = Math.max(newHeight, minHeight)
  }

  if (props.maxRows) {
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 20
    const maxHeight = lineHeight * props.maxRows
    newHeight = Math.min(newHeight, maxHeight)
  }

  textarea.style.height = `${newHeight}px`
}

onMounted(() => {
  nextTick(() => {
    window.requestAnimationFrame(() => {
      if (props.autofocus) textareaRef.value?.focus()
      if (props.autosize) adjustHeight()
    })
  })
})

onBeforeUnmount(() => {
  if (debounceTimer.value !== null) {
    clearTimeout(debounceTimer.value)
  }
})

watch(
  () => props.modelValue,
  () => {
    if (props.autosize) {
      nextTick(() => adjustHeight())
    }
  }
)

const handleChanged = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  const value = target.value

  if (props.autosize) {
    adjustHeight()
  }

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

<style scoped>
textarea.form-control {
  resize: vertical;
  overflow-y: auto;
}

textarea.form-control[data-autosize='true'] {
  resize: none;
  overflow-y: hidden;
}
</style>
