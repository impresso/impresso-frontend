<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isAuthenticated = computed(() => userStore.userData !== false)
</script>

<template>
  <template v-if="isAuthenticated">
    <slot name="authenticated" />
  </template>
  <template v-else>
    <slot name="unauthenticated" />
  </template>
</template>
