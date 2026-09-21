<template>
  <div class="SearchInput input-group">
    <BFormInput
      class="search-input"
      :placeholder="placeholder"
      v-model.trim="q"
      @keyup.enter="submit"
      @input="change"
      @keyup="change"
      :disabled="disabled"
    />
    <div class="input-group-append">
      <button type="button" class="btn btn-outline-primary px-2 pt-1" @click="submit">
        <Icon name="search" :stroke-width="2" :height="16" :width="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Icon from '@/components/base/Icon.vue'
import BFormInput from '@/components/legacy/bootstrap/BFormInput.vue'

export interface SearchInputProps {
  placeholder?: string
  initial?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<SearchInputProps>(), {
  placeholder: 'search  ...',
  initial: '',
  disabled: false
})

const emit = defineEmits<{
  (e: 'change', payload: { q: string }): void
  (e: 'submit', payload: { q: string }): void
}>()

const q = ref(props.initial)

watch(
  () => props.initial,
  val => {
    q.value = val
  },
  { immediate: true }
)

const change = () => {
  emit('change', { q: q.value })
}

const submit = () => {
  emit('submit', { q: q.value })
}
</script>

<style lang="css">
.SearchInput {
  position: relative;
}

.SearchInput .search-input {
  border: 1px solid var(--impresso-color-black);
  border-top-left-radius: var(--border-radius-sm);
  border-bottom-left-radius: var(--border-radius-sm);
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
</style>
