<template lang="html">
  <main id="UserDashboard">
    <b-container>
      <b-row>
        <b-col md="6" offset-md="3">
          <div class="d-flex align-items-center my-5">
            <div class="colors-wrapper flex-shrink-1">
              <div v-if="user">
                <div class="color" v-for="(color, k) in user.colors" v-bind:key="k" :style="getColorBandStyle(color)"></div>
              </div>
            </div>
            <div class="ml-4">
              <h1 class="user-fullname  m-0 sans font-weight-bold">
                {{ user.firstname }} {{ user.lastname }}
              </h1>
              <div class="user-displayname small-caps">
                {{ user.displayName }}
              </div>
            </div>
          </div>

          <ValidationObserver v-slot="{ invalid }">

            <b-form @submit.prevent="onSubmit" v-if="user.uid">

              <validation-provider name="email" rules="required|email" v-slot="{ errors }">
                <b-form-group
                  id="input-group-1"
                  label="Email address"
                  label-for="email"
                  :description="errors[0]">
                  <b-form-input
                    id="email" name="email" autocomplete="home email"
                    v-model.trim="user.email"
                  ></b-form-input>
                </b-form-group>
              </validation-provider>

              <b-row>
                <b-col>
                  <b-form-group id="input-group-2" :label="$t('form_firstname')" label-for="firstname">
                    <b-form-input
                      id="firstname" name="firstname" autocomplete="firstname"
                      v-model="user.firstname"
                      required
                      maxlength="20"></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col>
                  <b-form-group id="input-group-3" :label="$t('form_lastname')" label-for="lastname">
                    <b-form-input
                      id="lastname" name="lastname" autocomplete="lastname"
                      v-model="user.lastname"
                      required
                      maxlength="20"
                    ></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>

              <b-form-group id="input-group-5" :label="$t('form_displayname')" label-for="input-4">
                <b-form-input
                  id="input-4"
                  v-model="user.displayName"
                  maxlength="20"></b-form-input>
              </b-form-group>

              <b-input-group id="input-group-4" :label="$t('form_pattern')" label-for="pattern" class="mb-4">
                <b-form-input
                  id="pattern"
                  v-model="patternAsText"
                  maxlength="70">
                </b-form-input>
                <b-input-group-append>
                  <b-form-input id="numcolors" type="number" v-model="numColors" min="2" max="8"></b-form-input>
                  <b-button size="sm" variant="outline-primary" @click="onGeneratePattern">
                    {{$t('actions.generatePattern')}}
                  </b-button>
                </b-input-group-append>
              </b-input-group>

              <b-button size="sm" type='submit' variant="outline-primary" :disabled="invalid">{{$t('actions.applyChanges')}}</b-button>
              <!-- (TODO)
                <b-button size="sm" variant="danger" class="float-right" @click="confirmDelete">{{ $t('actions.removeAccount') }}</b-button>
              -->

            </b-form>

          </ValidationObserver>
        </b-col>
      </b-row>

      <h2 class="border-bottom mt-5 mb-3 pb-3">{{ $t('form_change_password') }}</h2>
      <b-row class="mb-5">
        <b-col md="6" offset-md="3">
          <ValidationObserver v-slot="{ invalid }">
            <b-form @submit.prevent="onSubmitChangePassword">
              <div v-if="passwordSubmitted">
                <b-alert v-if="passwordSubmittedSuccess" variant="success" show>{{ $t('form_password_changed') }}</b-alert>
                <b-alert v-else variant="danger" show>
                  <b>{{ $t(`errors.changePassword.${passwordSubmittedError}`)}}</b>
                  <br>
                  {{ $t('form_password_changed_failed') }}
                </b-alert>
              </div>
              <!-- current password -->
              <ValidationProvider name="Password" rules="required|min:8" v-slot="{ errors }" vid="repeatPassword">
                <b-form-group
                  id="input-group-changepwd-1"
                  :label="$t('form_oldpassword')"
                  label-for="current-password"
                  :description="errors[0]"
                  >
                  <b-form-input
                    id="current-password" name="current-password"
                    v-model="previousPassword"
                    type="password" />
                </b-form-group>
              </ValidationProvider><!-- current password -->
              <!-- new password -->
              <ValidationObserver>
                <!-- dd rule:
                  Use the following Regex to satisfy the below conditions:

                  Conditions: 1] Min 1 uppercase letter.
                              2] Min 1 lowercase letter.
                              3] Min 1 special character.
                              4] Min 1 number.
                              5] Min 12 characters.
                              6] Max 42 characters.

                  Regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{12,42}$/
                -->
                <ValidationProvider name="Password" :rules="{ min: 8, regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/}" v-slot="{ errors }" vid="repeatPassword">
                <b-form-group
                  id="input-group-changepwd-2"
                  :label="$t('form_newpassword')"
                  label-for="password"
                  :description="errors[0]">
                  <b-form-input
                    id="password" name="password"
                    v-model="newPassword"
                    type="password"
                    maxlength="80"
                    :description="errors[0]"
                  ></b-form-input>
                </b-form-group>
                </ValidationProvider>

                <ValidationProvider rules="required|confirmed:repeatPassword" v-slot="{ errors }">
                  <b-form-group
                    id="input-group-changepwd-3"
                    :label="$t('form_newpassword_repeat')"
                    label-for="repeat-password"
                    :description="errors[0]">
                    <b-form-input
                      id="repeat-password" name="repeat-password"
                      v-model="repeatPassword"
                      maxlength="80"
                      type="password" />
                  </b-form-group>
                </ValidationProvider>
              </ValidationObserver><!-- new password -->
              <b-button size="sm" type='submit' :disabled="invalid" variant="outline-primary">{{ $t('actions.requestNewPassword') }}</b-button>
            </b-form>
          </ValidationObserver>
        </b-col>
      </b-row>
    </b-container>
  </main>
