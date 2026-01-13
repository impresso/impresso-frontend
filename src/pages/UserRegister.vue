<template>
  <b-container class="mb-5 UserRegister">
    <b-row>
      <div class="col-12 col-lg-8 offset-lg-2">
        <div class="d-flex align-items-center my-5">
          <div class="colors-wrapper flex-shrink-1">
            <Sunset :colors="user.pattern" :radius="40"></Sunset>
          </div>
          <div class="ml-4">
            <h1 class="user-fullname m-0 sans font-weight-bold">
              {{ userLabel || $t('signUp') }}
            </h1>
            <div class="user-displayname small-caps">
              {{ userPlanLabel }}
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-8 offset-lg-2">
        <h1 class="border-bottom border-dark my-3 pb-3 sans">
          {{ $t(isCreated ? 'registration_successful' : 'register') }}
        </h1>
      </div>
    </b-row>
    <b-row>
      <div class="col-12 col-lg-8 offset-lg-2" ref="errorManager">
        <FeathersErrorManager :error="featherError" />
      </div>
    </b-row>
    <b-row v-if="isCreated">
      <div class="col-12 col-lg-8 offset-lg-2">
        <p>Thank you for completing the registration.</p>
        <p>
          Your account has been created, and we've received your information. Since activation is a
          manual process, one of our team members will review your details and get your account up
          and running as soon as possible. You'll receive a confirmation email once your account is
          activated.
        </p>
        <p>We appreciate your patience and look forward to welcoming you!</p>
      </div>
    </b-row>
    <b-row v-else>
      <div class="col-12 col-lg-8 offset-lg-2">
        <p>
          Create your Impresso account to explore the full potential of our Web App and Datalab.
        </p>
      </div>
      <div class="col-12 col-lg-8 offset-lg-2">
        <h3 class="mb-3 font-weight-bold font-size-inherit">
          Select the User Plan which fits your profile
        </h3>
        <p>
          Select the User Plan which best describes your current status and be ready to provide
          evidence for <em>Student User</em> and <em>Academic User</em> registrations.
          <br />
          Visit the <LinkToModal :view="ViewPlans">plans page</LinkToModal> for more information.
        </p>
        <ChangePlanForm
          allowAllPlans
          :availablePlansLabels="availablePlansLabels"
          :availablePlans="availablePlans"
          :error="null"
          @change="onChangePlan"
          :show-submit-button="false"
        />
        <h3 class="mb-3 font-weight-bold font-size-inherit">Complete the registration form</h3>

        <form @submit.prevent="onSubmit">
          <b-row>
            <div class="col">
              <b-form-group
                id="input-group-1"
                label="Email (please use institution email if available) *"
                label-for="email"
                :description="v$.user.email.$errors[0]?.$message"
              >
                <b-form-input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autocomplete="email"
                  :class="{
                    'border-danger': v$.user.email.$error,
                    'border-success': !v$.user.email.$error && v$.user.email.$dirty
                  }"
                  class="rounded-sm shadow-sm"
                  v-model.trim="user.email"
                ></b-form-input>
              </b-form-group>
              <p class="text-muted very-small pt-0 px-3">
                Note: for Student User or Academic User plans, your institution email address is
                <b>required</b>.
              </p>
            </div>

            <!-- <div class="col">
                <b-form-group
                  id="input-group-0"
                  label="User Name"
                  label-for="username"
                  :description="v$.user.username.$errors[0]?.$message"
                >
                  <b-form-input
                    id="username"
                    name="username"
                    type="text"
                    autocomplete="username"
                    required
                    v-model.trim="user.username"
                    :class="{ 'border-danger': v$.user.username.$error }"
                  />
                </b-form-group>
              </div> -->
          </b-row>
          <b-row>
            <div class="col">
              <b-form-group
                id="input-group-5"
                :label="$t('form_affiliation')"
                label-for="affiliation"
                :description="v$.user.affiliation?.$errors[0]?.$message"
              >
                <b-form-input
                  id="affiliation"
                  name="affiliation"
                  type="text"
                  autocomplete="organization"
                  v-model.trim="user.affiliation"
                  :required="doesPlanRequireAffiliation"
                  :class="{
                    'border-danger': v$.user.affiliation?.$error,
                    'border-success': !v$.user.affiliation?.$error && v$.user.affiliation?.$dirty
                  }"
                  class="rounded-sm shadow-sm"
                  :placeholder="$t('form_affiliation_placeholder')"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col">
              <b-form-group
                id="input-group-6"
                :label="$t('form_institutional_url')"
                label-for="institutional-url"
                :description="v$.user.institutionalUrl?.$errors[0]?.$message"
              >
                <b-form-input
                  id="institutional-url"
                  name="institutional-url"
                  type="url"
                  :required="doesPlanRequireAffiliation"
                  autocomplete="url"
                  v-model.trim="user.institutionalUrl"
                  :class="{
                    'border-danger': v$.user.institutionalUrl?.$error,
                    'border-success':
                      !v$.user.institutionalUrl?.$error && v$.user.institutionalUrl?.$dirty
                  }"
                  class="rounded-sm shadow-sm"
                  :placeholder="$t('form_institutional_url_placeholder')"
                ></b-form-input>
              </b-form-group>
              <p
                class="text-muted very-small pt-0 px-3"
                v-html="$t('form_institutional_url_note')"
              ></p>
            </div>
          </b-row>
          <b-row>
            <div class="col-md-6">
              <b-form-group
                id="input-group-2"
                :label="$t('form_firstname')"
                label-for="firstname"
                :description="v$.user.firstname.$errors[0]?.$message"
              >
                <b-form-input
                  id="firstname"
                  name="firstname"
                  autocomplete="firstname"
                  v-model.trim="user.firstname"
                  maxlength="20"
                  required
                  :class="{
                    'border-danger': v$.user.firstname.$error,
                    'border-success': !v$.user.firstname.$error && v$.user.firstname.$dirty
                  }"
                  class="rounded-sm shadow-sm"
                  :placeholder="$t('form_firstname')"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col-md-6">
              <b-form-group
                id="input-group-3"
                :label="$t('form_lastname')"
                label-for="lastname"
                :description="v$.user.lastname.$errors[0]?.$message"
              >
                <b-form-input
                  id="lastname"
                  name="lastname"
                  autocomplete="lastname"
                  v-model.trim="user.lastname"
                  maxlength="20"
                  required
                  :class="{
                    'border-danger': v$.user.lastname.$error,
                    'border-success': !v$.user.lastname.$error && v$.user.lastname.$dirty
                  }"
                  class="rounded-sm shadow-sm"
                  :placeholder="$t('form_lastname')"
                ></b-form-input>
              </b-form-group>
            </div>
          </b-row>
          <!-- password -->

          <b-row>
            <div class="col">
              <b-form-group
                id="input-group-changepwd-2"
                :label="$t('form_password')"
                label-for="password"
                :description="v$.user.password.$errors[0]?.$message"
              >
                <b-form-input
                  id="password"
                  name="password"
                  v-model.trim="user.password"
                  type="password"
                  maxlength="80"
                  required
                  class="rounded-sm shadow-sm"
                  :class="{
                    'border-danger': v$.user.password.$error,
                    'border-success': !v$.user.password.$error && v$.user.password.$dirty
                  }"
                ></b-form-input>
              </b-form-group>
            </div>
            <div class="col">
              <b-form-group
                id="input-group-changepwd-3"
                :label="$t('form_password_repeat')"
                label-for="repeat-password"
                :description="v$.repeatPassword.$errors[0]?.$message"
              >
                <b-form-input
                  id="repeat-password"
                  name="repeat-password"
                  v-model.trim="repeatPassword"
                  maxlength="80"
                  required
                  class="rounded-sm shadow-sm"
                  :class="{
                    'border-danger': v$.repeatPassword.$error,
                    'border-success': !v$.repeatPassword.$error && v$.repeatPassword.$dirty
                  }"
                  type="password"
                />
              </b-form-group>
            </div>
          </b-row>
          <h3 class="mb-3 font-weight-bold font-size-inherit">
            Pick a color pattern for your profile (optional)
          </h3>
          <div
            id="input-group-4"
            :label="$t('form_pattern')"
            label-for="pattern"
            class="input-group mb-4 shadow-sm rounded-sm border"
          >
            <b-form-input
              id="pattern"
              v-model="patternAsText"
              maxlength="70"
              class="border-0"
              style="
                border-right: 1px solid var(--clr-grey-500) !important;
                border-top-left-radius: var(--border-radius-sm) !important;
                border-bottom-left-radius: var(--border-radius-sm) !important;
              "
            >
            </b-form-input>
            <div class="input-group-append">
              <b-form-input
                class="border-0"
                id="numcolors"
                type="number"
                v-model="numColors"
                style="border-right: 1px solid var(--clr-grey-500) !important"
                min="2"
                max="10"
              ></b-form-input>
              <b-button
                size="sm"
                class="text-nowrap border-0 shadow-none"
                variant="outline-primary"
                @click="onGeneratePattern"
              >
                {{ $t('actions.generatePattern') }}
              </b-button>
            </div>
          </div>

          <div class="d-flex w-100 mb-3">
            <div
              class="color py-3"
              v-for="(color, k) in user.pattern"
              v-bind:key="k"
              :style="getColorBandStyle(color)"
            ></div>
          </div>

          <AcceptTermsOfUse
            localStorageOnly
            :checked="isTermsOfUseAccepted"
            v-on:change="
              (event: Event) => {
                const isChecked = (event.target as HTMLInputElement).checked
                console.debug('[UserRegister] AcceptTermsOfUse@onChange', isChecked)
                toggleAcceptTermsDate(isChecked)
              }
            "
          />

          <div class="text-center">
            <b-button
              size="lg"
              type="submit"
              class="mt-2 rounded-md"
              variant="outline-primary"
              :disabled="!selectedPlan || !isTermsOfUseAccepted"
              >{{ $t('actions.requestAccount') }}</b-button
            >
          </div>
        </form>
      </div>
    </b-row>
  </b-container>

  <!-- Confirmation Modal for Student/Academic plans -->
  <ConfirmModal
    :show="showConfirmModal"
    id="confirm-registration-modal"
    :title="$t('confirm_registration_title')"
    :ok-label="$t('confirm_and_register')"
    @ok="handleConfirmModalOk"
    @close="handleConfirmModalClose"
  >
    <p>
      {{ $t('confirm_registration_message') }}
    </p>
    <p class="font-weight-bold">
      {{ $t('confirm_registration_reminder') }}
    </p>
  </ConfirmModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import useVuelidate from '@vuelidate/core'
