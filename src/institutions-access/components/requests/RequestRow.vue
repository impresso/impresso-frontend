<template>
  <div class="RequestRow" :class="{ 'RequestRow--expanded': isExpanded }">
    <div class="RequestRow__main">
      <div class="RequestRow__cell RequestRow__cell--requester">
        <div class="RequestRow__cellLabel small-caps d-lg-none">{{ $t('columns.requester') }}</div>
        <div class="RequestRow__name">{{ requesterFullName }}</div>
        <a class="RequestRow__email" :href="`mailto:${item.requester.email}`">
          {{ item.requester.email }}
        </a>
        <div class="RequestRow__affiliation">
          {{ item.requester.profile.affiliation || $t('noAffiliation') }}
        </div>
      </div>

      <div class="RequestRow__cell RequestRow__cell--access">
        <div class="RequestRow__cellLabel small-caps d-lg-none">{{ $t('columns.access') }}</div>
        <div class="RequestRow__name">{{ item.specialMembershipAccess.title }}</div>
        <div class="RequestRow__meta">{{ $t('requestId', { id: item.id }) }}</div>
      </div>

      <div class="RequestRow__cell RequestRow__cell--dates">
        <div class="RequestRow__cellLabel small-caps d-lg-none">{{ $t('columns.dates') }}</div>
        <dl class="RequestRow__dates">
          <div>
            <dt>{{ $t('dates.requested') }}</dt>
            <dd :title="$d(new Date(item.dateCreated), 'precise')">
              {{ $d(new Date(item.dateCreated), 'compact') }}
            </dd>
          </div>
          <div>
            <dt>{{ $t('dates.lastModified') }}</dt>
            <dd :title="$d(new Date(item.dateLastModified), 'precise')">
              {{ $d(new Date(item.dateLastModified), 'compact') }}
            </dd>
          </div>
          <div v-if="item.temporaryExpiresAt">
            <dt>{{ $t('dates.expires') }}</dt>
            <dd>{{ $d(new Date(item.temporaryExpiresAt), 'compact') }}</dd>
          </div>
        </dl>
      </div>

      <div class="RequestRow__cell RequestRow__cell--status">
        <div class="RequestRow__cellLabel small-caps d-lg-none">{{ $t('columns.status') }}</div>
        <RequestStatusBadge :status="item.status" />
      </div>

      <div class="RequestRow__cell RequestRow__cell--actions">
        <div class="RequestRow__actions">
          <slot name="actions" :item="item" />
          <button
            type="button"
            class="btn btn-sm btn-link RequestRow__detailsToggle"
            :aria-expanded="isExpanded"
            :aria-controls="detailsId"
            @click="isExpanded = !isExpanded"
          >
            {{ $t(isExpanded ? 'actions.hideDetails' : 'actions.showDetails') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="isExpanded" :id="detailsId" class="RequestRow__details">
      <div>
        <h6 class="RequestRow__detailsTitle small-caps">{{ $t('details.notes') }}</h6>
        <blockquote v-if="item.notes" class="RequestRow__notes">
          {{ item.notes }}
        </blockquote>
        <p v-else class="RequestRow__empty">{{ $t('details.noNotes') }}</p>

        <dl class="RequestRow__metaList">
          <div>
            <dt>{{ $t('details.plan') }}</dt>
            <dd>{{ userPlanLabel }}</dd>
          </div>
          <div v-if="item.requester.profile.institutionalUrl">
            <dt>{{ $t('details.website') }}</dt>
            <dd>
              <a
                class="RequestRow__email"
                :href="item.requester.profile.institutionalUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ $t('details.openWebsite') }}
              </a>
            </dd>
          </div>
          <div>
            <dt>{{ $t('details.signedInWith') }}</dt>
            <dd>{{ item.requester.profile.provider }}</dd>
          </div>
          <div v-if="provider">
            <dt>{{ $t('details.provider') }}</dt>
            <dd>{{ provider }}</dd>
          </div>
          <div v-if="allowsTemporaryAccess">
            <dt>{{ $t('details.temporaryAccess') }}</dt>
            <dd>{{ $t('details.enabled') }}</dd>
          </div>
          <div v-if="revokeAfterDays">
            <dt>{{ $t('details.revokeAfter') }}</dt>
            <dd>{{ $t('details.days', { count: revokeAfterDays }, revokeAfterDays) }}</dd>
          </div>
          <div>
            <dt>{{ $t('details.assignedReviewer') }}</dt>
            <dd>{{ lastReviewer || $t('details.unassigned') }}</dd>
          </div>
        </dl>
      </div>

      <div>
        <h6 class="RequestRow__detailsTitle small-caps">{{ $t('details.changelog') }}</h6>
        <RequestChangelogTimeline :changelog="item.changelog" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import type { UserSpecialMembershipRequestReview } from '@/services/types'
import { getUserPlan } from '@/logic/user'
import RequestStatusBadge from '@/components/specialMembership/RequestStatusBadge.vue'
import RequestChangelogTimeline from '@/components/specialMembership/RequestChangelogTimeline.vue'

export interface RequestRowProps {
  item: UserSpecialMembershipRequestReview
  /** Render the detail area open on first paint. */
  initiallyExpanded?: boolean
}

const props = withDefaults(defineProps<RequestRowProps>(), {
  initiallyExpanded: false
})

const isExpanded = ref(props.initiallyExpanded)
const detailsId = useId()

const requesterFullName = computed(() =>
  `${props.item.requester.firstname} ${props.item.requester.lastname}`.trim()
)

const provider = computed(() => props.item.specialMembershipAccess.metadata?.provider ?? '')

const allowsTemporaryAccess = computed(
  () => props.item.specialMembershipAccess.metadata?.enableTemporaryAutomaticAcceptance === true
)

const revokeAfterDays = computed(
  () => props.item.specialMembershipAccess.metadata?.revokeAfterDays ?? 0
)

/**
 * The service exposes `reviewerId` rather than a reviewer name, so the most
 * recent changelog entry is the only place a reviewer is identifiable.
 */
const lastReviewer = computed(() => {
  const entries = props.item.changelog ?? []
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    if (entries[index].reviewer) return entries[index].reviewer
  }
  return ''
})

const userPlanLabel = computed<string>(() => getUserPlan(props.item.requester.groups).label)
</script>

<i18n lang="json">
{
  "en": {
    "columns": {
      "requester": "Requester",
      "access": "Requested access",
      "dates": "Dates",
      "status": "Status"
    },
    "noAffiliation": "No affiliation provided",
    "requestId": "Request #{id}",
    "dates": {
      "requested": "Requested",
      "lastModified": "Modified",
      "expires": "Expires"
    },
    "actions": {
      "showDetails": "Details",
      "hideDetails": "Hide details"
    },
    "details": {
      "notes": "Notes",
      "noNotes": "No notes were submitted with this request.",
      "plan": "Plan",
      "website": "Institution website",
      "openWebsite": "Open website",
      "signedInWith": "Signed in with",
      "provider": "Provider",
      "temporaryAccess": "Temporary access",
      "revokeAfter": "Revoked after",
      "days": "{count} day | {count} days",
      "assignedReviewer": "Last reviewed by",
      "unassigned": "Not reviewed yet",
      "enabled": "Granted automatically",
      "changelog": "History"
    }
  }
}
</i18n>

<style>
.RequestRow {
  border-bottom: 1px solid var(--clr-grey-700);
  transition: background-color 0.2s ease;
}
.RequestRow:last-child {
  border-bottom: none;
}
.RequestRow:hover,
.RequestRow--expanded {
  background-color: var(--impresso-color-paper);
}
.RequestRow__main,
.RequestsTable__header {
  grid-template-columns:
    minmax(0, 2.4fr)
    minmax(0, 1.8fr)
    minmax(0, 1.15fr)
    minmax(6.5rem, 0.7fr)
    minmax(11rem, 1.15fr);
  gap: 0.75rem 1.25rem;
  align-items: start;
  padding: 0.9rem 1.25rem;
}
.RequestRow__main {
  display: grid;
}
.RequestRow__cellLabel {
  margin-bottom: 0.25rem;
  color: var(--clr-grey-300);
}
.RequestRow__name {
  font-weight: 600;
  line-height: 1.3;
}
.RequestRow__email,
.RequestRow__affiliation,
.RequestRow__meta {
  display: block;
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--clr-grey-200);
}
.RequestRow__email {
  color: inherit;
  text-decoration-color: var(--clr-grey-500);
  word-break: break-word;
}
.RequestRow__dates {
  display: grid;
  gap: 0.4rem;
  margin: 0;
}
.RequestRow__dates dt {
  margin: 0;
  font-size: 0.7rem;
  color: var(--clr-grey-300);
}
.RequestRow__dates dd {
  margin: 0;
  font-size: 0.85rem;
  color: var(--clr-grey-100);
  font-variant-numeric: tabular-nums;
}
.RequestRow__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}
.RequestRow__details {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.25rem 2rem;
  padding: 0 1.25rem 1.1rem;
}
.RequestRow__detailsTitle {
  margin: 0 0 0.5rem;
  color: var(--clr-grey-300);
}
.RequestRow__detailsToggle {
  padding: 0.15rem 0.1rem;
  min-height: 1.9rem;
}
.RequestRow__notes,
.RequestRow__empty {
  margin: 0 0 1rem;
  font-size: 0.875rem;
}
.RequestRow__notes {
  border-left: 2px solid var(--clr-grey-400);
  background-color: var(--impresso-color-light-grey);
  padding: 0.4rem 0.6rem;
  border-radius: var(--impresso-border-radius-xs);
}
.RequestRow__empty {
  color: var(--clr-grey-300);
}
.RequestRow__metaList {
  display: grid;
  gap: 0.45rem;
  margin: 0;
}
.RequestRow__metaList > div {
  display: grid;
  grid-template-columns: minmax(0, 9.5rem) minmax(0, 1fr);
  gap: 0.5rem;
}
.RequestRow__metaList dt {
  margin: 0;
  font-size: 0.75rem;
  color: var(--clr-grey-300);
}
.RequestRow__metaList dd {
  margin: 0;
  font-size: 0.85rem;
}

@media (max-width: 991.98px) {
  .RequestRow__main {
    grid-template-columns: 1fr 1fr;
  }
  .RequestRow__cell--requester,
  .RequestRow__cell--access {
    grid-column: 1 / -1;
  }
  .RequestRow__details {
    grid-template-columns: 1fr;
  }
}
</style>
