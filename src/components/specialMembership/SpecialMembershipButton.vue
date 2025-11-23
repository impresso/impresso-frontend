<template>
  <button
    class="UserSpecialmembershipRequestButton"
    @click="() => (viewStore.view = ViewSpecialMembership)"
  >
    <span v-if="item"></span>
    <span v-else>Request Special Membership Access</span>
  </button>
  <div v-if="item" class="SpecialMembershipAccessItem">
    <b>{{ item.title }}</b>
  </div>
  <SpecialMembershipModal :isVisible="isModalVisible" @dismiss="() => viewStore.resetView()">
    <template #specialMembershipAccess v-if="item">
      <div class="m-3">
        <p>Request for access could take 3 working days on averege.</p>
        <div
          class="rounded-md shadow-sm p-3 border d-flex align-items-center gap-2 justify-content-between"
        >
          <SpecialMembershipAccessItem :item="item" v-if="item" />
          <button class="btn btn-sm btn-outline-secondary">{{ $t('request access') }}</button>
        </div>
      </div>
    </template>
  </SpecialMembershipModal>
</template>
<script setup lang="ts">
import { SpecialMembershipAccess, UserSpecialMembershipRequest } from '@/services/types'
import { useViewsStore } from '@/stores/views'
import { computed, ref, watch } from 'vue'
import { ViewSpecialMembership } from '@/constants'
import { useUserStore } from '@/stores/user'
import type { FeathersError } from '@feathersjs/errors'
import SpecialMembershipModal from './SpecialMembershipModal.vue'
import SpecialMembershipAccessItem from '../modules/lists/SpecialMembershipAccessItem.vue'
import { userSpecialMembershipRequests as userSpecialMembershipRequestsService } from '@/services'
export interface SpecialMembershipButtonProps {
  item?: SpecialMembershipAccess
}

defineProps<{ item?: SpecialMembershipAccess }>()

const viewStore = useViewsStore()
const userStore = useUserStore()

const isModalVisible = computed(() => viewStore.view === ViewSpecialMembership)
const isLoggedIn = computed(() => !!userStore.userData)

const serviceResponse = ref<{
  data: UserSpecialMembershipRequest[]
  pagination: { total: number; offset: number; limit: number }
  status: 'idle' | 'loading' | 'success' | 'error'
}>({
  status: 'idle',
  pagination: { total: 0, offset: 0, limit: 0 },
  data: []
})

const fetchUserSpecialMembershipRequests = async () => {
  console.debug('[Modals] fetchUserSpecialMembershipRequests')
  // load current status
  if (!isLoggedIn.value) {
    return
  }
  serviceResponse.value = {
    data: [],
    status: 'loading',
    pagination: serviceResponse.value.pagination
  }

  // fetch user requests
  userSpecialMembershipRequestsService
    .find()
    .then(({ data, pagination }) => {
      console.info('[Modals] @useEffect - userRequestsService', data)
      serviceResponse.value = { data, status: 'success', pagination }
    })
    .catch((err: FeathersError) => {
      console.error('[Modals] @useEffect - userRequestsService', err.message, err.data, err.code)
      serviceResponse.value = {
        data: [],
        status: 'error',
        pagination: serviceResponse.value.pagination
      }
    })
  // fetch subscription datasets
}

watch(isModalVisible, isVisible => {
  if (isVisible && !isLoggedIn.value) {
    console.warn('[UserSpecialmembershipRequestButton] User is not logged in. Nothing to show')
    viewStore.resetView()
  } else if (isVisible) {
    console.debug('[UserSpecialmembershipRequestButton] Showing Special Membership Modal')
    fetchUserSpecialMembershipRequests()
  }
})
</script>
