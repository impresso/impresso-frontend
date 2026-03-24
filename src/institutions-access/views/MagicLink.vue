<template>
  <div class="row">
    <div
      class="col-10 offset-1 col-md-8 offset-md-2 col-lg-6 offset-lg-3 vh-75 d-flex align-items-center"
    >
      <Card class="w-100">
        <template #header>
          <h2 class="mb-0 font-weight-bold">{{ $t('loginTitle') }}</h2>
        </template>
        <MagicLinkForm :token="tokenFromUrl" :is-loading="isLoading" @submit="onSubmit">
          <FeathersErrorManager v-if="error" :error="error">
            {{ $t('errorInvalidMagicLink') }}
          </FeathersErrorManager>
          <template #actions>
            or
            <RouterLink :to="{ name: 'Login' }" class="text-decoration-underline">
              {{ $t('requestLoginLink') }}
            </RouterLink>
          </template>
        </MagicLinkForm>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '../components/Card.vue'
import MagicLinkForm from '../components/forms/MagicLinkForm.vue'
import { app as appService } from '@/services'
import type { FeathersError } from '@feathersjs/errors'
import FeathersErrorManager from '@/components/FeathersErrorManager.vue'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const error = ref<FeathersError | Error | null>(null)
const isLoading = ref(false)

const tokenFromUrl = computed(() => {
  return (route.params.token as string) || (route.query.token as string) || ''
})

const authenticate = async (token: string) => {
  error.value = null
  isLoading.value = true
  try {
    await appService.authenticate({
      strategy: 'magic-link',
      accessToken: token
    })
    await appService.reAuthenticate(true)
    await userStore.refreshUser()
    router.push({ name: 'Index' })
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

onMounted(() => {
  if (tokenFromUrl.value) {
    authenticate(tokenFromUrl.value)
  }
})
</script>

<i18n lang="json">
{
  "en": {
    "loginTitle": "Login via Magic Link",
    "requestLoginLink": "Request Login Link",
    "errorInvalidMagicLink": "The magic link is invalid or has expired. Please request a new login link."
  }
}
</i18n>
