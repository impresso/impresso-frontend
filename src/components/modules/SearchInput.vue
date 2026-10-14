<template>
  <div class="SearchInput input-group">
    <BFormInput
      ref="bFormInput"
      class="search-input"
      :placeholder="placeholder"
      :model-value="q"
      :disabled="disabled"
      :data-testid="dataTestid"
      @update:model-value="handleInput"
      @keyup="handleKeyup"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <div class="input-group-append">
      <button
        type="button"
        class="btn btn-outline-primary px-2 pt-1"
        :title="submitTitle"
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
import { ref, watch } from 'vue'
import Icon from '@/components/base/Icon.vue'
import BFormInput from '@/components/legacy/bootstrap/BFormInput.vue'

export interface SearchInputProps {
  /** v-model binding, takes precedence over `initial` when provided. */
  modelValue?: string
  placeholder?: string
  initial?: string
  disabled?: boolean
  /** Icon rendered inside the submit button. */
  icon?: string
  /** Native title attribute of the submit button. */
  submitTitle?: string
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
}

const props = withDefaults(defineProps<SearchInputProps>(), {
  modelValue: undefined,
  placeholder: 'search  ...',
  initial: '',
  disabled: false,
  icon: 'search',
  submitTitle: undefined,
  dataTestid: undefined,
  submitTestid: undefined,
  submitOnEnter: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', payload: { q: string }): void
  (e: 'submit', payload: { q: string }): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'keyup', event: KeyboardEvent): void
}>()

const q = ref(props.modelValue ?? props.initial)

watch(
  () => props.modelValue ?? props.initial,
  val => {
    q.value = val ?? ''
  },
  { immediate: true }
)

const bFormInput = ref<InstanceType<typeof BFormInput> | null>(null)

const handleInput = (value: string) => {
  const next = (value ?? '').trim()
  q.value = next
  emit('update:modelValue', next)
  emit('change', { q: next })
}

const handleKeyup = (event: KeyboardEvent) => {
  if (props.submitOnEnter && event.key === 'Enter') {
    submit()
    return
  }
  emit('keyup', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const submit = () => {
  emit('submit', { q: q.value })
}

const focus = () => {
  bFormInput.value?.focus()
}

const blur = () => {
  bFormInput.value?.blur()
}

const select = () => {
  const el = bFormInput.value?.inputRef as HTMLInputElement | null
  el?.select()
}

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
