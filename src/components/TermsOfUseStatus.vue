<template>
  <div v-if="acceptTermsDate && isAuthenticated">
    You have accepted the
    <LinkToModal :view="ViewTermsOfUse" v-if="withCallToAction">terms of use</LinkToModal> terms of
    use:
    <b>{{ $d(new Date(acceptTermsDate), 'precise') }}</b>
  </div>
  <div v-else-if="withCallToAction && !isAuthenticated">
    <LinkToModal class="text-decoration-underline" :view="ViewTermsOfUse">Terms of use</LinkToModal>
  </div>
  <div v-else-if="withCallToAction && isAuthenticated">
    You have not accepted the <LinkToModal :view="ViewTermsOfUse">Terms of Use</LinkToModal>.
  </div>
  <div v-else>
    You have not accepted the terms of use yet. Please read the entire terms of use document
    carefully and accept it at the bottom to continue.
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
const isAuthenticated = computed(() => !!userStore.userData)
</script>