import { email, helpers, minLength, required, sameAs } from '@vuelidate/validators'
import { users as usersService } from '@/services'
import { PasswordRegex, UserRegex } from '@/logic/user'
import User from '@/models/User'
import FeathersErrorManager from '@/components/FeathersErrorManager.vue'
import AcceptTermsOfUse from '@/components/AcceptTermsOfUse.vue'
import { useUserStore } from '@/stores/user'
import ChangePlanForm, { ChangePlanRequestFormPayload } from '@/components/ChangePlanForm.vue'
import {
  AvailablePlans,
  PlanLabels,
  PlanEducational,
  PlanResearcher,
  PlanImpressoUser
} from '@/constants'
import Sunset from 'impresso-ui-components/components/Sunset.vue'
import LinkToModal from '@/components/LinkToModal.vue'
import ConfirmModal from '@/components/modules/collections/ConfirmModal.vue'
import { ViewPlans } from '../constants'

// Props
interface Props {
  allowUploadOfNDA?: boolean
}

withDefaults(defineProps<Props>(), {
  allowUploadOfNDA: false
})

// Refs
const errorManager = ref<HTMLElement | null>(null)
const userStore = useUserStore()

// Data
const availablePlansLabels = PlanLabels
const availablePlans = AvailablePlans
const selectedPlan = ref<string | null>(null)
const user = ref({
  username: '',
  email: '',
  password: '',
  firstname: '',
  lastname: '',
  displayName: '',
  affiliation: '',
  institutionalUrl: '',
  pattern: [] as string[]
})
const isCreated = ref(false)
const isLoading = ref(false)
const repeatPassword = ref('')
const featherError = ref<Error | null>(null)
const palettes = [
  '#96ceb4',
  '#ffeead',
  '#ffcc5c',
  '#ff6f69',
  '#588c7e',
  '#f2e394',
  '#f2ae72',
  '#d96459',
  '#a9bdc8',
  '#677e96',
  '#4a9bb1',
  '#ccd6e6',
  '#4f615b',
  '#3d95a6',
  '#d3deec',
  '#3c4b54',
  '#3e8696',
  '#dce5f4',
  '#45535f',
  '#4a818a',
  '#b2bdcc',
  '#2e4051',
  '#62797d',
  '#EF476F',
  '#06D6A0',
  '#EE6123',
  '#21295C',
  '#FA003F',
  '#00916E'
]
const numColors = ref(5)

