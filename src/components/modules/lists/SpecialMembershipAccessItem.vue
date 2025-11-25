<template>
  <div class="SpecialMembershipAccessItem d-flex align-items-center justify-content-between gap-2">
    <div>
      <h3 class="font-size-inherit m-0 font-weight-bold">{{ item.title }}</h3>
      <p class="small m-0">{{ item.metadata.provider }}</p>
    </div>
    <slot name="actions">
      <p
        v-if="item.request"
        class="m-0 small"
        :class="{
          'text-success': item.request.status === 'approved',
          'text-warning': item.request.status === 'pending',
          'text-danger': item.request.status === 'rejected'
        }"
      >
        {{ $t('access requested') }}
        {{ item.request.status }}
        creation date:
        <TimeAgo :date="item.request.dateCreated" />
      </p>
    </slot>
  </div>
</template>
<script setup lang="ts">
import type { SpecialMembershipAccess } from '@/services/types'
import TimeAgo from '../../TimeAgo.vue'

export interface SpecialMembershipAccessItemProps {
  item: SpecialMembershipAccess
}

defineProps<{ item: SpecialMembershipAccess }>()
</script>
