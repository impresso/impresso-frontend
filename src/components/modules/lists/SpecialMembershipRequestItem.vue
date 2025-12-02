<template>
  <SpecialMembershipAccessItem :item="specialMembershipAccessWithRequest" />
</template>
<script setup lang="ts">
import type { SpecialMembershipAccess, UserSpecialMembershipRequest } from '@/services/types'
import SpecialMembershipAccessItem from './SpecialMembershipAccessItem.vue'

import { computed } from 'vue'

export interface SpecialMembershipRequestItemProps {
  item: UserSpecialMembershipRequest
}

const props = defineProps<SpecialMembershipRequestItemProps>()

const specialMembershipAccessWithRequest = computed<SpecialMembershipAccess>(() => {
  return {
    ...props.item.specialMembershipAccess,
    requests: [props.item]
  }
})
</script>