</template>

<script>
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import { required, email, confirmed, min, regex } from 'vee-validate/dist/rules';

extend('required', {
  ...required,
  message: 'This field is required'
});

extend('email', email);

extend('confirmed', {
  ...confirmed,
  message: 'Passwords do not match'
});

extend('min', {
  ...min,
  params: ['length'],
  message: 'Password must have at least {length} characters'
});

extend('regex', {
  ...regex,
  message: 'Password must contain at least one uppercase letter, one lowercase letter and one number'
});


export default {
  data: () => ({
    user: Object,
    previousPassword: '',
    newPassword: '',
    repeatPassword: '',
    // form results
    passwordSubmitted: false,
    passwordSubmittedSuccess: false,
    passwordSubmittedError: '',
    errors: [],
    palettes:
    [
      '#96ceb4', '#ffeead', '#ffcc5c', '#ff6f69', '#588c7e', '#f2e394', '#f2ae72', '#d96459',
      '#a9bdc8', '#677e96', '#4a9bb1', '#ccd6e6', '#4f615b', '#3d95a6', '#d3deec', '#3c4b54',
      '#3e8696', '#dce5f4', '#45535f', '#4a818a', '#b2bdcc', '#2e4051', '#62797d'
    ],
    numColors: 5,
  }),
  components: {
    ValidationProvider,
    ValidationObserver,
  },
  methods: {
    onSubmitChangePassword() {
      this.passwordSubmitted = false;
      this.passwordSubmittedError = '';
      this.$store.dispatch('user/CHANGE_PASSWORD', {
        uid: this.user.uid,
        previousPassword: this.previousPassword,
        newPassword: this.newPassword,
      }).then(() => {
        this.passwordSubmitted = true;
        this.passwordSubmittedSuccess = true;
        console.info('UserPage.onSubmitChangePassword() SUCCESS, Password changed!');
      }).catch((err) => {
        this.passwordSubmitted = true;
        this.passwordSubmittedSuccess = false;
        if (err.data && err.data.newPassword) {
          this.passwordSubmittedError = err.data.newPassword.code;
        } else {
          this.passwordSubmittedError = err.message.toLowerCase().split(' ').join('');
        }
        console.warn('UserPage.onSubmitChangePassword() failed, error: ', err);
      });
    },
    onSubmit() {
      this.$store.dispatch('user/UPDATE_CURRENT_USER', this.user).then((user) => {
        this.user = user;
      });
    },
    confirmDelete() {
      this.$bvModal.msgBoxConfirm(this.$t('Are you sure you want to permanently delete your profile?'))
        .then((ok) => {
          if (ok) {
            this.$store.dispatch('user/REMOVE_CURRENT_USER', this.user);
          }
        });
    },
    onGeneratePattern() {
      this.user.colors = [];
      // let palette = Math.floor(Math.random()*this.palettes.length);
      for (let i = 0; i < this.numColors; i ++) {
        const mycolor = this.palettes[Math.floor(Math.random()*this.palettes.length)];
        this.user.colors.push(mycolor);
      }
      this.user.pattern = this.user.colors;
    },
    getColorBandStyle(color) {
      const width = this.user.colors.length ? `${(100 / this.user.colors.length)}%` : '0%';
      return {
        'background-color': color,
        width,
      };
    },
  },
  computed: {
    patternAsText: {
      get() {
        if (this.user) {
          return this.user.pattern.join(', ');
        }
        return '';
      },
      set(v) {
        this.user.setPattern(v);
      }
    },
  },
  async mounted() {
    this.user = await this.$store.dispatch('user/GET_CURRENT_USER');
    console.info('UserPage mounted.',  this.user);
    if (this.user && this.user.pattern.length === 0) this.onGeneratePattern();
  },
};
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

.user-fullname{
  font-size:1.5rem;
}
.user-displayname{
  font-size:1.25rem;
}
</style>

<i18n>
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
    "form_password_changed_failed": "Please check the values you have entered."
  }
}
</i18n>