// Modal state
const showConfirmModal = ref(false)

// Common email providers to block for non-basic plans
const commonEmailProviders = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'aol.com',
  'icloud.com',
  'mail.com',
  'protonmail.com',
  'yandex.com',
  'zoho.com'
]

// Custom validation rules
const complexPassword = helpers.withMessage(
  'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  (value: string) => PasswordRegex.exec(value) != null
)

const institutionalEmailValidator = helpers.withMessage(
  'For Student or Academic plans, please use your institutional email address (common email providers like gmail, yahoo, etc. are not accepted)',
  (value: string) => {
    // Only validate if the plan requires institutional email
    if (
      selectedPlan.value &&
      (selectedPlan.value === PlanEducational || selectedPlan.value === PlanResearcher)
    ) {
      if (!value || value.length === 0) {
        return false
      }
      // Extract domain from email
      const domain = value.split('@')[1]?.toLowerCase()
      if (!domain) {
        return false
      }
      // Check if domain is in the list of common email providers
      return !commonEmailProviders.includes(domain)
    }
    return true
  }
)

// Validation rules
const rules = computed(() => ({
  user: {
    firstname: {
      required,
      minLength: minLength(2),
      $autoDirty: true
    },
    lastname: { required, minLength: minLength(2), $autoDirty: true },
    email: {
      required,
      minLength: minLength(4),
      email,
      institutionalEmailValidator,
      $autoDirty: true
    },
    password: { minLength: minLength(8), complexPassword, $autoDirty: true },
    institutionalUrl: {
      $autoDirty: true,
      required: false,
      urlRegex: helpers.withMessage('Please enter a valid URL', (value: string) => {
        if (!value || value.length === 0) {
          return true
        }
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w._~:/?#[\]@!$&'()*+,;=-]*)?$/
        return urlPattern.test(value)
      })
    },
    affiliation: {
      $autoDirty: true,
      required: false,
      minLength: minLength(2)
    }
  },
  repeatPassword: { required, sameAsPassword: sameAs(user.value.password), $autoDirty: true }
}))

