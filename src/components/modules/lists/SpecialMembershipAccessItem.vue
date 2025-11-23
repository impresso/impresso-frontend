<template>
  <div class="SpecialMembershipAccessItem">
    <h3 class="font-size-inherit m-0 font-weight-bold">{{ item.title }}</h3>
    <p class="small m-0">{{ item.metadata.provider }}</p>
  </div>
</template>
<script setup lang="ts">
import type { SpecialMembershipAccess } from '@/services/types'

export interface SpecialMembershipAccessItemProps {
  item: SpecialMembershipAccess
}

defineProps<{ item: SpecialMembershipAccess }>()
</script>
