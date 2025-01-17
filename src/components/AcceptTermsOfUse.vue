<template>
  <section class="AcceptTermsOfUse border-top mx-0 py-4 mt-0 d-flex justify-content-center">
    <div class="form-check d-inline-block w-auto">
      <input
        class="form-check-input"
        type="checkbox"
        id="terms-of-use"
        :checked="checked"
        @change="handleChange"
        :disabled="isLoading || disabled"
      />
      <label class="form-check-label font-weight-bold" for="terms-of-use">
        I HAVE READ and I AGREE to the Impresso Terms of Use
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  onChange?: (event: Event) => void
  checked?: boolean
  isLoading?: boolean
  disabled?: boolean
}>()

const handleChange = (event: Event) => {
  if (!(event.target instanceof HTMLInputElement)) {
    console.error('event.target is not an HTMLInputElement')
  }
  if (typeof props.onChange === 'function') {
    props.onChange(event)
  }
}
</script>
