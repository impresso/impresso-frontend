<template>
  <form @submit="submitHandler">
    <div class="input-group">
      <BFormInput
        v-model="form.q"
        type="text"
        :debounce="debounce"
        :placeholder="placeholder"
        v-bind="$attrs"
        :class="{
          'is-invalid': v$.q.$error,
          'border-danger': v$.q.$error,
          'border-success': v$.q.$dirty && !v$.q.$error
        }"
      ></BFormInput>
      <div class="input-group-append">
        <button
          type="button"
          class="btn btn-outline-primary"
          ref="searchButton"
          :title="searchButtonLabel"
          @click="submitHandler"
          data-testid="add-keyword-button"
        >
          <Icon name="search" :stroke-width="2.5" :height="16" :width="16" />
        </button>
      </div>
    </div>
    <div v-if="v$.q.$error" class="invalid-feedback d-block">
      {{ v$.q.$errors[0].$message }}
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, maxLength } from '@vuelidate/validators'
import BFormInput from './BFormInput.vue'
import Icon from '@/components/base/Icon.vue'

export interface BSearchInputFormProps {
  modelValue?: string
  placeholder?: string
  debounce?: number
  required?: boolean
  minLength?: number
  maxLength?: number
  searchButtonLabel?: string
}

const props = withDefaults(defineProps<BSearchInputFormProps>(), {
  debounce: 500,
  placeholder: 'Search...',
  required: true,
  minLength: 0,
  maxLength: 255,
  searchButtonLabel: 'Search'
})

const emit = defineEmits<{
  (e: 'submit', value: string): void
}>()

export interface BSearchInputFormPayload {
  q: string
}
const form = reactive<BSearchInputFormPayload>({
  q: props.modelValue || ''
})

const validationRules = {
  q: {
    ...(props.required && { required }),
    ...(props.minLength > 0 && { minLength: minLength(props.minLength) }),
    ...(props.maxLength > 0 && { maxLength: maxLength(props.maxLength) })
  }
}

const v$ = useVuelidate(validationRules, form)

const submitHandler = async (event: Event) => {
  event.preventDefault()
  await v$.value.$validate()
  if (v$.value.$error) {
    return
  }
  emit('submit', form.q)
}

defineExpose({
  v$
})
</script>
<style scoped>
.input-group > input {
  border: 1px solid var(--impresso-color-black);
  border-top-left-radius: var(--border-radius-sm);
  border-bottom-left-radius: var(--border-radius-sm);
  background-color: transparent;
  box-shadow: var(--bs-box-shadow-sm);
  color: var(--impresso-color-black);
}
</style>
