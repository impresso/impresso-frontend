<template>
  <form class="MagicLinkForm" @submit.prevent="onSubmit" novalidate>
    <BFormGroup
      id="token-group"
      label="Magic Link Token *"
      label-for="token"
      :description="(v$.token!.$errors[0]?.$message as string) || ''"
    >
      <BFormInput
        id="token"
        autofocus
        name="token"
        type="text"
        required
        placeholder="Enter your magic link token"
        :class="{
          'border-danger': v$.token!.$error,
          'border-dark': !v$.token!.$error
        }"
        class="rounded-sm shadow-sm bg-light"
        v-model.trim="formData.token"
      />
    </BFormGroup>
    <slot>test</slot>
    <button
      type="submit"
      :disabled="props.isLoading || v$.token!.$error"
      class="btn btn-outline-primary btn-md px-4 gap-2 border border-dark mt-3"
    >
      <span v-if="!props.isLoading">Verify Token</span>
      <span v-else>Verifying...</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { helpers, required, minLength } from '@vuelidate/validators'
import BFormGroup from 'impresso-ui-components/components/legacy/BFormGroup.vue'
import BFormInput from '@/components/legacy/bootstrap/BFormInput.vue'

/**
 * Type definitions for the form payload
 */
export interface MagicLinkFormPayload {
  token: string
}

/**
 * Type definitions for component props
 */
export interface MagicLinkFormProps {
  className?: string
  isLoading?: boolean
}

const props = withDefaults(defineProps<MagicLinkFormProps>(), {
  className: '',
  isLoading: false
})

const emit = defineEmits<{
  (e: 'submit', payload: MagicLinkFormPayload): void
}>()

const formData = reactive<MagicLinkFormPayload>({
  token: ''
})

/**
 * Validation rules using Vuelidate
 */
const formRules = {
  token: {
    required: helpers.withMessage('Please enter a token', required),
    minLength: helpers.withMessage('Token must be at least 10 characters', minLength(10))
  }
}

const v$ = useVuelidate(formRules, formData)

/**
 * Handle form submission
 */
const onSubmit = async () => {
  v$.value.$touch()
  const isValid = await v$.value.$validate()

  if (!isValid) {
    return
  }
  // Emit both events for flexibility
  emit('submit', {
    token: formData.token
  })
}
</script>

<i18n lang="json">
{
  "en": {
    "magicLinkTitle": "Verify Magic Link Token",
    "magicLinkDescription": "Please enter the token from your magic link to verify access",
    "tokenPlaceholder": "Enter your magic link token",
    "verifyButton": "Verify Token",
    "verifyingButton": "Verifying...",
    "tokenRequired": "Token is required",
    "tokenMinLength": "Token must be at least 10 characters long",
    "invalidToken": "Invalid or expired token",
    "verificationError": "An error occurred during token verification"
  }
}
</i18n>

<style scoped>
.MagicLinkForm {
  width: 100%;
}
</style>
