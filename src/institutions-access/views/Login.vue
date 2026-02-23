<template>
  <div class="row">
    <div
      class="col-10 offset-1 col-md-8 offset-md-2 col-lg-6 offset-lg-3 vh-75 d-flex align-items-center"
    >
      <Card class="w-100" v-if="!isEmailConfirmed">
        <template #header>
          <h2 class="mb-0 font-weight-bold">{{ $t('loginTitle') }}</h2>
        </template>
        <p v-html="$t('loginHelpMessage')" />

        <form class="SignUpForm" @submit.prevent="onSubmit" novalidate>
          <BFormGroup
            id="input-group-1"
            label="Email (please use institution email if available) *"
            label-for="email"
            :description="(v$.email!.$errors[0]?.$message as string) || ''"
          >
            <BFormInput
              id="email"
              name="email"
              type="email"
              required
              autocomplete="email"
              :class="{
                'border-danger': v$.email!.$error,
                'border-dark': !v$.email!.$error
              }"
              class="rounded-sm shadow-sm bg-light"
              v-model.trim="formData.email"
            >
            </BFormInput>
          </BFormGroup>
          <button
            type="submit"
            class="d-flex align-items-center btn btn-outline-primary btn-md px-4 gap-2 border border-dark"
          >
            <span>{{ $t('sendLoginLink') }}</span>
            <Icon name="sendMail" :scale="1.25" />
          </button>
        </form>
      </Card>
      <Card class="w-100" v-else>
        <template #header>
          <h2 class="mb-0 font-weight-bold">{{ $t('loginTitle') }}</h2>
        </template>
        <p v-html="$t('loginSentMessage')" />
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import Card from '../components/Card.vue'
import useVuelidate from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'
import BFormGroup from 'impresso-ui-components/components/legacy/BFormGroup.vue'
import Icon from '@/components/base/Icon.vue'
import { magicLink as magicLinkService } from '@/services'
import { useNotificationsStore } from '@/stores/notifications'
export interface LoginFormPayload {
  email: string
}

const notificationStore = useNotificationsStore()
const isEmailConfirmed = ref(false)

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
  if (v$.value.$invalid) {
    return
  }
  // Handle form submission logic here
  try {
    const result = await magicLinkService.create({ email: formData.email })
    console.debug('Magic link result:', result)
    notificationStore.addNotification({
      type: 'info',
      title: 'Magic Link Sent',
      message: `A magic link has been sent to ${formData.email}`
    })
    isEmailConfirmed.value = true
  } catch (error) {
    console.error('Error sending magic link:', error)
    notificationStore.addNotification({
      type: 'error',
      title: 'Error',
      message: 'An error occurred while sending the magic link. Please try again.'
    })
  }
}
</script>
<i18n lang="json">
{
  "en": {
    "loginTitle": "Login to Institution Access",
    "sendLoginLink": "Send Login Link",
    "loginSentMessage": "A login link has been sent to your email. Please check your inbox and click the link to access the institution resources.",
    "loginHelpMessage": "Please enter your institutional email address to receive a login link. For assistance, contact us."
  }
}
</i18n>
