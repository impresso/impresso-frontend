<template>
  <div class="Modals position-fixed top-0 end-0" style="z-index: var(--z-index-modals)">
    <DataRundownModal
      :requestDelay="500"
      :isVisible="view === ViewDataRundown"
      @dismiss="resetView"
    ></DataRundownModal>
    <ChangePasswordModal
      :isVisible="view === ViewChangePassword"
      @dismiss="resetView"
      @success="changeView(ViewChangePasswordSuccess)"
    />
    <!-- generic message Modal -->
    <InfoModal
      :isVisible="
        [ViewChangePasswordSuccess, ViewCreateSpecialMembershipRequestSuccess].includes(view as any)
      "
      :modalTitle="$t('view_' + view + '_modalTitle')"
      :title="$t('view_' + view + '_title')"
      dialogClass="modal-md modal-dialog-centered"
      @dismiss="resetView"
    >
      <p class="m-0" v-html="$t('view_' + view + '_content')"></p>
    </InfoModal>

    <SpecialMembershipModal
      :isVisible="view === ViewSpecialMembership"
      @dismiss="resetView"
      :filters="filters"
    />
    <SpecialMembershipRequestModal
      :isVisible="view === ViewCreateSpecialMembershipRequest"
      :item="store.specialMembershipAccessItem"
      @dismiss="resetView"
      @success="changeView(ViewCreateSpecialMembershipRequestSuccess)"
    />

    <TermsOfUseModalHost />
    <PlansModal
      :isVisible="view === ViewPlans"
      @dismiss="resetView"
      :modalTitle="$t('User plans overview')"
      :title="$t('Impresso User Plans')"
      :userPlan="userPlan"
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
    <UserSettingsModal
      :isVisible="view === ViewInfoModal"
      @dismiss="resetView"
      :userPlanLabel="PlanLabels[userPlan]"
      :userPlan="userPlan"
      :userBitmapBase64="userStore.bitmap"
      :acceptTermsDateOnLocalStorage="acceptTermsDateOnLocalStorage"
      :acceptTermsDate="acceptTermsDate"
    />

    <!--  -->
    <ChangePlanModal
      :show="view === ViewChangePlanRequest"
      :title="$t(userPlan === PlanNone ? 'Select a plan' : 'Change Plan')"
      @dismiss="resetView"
      @success="() => changeView(ViewConfirmChangePlanRequest)"
      :submitLabel="$t('Confirm your plan selection')"
    >
      <div v-if="userPlan !== PlanGuest && userPlan !== PlanNone">
        <p>
          You can request to change your plan any time if your situation changed. More information
          about the plans can be found in the
          <LinkToModal :view="ViewPlans">Plans page</LinkToModal>.
        </p>
        <p v-if="userPlan !== PlanNone">
          Your current plan is <b> {{ PlanLabels[userPlan] }} </b>. <br />
          Please select the plan you want to change to:
        </p>
      </div>
      <div v-if="userPlan === PlanNone">
        <h4>Important Update: Please Select Your Plan</h4>
        <p>
          We've recently updated our website's architecture and Terms of Use to improve how you
          access transcripts, facsimiles, and audio files.
        </p>
        <p>
          To ensure continued access to these features, please take a moment to select the plan that
          best reflects your status (Student or Academic Staff).
        </p>
      </div>
    </ChangePlanModal>

    <CorpusOverviewModal
      :title="$t('corpusCatalogueModalTitle')"
      :isVisible="view === ViewCorpusOverview"
      :userPlan="userPlan"
      :plansLabels="PlanLabels"
      :datasets="fetchCorpusOverviewResponse.data"
      @dismiss="resetView"
      showLink
      :isLoading="
        fetchCorpusOverviewResponse.status === 'loading' ||
        fetchCorpusOverviewResponse.status === 'idle'
      "
    />
    <FeedbackButton />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ChangePlanModal from './ChangePlanModal.vue'
