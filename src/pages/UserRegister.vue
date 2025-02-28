<template>
  <main id="UserDashboard">
    <b-container class="mb-5">
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
          <h1 class="border-bottom border-dark my-3 pb-3 sans">{{ $t('Register') }}</h1>
        </div>
      </b-row>
      <b-row>
        <div class="col-12 col-lg-8 offset-lg-2" ref="errorManager">
          <FeathersErrorManager :error="featherError" />
        </div>
      </b-row>
      <b-row v-if="isCreated">
        <div class="col-12 col-lg-8 offset-lg-2">
          <p>
            Thank you for completing the first step of the registration.
            <br /><br />
            <b>Action required</b>
            <br /><br />
            Next, please download this
            <a href="https://impresso-project.ch/assets/documents/impresso_NDA.pdf" download
              >Non-Disclosure Agreement (NDA)</a
            >, sign it and email it to
            <a href="mailto:info@impresso-project.ch">info@impresso-project.ch</a>. <br /><br />
            Once we have received the signed NDA, your account will be activated within two working
            days.
          </p>
        </div>
      </b-row>
      <b-row v-else>
        <div class="col-12 col-lg-8 offset-lg-2">
          <p>
            Create your Impresso account to explore the full potential of our Web App and Datalab.
            Be careful to select the User Plan which best describes your current status and be
            prepared to provide evidence for Student user and Academic User registrations. Select
            the User Plan which fits your profile and be ready to <b>provide evidence</b> for
            Student User and Academic User registrations.
          </p>
        </div>
        <div class="col-12 col-lg-8 offset-lg-2">
          <h3 class="mb-3 font-weight-bold font-size-inherit">
            Select the User Plan which fits your profile
          </h3>
          <ChangePlanForm
            allowAllPlans
            :availablePlansLabels="availablePlansLabels"
            :availablePlans="availablePlans"
            :error="null"
            @change="onChangePlan"
            :show-submit-button="false"
          />
          <h3 class="mb-3 font-weight-bold font-size-inherit">Complete the registration form</h3>
          <p class="text-muted">
            Please use your <em>institution email address</em> if student or academic user.
          </p>
          <form @submit.prevent="onSubmit">
            <b-row>
              <div class="col">
                <b-form-group
                  id="input-group-1"
                  label="Email address"
                  label-for="email"
                  :description="v$.user.email.$errors[0]?.$message"
                >
                  <b-form-input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autocomplete="email"
                    :class="{ 'border-danger': v$.user.email.$error }"
                    v-model.trim="user.email"
                  ></b-form-input>
                </b-form-group>
              </div>
              <div class="col">
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
              </div>
            </b-row>
            <b-row>
              <div class="col">
                <b-form-group
                  id="input-group-2"
                  :label="$t('form_firstname')"
                  label-for="firstname"
                >
                  <b-form-input
                    id="firstname"
                    name="firstname"
                    autocomplete="firstname"
                    v-model.trim="user.firstname"
                    maxlength="20"
                    required
                  ></b-form-input>
                </b-form-group>
              </div>
            </b-row>
            <b-row>
              <div class="col">
                <b-form-group id="input-group-3" :label="$t('form_lastname')" label-for="lastname">
                  <b-form-input
                    id="lastname"
                    name="lastname"
                    autocomplete="lastname"
                    v-model.trim="user.lastname"
                    maxlength="20"
                    required
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
                    :class="{ 'border-danger': v$.user.password.$error }"
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
                    :class="{ 'border-danger': v$.repeatPassword.$error }"
                    type="password"
                  />
                </b-form-group>
              </div>
            </b-row>

            <div
              id="input-group-4"
              :label="$t('form_pattern')"
              label-for="pattern"
              class="input-group mb-4"
            >
              <b-form-input id="pattern" v-model="patternAsText" maxlength="70"> </b-form-input>
              <div class="input-group-append">
                <b-form-input
                  id="numcolors"
                  type="number"
                  v-model="numColors"
                  min="2"
                  max="10"
                ></b-form-input>
                <b-button
                  size="sm"
                  class="text-nowrap"
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
                class="mt-2"
                variant="outline-primary"
                :disabled="!selectedPlan || !isTermsOfUseAccepted || v$.$error || !v$.$anyDirty"
                >{{ $t('actions.requestAccount') }}</b-button
              >
            </div>
          </form>
        </div>
      </b-row>
    </b-container>
  </main>
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
import { AvailablePlans, PlanLabels } from '@/constants'
import { mapStores } from 'pinia'
import Sunset from '@/components/base/Sunset.vue'

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
    Sunset
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
      displayName: 'Researcher',
      pattern: Array()
    } as User & { password: string },
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
    numColors: 5
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
      usersService
        .create({
          ...this.user,
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
        username: { required, minLength: minLength(4), userRegex, $autoDirty: true }, // required|min:4|userRegex
        email: { required, minLength: minLength(4), email, $autoDirty: true }, // required|email
        password: { minLength: minLength(8), complexPassword, $autoDirty: true } // min: 8, regex: passwordRegex
      },
      repeatPassword: { required, sameAsPassword: sameAs(this.user.password), $autoDirty: true } // required|confirmed:repeatPassword
    }
  }
})
</script>

<style scoped lang="scss">
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
    "form_firstname": "First name",
    "form_lastname": "Last name",
    "form_pattern": "Pattern",
    "form_displayname": "User label",
    "form_change_password": "Change Password",
    "form_oldpassword": "Current Password",
    "form_password": "Password",
    "form_password_repeat": "Password (again)",
    "signUp": "(sign up)"
  }
}
</i18n>
