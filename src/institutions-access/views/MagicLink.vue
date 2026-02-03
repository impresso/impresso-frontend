<template>
  <div class="row">
    <div
      class="col-10 offset-1 col-md-8 offset-md-2 col-lg-6 offset-lg-3 vh-75 d-flex align-items-center"
    >
      <Card class="w-100">
        <template #header>
          <h2 class="mb-0 font-weight-bold">{{ $t('loginTitle') }}</h2>
        </template>
        <MagicLinkForm @submit="onSubmit"
          >{{ error }}
          <FeathersErrorManager v-if="error" :error="error" />
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
import { ref } from 'vue'

const error = ref<FeathersError | Error | null>(null)

const onSubmit = async ({ token }: { token: string }) => {
  error.value = null
  if (!token) {
    alert('No token provided')
    return
  }
  console.debug('Received token:', token)
  // Handle form submission logic here
  try {
    await appService.authenticate({
      strategy: 'magic-link',
      accessToken: token
    })
  } catch (err) {
    error.value = new Error(err.message)
    console.error('Magic link error:', err)
  }
}
</script>

<i18n lang="json">
{
  "en": {
    "loginTitle": "Login via Magic Link"
  }
}
</i18n>
