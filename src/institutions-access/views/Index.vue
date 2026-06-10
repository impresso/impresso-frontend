<template>
  <div class="container Index">
    <div class="row">
      <div class="col-lg-8 col-xl-9 order-2 order-lg-1">
        <Card class="mb-4">
          <template #header>
            <h4 class="p-2 m-0 font-weight-bold">{{ $t(`card.title.${selectedStatus}`) }}</h4>
          </template>
          <ListOfFindResponseItems
            ref="listRef"
            :error-loading-items-message="$t(`card.errorLoadingItems.${selectedStatus}`)"
            :list-is-empty-message="$t(`card.listisEmpty.${selectedStatus}`)"
            :service="userSpecialMembershipRequestsReviewsService"
            :title="$t(`card.title.${selectedStatus}`)"
            items-class=""
            :params="serviceParams"
            class="border rounded-sm"
          >
            <template #header="{ total }">
              <div
                class="px-3 py-2 d-flex gap-2 justify-content-between align-items-center border-bottom mb-2"
              >
                <div>
                  <BSearchInputForm
                    :key="searchInputKey"
                    @submit="performSearch"
                    :required="false"
                    :placeholder="$t('searchPlaceholder')"
                  />
                </div>
                <span v-html="$t('numbers.itemsGeneric', { n: $n(total) }, total)"></span>
                <!-- reset -->
                <button
                  v-if="q"
                  class="btn btn-sm btn-outline-secondary"
                  @click="resetSearch"
                >
                  {{ $t('reset') }}
                </button>
              </div>
              <div class="container-fluid">
                <div class="row pb-2 small align-items-center font-weight-bold">
                  <div class="col-3">
                    {{ $t('userSpecialMembershipRequestsRequester') }}
                  </div>
                  <div class="col-3">
                    {{ $t('userSpecialMembershipRequestsDates') }}
                  </div>
                  <div class="col-4">
                    {{ $t('specialMembershipAccessTitle') }}
                  </div>

                  <div class="col-2">
                    {{ $t('userSpecialMembershipRequestsStatus') }}
                  </div>
                </div>
              </div>
            </template>
            <template #beforeHeader> </template>
            <template #default="{ items }">
              <div class="container-fluid">
                <SpecialMembershipRequestReviewItem
                  :item="item"
                  class="py-3"
                  v-for="(item, index) in items"
                  :key="item.id"
                  :class="{
                    'border-bottom border-dark ': index < items.length - 1
                  }"
                >
                  <template #actions>
                    <button
                      class="btn btn-sm btn-outline-secondary mt-2"
                      @click="routeToModal(item)"
                    >
                      {{ $t('actions.toggleStatus') }}
                    </button>
                  </template>
                </SpecialMembershipRequestReviewItem>
              </div>
            </template>
          </ListOfFindResponseItems>
        </Card>
      </div>
      <div class="col-lg-4 col-xl-3 order-1 order-lg-2">
        <Card>
          <template #header>
            <h4 class="p-2 m-0 font-weight-bold">Special Membership Access</h4>
          </template>
          <div>
            <p class="m-2">Manage special membership access for institutions.</p>
          </div>

          <div class="mt-3 pt-2 border-top">
            <label class="m-2">{{ $t('sortBy') }}</label>
            <i-dropdown
              v-model="orderBy"
              :options="
                orderByOptions.map((value: string) => ({
                  value,
                  text: $t(`orderBy_${value}`)
                }))
              "
              class="mr-auto"
              size="sm"
              variant="outline-primary"
            ></i-dropdown>
          </div>
          <div class="mt-3 pt-3 border-top">
            <ReviewerSettings></ReviewerSettings>
          </div>
        </Card>
      </div>
      <ToggleSpecialMembershipRequestStatusModal
        :is-visible="isToggleStatusModalVisible"
        :item="itemToUpdate"
        @success="refreshLists"
        @dismiss="hideToggleStatusModal()"
      ></ToggleSpecialMembershipRequestStatusModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '../components/Card.vue'
import ListOfFindResponseItems from '@/components/ListOfFindResponseItems.vue'
import type { ListOfFindResponseItemsExposed } from '@/components/ListOfFindResponseItems.vue'
import SpecialMembershipRequestReviewItem from '@/components/modules/lists/SpecialMembershipRequestReviewItem.vue'
import { userSpecialMembershipRequestsReviews as userSpecialMembershipRequestsReviewsService } from '@/services'
import ToggleSpecialMembershipRequestStatusModal from '../components/reviews/ToggleSpecialMembershipRequestStatusModal.vue'
import { ref, computed, watch } from 'vue'
import { UserSpecialMembershipRequestReview } from '@/services/types'
import BSearchInputForm from '@/components/legacy/bootstrap/BSearchInputForm.vue'
import ReviewerSettings from '../components/ReviewerSettings.vue'
import { useRouter } from 'vue-router'
import { SpecialMembershipRequestStatuses } from '@/constants.js'

const router = useRouter()
const availableStatuses: ((typeof SpecialMembershipRequestStatuses)[number] | 'all')[] = [
  'all',
  ...SpecialMembershipRequestStatuses
]

