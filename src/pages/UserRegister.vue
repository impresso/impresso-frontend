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
              {{ userLabel }}
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
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { email, helpers, minLength, required, sameAs } from '@vuelidate/validators'
import { users as usersService } from '@/services'
import { PasswordRegex, UserRegex } from '@/logic/user'
import User from '@/models/User'
import FeathersErrorManager from '@/components/FeathersErrorManager.vue'
import AcceptTermsOfUse from '@/components/AcceptTermsOfUse.vue'
import { useUserStore } from '@/stores/user'
import ChangePlanForm, { ChangePlanRequestFormPayload } from '@/components/ChangePlanForm.vue'
import { AvailablePlans, PlanLabels, PlanEducational, PlanResearcher } from '@/constants'
import { mapStores } from 'pinia'
import Sunset from 'impresso-ui-components/components/Sunset.vue'
import LinkToModal from '@/components/LinkToModal.vue'
import { ViewPlans } from '../constants'

const userRegex = helpers.withMessage(
  'Please use only lowercase alpha-numeric characters',
  (value: string) => UserRegex.exec(value) != null
)

const complexPassword = helpers.withMessage(
  'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  (value: string) => PasswordRegex.exec(value) != null
)

export default defineComponent({
  setup() {
    const errorManager = ref(null)
    return { v$: useVuelidate(), errorManager }
  },

  props: {
    allowUploadOfNDA: Boolean
  },
  components: {
    FeathersErrorManager,
    AcceptTermsOfUse,
    ChangePlanForm,
    Sunset,
    LinkToModal
  },
  data: () => ({
    availablePlansLabels: PlanLabels,
    availablePlans: AvailablePlans,
    selectedPlan: null,
    passwordRegex: PasswordRegex,
    userRegex: UserRegex,
    user: {
      username: '',
      email: '',
      password: '',
      firstname: '',
      lastname: '',
      displayName: '',
      affiliation: '',
      institutionalUrl: '',
      pattern: Array()
    } as User & { password: string; affiliation: string; institutionalUrl: string },
    isCreated: false,
    isLoading: false,
    nda: null,
    repeatPassword: '',
    errors: [],
    featherError: null,
    palettes: [
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
    ],
    numColors: 5,
    ViewPlans
  }),
  computed: {
    ...mapStores(useUserStore),
    userLabel() {
      if (this.user.firstname.length || this.user.lastname.length) {
        return `${this.user.firstname} ${this.user.lastname}`
      }
      return this.$t('signUp')
    },
    userPlanLabel() {
      if (!this.selectedPlan) {
        return ''
      }
      return this.availablePlansLabels[this.selectedPlan]
    },
    doesPlanRequireAffiliation() {
      return this.selectedPlan === PlanEducational || this.selectedPlan === PlanResearcher
    },
    patternAsText: {
      get() {
        if (this.user) {
          return this.user.pattern.join(', ')
        }
        return ''
      },
      set(v: string) {
        this.user.pattern = v.split(',').map(v => v.trim())
      }
    },
    isTermsOfUseAccepted() {
      return this.userStore.acceptTermsDateOnLocalStorage !== null
    }
  },
  methods: {
    scrollToError() {
      if (this.$refs.errorManager) {
        ;(this.$refs.errorManager as HTMLElement).scrollIntoView({ behavior: 'smooth' })
      }
    },
    toggleAcceptTermsDate(isChecked: boolean) {
      if (isChecked) {
        this.userStore.acceptTermsDateOnLocalStorage = new Date().toISOString()
      } else {
        this.userStore.acceptTermsDateOnLocalStorage = null
      }
    },
    onSubmit() {
      // check vuelidate form
      this.v$.$touch()
      if (this.v$.$error) {
        console.warn('UserRegister#onSubmit() form is invalid', this.v$.$error)
        this.featherError = new Error(
          'Form submission failed: Please correct the highlighted errors and try again.'
        )
        this.scrollToError()
        return
      }
      // console.info('UserRegister#onSubmit()', this.user, this.nda);
      // to be checked for validity...
      if (!this.isTermsOfUseAccepted) {
        this.featherError = new Error('Please accept the Terms of Use')
        this.scrollToError()
        return
      }
      if (!this.selectedPlan) {
        this.featherError = new Error('Please select the plan')
        this.scrollToError()
        return
      }
      this.featherError = null
      this.isLoading = true
      this.user.username = this.user.email.replace(/[^a-z]/g, '')
      console.info('[UserRegister] onSubmit calling service...')
      usersService
        .create({
          ...this.user,
          username: this.user.email.replace(/[^a-z]/g, ''),
          pattern: this.user.pattern.join(','),
          plan: this.selectedPlan
        })
        .then(res => {
          console.info('UserRegister#onSubmit() success, received:', res)
          this.isCreated = true
        })
        .catch(err => {
          console.warn(err)
          if (err.code === 409 && err.message.indexOf('auth_user.username') !== -1) {
            this.featherError = new Error(this.$t('errors.Conflict.UsernameExistError'))
            this.scrollToError()
          } else {
            this.featherError = err
            this.scrollToError()
          }
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    onGeneratePattern() {
      const colors = []
      // let palette = Math.floor(Math.random()*this.palettes.length);
      for (let i = 0; i < this.numColors; i++) {
        const mycolor = this.palettes[Math.floor(Math.random() * this.palettes.length)]
        colors.push(mycolor)
      }
      this.user.pattern = colors
    },
    onChangePlan(payload: ChangePlanRequestFormPayload) {
      console.info('UserRegister#onChangePlanSubmit()', payload.plan)
      this.selectedPlan = payload.plan
    },
    getColorBandStyle(color: string) {
      const width = this.user.pattern.length ? `${100 / this.user.pattern.length}%` : '0%'
      return {
        'background-color': color,
        width
      }
    }
  },
  created() {
    this.onGeneratePattern()
  },
  validations() {
    return {
      user: {
        // username: { required, minLength: minLength(4), userRegex, $autoDirty: true }, // required|min:4|userRegex
        firstname: {
          required,
          minLength: minLength(2),
          $autoDirty: true
        }, // required|min:2
        lastname: { required, minLength: minLength(2), $autoDirty: true }, // required|min:2
        email: { required, minLength: minLength(4), email, $autoDirty: true }, // required|email
        password: { minLength: minLength(8), complexPassword, $autoDirty: true }, // min: 8, regex: passwordRegex
        institutionalUrl: {
          $autoDirty: true,
          required: false,
          urlRegex: helpers.withMessage('Please enter a valid URL', (value: string) => {
            if (!value || value.length === 0) {
              return true
            }
            const urlPattern =
              /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/
            return urlPattern.test(value)
          })
        },
        affiliation: {
          $autoDirty: true,
          required: false,
          minLength: minLength(2)
        }
      },
      repeatPassword: { required, sameAsPassword: sameAs(this.user.password), $autoDirty: true } // required|confirmed:repeatPassword
    }
  }
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
    "signUp": "(sign up)"
  }
}
</i18n>
