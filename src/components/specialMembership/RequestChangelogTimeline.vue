<template>
  <div class="RequestChangelogTimeline">
    <p v-if="entries.length === 0" class="small text-muted m-0">{{ $t('empty') }}</p>
    <ol v-else class="RequestChangelogTimeline__list list-unstyled m-0">
      <li v-for="(entry, index) in entries" :key="index" class="RequestChangelogTimeline__entry">
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <RequestStatusBadge v-if="isKnownStatus(entry.status)" :status="entry.status" />
          <span v-else class="badge bg-light text-dark small-caps">{{ entry.status }}</span>
          <span class="very-small text-muted">{{ $d(new Date(entry.date), 'precise') }}</span>
        </div>
        <div class="very-small text-muted">
          <span v-if="entry.reviewer">{{ $t('byReviewer', { reviewer: entry.reviewer }) }}</span>
          <span v-else>{{ $t('bySystem') }}</span>
          <template v-if="entry.subscription">
            &middot; <span>{{ entry.subscription }}</span>
          </template>
        </div>
        <blockquote v-if="entry.notes" class="RequestChangelogTimeline__notes small m-0 mt-1">
          {{ entry.notes }}
        </blockquote>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SpecialMembershipRequestStatuses } from '@/constants'
import type { UserSpecialMembershipRequestChangelogEntry } from '@/services/types'
import RequestStatusBadge, { type RequestStatus } from './RequestStatusBadge.vue'

export interface RequestChangelogTimelineProps {
  changelog?: UserSpecialMembershipRequestChangelogEntry[]
  /** Show the most recent entry first. */
  newestFirst?: boolean
}

const props = withDefaults(defineProps<RequestChangelogTimelineProps>(), {
  changelog: () => [],
  newestFirst: true
})

const entries = computed(() => {
  const list = props.changelog ?? []
  return props.newestFirst ? [...list].reverse() : list
})

/**
 * The changelog is free form on the backend, so only render a badge for a
 * status we actually know how to style.
 */
const isKnownStatus = (status: string): status is RequestStatus =>
  (SpecialMembershipRequestStatuses as readonly string[]).includes(status)
</script>

<i18n lang="json">
{
  "en": {
    "empty": "No changes recorded yet.",
    "byReviewer": "by {reviewer}",
    "bySystem": "by the system"
  }
}
</i18n>

<style>
.RequestChangelogTimeline__entry {
  position: relative;
  padding-left: 1rem;
  padding-bottom: 0.75rem;
}
.RequestChangelogTimeline__entry:last-child {
  padding-bottom: 0;
}
/* Connector line between entries. */
.RequestChangelogTimeline__entry::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 0.65rem;
  bottom: 0;
  border-left: 1px solid var(--clr-grey-600);
}
.RequestChangelogTimeline__entry:last-child::before {
  display: none;
}
.RequestChangelogTimeline__entry::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0.4rem;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--clr-grey-300);
}
.RequestChangelogTimeline__notes {
  border-left: 2px solid var(--clr-grey-400);
  background-color: var(--impresso-color-light-grey);
  padding: 0.35rem 0.5rem;
  border-radius: var(--impresso-border-radius-xs);
}
</style>
