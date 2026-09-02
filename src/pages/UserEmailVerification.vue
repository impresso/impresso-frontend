<template>
  <main class="container-fluid h-100 pb-5 UserEmailVerification">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="my-5">
          <h1 class="mb-3">
            {{ $t('title') }}
          </h1>
          <LoadingBlock v-if="isLoading" :label="$t('loading')" :height="120" />
          <Alert v-else-if="isVerified" type="success">
            {{ $t('successMessage') }}
          </Alert>
          <Alert v-else-if="hasError" type="error">
            {{ $t('errorMessage') }}
          </Alert>
          <div v-if="shouldShowResendForm" class="mt-4">
            <label class="form-label" for="verification-resend-email">
              {{ $t('emailLabel') }}
            </label>
            <BFormInput
              id="verification-resend-email"
              v-model.trim="resendEmail"
              type="email"
              :placeholder="$t('emailPlaceholder')"
              :disabled="isResendDisabled"
              :class="{ 'border-danger': hasInvalidResendEmail }"
              class="rounded-sm shadow-sm"
              data-testid="verification-resend-email-input"
            />
            <p
              v-if="hasInvalidResendEmail"
              class="mt-2 mb-0 text-danger"
              data-testid="invalid-email"
            >
              {{ $t('invalidEmailMessage') }}
            </p>
            <p v-else-if="resendWaitSeconds > 0" class="mt-2 mb-0" data-testid="resend-wait">
              {{ $t('resendWaitMessage', { seconds: $n(resendWaitSeconds) }) }}
            </p>
            <Alert v-else-if="resendSucceeded" type="success" class="mt-3">
              {{ $t('resendSuccessMessage') }}
            </Alert>
            <Alert v-else-if="resendFailed" type="error" class="mt-3">
              {{ $t('resendErrorMessage') }}
            </Alert>

            <button
              class="btn btn-outline-light mt-3"
              type="button"
              data-testid="verification-resend-button"
              :disabled="isResendDisabled"
              @click="onResendVerificationEmail"
            >
              <span v-if="isResendLoading">{{ $t('resendLoading') }}</span>
              <span v-else>{{ $t('resendButton') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Alert from 'impresso-ui-components/components/Alert.vue'

import BFormInput from '@/components/legacy/bootstrap/BFormInput.vue'
import LoadingBlock from '@/components/LoadingBlock.vue'
import { userEmailVerification, userEmailVerificationResend } from '@/services'

interface UserEmailVerificationResponse {
  result?: string
}

interface UserEmailVerificationResendResponse {
  result?: string
  retryAfterSeconds?: number
}

const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const route = useRoute()
const isLoading = ref(true)
const isVerified = ref(false)
const hasError = ref(false)
const resendEmail = ref('')
const isResendLoading = ref(false)
const resendSucceeded = ref(false)
const resendFailed = ref(false)
const hasInvalidResendEmail = ref(false)
const resendWaitSeconds = ref(0)
const resendCountdownIntervalId = ref<number | null>(null)

const isResendDisabled = computed(() => isResendLoading.value || resendWaitSeconds.value > 0)

const token = computed(() => {
  const routeToken = route.query.token
  if (Array.isArray(routeToken)) {
    return (routeToken[0] ?? '').trim()
  }
  return typeof routeToken === 'string' ? routeToken.trim() : ''
})

function isSuccessfulResponse(response: UserEmailVerificationResponse): boolean {
  return response.result === 'ok'
}

function isValidEmail(value: string): boolean {
  return EmailRegex.test(value)
}

function resetResendFeedback(): void {
  resendSucceeded.value = false
  resendFailed.value = false
  hasInvalidResendEmail.value = false
}

function clearResendCountdown(): void {
  if (resendCountdownIntervalId.value !== null) {
    window.clearInterval(resendCountdownIntervalId.value)
    resendCountdownIntervalId.value = null
  }
}

function startResendCountdown(seconds: number): void {
  clearResendCountdown()
  resendWaitSeconds.value = Math.max(0, Math.floor(seconds))

  if (resendWaitSeconds.value === 0) {
    return
  }

  resendCountdownIntervalId.value = window.setInterval(() => {
    if (resendWaitSeconds.value <= 1) {
      resendWaitSeconds.value = 0
      clearResendCountdown()
      return
    }
    resendWaitSeconds.value -= 1
  }, 1000)
}

const shouldShowResendForm = computed(() => !isLoading.value && !isVerified.value)

async function verifyEmail(): Promise<void> {
  if (!token.value) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  isVerified.value = false
  hasError.value = false

  try {
    const response = (await userEmailVerification.create(
      { token: token.value },
      { ignoreErrors: true }
    )) as UserEmailVerificationResponse

    isVerified.value = isSuccessfulResponse(response)
    hasError.value = !isVerified.value
  } catch {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

async function onResendVerificationEmail(): Promise<void> {
  if (isResendDisabled.value) {
    return
  }

  const email = resendEmail.value.trim()
  resetResendFeedback()

  if (!isValidEmail(email)) {
    hasInvalidResendEmail.value = true
    return
  }

  isResendLoading.value = true

  try {
    const response = (await userEmailVerificationResend.create(
      { email },
      { ignoreErrors: true }
    )) as UserEmailVerificationResendResponse

    if (response.result === 'ok') {
      resendSucceeded.value = true
      resendWaitSeconds.value = 0
      clearResendCountdown()
      return
    }

    if (response.result === 'wait' && typeof response.retryAfterSeconds === 'number') {
      startResendCountdown(response.retryAfterSeconds)
      return
    }

    resendFailed.value = true
  } catch {
    resendFailed.value = true
  } finally {
    isResendLoading.value = false
  }
}

onMounted(() => {
  void verifyEmail()
})

onBeforeUnmount(() => {
  clearResendCountdown()
})
</script>

<i18n lang="json">
{
  "en": {
    "title": "Email verification",
    "loading": "Verifying your email...",
    "successMessage": "Your email has been verified successfully.",
    "errorMessage": "There was a problem verifying your email. Please contact us if you think this is a mistake.",
    "emailLabel": "Email address",
    "emailPlaceholder": "Enter your account email",
    "invalidEmailMessage": "Please enter a valid email address.",
    "resendButton": "Resend verification email",
    "resendLoading": "Sending...",
    "resendSuccessMessage": "A new verification email has been sent.",
    "resendWaitMessage": "Please wait {seconds} seconds before trying again.",
    "resendErrorMessage": "There was a problem resending your verification email. Please try again later."
  }
}
</i18n>

<style>
.UserEmailVerification {
  color: var(--impresso-color-white);

  --impresso-text-decoration-color: var(--clr-grey-300);
  --impresso-text-decoration-color-hover: var(--impresso-color-white);

  background: -webkit-linear-gradient(
    360deg,
    var(--impresso-color-black-deeper),
    var(--impresso-color-black)
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    360deg,
    var(--impresso-color-black-deeper),
    var(--impresso-color-black)
  );
}

.UserEmailVerification h1 {
  color: var(--impresso-color-white);
}
.UserEmailVerification .Alert.error svg path {
  stroke: var(--impresso-color-white);
}
</style>
