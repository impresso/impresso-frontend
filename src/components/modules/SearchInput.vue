<template>
  <div class="SearchInput input-group">
    <BFormInput
      ref="bFormInput"
      class="search-input"
      autocomplete="off"
      enterkeyhint="search"
      :aria-label="inputLabel"
      :placeholder="placeholder"
      :model-value="q"
      :disabled="disabled"
      :data-testid="dataTestid"
      @update:model-value="handleInput"
      @keydown="handleKeydown"
      @keyup="handleKeyup"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <div class="input-group-append">
      <button
        type="button"
        class="btn btn-outline-primary px-2 pt-1"
        :title="submitTitle"
        :aria-label="submitTitle ?? 'Search'"
        :disabled="disabled"
        :data-testid="submitTestid"
        @click="submit"
      >
        <Icon :name="icon" :stroke-width="2" :height="16" :width="16" />
      </button>
      <slot name="append"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import Icon from '@/components/base/Icon.vue'
import BFormInput from '@/components/legacy/bootstrap/BFormInput.vue'

export interface SearchInputProps {
  /** v-model binding, takes precedence over `initial` when provided. Emitted raw (untrimmed). */
  modelValue?: string
  placeholder?: string
  initial?: string
  disabled?: boolean
  /** Icon rendered inside the submit button. */
  icon?: string
  /** Title (tooltip) and accessible name of the submit button. Falls back to "Search" for the accessible name. */
  submitTitle?: string
  /** Accessible name of the input. Falls back to `placeholder`. */
  ariaLabel?: string
  /** `data-testid` applied to the native input. */
  dataTestid?: string
  /** `data-testid` applied to the submit button. */
  submitTestid?: string
  /**
   * When true (default), pressing Enter emits `submit`.
   * Consumers that need to handle Enter themselves (e.g. Autocomplete for
   * keyboard suggestion navigation) can disable it and listen to `keyup`.
   */
  submitOnEnter?: boolean
  /** Delay in ms before `change` is emitted while typing. 0 = emit on every change. `submit` always flushes. */
  debounce?: number
}

const props = withDefaults(defineProps<SearchInputProps>(), {
  modelValue: undefined,
  placeholder: 'Search...',
  initial: '',
  disabled: false,
  icon: 'search',
  submitTitle: undefined,
  ariaLabel: undefined,
  dataTestid: undefined,
  submitTestid: undefined,
  submitOnEnter: true,
  debounce: 0
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  /** Trimmed value, only emitted when it actually differs from the last emitted one. */
  (e: 'change', payload: { q: string }): void
  (e: 'submit', payload: { q: string }): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'keyup', event: KeyboardEvent): void
}>()

const inputLabel = computed(() => props.ariaLabel ?? props.placeholder)

/** Raw text as typed. Trimming happens only on the values handed out. */
const q = ref(props.modelValue ?? props.initial)

let timer: ReturnType<typeof setTimeout> | undefined
let lastChange = q.value.trim()

const clearTimer = () => {
  if (timer !== undefined) {
    clearTimeout(timer)
    timer = undefined
  }
}

// Parent is the source of truth: adopt its value and drop any pending `change`.
watch(
  () => props.modelValue ?? props.initial,
  val => {
    clearTimer()
    q.value = val ?? ''
    lastChange = q.value.trim()
  }
)

const emitChange = () => {
  clearTimer()
  const next = q.value.trim()
  if (next === lastChange) return
  lastChange = next
  emit('change', { q: next })
}

const handleInput = (value: string) => {
  q.value = value ?? ''
  emit('update:modelValue', q.value)

  clearTimer()
  if (props.debounce > 0) {
    timer = setTimeout(emitChange, props.debounce)
  } else {
    emitChange()
  }
}

const submit = () => {
  if (props.disabled) return
  emitChange() // flush any pending debounced change first
  emit('submit', { q: q.value.trim() })
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.submitOnEnter || event.key !== 'Enter') return
  // Ignore Enter that confirms an IME composition (keyCode 229 covers older Safari).
  if (event.isComposing || event.keyCode === 229) return
  event.preventDefault() // avoid an implicit native <form> submit on top of ours
  submit()
}

const handleKeyup = (event: KeyboardEvent) => {
  emit('keyup', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const bFormInput = ref<InstanceType<typeof BFormInput> | null>(null)

const focus = () => bFormInput.value?.focus()
const blur = () => bFormInput.value?.blur()
const select = () => bFormInput.value?.select()

onBeforeUnmount(clearTimer)

defineExpose({
  focus,
  blur,
  select
})
</script>

<style lang="css">
.SearchInput {
  position: relative;
}

.SearchInput .search-input {
  border: 1px solid var(--impresso-color-black);
  border-top-left-radius: var(--border-radius-sm);
  border-bottom-left-radius: var(--border-radius-sm);
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  background-color: transparent;
  box-shadow: var(--bs-box-shadow-sm);
  color: var(--impresso-color-black);
}

.SearchInput .search-input:focus {
  background-color: var(--clr-white-rgba-90);
}

.SearchInput .search-input::placeholder {
  color: var(--clr-grey-500);
}

/*
 * Harmonize the action buttons appended to the input: the first button sits
 * flush against the field, inner edges stay square, and only the last button
 * closes the group with a rounded right edge. This keeps the built-in submit
 * button and any buttons passed through the `append` slot visually joined.
 */
.SearchInput .input-group-append > .btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.SearchInput .input-group-append > .btn:last-child {
  border-top-right-radius: var(--border-radius-sm);
  border-bottom-right-radius: var(--border-radius-sm);
}
</style>
