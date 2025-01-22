<template>
  <div class="Modals position-fixed top-0 end-0" style="z-index: var(--z-index-modals)">
    <!--  -->
    <TermsOfUseModal :isVisible="view === ViewTermsOfUse" @dismiss="() => resetView()">
      <template v-slot:terms-of-use-status>
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
              console.debug('[Modals] AcceptTermsOfUse@onChange', isChecked)
              if (isChecked) {
                patchAcceptTermsDate()
              }
            }
          "
        />
      </template>
    </TermsOfUseModal>
    <PlansModal
      :isVisible="view === ViewPlans"
      @dismiss="() => resetView()"
      :modalTitle="$t('User plans overview')"
      :title="$t('Impresso User Plans')"
      :userPlan="userPlan"
      :userPlanLabel="PlanLabels[userPlan]"
    />
    <InfoModal
      :isVisible="view === ViewInfoModal"
      :title="$t('User settings')"
      @dismiss="() => resetView()"
    >
      <div class="d-flex justify-content-between border-bottom p-2">
        <div>
          {{ $t('user_plan_label') }}
        </div>
        <div>
          <b>{{ PlanLabels[userPlan] }}</b>
          ({{ userPlan }})
        </div>
      </div>
      <div class="d-flex justify-content-between border-bottom p-2">
        <div>
          {{ $t('user_bitmap_label') }}
        </div>
        <div>
          {{ bitmap }}
        </div>
      </div>
      <div class="d-flex justify-content-between border-bottom p-2">
        <div>
          {{ $t('user_accept_terms_date_local_label') }}
        </div>
        <div v-if="acceptTermsDateOnLocalStorage">
          {{ $d(new Date(acceptTermsDateOnLocalStorage), 'precise') }}
        </div>
        <div v-else>
          {{ $t('not_accepted_local_label') }}
        </div>
      </div>
      <div class="d-flex justify-content-between border-bottom p-2">
        <div>
          {{ $t('user_accept_terms_date_on_db_label') }}
        </div>
        <div v-if="acceptTermsDate">
          {{ $d(new Date(acceptTermsDate), 'precise') }}
        </div>
        <div v-else>
          {{ $t('not_accepted_on_db_label') }}
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
    <UserRequestsModal
      :title="$t('User Requests')"
      :isVisible="view === ViewUserRequests"
      @dismiss="() => resetView()"
      :userRequests="userRequestResponse.data"
      :isLoadingUserRequests="userRequestResponse.status === 'loading'"
      :subscriptionDatasets="subscriptionDatasetResponse.data"
      :isLoadingSubscriptionDatasets="
        subscriptionDatasetResponse.status === 'loading' ||
        subscriptionDatasetResponse.status === 'idle'
      "
    ></UserRequestsModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import TermsOfUseModal from './TermsOfUseModal.vue'
import ChangePlanModal from './ChangePlanModal.vue'
import type {
  SubscriptionDataset,
  TermsOfUse,
  UserChangePlanRequest,
  UserRequest
} from '@/services/types.ts'
import {
  Views,
  ViewTermsOfUse,
  ViewPlans,
  ViewChangePlanRequest,
  ViewUserRequests,
  ViewConfirmChangePlanRequest,
  ViewInfoModal
} from '@/constants'
import { useViewsStore } from '@/stores/views'
import {
  userChangePlanRequest as userChangePlanRequestService,
  termsOfUse as termsOfUseService,
  userRequests as userRequestsService,
  subscriptionDatasets as subscriptionDatasetsService
} from '@/services'
import type { FeathersError } from '@feathersjs/errors'
import { useUserStore } from '@/stores/user'
import { AvailablePlans, PlanLabels } from '@/constants'
import TermsOfUseStatus from './TermsOfUseStatus.vue'
import AcceptTermsOfUse from './AcceptTermsOfUse.vue'
import Alert from './Alert.vue'
import InfoModal from './InfoModal.vue'
import UserRequestsModal from './UserRequestsModal.vue'
import PlansModal from './PlansModal.vue'
const store = useViewsStore()
const userStore = useUserStore()
const userPlan = computed(() => userStore.userPlan)
const bitmap = computed(() => {
  const base64String = userStore.bitmap
  // Input Base64 string
  if (!base64String) return 'n/a'
  // Step 1: Decode the Base64 string to a byte array
  const bi = BigInt(base64String)
  // Step 3: Convert the BigInt to a binary string
  const binaryString = bi.toString(2)
  return `${binaryString} - "${base64String}"`
})
const view = ref<(typeof Views)[number] | null>(store.view)
const isLoading = ref(false)
const user = computed(() => !!userStore.userData)
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

