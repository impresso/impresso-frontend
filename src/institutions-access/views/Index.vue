<template>
  <div class="row">
    <div class="col-10 offset-1">
      <Card>
        <template #header>
          <h4 class="p-2 m-0 font-weight-bold">Pending Special Membership requests</h4>
        </template>
        <ListOfFindResponseItems
          :error-loading-items-message="$t('errorLoadingSpecialMembershipRequests')"
          :list-is-empty-message="$t('listIsEmpty')"
          :service="userSpecialMembershipRequestsReviewsService"
          :title="$t('listTitle')"
          :params="{
            query: {
              limit: 10
            }
          }"
        >
          <template #header="{ total }">
            <div class="p-2 pb-3 d-flex gap-2 justify-content-between align-items-center">
              <h5 class="m-0 font-size-inherit" v-html="$t('listTitle')"></h5>
              <span v-html="$tc('numbers.itemsGeneric', total, { n: $n(total) })"></span>
            </div>
            <div class="container-fluid">
              <div class="row pb-2 small align-items-center">
                <div class="col-3">
                  {{ $t('userSpecialMembershipRequestsRequester') }}
                </div>
                <div class="col-3">
                  {{ $t('userSpecialMembershipRequestsDates') }}
                </div>
                <div class="col-3">
                  {{ $t('specialMembershipAccessTitle') }}
                </div>
                <div class="col-1">
                  {{ $t('userHasAlreadySpecialMembership') }}
                </div>
                <div class="col-2">
                  {{ $t('userSpecialMembershipRequestsStatus') }}
                </div>
              </div>
            </div>
          </template>

          <template #default="{ items }">
            <div class="container">
              <div
                class="py-3"
                v-for="(item, index) in items"
                :key="item.id"
                :class="{
                  'border-bottom border-dark ': index < items.length - 1
                }"
              >
                <SpecialMembershipRequestReviewItem :item="item" />
              </div>
            </div>
          </template>
        </ListOfFindResponseItems>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '../components/Card.vue'
import ListOfFindResponseItems from '@/components/ListOfFindResponseItems.vue'
import SpecialMembershipRequestReviewItem from '@/components/modules/lists/SpecialMembershipRequestReviewItem.vue'
import { userSpecialMembershipRequestsReviews as userSpecialMembershipRequestsReviewsService } from '@/services'
</script>

<i18n lang="json">
{
  "en": {
    "errorLoadingSpecialMembershipRequests": "Error loading special membership requests.",
    "listIsEmpty": "There are no pending special membership requests.",
    "listTitle": "Special Membership Requests",
    "userSpecialMembershipRequestsRequester": "Requester",
    "userSpecialMembershipRequestsDates": "Dates",
    "specialMembershipAccessTitle": "Special Membership Access",
    "userHasAlreadySpecialMembership": "Other special Membership",
    "userSpecialMembershipRequestsStatus": "Status"
  }
}
</i18n>
