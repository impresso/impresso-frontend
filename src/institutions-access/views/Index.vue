<template>
  <div class="container Index">
    <div class="row">
      <div class="col-lg-8 col-xl-9 order-2 order-lg-1">
        <Card class="my-4" v-for="card in cardViewsWithServiceParams" :key="card.name">
          <template #header>
            <h4 class="p-2 m-0 font-weight-bold">{{ $t(`card.title.${card.name}`) }}</h4>
          </template>
          <ListOfFindResponseItems
            :error-loading-items-message="$t(`card.errorLoadingItems.${card.name}`)"
            :list-is-empty-message="$t(`card.listisEmpty.${card.name}`)"
            :service="userSpecialMembershipRequestsReviewsService"
            :title="$t(`card.title.${card.name}`)"
            items-class=""
            :params="card.serviceParams"
          >
            <template #header="{ total }">
              <div class="p-2 pb-3 d-flex gap-2 justify-content-between align-items-center">
                <h5 class="m-0 font-size-inherit" v-html="$t(`card.listTitle.${card.name}`)"></h5>
                <span v-html="$t('numbers.itemsGeneric', { n: $n(total) }, total)"></span>
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
          <div>
            <BSearchInputForm @submit="performSearch" :placeholder="$t('searchPlaceholder')" />
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
        </Card>
      </div>
      <ToggleSpecialMembershipRequestStatusModal
        :is-visible="isToggleStatusModalVisible"
        :item="itemToUpdate"
        @dismiss="hideToggleStatusModal()"
      ></ToggleSpecialMembershipRequestStatusModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '../components/Card.vue'
import ListOfFindResponseItems from '@/components/ListOfFindResponseItems.vue'
import SpecialMembershipRequestReviewItem from '@/components/modules/lists/SpecialMembershipRequestReviewItem.vue'
import { userSpecialMembershipRequestsReviews as userSpecialMembershipRequestsReviewsService } from '@/services'
import ToggleSpecialMembershipRequestStatusModal from '../components/reviews/ToggleSpecialMembershipRequestStatusModal.vue'
import { ref, computed, watch } from 'vue'
import { ServiceFindParams, UserSpecialMembershipRequestReview } from '@/services/types'
import BSearchInputForm from '@/components/legacy/bootstrap/BSearchInputForm.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

export interface IndexProps {
  prefetchedItem?: UserSpecialMembershipRequestReview | null
}

const props = withDefaults(defineProps<IndexProps>(), {
  prefetchedItem: null
})

const itemToUpdate = ref<UserSpecialMembershipRequestReview>(null)
const isToggleStatusModalVisible = ref(false)

const hideToggleStatusModal = () => {
  isToggleStatusModalVisible.value = false
  router.push({ name: 'Index' })
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

const cardViewsWithServiceParams = computed(() => {
  const query = {
    limit: 50,
    order_by: orderBy.value,
    term: q.value
  }
  return ['pending', 'approved'].map(status => ({
    name: status,
    serviceParams: {
      query: {
        ...query,
        status: [status]
      }
    }
  }))
})

const performSearch = (searchTerm: string) => {
  console.info('performSearch', searchTerm)
  q.value = searchTerm
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
        "pending": "Pending Requests",
        "approved": "Approved Requests"
      },
      "errorLoadingItems": {
        "pending": "Error loading pending requests.",
        "approved": "Error loading approved requests."
      },
      "listTitle": {
        "pending": "Pending Special Membership Requests",
        "approved": "Approved Special Membership Requests"
      },
      "listisEmpty": {
        "pending": "There are no pending special membership requests.",
        "approved": "There are no approved special membership requests."
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
