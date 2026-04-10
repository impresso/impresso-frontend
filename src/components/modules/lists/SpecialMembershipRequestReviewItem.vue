<template>
  <div class="row align-items-start">
    <div class="col-3 small">
      <p>
        <b>full name:</b><br />
        {{ item.requester.firstname }} {{ item.requester.lastname }}
      </p>
      <p>
        <b>email:</b><br />
        {{ item.requester.email }}
      </p>
      <p>
        <b>affiliation:</b><br />
        {{ item.requester.profile.affiliation }}
      </p>
      <p class="mb-0 mt-1 small-caps">{{ userPlanLabel }}</p>
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
    <div class="col-4">
      {{ item.specialMembershipAccess.title }}
      <p class="m-0 small"><b>Notes:</b></p>
      <blockquote class="border small p-2 rounded bg-light">
        {{ item.notes }}
      </blockquote>

      <details>
        <summary class="small-caps">{{ $t('changelog') }}</summary>

        <p v-for="(log, index) in item.changelog" :key="index" class="m-0 very-small">
          {{ log }}
        </p>
      </details>
    </div>

    <div class="col-2">
      <p class="m-0">{{ item.status }}</p>
      <slot name="actions" :item="item" />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { UserSpecialMembershipRequestReview } from '@/services/types'

import { computed } from 'vue'
import { getUserBitmapAsString, getUserPlan, hasAnySpecialMembershipAccess } from '@/logic/user'
import TimeAgo from '@/components/TimeAgo.vue'

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
