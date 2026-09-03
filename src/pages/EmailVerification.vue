<template>
  <div class="EmailVerificationPage static-page">
    <h1>{{ $t(isLoading ? 'verifyingTokenTitle' : 'emailVerificationTitle') }}</h1>

    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 bg-light p-4 rounded shadow-sm text-dark">
          <MagicLinkForm :token="tokenFromUrl" :is-loading="isLoading" @submit="onSubmit">
            <FeathersErrorManager v-if="error" :error="error">
              {{ $t('errorInvalidEmailVerificationLink') }}
            </FeathersErrorManager>
            <template #actions v-if="!isLoading">
              or
              <!-- <RouterLink :to="{ name: 'Login' }" class="text-decoration-underline">
            {{ $t('requestLoginLink') }}
          </RouterLink> -->
            </template>
          </MagicLinkForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MagicLinkForm from '@/institutions-access/components/forms/MagicLinkForm.vue'
import { emailVerification as emailVerificationService } from '@/services'
import type { FeathersError } from '@feathersjs/errors'
import FeathersErrorManager from '@/components/FeathersErrorManager.vue'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { reducedTimeoutPromise } from '@/services/utils'
import { useNotificationsStore } from '@/stores/notifications'

const route = useRoute()
const router = useRouter()
const error = ref<FeathersError | Error | null>(null)
const isLoading = ref(false)

const tokenFromUrl = computed(() => {
  return (route.params.token as string) || (route.query.token as string) || ''
})
const notificationStore = useNotificationsStore()

const authenticate = async (token: string) => {
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
        token: token
      })
    ])
    notificationStore.addNotification({
      type: 'success',
      title: 'Email Verified',
      message: 'Your email has been successfully verified.'
    })
  } catch (err: unknown) {
    error.value = err instanceof Error ? err : new Error(String(err))
    console.error('Magic link error:', err)
  } finally {
    isLoading.value = false
  }
}

const onSubmit = async ({ token }: { token: string }) => {
  if (!token) return
  await authenticate(token)
}
</script>

<i18n lang="json">
{
  "en": {
    "emailVerificationTitle": "Email Verification",
    "verifyingTokenTitle": "Verifying ...",
    "requestEmailVerificationLink": "Request email verification link",
    "errorInvalidEmailVerificationLink": "The link is invalid or has expired. Please request a new login link."
  }
}
</i18n>
