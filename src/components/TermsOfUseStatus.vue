<template>
  <div v-if="acceptTermsDate">
    You have accepted the terms of use: <b>{{ $d(new Date(acceptTermsDate), 'precise') }}</b>
  </div>
  <div v-else-if="withCallToAction">
    You have not accepted the new terms of use yet. Please read and accept the
    <a href="/terms-of-use" @click="handleClick">terms of use</a>.
  </div>
  <div v-else>
    You have not accepted the new terms of use yet. Please read the entire terms of use document
    carefully and accept it at the bottom to continue.
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useViewsStore, ViewTermsOfUse } from '@/stores/views'
import { ref } from 'vue'

defineProps<{
  withCallToAction?: boolean
}>()

const handleClick = (event: MouseEvent) => {
  event.preventDefault()
  useViewsStore().view = ViewTermsOfUse
}
const acceptTermsDate = ref(useUserStore().acceptTermsDate)
// watch changes on pinia store
useUserStore().$subscribe((mutation, state) => {
  acceptTermsDate.value = state.acceptTermsDate
})
</script>
