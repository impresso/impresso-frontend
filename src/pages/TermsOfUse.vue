<template>
  <main class="container py-5">
    <b-row class="justify-content-md-center">
      <b-col col xl="6" lg="8" md="10">
        <h1 class="mb-4">{{ $t('pages.termsOfUse.title') }}</h1>
        <Alert v-if="isAuthenticated" type="warning" class="bg-info my-4">
          <TermsOfUseStatus />
        </Alert>
        <MarkdownContent :url="url" />
        <AcceptTermsOfUse v-if="isAuthenticated" />
      </b-col>
    </b-row>
  </main>
</template>

<script setup lang="ts">
import Alert from '@/components/Alert.vue'
import TermsOfUseStatus from '@/components/TermsOfUseStatus.vue'
import MarkdownContent from '@/components/MarkdownContent.vue'
import AcceptTermsOfUse from '@/components/AcceptTermsOfUse.vue'
import { useUserStore } from '@/stores/user'

const url = import.meta.env.VITE_TERMS_OF_USE_MD_URL

const userStore = useUserStore()

import { ref, watch } from 'vue'

const isAuthenticated = ref<boolean>(userStore.userData !== null)

watch(
  () => userStore.userData,
  newValue => {
    isAuthenticated.value = !!newValue
  }
)
</script>
