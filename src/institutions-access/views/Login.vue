<template>
  <section class="InstitutionsAccessAuth">
    <Card v-if="!isEmailConfirmed">
      <template #header>
        <h2>{{ $t('loginTitle') }}</h2>
      </template>
      <p>{{ $t('loginHelpMessage') }}</p>

      <form class="SignUpForm" @submit.prevent="onSubmit" novalidate>
        <BFormGroup
          id="input-group-1"
          :label="$t('emailLabel')"
          label-for="email"
          :description="(v$.email!.$errors[0]?.$message as string) || ''"
        >
          <BFormInput
            id="email"
            name="email"
            type="email"
            required
            autocomplete="email"
            :disabled="isSending"
            :class="{
              'border-danger': v$.email!.$error,
              'border-dark': !v$.email!.$error
            }"
            class="rounded-sm bg-light"
            v-model.trim="formData.email"
          >
          </BFormInput>
        </BFormGroup>
        <button
          type="submit"
          class="d-flex align-items-center btn btn-outline-primary btn-md px-4 gap-2 border border-dark"
          :disabled="isSending"
          :aria-busy="isSending"
        >
          <span>{{ $t(isSending ? 'sendingLoginLink' : 'sendLoginLink') }}</span>
          <Icon name="sendMail" :scale="1.25" />
        </button>
      </form>
    </Card>
    <Card v-else>
      <template #header>
        <h2>{{ $t('loginTitle') }}</h2>
      </template>
      <p>{{ $t('loginSentMessage') }}</p>
    </Card>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import Card from '../components/Card.vue'
import useVuelidate from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'
import BFormGroup from 'impresso-ui-components/components/legacy/BFormGroup.vue'
import BFormInput from '@/components/legacy/bootstrap/BFormInput.vue'
import Icon from '@/components/base/Icon.vue'
import { magicLink as magicLinkService } from '@/services'
import { useNotificationsStore } from '@/stores/notifications'
export interface LoginFormPayload {
  email: string
}

const notificationStore = useNotificationsStore()
const isEmailConfirmed = ref(false)
const isSending = ref(false)

const formData = reactive<LoginFormPayload>({
  email: ''
})

const formRules: { email: any } = {
  email: {
    required: helpers.withMessage('Please enter your email', required),
    urlRegex: helpers.withMessage('Must be a valid email', (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    })
  }
}
// Initialize validation
const v$ = useVuelidate(formRules, formData)

const onSubmit = async () => {
  v$.value.$touch()
  if (v$.value.$invalid || isSending.value) {
    return
  }
  isSending.value = true
  try {
    const result = await magicLinkService.create({ email: formData.email })
    console.debug('Magic link result:', result)
    notificationStore.addNotification({
      type: 'info',
      title: 'Sign-in link sent',
      message: `A sign-in link was sent to ${formData.email}`
    })
    isEmailConfirmed.value = true
  } catch (error) {
    console.error('Error sending magic link:', error)
    notificationStore.addNotification({
      type: 'error',
      title: 'Sign-in link could not be sent',
      message: 'Please try again.'
    })
  } finally {
    isSending.value = false
  }
}
</script>
<i18n lang="json">
{
  "en": {
    "loginTitle": "Sign in to institutional access",
    "emailLabel": "Institutional email",
    "sendLoginLink": "Send sign-in link",
    "sendingLoginLink": "Sending link",
    "loginSentMessage": "A sign-in link was sent to your email. Open it to continue. No password is required.",
    "loginHelpMessage": "Enter your institutional email to receive a sign-in link. Open the link in your inbox to continue."
  }
}
</i18n>
