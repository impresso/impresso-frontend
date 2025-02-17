<template>
  <div class="SubscriptionDatasetItem">
    <b>{{ item.name }}</b>
  </div>
</template>
<script setup lang="ts">
import { SubscriptionDataset } from '@/services/types'

defineProps<{ item: SubscriptionDataset }>()
</script>
