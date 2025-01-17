<template>
  <div class="Modals position-fixed top-0 end-0" style="z-index: var(--z-index-modals)">
    <!--  -->
    <TermsOfUseModal :isVisible="view === ViewTermsOfUse" @dismiss="() => resetView()">
      <template v-slot:terms-of-use-status v-if="termsOfUseResponse.status === 'success'">
        <Alert
          :type="acceptTermsDate || acceptTermsDateOnLocalStorage ? 'info' : 'warning'"
          class="bg-info mb-3"
          style="position: sticky; top: 0"
        >
          <TermsOfUseStatus />
        </Alert>
      </template>
      <template v-slot:accept-terms-of-use>
        <AcceptTermsOfUse
          :is-loading="
            termsOfUseResponse.status === 'idle' || termsOfUseResponse.status === 'loading'
          "
          :checked="!!acceptTermsDate"
          :disabled="!!acceptTermsDate"
          @change="
            (event: Event) => {
              const isChecked = (event.target as HTMLInputElement).checked
              console.debug('[Models] AcceptTermsOfUse@onChange', isChecked)
              if (isChecked) {
                patchAcceptTermsDate()
              }
            }
          "
        />
      </template>
    </TermsOfUseModal>
    <InfoModal
      :isVisible="view === ViewInfoModal"
      :title="$t('Verbose Info')"
      @dismiss="() => resetView()"
    >
      <div class="row">
        <div class="col-6">
          <h3>{{ $t('User Plan') }}</h3>
          <pre>{{ userPlan }}</pre>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <h2>{{ $t('User Accept Terms Date Local') }}</h2>
          <pre>{{ acceptTermsDateOnLocalStorage }}</pre>
        </div>
        <div class="col">
          <h2>{{ $t('User Accept Terms Date') }}</h2>
          <pre>{{ acceptTermsDate }}</pre>
        </div>
      </div>
    </InfoModal>
    <!--  -->
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
import { computed, onMounted, ref, watch } from 'vue'
import TermsOfUseModal from './TermsOfUseModal.vue'
import ChangePlanModal from './ChangePlanModal.vue'
import type { TermsOfUse, UserChangePlanRequest } from '@/services/types.ts'
import {
  Views,
  useViewsStore,
  ViewTermsOfUse,
  ViewChangePlanRequest,
  ViewConfirmChangePlanRequest,
  ViewInfoModal
} from '@/stores/views'
import {
  userChangePlanRequest as userChangePlanRequestService,
  termsOfUse as termsOfUseService
} from '@/services'
import type { FeathersError } from '@feathersjs/errors'
import { useUserStore } from '@/stores/user'
import { AvailablePlans, PlanLabels } from '@/constants'
import TermsOfUseStatus from './TermsOfUseStatus.vue'
import AcceptTermsOfUse from './AcceptTermsOfUse.vue'
import Alert from './Alert.vue'
import InfoModal from './InfoModal.vue'

const store = useViewsStore()
const userStore = useUserStore()
const userPlan = computed(() => userStore.userPlan)
const view = ref<(typeof Views)[number] | null>(store.view)
const isLoading = ref(false)
const isAuthenticated = computed(() => !!userStore.userData)
// date of accepting the ToU on localStorage
const acceptTermsDateOnLocalStorage = computed(() => userStore.acceptTermsDateOnLocalStorage)
// date of accepting the ToU on current store (sort of cached value)
const acceptTermsDate = computed(() => userStore.acceptTermsDate)

const userChangePlanRequestResponse = ref<{
  data: UserChangePlanRequest | null
  status: 'idle' | 'loading' | 'success' | 'error'
}>({
  status: 'idle',
  data: null
})

const termsOfUseResponse = ref<{
  data: TermsOfUse
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

const fetchAcceptTermsDate = async () => {
  /**
   * Fetches the date when the user accepted the terms of use.
   *
   * This method updates the `acceptTermsDateResponse` ref with the status of the request.
   * It sets the status to 'loading' before making the request, and updates it to 'success' or 'error' based on the outcome.
   *
   * @returns {Promise<void>}
   */

  return termsOfUseService
    .find()
    .then((data: TermsOfUse) => {
      console.debug('[Modals] fetchAcceptTermsDate call termsOfUseService.find() success:', data)
      termsOfUseResponse.value = { data, status: 'success' }
      userStore.setAcceptTermsDate(
        data.dateAcceptedTerms ? new Date(data.dateAcceptedTerms).toISOString() : null
      )
    })
    .catch((err: FeathersError) => {
      console.error(
        '[Modals] fetchAcceptTermsDate call termsOfUseService.find() error:',
        err.message,
        err.data,
        err.code
      )
      termsOfUseResponse.value = { data: null, status: 'error' }
    })
}

const patchAcceptTermsDate = async () => {
  termsOfUseService
    .patch(null, {})
    .then(data => {
      console.debug(
        '[Modals] patchAcceptTermsDate call termsOfUseService.patch() success:',
        data.dateAcceptedTerms
      )
      // update with the latest value
      userStore.setAcceptTermsDate(
        data.dateAcceptedTerms ? new Date(data.dateAcceptedTerms).toISOString() : null
      )
    })
    .finally(() => {
      isLoading.value = false
    })
}
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
        '[Modals] @useEffect - userChangePlanRequestService',
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
onMounted(() => {
  console.debug('[Modals] @mounted')
  fetchAcceptTermsDate()
})
</script>
