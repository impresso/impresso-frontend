<template>
  <div class="row">
    <div class="col-8">
      <Card>
        <h2 class="m-0 font-size-inherit font-weight-bold">Pending Special Membership requests</h2>
        <ListOfFindResponseItems
          :error-loading-items-message="$t('errorLoadingSpecialMembershipRequests')"
          :list-is-empty-message="$t('listIsEmpty')"
          :service="userSpecialMembershipRequestsService"
          :title="$t('listTitle')"
          :params="{
            query: {
              limit: 10
            }
          }"
        />
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '../components/Card.vue'
import ListOfFindResponseItems from '@/components/ListOfFindResponseItems.vue'
import { userSpecialMembershipRequests as userSpecialMembershipRequestsService } from '@/services'
</script>