import ChangePasswordModal from './modals/ChangePasswordModal.vue'
import {
  Views,
  ViewPlans,
  ViewChangePlanRequest,
  ViewConfirmChangePlanRequest,
  ViewInfoModal,
  ViewCorpusOverview,
  ViewDataRundown,
  ViewChangePassword,
  ViewChangePasswordSuccess,
  PlanGuest,
  PlanNone,
  ViewSpecialMembership,
  ViewCreateSpecialMembershipRequest,
  ViewCreateSpecialMembershipRequestSuccess
} from '@/constants'
import { useViewsStore } from '@/stores/views'
import { feedback as feedbackService } from '@/services'
import { BadRequest, type FeathersError } from '@feathersjs/errors'
import { useUserStore } from '@/stores/user'
import { PlanLabels } from '@/constants'
import TermsOfUseModalHost from './TermsOfUseModalHost.vue'
import InfoModal from './InfoModal.vue'
import CorpusOverviewModal from './CorpusOverviewModal.vue'
import type { Dataset } from './CorpusOverviewModal.vue'
import PlansModal from './PlansModal.vue'
import axios from 'axios'
import { useNotificationsStore } from '@/stores/notifications'
import DataRundownModal from './dataRundown/DataRundownModal.vue'
import LinkToModal from './LinkToModal.vue'
import SpecialMembershipRequestModal from './specialMembership/SpecialMembershipRequestModal.vue'
import SpecialMembershipModal from './specialMembership/SpecialMembershipModal.vue'
import UserSettingsModal from './modals/UserSettingsModal.vue'
import FeedbackButton from './feedback/FeedbackButton.vue'
import { Filter } from '@/models'

const store = useViewsStore()
const userStore = useUserStore()
const notificationsStore = useNotificationsStore()
const userPlan = computed(() => userStore.userPlan)

const props = defineProps<{
  filters: Filter[]
}>()
const view = ref<(typeof Views)[number] | null>(store.view)
const isLoggedIn = computed(() => !!userStore.userData)
// date of accepting the ToU on localStorage
const acceptTermsDateOnLocalStorage = computed(() => userStore.acceptTermsDateOnLocalStorage)
// date of accepting the ToU on current store (sort of cached value)
const acceptTermsDate = computed(() => userStore.acceptTermsDate)

const showChangePlanToLegacyUsers = computed(() => {
  // if the user is logged in and has a plan, show the change plan modal
  return (
    view.value === null &&
    notificationsStore.initSequenceDone &&
    isLoggedIn.value &&
    userPlan.value === PlanNone &&
    !userStore.hasPendingChangePlanRequest
  )
})

const fetchCorpusOverviewResponse = ref<{
  data: Dataset[]
  status: 'idle' | 'loading' | 'success' | 'error'
}>({
  status: 'idle',
  data: []
})

const resetView = () => {
  store.view = null
}

const changeView = (view: (typeof Views)[number]) => {
  console.debug('[Modals] changeView', view)
  store.view = view
}

// watcher for store.view changes
watch(
  () => store.view,
  _view => {
    view.value = _view
    if (_view === ViewCorpusOverview) {
      console.debug('[Modals] @watch view = ViewCorpusOverview')
      fetchCorpusOverview()
    }
  }
)

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

watch(
  showChangePlanToLegacyUsers,
  () => {
    console.debug('[Modals] @watch showChangePlanToLegacyUsers', showChangePlanToLegacyUsers.value)
    if (showChangePlanToLegacyUsers.value) {
      changeView(ViewChangePlanRequest)
    }
  },
  {
    immediate: true
  }
)
</script>
<i18n lang="json">
{
  "en": {
    "user_plan_label": "User Plan",
    "user_bitmap_label": "User Bitmap",
    "user_accept_terms_date_local_label": "User Accept Terms Date Local",
    "user_accept_terms_date_on_db_label": "User Accept Terms Date on db",
    "verbose_info_label": "[staff only] Verbose Info",
    "not_accepted_local_label": "Not accepted on this device",
    "not_accepted_on_db_label": "Not accepted on the server",
    "view_change-password-success_modalTitle": "Password changed",
    "view_change-password-success_title": "Password changed successfully",
    "view_change-password-success_content": "Your password has been changed successfully. Logout then Login with your new password.",
    "view_create-special-membership-request-success_modalTitle": "Special Membership Request Submitted",
    "view_create-special-membership-request-success_title": "Special Membership request submitted successfully",
    "view_create-special-membership-request-success_content": "Your special membership access request has been submitted successfully. We will notify you via email once your request has been processed.",
    "corpusCatalogueModalTitle": "Impresso Corpus Catalogue"
  }
}
</i18n>