const v$ = useVuelidate(rules, { user, repeatPassword })

// Computed
const userLabel = computed(() => {
  if (user.value.firstname.length || user.value.lastname.length) {
    return `${user.value.firstname} ${user.value.lastname}`
  }
  return ''
})

const userPlanLabel = computed(() => {
  if (!selectedPlan.value) {
    return ''
  }
  return availablePlansLabels[selectedPlan.value]
})

const doesPlanRequireAffiliation = computed(() => {
  return selectedPlan.value === PlanEducational || selectedPlan.value === PlanResearcher
})

const patternAsText = computed({
  get() {
    if (user.value) {
      return user.value.pattern.join(', ')
    }
    return ''
  },
  set(v: string) {
    user.value.pattern = v.split(',').map(v => v.trim())
  }
})

const isTermsOfUseAccepted = computed(() => {
  return userStore.acceptTermsDateOnLocalStorage !== null
})

// Methods
const scrollToError = () => {
  if (errorManager.value) {
    errorManager.value.scrollIntoView({ behavior: 'smooth' })
  }
}

const toggleAcceptTermsDate = (isChecked: boolean) => {
  if (isChecked) {
    userStore.acceptTermsDateOnLocalStorage = new Date().toISOString()
  } else {
    userStore.acceptTermsDateOnLocalStorage = null
  }
}

