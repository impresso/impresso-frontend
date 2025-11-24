<template>
  <div class="SpecialMembershipRequestItem container-fluid">
    <div class="row">
      <SpecialMembershipAccessItem class="col-4" :item="item.specialMembershipAccess" />
      <div class="date-created small col-3">
        {{ $d(new Date(item.dateCreated), 'short') }}
      </div>
      <div class="date-updated small col-3">
        {{ $d(new Date(item.dateLastModified), 'short') }}
      </div>
      <div class="SpecialMembershipRequestItem_status col-2 position-relative">
        <span class="very-small-caps">{{ item.status }}</span>
        <Icon
          name="checkCircle"
          :stroke-width="1.5"
          class="text-success ml-1"
          v-if="item.status === 'approved'"
        />
        <Icon
          name="warningCircle"
          :stroke-width="1.5"
          class="ml-1"
          v-else-if="item.status === 'pending'"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { UserSpecialMembershipRequest } from '@/services/types'
import SpecialMembershipAccessItem from './SpecialMembershipAccessItem.vue'
import Icon from '@/components/base/Icon.vue'

export interface SpecialMembershipRequestItemProps {
  item: UserSpecialMembershipRequest
}

defineProps<SpecialMembershipRequestItemProps>()
</script>
