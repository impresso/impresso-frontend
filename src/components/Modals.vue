<template>
  <div class="Modals position-fixed top-0 end-0" style="z-index: var(--z-index-modals)">
    <TermsOfUseModal :isVisible="view === ViewTermsOfUse" @dismiss="() => resetView()">
      <template v-slot:accept-terms-of-use>
        <AcceptTermsOfUse v-if="isAuthenticated" />
      </template>
      <template v-slot:terms-of-use-status>
        <Alert
          type="warning"
          v-if="isAuthenticated"
          class="bg-info mb-3"
          style="position: sticky; top: 0"
        >
          <TermsOfUseStatus />
        </Alert>
      </template>
    </TermsOfUseModal>

    <ChangePlanModal
      :available-plans="AvailablePlans"
      :available-plans-labels="PlanLabels"
      :userPlan="userPlan"
      :isVisible="view === ViewChangePlanRequest"
      :title="$t('Change Plan')"
      @dismiss="() => resetView()"
      :userChangePlanRequest="userChangePlanRequestResponse.data"
      :isLoading="
        userChangePlanRequestResponse.status === 'loading' ||
        userChangePlanRequestResponse.status === 'idle'
      "
      @submit="patchCurrentPlanChangeRequest"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import TermsOfUseModal from './TermsOfUseModal.vue'
import ChangePlanModal from './ChangePlanModal.vue'
import type { UserChangePlanRequest } from '@/services/types.ts'
import {
  Views,
  useViewsStore,
  ViewTermsOfUse,
  ViewChangePlanRequest,
  ViewConfirmChangePlanRequest
} from '@/stores/views'
import { userChangePlanRequest as userChangePlanRequestService } from '@/services'
import type { FeathersError } from '@feathersjs/errors'
import { useUserStore } from '@/stores/user'
import { AvailablePlans, PlanLabels } from '@/constants'
import TermsOfUseStatus from './TermsOfUseStatus.vue'
import AcceptTermsOfUse from './AcceptTermsOfUse.vue'
import Alert from './Alert.vue'
const store = useViewsStore()
const userStore = useUserStore()
const userPlan = computed(() => userStore.userPlan)
const view = ref<(typeof Views)[number] | null>(store.view)
const isAuthenticated = computed(() => !!userStore.userData)
const userChangePlanRequestResponse = ref<{
  data: UserChangePlanRequest | null
  status: 'idle' | 'loading' | 'success' | 'error'
}>({
  status: 'idle',
  data: null
})

const resetView = () => {
  store.view = null
}

watch(
  () => store.view,
  _view => {
    view.value = _view
    if (_view === ViewChangePlanRequest) {
      console.debug('[Modals] @watch view = ViewChangePlanRequest')
      fetchUserPlanChangeRequest()
    }
  }
)
const fetchUserPlanChangeRequest = async () => {
  /**
   * Fetches the current user plan change request.
   *
   * This method updates the `userChangePlanRequestResponse` ref with the status of the request.
   * It sets the status to 'loading' before making the request, and updates it to 'success' or 'error' based on the outcome.
   *
   * @returns {Promise<void>}
   */
  // load current status
  userChangePlanRequestResponse.value = { data: null, status: 'loading' }
  await userChangePlanRequestService
    .find()
    .then(data => {
      console.info('[ChangePlanModal] @useEffect - userChangePlanRequestService', data)
      userChangePlanRequestResponse.value = { data, status: 'success' }
    })
    .catch((err: FeathersError) => {
      console.error(
        '[ChangePlanModal] @useEffect - userChangePlanRequestService',
        err.message,
        err.data,
        err.code
      )
      userChangePlanRequestResponse.value = { data: null, status: 'error' }
    })
}

const patchCurrentPlanChangeRequest = async ({ plan }) => {
  console.debug('[ChangePlanModal] @patchCurrentPlanChangeRequest', plan)
  await userChangePlanRequestService
    .create({
      plan
    })
    .then(data => {
      console.info('[ChangePlanModal] Password changed successfully. data:', data)
      store.view = ViewConfirmChangePlanRequest
    })
    .catch((err: FeathersError) => {
      console.error('[ChangePlanModal] create', err.message, err.data)
    })
}
</script>
