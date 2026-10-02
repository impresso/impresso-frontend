<template>
  <form class="MagicLinkForm" @submit.prevent="onSubmit" novalidate>
    <BFormGroup
      id="token-group"
      :label="$t('tokenLabel')"
      label-for="token"
      :description="(v$.token!.$errors[0]?.$message as string) || ''"
      :class="{ 'd-none': props.isLoading }"
    >
      <BFormInput
        id="token"
        autofocus
        name="token"
        type="text"
        required
        :disabled="props.isLoading"
        :placeholder="$t('tokenPlaceholder')"
        :class="{
          'border-danger': v$.token!.$error,
          'border-dark': !v$.token!.$error
        }"
        class="rounded-sm bg-light"
        v-model.trim="formData.token"
      />
    </BFormGroup>
    <slot></slot>
    <section class="d-flex gap-3 align-items-center mt-3">
      <button
        type="submit"
        :disabled="props.isLoading || v$.token!.$error"
        class="btn btn-outline-primary btn-md px-4 gap-2 border border-dark"
        :aria-busy="props.isLoading"
      >
        <span>{{ $t(props.isLoading ? 'actions.verifyingToken' : 'actions.verifyTokenAndLogIn') }}</span>
      </button>
      <slot name="actions"></slot>
    </section>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import useVuelidate from '@vuelidate/core'
import { helpers, required, minLength } from '@vuelidate/validators'
import BFormGroup from 'impresso-ui-components/components/legacy/BFormGroup.vue'
import BFormInput from '@/components/legacy/bootstrap/BFormInput.vue'

export interface MagicLinkFormPayload {
  token: string
}

export interface MagicLinkFormProps {
  className?: string
  isLoading?: boolean
  token?: string
}

const props = withDefaults(defineProps<MagicLinkFormProps>(), {
  className: '',
  isLoading: false,
  token: ''
})

const emit = defineEmits<{
  (e: 'submit', payload: MagicLinkFormPayload): void
}>()

const formData = reactive<MagicLinkFormPayload>({
  token: props.token
})

const formRules = {
  token: {
    required: helpers.withMessage('Please enter a token', required),
    minLength: helpers.withMessage('Token must be at least 10 characters', minLength(10))
  }
}

const v$ = useVuelidate(formRules, formData)

const onSubmit = async () => {
  v$.value.$touch()
  const isValid = await v$.value.$validate()

  if (!isValid) {
    return
  }
  emit('submit', {
    token: formData.token
  })
}
</script>

<i18n lang="json">
{
  "en": {
    "tokenLabel": "Sign-in token",
    "tokenPlaceholder": "Paste the token from your email",
    "actions": {
      "verifyTokenAndLogIn": "Verify and sign in",
      "verifyingToken": "Checking link"
    }
  }
}
</i18n>

<style scoped>
.MagicLinkForm {
  width: 100%;
}
</style>
