<template>
  <main id="UserDashboard">
    <b-container>
      <b-row>
        <b-col md="6" offset-md="3">
          <div class="d-flex align-items-center my-5">
            <div class="colors-wrapper flex-shrink-1">
              <div v-if="user">
                <div
                  class="color"
                  v-for="(color, k) in user.colors"
                  v-bind:key="k"
                  :style="getColorBandStyle(color)"
                ></div>
              </div>
            </div>
            <div class="ml-4">
              <h1 class="user-fullname m-0 sans font-weight-bold">
                {{ user.firstname }} {{ user.lastname }}
              </h1>
              <div class="user-displayname small-caps">
                {{ user.displayName }}
              </div>
            </div>
          </div>

          <div v-if="userSubmitted">
            <b-alert v-if="userSubmittedSuccess" variant="success" show dismissible>{{
              $t('form_user_changed')
            }}</b-alert>
            <b-alert v-else variant="danger" show dismissible>
              <!-- <b>{{ $t(`errors.changeUser.${userSubmittedError}`)}}</b>
              <br> -->
              {{ $t('form_user_changed_failed') }}
            </b-alert>
          </div>

          <form @submit.prevent="onSubmit" v-if="user.uid">
            <b-form-group
              id="input-group-1"
              label="Email address"
              label-for="email"
              :description="v$.user.email.$errors[0]?.$message"
            >
              <b-form-input
                id="email"
                name="email"
                autocomplete="home email"
                v-model.trim="user.email"
              ></b-form-input>
            </b-form-group>

            <b-row>
              <b-col>
                <b-form-group
                  id="input-group-2"
                  :label="$t('form_firstname')"
                  label-for="firstname"
                >
                  <b-form-input
                    id="firstname"
                    name="firstname"
                    autocomplete="firstname"
                    v-model="user.firstname"
                    required
                    maxlength="20"
                  ></b-form-input>
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group id="input-group-3" :label="$t('form_lastname')" label-for="lastname">
                  <b-form-input
                    id="lastname"
                    name="lastname"
                    autocomplete="lastname"
                    v-model="user.lastname"
                    required
                    maxlength="20"
                  ></b-form-input>
                </b-form-group>
              </b-col>
            </b-row>

            <b-form-group id="input-group-5" :label="$t('form_displayname')" label-for="input-4">
              <b-form-input id="input-4" v-model="user.displayName" maxlength="20"></b-form-input>
            </b-form-group>

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
                  max="8"
                ></b-form-input>
                <b-button size="sm" variant="outline-primary" @click="onGeneratePattern">
                  {{ $t('actions.generatePattern') }}
                </b-button>
              </div>
            </div>

            <div v-if="user" class="d-flex w-100 mb-3">
              <div
                class="color py-3"
                v-for="(color, k) in user.colors"
                v-bind:key="k"
                :style="getColorBandStyle(color)"
              ></div>
            </div>

            <b-button
              size="sm"
              type="submit"
              variant="outline-primary"
              :disabled="v$.user.$error"
              >{{ $t('actions.applyChanges') }}</b-button
            >
            <!-- (TODO)
                <b-button size="sm" variant="danger" class="float-right" @click="confirmDelete">{{ $t('actions.removeAccount') }}</b-button>
              -->
          </form>
        </b-col>
      </b-row>
    </b-container>
    <Modal
      :show="isDeleteConfirmationDialogVisible"
      @close="hideDeleteConfirmationDialog"
      @ok="handleDeleteUserAfterConfirmation"
    >
      {{ $t('Are you sure you want to permanently delete your profile?') }}
    </Modal>
  </main>
</template>

<script lang="ts">
import Modal from '@/components/base/Modal.vue'
import { PasswordRegex } from '@/logic/user'
import User from '@/models/User'
import { useUserStore } from '@/stores/user'
import useVuelidate from '@vuelidate/core'
import { email, helpers, minLength, required, sameAs } from '@vuelidate/validators'
import { mapStores } from 'pinia'
import { defineComponent } from 'vue'

