<template>
  <button
    :class="`UserSpecialmembershipRequestButton btn btn-sm btn-outline-primary ${className}`"
    @click="viewStore.openSpecialMembershipModal(item)"
  >
    <span v-if="item">{{ item.title }}</span>
    <span v-else>Request Special Membership Access</span>
  </button>
</template>

<script setup lang="ts">
import { SpecialMembershipAccess } from '@/services/types'
import { useViewsStore } from '@/stores/views'

export interface SpecialMembershipButtonProps {
  item?: SpecialMembershipAccess
  className?: string
}

defineProps<SpecialMembershipButtonProps>()
const viewStore = useViewsStore()
</script>
