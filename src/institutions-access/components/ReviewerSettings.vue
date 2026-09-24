<template>
  <div class="ReviewerSettings">
    <h6 class="small-caps text-muted text-uppercase mb-2">{{ $t('title') }}</h6>
    <template v-if="user">
      <div class="small text-muted font-weight-bold">{{ $t('email') }}</div>
      <div class="small">{{ user.email }}</div>
    </template>
    <template v-else>
      <p class="small text-muted m-0">{{ $t('notLoggedIn') }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const user = computed(() => (userStore.userData !== false ? userStore.userData : null))
</script>

<i18n lang="json">
{
  "en": {
    "title": "Reviewer",
    "email": "Email:",
    "notLoggedIn": "Not logged in."
  }
}
</i18n>
