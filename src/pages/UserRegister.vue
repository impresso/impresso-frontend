<template>
  <div class="container my-5 UserRegister">
    <div class="row">
      <div class="col-12 col-lg-8 offset-lg-2">
        <h1 class="mb-5 sans font-weight-bold">
          {{ $t('userRegister.title') }}
        </h1>
      </div>
      <div class="col-12 col-lg-8 offset-lg-2">
        <h2 class="font-weight-bold font-size-inherit">
          {{ $t('userRegister.step1Title') }}
        </h2>
        <p>
          Select the User Plan which best describes your current status and be ready to provide
          evidence for Student User and Academic User registrations. Visit the
          <LinkToModal :view="ViewPlans">Plans</LinkToModal> page for more information.
        </p>
        <ChangePlanForm
          allowAllPlans
          :availablePlansLabels="PlanLabels"
          :availablePlans="AvailablePlansWithLabels"
          :error="null"
          @change="handlePlanChanged"
          submit-area-classes=""
          class="px-3 mb-2"
        >
          <template #submit-button>&nbsp; </template>
        </ChangePlanForm>
      </div>
      <div class="col-12 col-lg-8 offset-lg-2">
        <h2 class="font-weight-bold font-size-inherit">{{ $t('userRegister.step2Title') }}</h2>
        <ProfileForm
          :doesPlanRequireAffiliation="selectedPlan?.requireAffiliation"
          :doesPlanRequireInsitutionalUrl="selectedPlan?.requireInstitutionalUrl"
          :doesPlanExcludeCommonEmailProviders="selectedPlan?.excludeCommonEmailProviders"
          @submit="onSubmit"
          mode="create"
          class="p-0"
          submit-area-classes="position-sticky bottom-0 bg-light py-3 border-top"
          @changeAcceptTerms="handleChangeAcceptTerms"
          :disabled="!selectedPlan"
        >
          <template #accept-terms-of-use-label>
            I have read and agree to the
            <LinkToModal :view="ViewTermsOfUse">Impresso Terms of Use</LinkToModal>.
          </template>
          <template v-if="error" #form-errors>
            <Alert class="mb-3" type="error">{{ error.message }}</Alert>
          </template>
        </ProfileForm>
      </div>
    </div>
  </div>
  <InfoModal
    :is-visible="showConfirmModal"
    :modalTitle="$t('userRegister.confirmRegistrationTitle')"
    :ok-label="$t('userRegister.confirmAndRegister')"
    dialogClass="modal-dialog-centered modal-md"
    @close="showConfirmModal = false"
    hideFooter
  >
    <form @submit.prevent="handleConfirmModalOk">
      <p>
        {{ $t('userRegister.confirmRegistrationMessage') }}
      </p>
      <p class="font-weight-bold">
        {{ $t('userRegister.confirmRegistrationReminder') }}
      </p>

      <button
        autofocus
        class="btn btn-md btn-outline-secondary border border-dark btn-block"
        type="submit"
      >
        {{ $t('userRegister.confirmAndRegister') }}
      </button>
    </form>
  </InfoModal>
  <InfoModal
    :is-visible="isCreated"
    :modalTitle="$t('userRegister.title')"
    :ok-label="'OK'"
    dialogClass="modal-dialog-centered modal-md"
    @close="handleCloseSignupSuccess"
    hideFooter
  >
    <h3>Thanks for signing up for Impresso!</h3>
    <p>
      One of our team members is now reviewing your information to ensure everything is set up
      correctly.
    </p>
    <Alert type="info" class="my-3">
      You'll receive a separate email notification as soon as your account is activated and ready to
      go.
    </Alert>
    <p>
      If you have registered with a <b>Student User</b> or <b>Academic User</b> plan, please be
      aware that your account will be reviewed by our team before activation. We appreciate your
      patience during this process.
    </p>
    <RouterLink to="/" class="btn btn-md btn-outline-secondary border border-dark btn-block">
      Back to homepage
    </RouterLink>
  </InfoModal>
