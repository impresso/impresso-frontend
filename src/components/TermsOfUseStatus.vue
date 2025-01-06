<template>
  <div v-if="acceptTermsDate">
    You have accepted the terms of use: <b>{{ $d(new Date(acceptTermsDate), 'precise') }}</b>
  </div>
  <div v-else-if="withCallToAction">
    You have not accepted the new terms of use yet. Please read and accept the
    <TermsOfUseModalLink>terms of use</TermsOfUseModalLink>.
  </div>
  <div v-else>
    You have not accepted the new terms of use yet. Please read the entire terms of use document
    carefully and accept it at the bottom to continue.
  </div>
</template>

<script setup lang="ts">
import TermsOfUseModalLink from '@/components/TermsOfUseModalLink.vue'
import { useUserStore } from '@/stores/user'
import { ref } from 'vue'

defineProps<{
  withCallToAction?: boolean
}>()

const acceptTermsDate = ref(useUserStore().acceptTermsDate)
// watch changes on pinia store
useUserStore().$subscribe((mutation, state) => {
  acceptTermsDate.value = state.acceptTermsDate
})
</script>
