<template>
  <div class="SpecialMembershipRequestItem d-flex justify-content-between align-items-center">
    <SpecialMembershipAccessItem :item="item.specialMembershipAccess" />

    <div class="SpecialMembershipRequestItem_status">{{ item.status }}</div>
    <div class="SpecialMembershipRequestItem_dateCreated">
      {{ $d(new Date(item.dateCreated), 'long') }}
    </div>
  </div>
</template>
<script setup lang="ts">
import type { UserSpecialMembershipRequest } from '@/services/types'
import SpecialMembershipAccessItem from './SpecialMembershipAccessItem.vue'

export interface SpecialMembershipRequestItemProps {
  item: UserSpecialMembershipRequest
}

defineProps<SpecialMembershipRequestItemProps>()
</script>
