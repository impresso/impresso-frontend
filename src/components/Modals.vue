<template>
  <div class="Modals position-fixed top-0 end-0" style="z-index: var(--z-index-modals)">
    <DataRundownModal
      :requestDelay="500"
      :isVisible="view === ViewDataRundown"
      @dismiss="() => resetView()"
    ></DataRundownModal>
    <ChangePasswordModal
      :isVisible="view === ViewChangePassword"
      @dismiss="() => resetView()"
      @success="
        () => {
          store.view = ViewChangePasswordSuccess
        }
      "
    />
    <!-- generic message Modal -->
    <InfoModal
      :isVisible="[ViewChangePasswordSuccess].includes(view as any)"
      :modalTitle="$t('view_' + view + '_modalTitle')"
      :title="$t('view_' + view + '_title')"
      dialogClass="modal-md modal-dialog-centered"
      @dismiss="() => resetView()"
    >
      <p v-html="$t('view_' + view + '_content')"></p>
    </InfoModal>
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
      :content="fetchPlansResponse.data?.planContent.body || ''"
      :userPlan="userPlan"
      :plans="fetchPlansResponse.data?.plans || []"
      :dataFeatureLabels="fetchPlansResponse.data?.DataFeatureLabels || {}"
      :requirementsLabels="fetchPlansResponse.data?.RequirementsLabels || {}"
      :isLoading="fetchPlansResponse.status === 'loading' || fetchPlansResponse.status === 'idle'"
      :values="fetchPlansResponse.data?.values || {}"
      :acceptedTermsDate="acceptTermsDate"
    >
      <!-- <template v-slot:terms-of-use-status>
        <Alert
          :type="acceptTermsDate || acceptTermsDateOnLocalStorage ? 'info' : 'warning'"
          class="bg-info mb-3"
        >
          <TermsOfUseStatus />
        </Alert>
      </template> -->
    </PlansModal>
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
      <div class="d-flex justify-content-between border-bottom p-2">
        <TermsOfUseStatus withCallToAction />
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
    <CorpusOverviewModal
      :title="$t('Corpus Overview')"
      :isVisible="view === ViewCorpusOverview"
      :userPlan="userPlan"
      :plansLabels="PlanLabels"
      :datasets="fetchCorpusOverviewResponse.data"
      @dismiss="() => resetView()"
      showLink
      :isLoading="
        fetchCorpusOverviewResponse.status === 'loading' ||
        fetchCorpusOverviewResponse.status === 'idle'
      "
    />
    <FeedbackModal
      :title="$t('label_feedback_modal')"
      :isVisible="view === ViewFeedback"
      @dismiss="() => resetView()"
      @submit="createFeedback"
      :errorMessages="errorMessages as ErrorMessage[]"
      :is-loading="feedbackCollectorResponse.status === 'loading'"
    ></FeedbackModal>
    <div class="position-fixed" style="right: 0; top: 50%">
      <button
        type="button"
        class="btn btn-primary rounded-md Modals__feedback-button"
        @click="() => (store.view = ViewFeedback)"
        style="z-index: var(--z-index-modals)"
      >
        <Icon name="sendMail" />
        <span class="ml-2">{{ $t('label_trigger_feedback_modal') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import TermsOfUseModal from './TermsOfUseModal.vue'
import ChangePlanModal from './modals/ChangePlanModal.vue'
import ChangePasswordModal from './modals/ChangePasswordModal.vue'
import type {
  SubscriptionDataset,
  TermsOfUse,
  UserRequest
} from '@/services/types'
import {
  Views,
  ViewTermsOfUse,
  ViewPlans,
  ViewChangePlanRequest,
  ViewUserRequests,
  ViewConfirmChangePlanRequest,
  ViewInfoModal,
  ViewCorpusOverview,
  ViewFeedback,
  ViewDataRundown,
  ViewChangePassword,
  ViewChangePasswordSuccess
} from '@/constants'
import { useViewsStore } from '@/stores/views'
import {
  userChangePlanRequest as userChangePlanRequestService,
  termsOfUse as termsOfUseService,
  userRequests as userRequestsService,
  subscriptionDatasets as subscriptionDatasetsService,
  feedback as feedbackService
} from '@/services'
import { BadRequest, type FeathersError } from '@feathersjs/errors'
import { useUserStore } from '@/stores/user'
import { AvailablePlans, PlanLabels } from '@/constants'
import TermsOfUseStatus from './TermsOfUseStatus.vue'
import AcceptTermsOfUse from './AcceptTermsOfUse.vue'
import Alert from './Alert.vue'
import InfoModal from './InfoModal.vue'
import UserRequestsModal from './UserRequestsModal.vue'
import CorpusOverviewModal from './CorpusOverviewModal.vue'
import type { Dataset } from './CorpusOverviewModal.vue'
import PlansModal from './PlansModal.vue'
import axios from 'axios'
import FeedbackModal from './FeedbackModal.vue'
import { FeedbackFormPayload } from './FeedbackForm.vue'
import { ErrorMessage, useNotificationsStore } from '@/stores/notifications'
import Icon from './base/Icon.vue'
import DataRundownModal from './dataRundown/DataRundownModal.vue'

const store = useViewsStore()
const userStore = useUserStore()
const notificationsStore = useNotificationsStore()
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
const isLoggedIn = computed(() => !!userStore.userData)
const errorMessages = computed(() => {
  if (feedbackCollectorResponse.value.status === 'error') {
    return [new BadRequest('Error', feedbackCollectorResponse.value.data)]
  }
  return notificationsStore.errorMessages
})
// date of accepting the ToU on localStorage
const acceptTermsDateOnLocalStorage = computed(() => userStore.acceptTermsDateOnLocalStorage)
// date of accepting the ToU on current store (sort of cached value)
const acceptTermsDate = computed(() => userStore.acceptTermsDate)


const feedbackCollectorResponse = ref<{
  data: any
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

const fetchCorpusOverviewResponse = ref<{
  data: Dataset[]
  status: 'idle' | 'loading' | 'success' | 'error'
}>({
  status: 'idle',
  data: []
})

const fetchPlansResponse = ref<{
  data: {
    plans: {
      title: string
      icon: string
      id: string
      features: {
        ref: string
        icon?: string
      }[]
      requirements: string[]
      body: string
    }[]
    AvailablePlans: string[]
    DataFeatureLabels: Record<string, string>
    ExportFeatureLabels: Record<string, string>
    GenericFeatureLabels: Record<string, string>
    RequirementsLabels: Record<string, string>
    values: Record<string, string>
    planContent: {
      excerpt: string
      body: string
    }
    features: string[]
  } | null
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
    } else if (_view === ViewPlans) {
      ;``
      console.debug('[Modals] @watch view = ViewPlans')
      fetchPlansContent()
    } else if (_view === ViewUserRequests) {
      console.debug('[Modals] @watch view = ViewUserRequests')
      fetchUserRequest()
      fetchSubscriptionDatasets()
    } else if (_view === ViewCorpusOverview) {
      console.debug('[Modals] @watch view = ViewCorpusOverview')
      fetchCorpusOverview()
    }
  }
)

watch(
  () => isLoggedIn.value,
  async () => {
    console.debug('[Modals] @watch isLoggedIn.value is logged in:', isLoggedIn.value)
    if (isLoggedIn.value) {
      isLoading.value = true
      await fetchAcceptTermsDate()
      isLoading.value = false
    }
  }
)
/**
 * Fetches the plans content from a JSON URL specified in the environment variables.
 *
 * Logs the URL being fetched from for debugging purposes.
 * If the user is not available, the function returns early.
 * Sets the fetchPlansResponse to a loading state before making the request.
 *
 * Upon successful response, updates fetchPlansResponse with the fetched data and sets the status to 'success'.
 *
 * @async
 * @function fetchPlansContent
 * @returns {Promise<void>} A promise that resolves when the fetch operation is complete.
 */
const fetchPlansContent = async (): Promise<void> => {
  console.debug('[Modals] fetchPlansContent from JSON:', import.meta.env.VITE_PLANS_JSON_URL)

  fetchPlansResponse.value = { data: null, status: 'loading' }
  const response = await axios.get(import.meta.env.VITE_PLANS_JSON_URL).then(response => {
    console.info(
      '[Modals]fetchPlansContent - axios.get(import.meta.env.VITE_PLANS_JSON_URL)',
      response
    )
    return response
  })
  fetchPlansResponse.value = { data: response.data, status: 'success' }
}

const fetchCorpusOverview = async (): Promise<void> => {
  console.debug(
    '[Modals] fetchCorpusOverview from JSON:',
    import.meta.env.VITE_CORPUS_OVERVIEW_JSON_URL
  )
  // load current status
  fetchCorpusOverviewResponse.value = { data: [], status: 'loading' }
  const response = await axios.get(import.meta.env.VITE_CORPUS_OVERVIEW_JSON_URL).then(response => {
    console.info('[Modals]fetchCorpusOverview success', response)
    return response
  })
  fetchCorpusOverviewResponse.value = { data: response.data, status: 'success' }
}

/**
 * Fetches the date when the user accepted the terms of use.
 *
 * This method updates the `acceptTermsDateResponse` ref with the status of the request.
 * It sets the status to 'loading' before making the request, and updates it to 'success' or 'error' based on the outcome.
 *@async
 * @function fetchAcceptTermsDate
 * @returns {Promise<void>}
 */
const fetchAcceptTermsDate = async (): Promise<void> => {
  console.debug('[Modals] fetchAcceptTermsDate is user logged in:', isLoggedIn.value)
  if (!isLoggedIn.value) {
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
      if (!data.dateAcceptedTerms) {
        store.view = ViewTermsOfUse
      }
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
  if (!isLoggedIn.value) {
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
  if (!isLoggedIn.value) {
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


const createFeedback = async (payload: FeedbackFormPayload) => {
  console.debug('[FeedbackModal] @createFeedback', payload)
  feedbackCollectorResponse.value = { data: null, status: 'loading' }
  await feedbackService
    .create(payload, {
      ignoreErrors: true
    })
    .then(data => {
      console.info('[FeedbackModal] Feedback sent successfully. data:', data)
      store.view = null
      feedbackCollectorResponse.value = { data, status: 'success' }
    })
    .catch((err: FeathersError) => {
      console.error('[FeedbackModal] create', err.message, err.data)
      feedbackCollectorResponse.value = { data: err.data, status: 'error' }
    })
}

const fetchUserRequest = async () => {
  console.debug('[Modals] fetchUserRequest')
  // load current status
  if (!isLoggedIn.value) {
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
  if (!isLoggedIn.value) {
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
      "label_feedback_modal": "Help us improve Impresso",
      "label_trigger_feedback_modal": "Send feedback",
      "view_change-password-success_modalTitle": "Password changed",
      "view_change-password-success_title": "Password changed",
      "view_change-password-success_content": "Your password has been changed successfully. Logout then Login with your new password.",
    }
  }
</i18n>
<style lang="css">
.Modals__feedback-button {
  position: absolute;
  right: 0;
  transform: rotate(90deg);
  top: 100px;
  margin-right: 5px;
  transform-origin: right top;
  display: flex;
}
.Modals__feedback-button:hover span {
  text-decoration: underline;
}
.Modals__feedback-button svg {
  stroke: currentColor;
}
.Modals__feedback-button span {
  white-space: nowrap;
}
</style>
