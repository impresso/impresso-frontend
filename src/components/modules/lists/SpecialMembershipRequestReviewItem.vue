<template>
  <div class="row align-items-start">
    <div class="col-3">
      <p class="m-0">{{ item.requester.firstname }} {{ item.requester.lastname }}</p>
      <p class="m-0">{{ item.requester.email }}</p>
      <p class="m-0 small">{{ item.requester.profile.affiliation }}</p>
      <p class="mb-0 mt-1 small-caps">{{ userPlanLabel }}</p>
      <p class="mb-0 mt-1 small-caps text-muted">{{ userBitmapStrings.binary }}</p>
    </div>
    <div class="col-3">
      <p class="m-0 small">{{ $d(new Date(item.dateCreated), 'short') }}</p>
      <p class="pb-2 mb-2 very-small border-bottom">
        Created: <TimeAgo :date="new Date(item.dateCreated)" />
      </p>
      <p class="m-0 small">{{ $d(new Date(item.dateCreated), 'short') }}</p>
      <p class="m-0 very-small">
        Last modified: <TimeAgo :date="new Date(item.dateLastModified)" />
      </p>
    </div>
    <div class="col-3">
      {{ item.specialMembershipAccess.title }}
      <p v-for="(log, index) in item.changelog" :key="index" class="m-0 very-small">
        {{ log }}
      </p>
    </div>
    <div class="col-1">
      <Icon v-if="userHasAnySpecialMembershipAccess" :name="'check'" />
      <span v-else>&mdash;</span>
    </div>
    <div class="col-2">
      {{ item.status }}
    </div>
  </div>
</template>
<script setup lang="ts">
import type { SpecialMembershipAccess, UserSpecialMembershipRequestReview } from '@/services/types'
import SpecialMembershipAccessItem from './SpecialMembershipAccessItem.vue'

import { computed } from 'vue'
import { getUserBitmapAsString, getUserPlan, hasAnySpecialMembershipAccess } from '@/logic/user'
import TimeAgo from '@/components/TimeAgo.vue'
import Icon from '@/components/base/Icon.vue'

export interface SpecialMembershipRequestItemProps {
  item: UserSpecialMembershipRequestReview
}

const props = defineProps<SpecialMembershipRequestItemProps>()
const userPlanLabel = computed<string>(() => {
  const { label } = getUserPlan(props.item.requester.groups)
  return label
})

const userBitmapStrings = computed<{ hex: string; binary: string; bigint: bigint }>(() => {
  return getUserBitmapAsString(props.item.requester.bitmap)
})

const userHasAnySpecialMembershipAccess = computed<boolean>(() => {
  return hasAnySpecialMembershipAccess(props.item.requester.bitmap)
})
</script>
