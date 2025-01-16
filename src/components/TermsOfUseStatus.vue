<template>
  <div v-if="!isAuthenticated && withCallToAction">
    <div v-if="!acceptTermsDateOnLocalStorage">
      You have not accepted the
      <LinkToModal class="text-decoration-underline" :view="ViewTermsOfUse"
        >Terms of Use</LinkToModal
      >
      yet on this device.
    </div>
    <div v-else>
      You have accepted the
      <LinkToModal class="text-decoration-underline" :view="ViewTermsOfUse"
        >Terms of Use</LinkToModal
      >
      on this device:
      <span class="date">{{ $d(new Date(acceptTermsDateOnLocalStorage), 'precise') }}</span>
    </div>
  </div>
  <div v-else-if="!isAuthenticated && !withCallToAction">
    <div v-if="!acceptTermsDateOnLocalStorage">
      You have not accepted the terms of use yet. Please read the entire terms of use document
      carefully and accept it at the bottom to continue.
    </div>
    <div v-else>
      You have accepted the terms of use <em>on this device</em>:
      <span class="date">{{ $d(new Date(acceptTermsDateOnLocalStorage), 'precise') }}</span
      >.<br />Please note that as soon as you log in, you will be asked to accept these Terms again.
    </div>
  </div>
  <div v-else-if="isAuthenticated && withCallToAction">
    <div v-if="acceptTermsDate">
      You have accepted the
      <LinkToModal class="text-decoration-underline" :view="ViewTermsOfUse"
        >Terms of Use</LinkToModal
      >:
      <span class="date">{{ $d(new Date(acceptTermsDate), 'precise') }}</span>
    </div>
    <div v-else-if="acceptTermsDateOnLocalStorage && !acceptTermsDate">
      <LinkToModal class="text-decoration-underline" :view="ViewTermsOfUse"
        >Terms of Use</LinkToModal
      >
    </div>
  </div>
  <div v-else-if="isAuthenticated && !withCallToAction">
    <div v-if="acceptTermsDate">
      You have accepted the terms of use:
      <span class="date">{{ $d(new Date(acceptTermsDate), 'precise') }}</span>
    </div>
    <div v-else-if="acceptTermsDateOnLocalStorage && !acceptTermsDate">
      You have accepted the terms of use <em>on this device</em>, but we need to record your
      acceptance on our servers once you log in. Please read the entire terms of use document
      carefully and accept it at the bottom to continue.
    </div>
  </div>
</template>

<script setup lang="ts">
import LinkToModal from '@/components/LinkToModal.vue'
import { ViewTermsOfUse } from '@/stores/views'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'

defineProps<{
  withCallToAction?: boolean
}>()

const userStore = useUserStore()
const acceptTermsDate = computed(() => userStore.acceptTermsDate)
const acceptTermsDateOnLocalStorage = computed(() => userStore.acceptTermsDateOnLocalStorage)
const isAuthenticated = computed(() => !!userStore.userData)
</script>