const complexPassword = helpers.withMessage(
  'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  (value: string) => PasswordRegex.exec(value) != null
)

export default defineComponent({
  setup() {
    return { v$: useVuelidate() }
  },
  data: () => ({
    passwordRegex: PasswordRegex,
    user: {} as User,
    previousPassword: '',
    newPassword: '',
    repeatPassword: '',
    // form results
    passwordSubmitted: false,
    passwordSubmittedSuccess: false,
    passwordSubmittedError: '',
    // form results
    userSubmitted: false,
    userSubmittedSuccess: false,
    userSubmittedError: '',
    errors: [],
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
      '#62797d'
    ],
    numColors: 5,
    isDeleteConfirmationDialogVisible: false
  }),
  components: {
    Modal
  },
  methods: {
    showDeleteConfirmationDialog() {
      this.isDeleteConfirmationDialogVisible = true
    },
    hideDeleteConfirmationDialog() {
      this.isDeleteConfirmationDialogVisible = false
    },

    onSubmit() {
      this.userSubmitted = false
      this.userStore
        .updateCurrentUser(this.user)
        .then(user => {
          this.userSubmittedSuccess = true
          this.user = user
        })
        .catch(err => {
          this.userSubmittedSuccess = false
          this.userSubmittedError = err
        })
        .then(() => {
          this.userSubmitted = true
        })
    },
    confirmDelete() {
      this.showDeleteConfirmationDialog()
    },
    handleDeleteUserAfterConfirmation() {
      console.error('TODO: Implement user deletion')
    },
    onGeneratePattern() {
      this.user.colors = []
      // let palette = Math.floor(Math.random()*this.palettes.length);
      for (let i = 0; i < this.numColors; i++) {
        const mycolor = this.palettes[Math.floor(Math.random() * this.palettes.length)]
        this.user.colors.push(mycolor)
      }
      this.user.pattern = this.user.colors
    },
    getColorBandStyle(color: string) {
      const width = this.user.colors.length ? `${100 / this.user.colors.length}%` : '0%'
      return {
        'background-color': color,
        width
      }
    }
  },
  computed: {
    ...mapStores(useUserStore),
    canUpdatePassword() {
      return (
        this.v$.previousPassword.$dirty &&
        !this.v$.previousPassword.$invalid &&
        this.v$.newPassword.$dirty &&
        !this.v$.newPassword.$invalid &&
        this.v$.repeatPassword.$dirty &&
        !this.v$.repeatPassword.$invalid
      )
    },
    patternAsText: {
      get() {
        if (this.user) {
          return this.user.pattern.join(', ')
        }
        return ''
      },
      set(v: string) {
        this.user.setPattern(v)
      }
    }
  },
  async mounted() {
    this.user = await this.userStore.getCurrentUser()
    console.info('UserPage mounted.', this.user)
    if (this.user && this.user.pattern.length === 0) this.onGeneratePattern()
  },
  validations() {
    return {
      user: {
        email: { required, email, $autoDirty: true }
      },
      previousPassword: { required, minLength: minLength(8), $autoDirty: true },
      newPassword: { required, minLength: minLength(8), complexPassword, $autoDirty: true },
      repeatPassword: { required, sameAsPassword: sameAs(this.newPassword), $autoDirty: true }
    }
  }
})
</script>

<style scoped lang="less">
.colors-wrapper {
  background-color: black;
  width: 100px;
  height: 100px;
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
    "form_displayname_description": "User label",
    "form_change_password": "Change Password",
    "form_oldpassword": "Current Password",
    "form_newpassword": "New Password",
    "form_newpassword_repeat": "Repeat New Password",
    "form_password_changed": "Bravo! Your password has been updated.",
    "form_password_changed_failed": "Please check the values you have entered.",
    "form_user_changed": "Your profile has been updated.",
    "form_user_changed_failed": "Please check the values you have entered."
  }
}
</i18n>
