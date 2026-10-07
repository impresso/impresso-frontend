<template>
  <div class="SpecialMembershipRequestReviewItem">
    <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap">
      <div>
        <div class="font-weight-bold">
          {{ item.requester.firstname }} {{ item.requester.lastname }}
        </div>
        <div class="small">{{ item.requester.email }}</div>
      </div>
      <RequestStatusBadge :status="item.status" />
    </div>

    <dl class="SpecialMembershipRequestReviewItem__meta small mb-0 mt-2">
      <dt class="text-muted">{{ $t('affiliation') }}</dt>
      <dd>{{ item.requester.profile.affiliation || $t('notProvided') }}</dd>

      <dt class="text-muted">{{ $t('plan') }}</dt>
      <dd class="small-caps">{{ userPlanLabel }}</dd>

      <dt class="text-muted">{{ $t('access') }}</dt>
      <dd>{{ item.specialMembershipAccess.title }}</dd>

      <dt class="text-muted">{{ $t('requested') }}</dt>
      <dd><TimeAgo :date="new Date(item.dateCreated)" /></dd>

      <dt class="text-muted">{{ $t('lastModified') }}</dt>
      <dd><TimeAgo :date="new Date(item.dateLastModified)" /></dd>

      <template v-if="item.temporaryExpiresAt">
        <dt class="text-muted">{{ $t('expires') }}</dt>
        <dd>{{ $d(new Date(item.temporaryExpiresAt), 'compact') }}</dd>
      </template>
    </dl>

    <blockquote v-if="item.notes" class="SpecialMembershipRequestReviewItem__notes small mt-2 mb-0">
      {{ item.notes }}
    </blockquote>
  </div>
</template>

<script setup lang="ts">
import type { UserSpecialMembershipRequestReview } from '@/services/types'

import { computed } from 'vue'
import { getUserPlan } from '@/logic/user'
import TimeAgo from '@/components/TimeAgo.vue'
import RequestStatusBadge from '@/components/specialMembership/RequestStatusBadge.vue'

/**
 * Compact summary of a single request, used where a request needs to be
 * identified rather than scanned in a list, such as the review modal. The
 * tabular presentation of the review queue lives in
 * `institutions-access/components/requests/RequestRow.vue`.
 */
export interface SpecialMembershipRequestReviewItemProps {
  item: UserSpecialMembershipRequestReview
}

const props = defineProps<SpecialMembershipRequestReviewItemProps>()

const userPlanLabel = computed<string>(() => {
  const { label } = getUserPlan(props.item.requester.groups)
  return label
})
</script>

<i18n lang="json">
{
  "en": {
    "affiliation": "Affiliation",
    "plan": "Plan",
    "access": "Requested access",
    "requested": "Requested",
    "lastModified": "Last modified",
    "expires": "Expires",
    "notProvided": "Not provided"
  }
}
</i18n>

<style>
.SpecialMembershipRequestReviewItem__meta {
  display: grid;
  grid-template-columns: minmax(0, 9rem) minmax(0, 1fr);
  column-gap: 0.75rem;
  row-gap: 0.15rem;
}
.SpecialMembershipRequestReviewItem__meta dd {
  margin-bottom: 0;
}
.SpecialMembershipRequestReviewItem__notes {
  border-left: 2px solid var(--clr-grey-400);
  background-color: var(--impresso-color-light-grey);
  padding: 0.35rem 0.5rem;
  border-radius: var(--impresso-border-radius-xs);
}
</style>
