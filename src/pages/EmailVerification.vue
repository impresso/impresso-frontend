<template>
  <div class="EmailVerificationPage static-page">
    <h1>{{ $t(isLoading ? 'verifyingTokenTitle' : 'emailVerificationTitle') }}</h1>

    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-xl-6 p-4 rounded shadow-sm">
          <EmailVerificationForm
            :token="tokenFromUrl"
            :isLoading="isLoading"
            @submit="verifyEmail($event.token, $event.email)"
            @sendEmailVerificationRequest="sendEmailVerificationRequest($event)"
          >
            <FeathersErrorManager v-if="error" :error="error">
              {{ $t('errorInvalidEmailVerificationLink') }}
            </FeathersErrorManager>
          </EmailVerificationForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  emailVerification as emailVerificationService,
  emailVerificationResend as emailVerificationResendService
} from '@/services'
import type { FeathersError } from '@feathersjs/errors'
import FeathersErrorManager from '@/components/FeathersErrorManager.vue'
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { reducedTimeoutPromise } from '@/services/utils'
import { useNotificationsStore } from '@/stores/notifications'
import EmailVerificationForm from '@/components/EmailVerificationForm.vue'

const route = useRoute()
const router = useRouter()
const error = ref<FeathersError | Error | null>(null)
const isLoading = ref(false)

const tokenFromUrl = computed(() => {
  return (route.params.token as string) || (route.query.token as string) || ''
})
const notificationStore = useNotificationsStore()

const sendEmailVerificationRequest = async (email: string) => {
  error.value = null
  isLoading.value = true
  try {
    await Promise.all([
      reducedTimeoutPromise({
        ms: 2450,
        service: 'version',
        silent: true
      }),
      emailVerificationResendService.create({
        email: email
      })
    ])
    notificationStore.addNotification({
      type: 'success',
      title: 'Email Verification Sent',
      message: 'A verification email has been sent to your address.'
    })
  } catch (err: unknown) {
    error.value = err instanceof Error ? err : new Error(String(err))
    console.error('Email verification error:', err)
  } finally {
    isLoading.value = false
  }
}
const verifyEmail = async (token: string, email: string) => {
  error.value = null
  isLoading.value = true
  try {
    await Promise.all([
      reducedTimeoutPromise({
        ms: 2450,
        service: 'version',
        silent: true
      }),
      emailVerificationService.create({
        email: email,
        token: token
      })
    ])
    notificationStore.addNotification({
      type: 'success',
      title: 'Email Verified',
      message: 'Your email has been successfully verified.'
    })
    await router.push({ name: 'emailVerificationSuccess' })
  } catch (err: unknown) {
    error.value = err instanceof Error ? err : new Error(String(err))
    console.error('Magic link error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<i18n lang="json">
{
  "en": {
    "emailVerificationTitle": "Verify Email Address",
    "verifyingTokenTitle": "Verifying ...",
    "requestEmailVerificationLink": "Request email verification link",
    "errorInvalidEmailVerificationLink": "The link is invalid or has expired. Please request a new verification link."
  }
}
</i18n>
