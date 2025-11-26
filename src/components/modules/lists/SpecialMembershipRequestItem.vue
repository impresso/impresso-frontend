<template>
  <SpecialMembershipAccessItem :item="specialMembershipAccessWithRequest" />
</template>
<script setup lang="ts">
import type { UserSpecialMembershipRequest } from '@/services/types'
import SpecialMembershipAccessItem from './SpecialMembershipAccessItem.vue'

import { computed } from 'vue'

export interface SpecialMembershipRequestItemProps {
  item: UserSpecialMembershipRequest
}

const props = defineProps<SpecialMembershipRequestItemProps>()

const specialMembershipAccessWithRequest = computed(() => {
  return {
    ...props.item.specialMembershipAccess,
    request: props.item
  }
})
</script>
