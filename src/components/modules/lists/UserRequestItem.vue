<template>
  <div class="UserRequestItem d-flex justify-content-between align-items-center">
    <div>
      <b>{{ item.subscription.name }}</b>
      <div>requested on {{ $d(item.dateCreated, 'short') }}</div>
    </div>
    <div class="text-muted">
      {{ item.status }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { UserRequest } from '@/services/types'

defineProps<{ item: UserRequest }>()
</script>
