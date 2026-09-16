<template>
  <section class="InstitutionsAccessAuth">
    <Card>
      <template #header>
        <h2>
          {{ $t(isLoading ? 'verifyingTokenTitle' : 'loginTitle') }}
        </h2>
      </template>
      <MagicLinkForm :token="tokenFromUrl" :is-loading="isLoading" @submit="onSubmit">
        <FeathersErrorManager v-if="error" :error="error">
          {{ $t('errorInvalidMagicLink') }}
        </FeathersErrorManager>
        <template #actions v-if="!isLoading">
          {{ $t('or') }}
          <RouterLink :to="{ name: 'Login' }" class="text-decoration-underline">
            {{ $t('requestLoginLink') }}
          </RouterLink>
        </template>
      </MagicLinkForm>
    </Card>
  </section>
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
import { reducedTimeoutPromise } from '@/services/utils'

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
    await Promise.all([
      reducedTimeoutPromise({
        ms: 2450,
        service: 'version',
        silent: true
      }),
      appService.authenticate({
        strategy: 'magic-link',
        accessToken: token
      })
    ])
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
    "loginTitle": "Sign in with a link",
    "verifyingTokenTitle": "Checking your sign-in link",
    "requestLoginLink": "Request a new link",
    "or": "or",
    "errorInvalidMagicLink": "This sign-in link is invalid or has expired. Request a new one."
  }
}
</i18n>