const createUser = () => {
  featherError.value = null
  isLoading.value = true
  user.value.username = user.value.email.replace(/[^a-z]/g, '')
  console.info('[UserRegister] createUser calling service...')
  usersService
    .create({
      ...user.value,
      username: user.value.email.replace(/[^a-z]/g, ''),
      pattern: user.value.pattern.join(','),
      plan: selectedPlan.value
    })
    .then(res => {
      console.info('UserRegister#createUser() success, received:', res)
      isCreated.value = true
    })
    .catch(err => {
      console.warn(err)
      if (err.code === 409 && err.message.indexOf('auth_user.username') !== -1) {
        featherError.value = new Error('This username is already taken!')
        scrollToError()
      } else {
        featherError.value = err
        scrollToError()
      }
    })
    .finally(() => {
      isLoading.value = false
    })
}

const handleConfirmModalOk = () => {
  showConfirmModal.value = false
  createUser()
}

const handleConfirmModalClose = () => {
  showConfirmModal.value = false
}

const onSubmit = () => {
  // check vuelidate form
  v$.value.$touch()
  if (v$.value.$error) {
    console.warn('UserRegister#onSubmit() form is invalid', v$.value.$error)
    featherError.value = new Error(
      'Form submission failed: Please correct the highlighted errors and try again.'
    )
    scrollToError()
    return
  }
  // to be checked for validity...
  if (!isTermsOfUseAccepted.value) {
    featherError.value = new Error('Please accept the Terms of Use')
    scrollToError()
    return
  }
  if (!selectedPlan.value) {
    featherError.value = new Error('Please select the plan')
    scrollToError()
    return
  }

  // Show confirmation modal for Student or Academic plans
  if (selectedPlan.value === PlanEducational || selectedPlan.value === PlanResearcher) {
    showConfirmModal.value = true
  } else {
    // For Basic plan, proceed directly
    createUser()
  }
}

const onGeneratePattern = () => {
  const colors = []
  for (let i = 0; i < numColors.value; i++) {
    const mycolor = palettes[Math.floor(Math.random() * palettes.length)]
    colors.push(mycolor)
  }
  user.value.pattern = colors
}

const onChangePlan = (payload: ChangePlanRequestFormPayload) => {
  console.info('UserRegister#onChangePlanSubmit()', payload.plan)
  selectedPlan.value = payload.plan
}

const getColorBandStyle = (color: string) => {
  const width = user.value.pattern.length ? `${100 / user.value.pattern.length}%` : '0%'
  return {
    'background-color': color,
    width
  }
}

// Watchers
// Re-validate email when plan changes to ensure validation state is up-to-date
watch(selectedPlan, () => {
  // Touch the email field to trigger re-validation when plan changes
  if (v$.value.user?.email?.$dirty) {
    v$.value.user.email.$touch()
  }
})

// Lifecycle
onMounted(() => {
  onGeneratePattern()
})
</script>

<style scoped lang="scss">
.UserRegister {
  counter-reset: h3-counter;
}
h3::before {
  content: counter(h3-counter) '. ';
  counter-increment: h3-counter;
}

.colors-wrapper {
  background-color: transparent;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;

  > div {
    width: 100%;
    height: 100%;
  }
  > div > div.color {
    display: inline-block;
    height: 100%;
  }
}

.user-fullname {
  font-size: 1.5rem;
}
.user-displayname {
  font-size: 1.25rem;
}
</style>

<i18n lang="json">
{
  "en": {
    "form_firstname": "First name *",
    "form_lastname": "Last name *",
    "form_pattern": "Pattern",
    "form_displayname": "User label",
    "form_change_password": "Change Password",
    "form_oldpassword": "Current Password",
    "form_password": "Password *",
    "form_password_repeat": "Verify Password *",
    "form_affiliation": "Affiliation",
    "form_affiliation_placeholder": "University, Company, etc.",
    "form_institutional_url": "Personal webpage at home institution ",
    "form_institutional_url_placeholder": "https://...",
    "form_institutional_url_note": "Note: for Academic User plan this link is <b>required</b>.",
    "registration_successful": "Registration successful",
    "register": "Register",
    "signUp": "(sign up)",
    "confirm_registration_title": "Confirm Registration",
    "confirm_registration_message": "You are about to register with a Student or Academic User plan. Please make sure you have provided your institutional email address and have the required documentation ready for verification.",
    "confirm_registration_reminder": "After submission, your account will be reviewed by our team before activation.",
    "confirm_and_register": "Confirm and Register"
  }
}
</i18n>