type RequestStatus = (typeof availableStatuses)[number]

export interface IndexProps {
  status?: string
  prefetchedItem?: UserSpecialMembershipRequestReview | null
}

const props = withDefaults(defineProps<IndexProps>(), {
  status: 'all',
  prefetchedItem: null
})

const itemToUpdate = ref<UserSpecialMembershipRequestReview | null>(null)
const isToggleStatusModalVisible = ref(false)

const selectedStatus = computed<RequestStatus>(() => {
  if (availableStatuses.includes(props.status as RequestStatus)) {
    return props.status as RequestStatus
  }
  return 'all'
})

const statusRouteByStatus: Record<RequestStatus, string> = {
  all: 'Index',
  pending: 'PendingRequests',
  approved: 'ApprovedRequests',
  rejected: 'RejectedRequests',
  revoked: 'Index',
  temporary: 'Index',
  'pending-t': 'PendingRequests'
}

const listRef = ref<ListOfFindResponseItemsExposed | null>(null)
const searchInputKey = ref(0)

const hideToggleStatusModal = () => {
  isToggleStatusModalVisible.value = false
  router.push({
    name: statusRouteByStatus[selectedStatus.value]
  })
  resetSearch()
}

const refreshLists = async () => {
  if (listRef.value) {
    await listRef.value.refreshFromFirstPage()
  }
}

const showToggleStatusModal = (item: UserSpecialMembershipRequestReview) => {
  itemToUpdate.value = item
  isToggleStatusModalVisible.value = true
}

watch(
  () => props.prefetchedItem,
  item => {
    if (item) {
      showToggleStatusModal(item)
    }
  },
  { immediate: true }
)

const orderByOptions = ['-dateLastModified', 'dateLastModified']

const orderBy = ref('-dateLastModified')
const q = ref('')

const serviceParams = computed(() => {
  const query: {
    limit: number
    order_by: string
    term: string
    status?: RequestStatus[]
  } = {
    limit: 50,
    order_by: orderBy.value,
    term: q.value
  }

  if (selectedStatus.value !== 'all') {
    query.status = [selectedStatus.value]
  }

  return {
    query
  }
})

const performSearch = (searchTerm: string) => {
  const normalizedSearchTerm = searchTerm.trim()

  if (!normalizedSearchTerm) {
    q.value = ''
    searchInputKey.value += 1
    return
  }

  console.info('performSearch', normalizedSearchTerm)
  q.value = normalizedSearchTerm
}

const resetSearch = () => {
  performSearch('')
}

const routeToModal = (item: UserSpecialMembershipRequestReview) => {
  console.debug('[Index] Routing to modal for item', item)
  router.push({
    name: 'SpecialMembershipRequest',
    params: {
      id: item.id
    }
  })
}
</script>

<i18n lang="json">
{
  "en": {
    "errorLoadingSpecialMembershipRequests": "Error loading special membership requests.",
    "listIsEmpty": "There are no pending special membership requests.",
    "approvedListIsEmpty": "There are no approved special membership requests.",
    "listTitle": "Special Membership Requests",
    "userSpecialMembershipRequestsRequester": "Requester",
    "userSpecialMembershipRequestsDates": "Dates",
    "specialMembershipAccessTitle": "Special Membership Access",
    "userHasAlreadySpecialMembership": "Other special Membership",
    "userSpecialMembershipRequestsStatus": "Status",
    "sortBy": "Sort by",
    "searchPlaceholder": "Search by requester name",
    "orderBy_dateLastModified": "Date Modified",
    "orderBy_-dateLastModified": "Date Modified (Descending)",
    "actions": {
      "toggleStatus": "Change..."
    },
    "card": {
      "title": {
        "all": "All Requests",
        "pending": "Pending Requests",
        "approved": "Approved Requests",
        "rejected": "Rejected Requests",
        "revoked": "Revoked Requests",
        "temporary": "Temporary Requests"
      },
      "errorLoadingItems": {
        "all": "Error loading requests.",
        "pending": "Error loading pending requests.",
        "approved": "Error loading approved requests.",
        "rejected": "Error loading rejected requests.",
        "revoked": "Error loading revoked requests.",
        "temporary": "Error loading temporary requests."
      },
      "listTitle": {
        "all": "All Special Membership Requests",
        "pending": "Pending Special Membership Requests",
        "approved": "Approved Special Membership Requests",
        "rejected": "Rejected Special Membership Requests",
        "revoked": "Revoked Special Membership Requests",
        "temporary": "Temporary Special Membership Requests"
      },
      "listisEmpty": {
        "all": "There are no special membership requests.",
        "pending": "There are no pending special membership requests.",
        "approved": "There are no approved special membership requests.",
        "rejected": "There are no rejected special membership requests.",
        "revoked": "There are no revoked special membership requests.",
        "temporary": "There are no temporary special membership requests."
      }
    }
  }
}
</i18n>

<style>
.Index.container {
  max-width: 2000px;
}
</style>
