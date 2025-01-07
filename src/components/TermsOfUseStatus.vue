<template>
  <div v-if="acceptTermsDate">
    You have accepted the
    <LinkToModal v-if="withCallToAction">terms of use</LinkToModal> terms of use:
    <b>{{ $d(new Date(acceptTermsDate), 'precise') }}</b>
  </div>
  <div v-else-if="withCallToAction">
    You have not accepted the new terms of use yet. Please read and accept the
    <LinkToModal>terms of use</LinkToModal>.
  </div>
  <div v-else>
    You have not accepted the new terms of use yet. Please read the entire terms of use document
    carefully and accept it at the bottom to continue.
  </div>
</template>

<script setup lang="ts">
import LinkToModal from '@/components/LinkToModal.vue'
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
