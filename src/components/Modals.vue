<template>
  <div class="Modals position-fixed top-0 end-0" style="z-index: var(--z-index-modals)">
    <TermsOfUseModal :isVisible="view === ViewTermsOfUse" @dismiss="() => resetView()" />
    <ChangePlanModal
      :isVisible="view === ViewChangePlanRequest"
      :title="$t('Change Plan')"
      @dismiss="() => resetView()"
      :userChangePlanRequest="userChangePlanRequestResponse.data"
      :isLoading="userChangePlanRequestResponse.status === 'loading'"
      @submit="patchCurrentPlanChangeRequest"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
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

const store = useViewsStore()
const view = ref<(typeof Views)[number] | null>(store.view)

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

const patchCurrentPlanChangeRequest = async (plan: string) => {
  console.debug('[ChangePlanModal] @patchCurrentPlanChangeRequest', plan)
  await userChangePlanRequestService
    .create({
      plan: 'plan-researcher'
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
