<template>
  <nav class="RequestStatusTabs" :aria-label="$t('label')">
    <ul class="RequestStatusTabs__list">
      <li v-for="tab in tabs" :key="tab.status">
        <RouterLink
          :to="{ name: tab.routeName, query: preservedQuery }"
          class="RequestStatusTabs__link"
          :class="{ active: tab.status === status }"
        >
          <span class="small-caps">{{ $t(`status.${tab.status}`) }}</span>
          <span v-if="tab.count !== undefined" class="RequestStatusTabs__count">
            {{ $n(tab.count) }}
          </span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { RoutesByRequestStatus, type RequestStatusFilter } from '../../router/routes'
import type { RequestCounts } from '@/composables/useRequestCounts'

export interface RequestStatusTabsProps {
  status: RequestStatusFilter
  counts?: RequestCounts
}

const props = withDefaults(defineProps<RequestStatusTabsProps>(), {
  counts: () => ({})
})

const route = useRoute()

/**
 * Switching status keeps the search term and sort order, but always returns to
 * the first page since the result set changes.
 */
const preservedQuery = computed(() => {
  const { q, orderBy } = route.query
  const query: Record<string, string> = {}
  if (typeof q === 'string' && q !== '') query.q = q
  if (typeof orderBy === 'string' && orderBy !== '') query.orderBy = orderBy
  return query
})

const tabs = computed(() =>
  RoutesByRequestStatus.map(entry => ({
    status: entry[0],
    routeName: entry[2],
    count: props.counts[entry[0]]
  }))
)
</script>

<i18n lang="json">
{
  "en": {
    "label": "Filter requests by status",
    "status": {
      "all": "All",
      "pending": "Pending",
      "temporary": "Temporary",
      "approved": "Approved",
      "rejected": "Rejected",
      "revoked": "Revoked"
    }
  }
}
</i18n>

<style>
.RequestStatusTabs {
  position: relative;
  z-index: 2;
  background-color: var(--impresso-color-white);
  border-bottom: 1px solid var(--clr-grey-600);
}
.RequestStatusTabs__list {
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 0;
  margin: 0 0 -1px;
  padding: 0 0.75rem 2px;
  list-style: none;
  overflow-x: auto;
}
.RequestStatusTabs__list > li {
  display: flex;
  flex-shrink: 0;
}
a.RequestStatusTabs__link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.75rem 0.9rem 0.65rem;
  color: var(--clr-grey-200);
  white-space: nowrap;
  text-decoration: none !important;
  border-bottom: 2px solid transparent;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}
a.RequestStatusTabs__link:hover,
a.RequestStatusTabs__link:focus-visible {
  color: var(--clr-grey-100);
  text-decoration: none !important;
}
a.RequestStatusTabs__link.active {
  color: var(--clr-grey-100);
  border-bottom-color: var(--impresso-color-black);
}
a.RequestStatusTabs__link.active .small-caps {
  font-weight: var(--impresso-wght-smallcaps-bold);
  font-variation-settings: 'wght' var(--impresso-wght-smallcaps-bold);
}
.RequestStatusTabs__count {
  min-width: 1.35rem;
  padding: 0 0.3rem;
  text-align: center;
  font-size: 0.7rem;
  line-height: 1.3rem;
  font-variant-numeric: tabular-nums;
  color: var(--clr-grey-200);
  background-color: var(--impresso-color-paper);
  border-radius: var(--impresso-border-radius-xs);
}
.RequestStatusTabs__link.active .RequestStatusTabs__count {
  color: var(--clr-grey-100);
  background-color: var(--clr-grey-700);
}
</style>
