<template>
  <span class="RequestStatusBadge badge small-caps" :class="badgeClass">
    {{ $t(labelKey) }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  SpecialMembershipRequestStatusApproved,
  SpecialMembershipRequestStatusPending,
  SpecialMembershipRequestStatusPendingTemporary,
  SpecialMembershipRequestStatusRejected,
  SpecialMembershipRequestStatusRevoked,
  SpecialMembershipRequestStatusTemporary,
  SpecialMembershipRequestStatuses
} from '@/constants'

export type RequestStatus = (typeof SpecialMembershipRequestStatuses)[number]

export interface RequestStatusBadgeProps {
  status: RequestStatus
}

const props = defineProps<RequestStatusBadgeProps>()

/**
 * Status colour uses Impresso pastels rather than Bootstrap's saturated
 * warning/success/danger fills, so the badge sits on the paper surface.
 */
const BadgeClassByStatus: Record<RequestStatus, string> = {
  [SpecialMembershipRequestStatusPending]: 'RequestStatusBadge--pending',
  [SpecialMembershipRequestStatusPendingTemporary]: 'RequestStatusBadge--pending',
  [SpecialMembershipRequestStatusTemporary]: 'RequestStatusBadge--temporary',
  [SpecialMembershipRequestStatusApproved]: 'RequestStatusBadge--approved',
  [SpecialMembershipRequestStatusRejected]: 'RequestStatusBadge--rejected',
  [SpecialMembershipRequestStatusRevoked]: 'RequestStatusBadge--revoked'
}

const badgeClass = computed(() => BadgeClassByStatus[props.status] ?? 'RequestStatusBadge--revoked')

const labelKey = computed(() => `status.${props.status}`)
</script>

<i18n lang="json">
{
  "en": {
    "status": {
      "pending": "Pending",
      "pending-t": "Pending temporary",
      "temporary": "Temporary",
      "approved": "Approved",
      "rejected": "Rejected",
      "revoked": "Revoked"
    }
  }
}
</i18n>

<style>
.RequestStatusBadge {
  border-radius: var(--impresso-border-radius-xs);
  padding: 0.35em 0.65em;
  font-weight: 600;
  letter-spacing: 0.03em;
  box-shadow: none;
  color: var(--impresso-color-black);
}
.RequestStatusBadge--pending {
  background-color: var(--impresso-color-paper-dark);
}
.RequestStatusBadge--temporary {
  background-color: var(--info);
}
.RequestStatusBadge--approved {
  background-color: var(--success);
}
.RequestStatusBadge--rejected {
  background-color: var(--warning);
}
.RequestStatusBadge--revoked {
  background-color: var(--clr-grey-600);
}
</style>