const userRequestResponse = ref<{
  data: UserRequest[]
  status: 'idle' | 'loading' | 'success' | 'error'
}>({
  status: 'idle',
  data: []
})

const subscriptionDatasetResponse = ref<{
  data: SubscriptionDataset[]
  status: 'idle' | 'loading' | 'success' | 'error'
}>({
  status: 'idle',
  data: []
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
    if (_view === ViewUserRequests) {
      console.debug('[Modals] @watch view = ViewUserRequests')
      fetchUserRequest()
      fetchSubscriptionDatasets()
    }
  }
)

const fetchAcceptTermsDate = async () => {
  console.debug('[Modals:fetchAcceptTermsDate] is user:', user.value)
  /**
   * Fetches the date when the user accepted the terms of use.
   *
   * This method updates the `acceptTermsDateResponse` ref with the status of the request.
   * It sets the status to 'loading' before making the request, and updates it to 'success' or 'error' based on the outcome.
   *
   * @returns {Promise<void>}
   */
  if (!user.value) {
    return
  }
  return termsOfUseService
    .find()
    .then((data: TermsOfUse) => {
      console.debug('[Modals] fetchAcceptTermsDate call termsOfUseService.find() success:', data)
      termsOfUseResponse.value = { data, status: 'success' }
      userStore.setAcceptTermsDate(
        data.dateAcceptedTerms ? new Date(data.dateAcceptedTerms).toISOString() : null
      )
      userStore.setBitmap(data.bitmap)
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
  if (!user.value) {
    console.debug('[Modals] patchAcceptTermsDate not authenticated')
    userStore.acceptTermsDateOnLocalStorage = new Date().toISOString()
    return
  }
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
  if (!user.value) {
    return
  }
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

const fetchUserRequest = async () => {
  console.debug('[Modals] fetchUserRequest')
  // load current status
  if (!user.value) {
    return
  }
  userRequestResponse.value = { data: [], status: 'loading' }

  // fetch user requests
  userRequestsService
    .find()
    .then(data => {
      console.info('[Modals] @useEffect - userRequestsService', data)
      userRequestResponse.value = { data, status: 'success' }
    })
    .catch((err: FeathersError) => {
      console.error('[Modals] @useEffect - userRequestsService', err.message, err.data, err.code)
      userRequestResponse.value = { data: [], status: 'error' }
    })
  // fetch subscription datasets
}
const fetchSubscriptionDatasets = async () => {
  console.debug('[Modals] fetchSubscriptionDatasets')
  // load current status
  if (!user.value) {
    return
  }
  subscriptionDatasetResponse.value = { data: [], status: 'loading' }

  // fetch subscription datasets
  subscriptionDatasetsService
    .find()
    .then(data => {
      console.info('[Modals] @useEffect - subscriptionDatasetsService', data)
      subscriptionDatasetResponse.value = { data, status: 'success' }
    })
    .catch((err: FeathersError) => {
      console.error(
        '[Modals] @useEffect - subscriptionDatasetsService',
        err.message,
        err.data,
        err.code
      )
      subscriptionDatasetResponse.value = { data: [], status: 'error' }
    })
}
onMounted(() => {
  console.debug('[Modals] @mounted')
  fetchAcceptTermsDate()
})
</script>
<i18n>
  {
    "en": {
      "user_plan_label": "User Plan",
      "user_bitmap_label": "User Bitmap",
      "user_accept_terms_date_local_label": "User Accept Terms Date Local",
      "user_accept_terms_date_on_db_label": "User Accept Terms Date on db",
      "verbose_info_label": "[staff only] Verbose Info",
      "not_accepted_local_label": "Not accepted on this device",
      "not_accepted_on_db_label": "Not accepted on the server",
    }
  }
</i18n>
