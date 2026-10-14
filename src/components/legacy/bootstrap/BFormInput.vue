<template>
  <input
    ref="inputRef"
    v-bind="$attrs"
    :type="type"
    :class="iClass"
    :value="local"
    :disabled="disabled"
    :placeholder="placeholder"
    :data-testid="dataTestid"
    @input="handleInput"
    @compositionstart="handleCompositionStart"
    @compositionend="handleCompositionEnd"
  />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

// Attributes (aria-*, autocomplete, onKeydown, ...) are bound explicitly on the
// <input> via v-bind="$attrs", so they must not also fall through automatically.
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  placeholder?: string
  modelValue?: string | number
  autofocus?: boolean
  type?: string
  size?: string
  dataTestid?: string
  disabled?: boolean
  /** Delay (ms) before `update:modelValue` is emitted. The input itself updates immediately. */
  debounce?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const toStr = (v: string | number | undefined | null) =>
  v === undefined || v === null ? '' : String(v)

const inputRef = ref<HTMLInputElement | null>(null)

/** What the user sees. Updated on every keystroke, independent of debouncing. */
const local = ref(toStr(props.modelValue))

let timer: ReturnType<typeof setTimeout> | undefined
let lastEmitted = local.value
let composing = false

const cancel = () => {
  if (timer !== undefined) {
    clearTimeout(timer)
    timer = undefined
  }
}

const emitNow = () => {
  cancel()
  if (local.value === lastEmitted) return
  lastEmitted = local.value
  emit('update:modelValue', local.value)
}

const schedule = () => {
  cancel()
  if (props.debounce && props.debounce > 0) {
    timer = setTimeout(emitNow, props.debounce)
  } else {
    emitNow()
  }
}

/** Emit a pending debounced value immediately (e.g. before submitting). */
const flush = () => {
  if (timer !== undefined) emitNow()
}

// Parent is the source of truth: adopt its value and drop any stale pending emit.
watch(
  () => props.modelValue,
  value => {
    const next = toStr(value)
    cancel()
    local.value = next
    lastEmitted = next
  }
)

const handleInput = (event: Event) => {
  local.value = (event.target as HTMLInputElement).value
  // Don't emit half-composed text (IME: Japanese, Chinese, Korean, ...).
  if (composing || (event as InputEvent).isComposing) return
  schedule()
}

const handleCompositionStart = () => {
  composing = true
}

const handleCompositionEnd = (event: Event) => {
  composing = false
  local.value = (event.target as HTMLInputElement).value
  schedule()
}

const focus = () => inputRef.value?.focus()
const blur = () => inputRef.value?.blur()
const select = () => inputRef.value?.select()

defineExpose({ focus, blur, select, flush, inputRef })

// Bootstrap only defines -sm and -lg; 'md' is the default and needs no class.
const iClass = computed(() => [
  'form-control',
  props.size && props.size !== 'md' ? `form-control-${props.size}` : null
])

onMounted(() => {
  if (!props.autofocus) return
  window.requestAnimationFrame(() => inputRef.value?.focus())
})

onBeforeUnmount(cancel)
</script>
