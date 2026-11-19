<template>
  <div class="container RequestsView">
    <header class="InstitutionsAccessPageHeader">
      <h1>{{ $t('pageTitle') }}</h1>
      <p>{{ $t('pageSubtitle') }}</p>
    </header>

    <div class="RequestsView__panel">
      <RequestStatusTabs :status="selectedStatus" :counts="counts" />
      <RequestsTable
        ref="tableRef"
        :service="userSpecialMembershipRequestsReviewsService"
        :params="serviceParams"
        :empty-message="$t(`card.listIsEmpty.${selectedStatus}`)"
        :error-message="$t(`card.errorLoadingItems.${selectedStatus}`)"
      >
        <!-- The list reports its page length, so the status count is the authoritative total. -->
        <template #toolbar="{ total }">
          <RequestsToolbar
            :term="term"
            :order-by="orderBy"
            :total="counts[selectedStatus] ?? total"
            :has-active-filters="hasActiveFilters"
            :is-exporting="isExporting"
            @update:term="setTerm"
            @update:order-by="setOrderBy"
            @reset="resetFilters"
            @export="exportLogs"
          />
        </template>
        <template #actions="{ item }">
          <button class="btn btn-sm btn-outline-secondary" @click="routeToModal(item)">
            {{ $t('actions.review') }}
          </button>
        </template>
      </RequestsTable>
    </div>

    <ToggleSpecialMembershipRequestStatusModal
      v-if="itemToUpdate"
      :is-visible="isToggleStatusModalVisible"
      :item="itemToUpdate"
      @success="onReviewSuccess"
      @dismiss="hideToggleStatusModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import RequestStatusTabs from '../components/requests/RequestStatusTabs.vue'
import RequestsToolbar from '../components/requests/RequestsToolbar.vue'
import RequestsTable from '../components/requests/RequestsTable.vue'
import ToggleSpecialMembershipRequestStatusModal from '../components/reviews/ToggleSpecialMembershipRequestStatusModal.vue'
import { userSpecialMembershipRequestsReviews as userSpecialMembershipRequestsReviewsService } from '@/services'
import type { UserSpecialMembershipRequestReview } from '@/services/types'
import type { ListOfFindResponseItemsExposed } from '@/components/ListOfFindResponseItems.vue'
import { useRequestsQuery } from '@/composables/useRequestsQuery'
import { useRequestCounts } from '@/composables/useRequestCounts'
import { useRequestsExport } from '@/composables/useRequestsExport'
import {
  RequestStatusFilters,
  RouteNameByRequestStatus,
  type RequestStatusFilter
} from '../router/routes'

export interface RequestsViewProps {
  /** Status filter, provided by the route. */
  status?: string
  /** Request prefetched by the router for a deep link into the review modal. */
  prefetchedItem?: UserSpecialMembershipRequestReview | null
}

const props = withDefaults(defineProps<RequestsViewProps>(), {
  status: 'all',
  prefetchedItem: null
})

const router = useRouter()

const selectedStatus = computed<RequestStatusFilter>(() =>
  RequestStatusFilters.includes(props.status as RequestStatusFilter)
    ? (props.status as RequestStatusFilter)
    : 'all'
)

const { term, orderBy, hasActiveFilters, serviceParams, setTerm, setOrderBy, resetFilters } =
  useRequestsQuery({ status: selectedStatus })

const { counts, refresh: refreshCounts } = useRequestCounts({ term })
const { isExporting, exportLogs } = useRequestsExport({ params: serviceParams, status: selectedStatus })

const tableRef = ref<ListOfFindResponseItemsExposed | null>(null)
const itemToUpdate = ref<UserSpecialMembershipRequestReview | null>(null)
const isToggleStatusModalVisible = ref(false)

const routeToModal = (item: UserSpecialMembershipRequestReview) => {
  router.push({ name: 'SpecialMembershipRequest', params: { id: item.id } })
}

const hideToggleStatusModal = () => {
  isToggleStatusModalVisible.value = false
  itemToUpdate.value = null
  // Return to the status list the reviewer came from, keeping their filters.
  router.push({
    name: RouteNameByRequestStatus[selectedStatus.value],
    query: router.currentRoute.value.query
  })
}

const onReviewSuccess = async () => {
  await Promise.all([tableRef.value?.refreshFromFirstPage(), refreshCounts()])
}

watch(
  () => props.prefetchedItem,
  item => {
    if (item) {
      itemToUpdate.value = item
      isToggleStatusModalVisible.value = true
    }
  },
  { immediate: true }
)
</script>

<i18n lang="json">
{
  "en": {
    "pageTitle": "Special membership requests",
    "pageSubtitle": "Review and manage institutional access requests.",
    "actions": {
      "review": "Review"
    },
    "card": {
      "errorLoadingItems": {
        "all": "Requests could not be loaded.",
        "pending": "Pending requests could not be loaded.",
        "approved": "Approved requests could not be loaded.",
        "rejected": "Rejected requests could not be loaded.",
        "revoked": "Revoked requests could not be loaded.",
        "temporary": "Temporary requests could not be loaded."
      },
      "listIsEmpty": {
        "all": "No requests yet.",
        "pending": "No pending requests.",
        "approved": "No approved requests.",
        "rejected": "No rejected requests.",
        "revoked": "No revoked requests.",
        "temporary": "No temporary requests."
      }
    }
  }
}
</i18n>

<style>
.RequestsView.container {
  max-width: 92rem;
}
.RequestsView__panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--impresso-color-white);
  border: 1px solid var(--clr-grey-600);
  border-radius: var(--impresso-border-radius-sm);
}
.RequestsView__panel .RequestStatusTabs {
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}
.RequestsView__panel .i-layout-section {
  height: auto !important;
  flex: 1 1 auto !important;
  max-width: none !important;
  min-height: 0;
  position: relative;
  z-index: 0;
}
.RequestsView__panel .i-layout-section > .header .border-bottom {
  border-bottom: 0;
}
</style>