</template>
<script setup lang="ts">
import ProfileForm from 'impresso-ui-components/components/ProfileForm.vue'
import type { ProfileFormPayload } from 'impresso-ui-components/components/ProfileForm.vue'
import type { FeathersError } from '@feathersjs/errors'
import ChangePlanForm from 'impresso-ui-components/components/ChangePlanForm.vue'
import type {
  ChangePlanFormPayload,
  AvailablePlan as AvailablePlanType
} from 'impresso-ui-components/components/ChangePlanForm.vue'
import { ref } from 'vue'
import Alert from 'impresso-ui-components/components/Alert.vue'
import {
  AvailablePlansWithLabels,
  PlanEducational,
  PlanLabels,
  PlanResearcher,
  ViewPlans,
  ViewTermsOfUse
} from '@/constants'
import LinkToModal from '@/components/LinkToModal.vue'
import InfoModal from '@/components/InfoModal.vue'
import { users as usersService } from '@/services'

defineOptions({
  inheritAttrs: false
})

const isLoading = ref(true)
const isCreated = ref(false)

const error = ref<FeathersError | null>(null)
const showConfirmModal = ref(false)
const selectedPlan = ref<AvailablePlanType | null>(null)
const acceptedTerms = ref<boolean>(false)

const profileFormData = ref<ProfileFormPayload>({
  email: '',
  password: '',
  firstname: '',
  lastname: '',
  affiliation: '',
  institutionalUrl: '',
  pattern: ''
})

const createUser = () => {
  error.value = null
  isLoading.value = true
  const username = profileFormData.value.email.replace(/[^a-z]/g, '').toLowerCase()
  console.info(
    '[UserRegister] createUser calling service...',
    username,
    'plan:',
    selectedPlan.value.label
  )
  const user: Partial<ProfileFormPayload> & {
    username: string
    displayName: string
    plan: string
  } = {
    username: username,
    email: profileFormData.value.email,
    password: profileFormData.value.password,
    firstname: profileFormData.value.firstname,
    lastname: profileFormData.value.lastname,
    displayName: `${profileFormData.value.firstname} ${profileFormData.value.lastname}`,
    pattern: profileFormData.value.pattern,
    plan: selectedPlan.value.name
  }
  // add institutionUrl and affiliation only if required by the plan
  if (selectedPlan.value.requireAffiliation) {
    user.affiliation = profileFormData.value.affiliation
  }
  if (selectedPlan.value.requireInstitutionalUrl) {
    user.institutionalUrl = profileFormData.value.institutionalUrl
  }
  usersService
    .create(user)
    .then(res => {
      console.info('UserRegister#createUser() success, received:', res)
      isCreated.value = true
    })
    .catch((err: FeathersError) => {
      error.value = {
        message: err.message || 'An error occurred during registration.'
      } as FeathersError
    })

    .finally(() => {
      isLoading.value = false
    })
}

const onSubmit = async (formData: ProfileFormPayload) => {
  if (!selectedPlan.value) {
    error.value = {
      message: 'You must select a User Plan to register.'
    } as FeathersError
    isLoading.value = false
    return
  }
  if (!acceptedTerms.value) {
    error.value = {
      message: 'You must accept the Terms of Use to register.'
    } as FeathersError
    isLoading.value = false
    return
  }
  profileFormData.value = formData
  // Show confirmation modal for Student or Academic plans
  if (selectedPlan.value.name === PlanEducational || selectedPlan.value.name === PlanResearcher) {
    showConfirmModal.value = true
  } else {
    // For Basic plan, proceed directly
    createUser()
  }
}

const handleCloseSignupSuccess = () => {
  isCreated.value = false
  // redirect to homepage
  window.location.href = '/'
}

const handleChangeAcceptTerms = (accepted: boolean) => {
  acceptedTerms.value = accepted
}
const handlePlanChanged = (payload: ChangePlanFormPayload) => {
  console.info('UserRegister#handlePlanChangedSubmit()', payload.plan)
  selectedPlan.value = AvailablePlansWithLabels.find(plan => plan.name === payload.plan) || null
}
const handleConfirmModalOk = () => {
  showConfirmModal.value = false
  // proceed wcreating user registration@
  createUser()
}
</script>
<i18n lang="json">
{
  "en": {
    "userRegister": {
      "title": "Register",
      "step1Title": "Select the User Plan which fits your profile",
      "step2Title": "Complete the registration form",

      "confirmRegistrationTitle": "Confirm Registration",
      "confirmRegistrationMessage": "You are about to register with a Student or Academic User plan. Please make sure you have provided your institutional email address and have the required documentation ready for verification.",
      "confirmRegistrationReminder": "After submission, your account will be reviewed by our team before activation.",
      "confirmAndRegister": "Confirm and Register"
    }
  }
}
</i18n>
