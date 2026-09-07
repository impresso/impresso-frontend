<template>
  <form class="EmailVerificationForm" @submit.prevent="onSubmit" novalidate>
    <BFormGroup
      id="email-group"
      :label="$t('emailAddress') + ' *'"
      label-for="email"
      :description="(v$.email!.$errors[0]?.$message as string) || ''"
      :style="{
        display: props.isLoading ? 'none' : 'block'
      }"
    >
      <BFormInput
        id="email"
        autofocus
        name="email"
        type="email"
        required
        :disabled="props.isLoading"
        placeholder="Enter your email address"
        :class="{
          'border-danger': v$.email!.$error,
          'border-dark': !v$.email!.$error
        }"
        class="rounded-sm shadow-sm"
        v-model.trim="formData.email"
      />
    </BFormGroup>
    <slot></slot>
    <section class="d-flex gap-3 align-items-center mt-3">
      <button
        type="submit"
        :disabled="props.isLoading || !props.token || v$.email!.$error"
        class="btn btn-outline-primary btn-md px-4 gap-2 border border-dark"
      >
        <span v-if="!props.isLoading">Verify email</span>
        <span v-else>Verifying email...</span>
      </button>

      <button
        type="button"
        :disabled="props.isLoading || v$.email!.$error"
        @click="onSendEmailVerificationRequest"
        class="btn btn-link btn-transparent"
      >
        {{ $t('requestEmailVerificationLink') }}
      </button>
    </section>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import useVuelidate from '@vuelidate/core'
import { email, helpers, required } from '@vuelidate/validators'
import BFormGroup from 'impresso-ui-components/components/legacy/BFormGroup.vue'
import BFormInput from '@/components/legacy/bootstrap/BFormInput.vue'

export interface EmailVerificationFormPayload {
  email: string
  token: string
}

export interface EmailVerificationFormProps {
  className?: string
  isLoading?: boolean
  token?: string
}

const props = withDefaults(defineProps<EmailVerificationFormProps>(), {
  className: '',
  isLoading: false,
  token: ''
})

const emit = defineEmits<{
  (e: 'submit', payload: EmailVerificationFormPayload): void
  (e: 'sendEmailVerificationRequest', email: string): void
}>()

const formData = reactive({
  email: ''
})

const formRules = {
  email: {
    required: helpers.withMessage('Please enter an email address', required),
    email: helpers.withMessage('Please enter a valid email address', email)
  }
}

const v$ = useVuelidate(formRules, formData)

const onSubmit = async () => {
  v$.value.$touch()
  const isValid = await v$.value.$validate()

  if (!isValid || !props.token) {
    return
  }

  emit('submit', {
    email: formData.email,
    token: props.token
  })
}

const onSendEmailVerificationRequest = async (event: Event) => {
  event.preventDefault()
  v$.value.$touch()
  const isValid = await v$.value.$validate()

  if (!isValid) {
    return
  }
  emit('sendEmailVerificationRequest', formData.email)
  // clean email field after sending the request and clean errors too
  formData.email = ''
  v$.value.$reset()
}
</script>

<style scoped>
.EmailVerificationForm {
  width: 100%;
}
</style>
<i18n lang="json">
{
  "en": {
    "emailAddress": "Email Address",
    "requestEmailVerificationLink": "or request email verification link"
  }
}
</i18n>
