<template lang="html">
  <main id="UserDashboard">
    <b-container class="mb-5">
      <b-row>
        <b-col md="6" offset-md="3">
          <div class="d-flex align-items-center my-5">
            <div class="colors-wrapper flex-shrink-1">
              <div>
                <div class="color" v-for="(color, k) in user.colors" v-bind:key="k" :style="getColorBandStyle(color)"></div>
              </div>
            </div>
            <div class="ml-4">
              <h1 class="user-fullname  m-0 sans font-weight-bold">
                {{ userLabel }}
              </h1>
              <div class="user-displayname small-caps">
                {{ user.displayName }}
              </div>
            </div>
          </div>
        </b-col>
        <b-col md="6" offset-md="3">
          <h1 class="border-bottom border-dark my-3 pb-3 sans">{{ $t('Register') }}</h1>
        </b-col>
      </b-row>
      <b-alert v-if="featherError" show dismissible fade variant="danger">{{ featherError }}</b-alert>
      <b-row v-if="isCreated">
        <b-col md="6" offset-md="3">
          <p v-hmtl="$t('form_success')"/>
        </b-col>
      </b-roW>
      <b-row v-else>
        <b-col md="6" offset-md="3">

          <ValidationObserver v-slot="{ invalid }">

            <b-form @submit.prevent="onSubmit">

              <validation-provider name="username" rules="required|min:4|userRegex" v-slot="{ errors }">
                <b-form-group
                  id="input-group-0"
                  label="User Name"
                  label-for="username"
                  :description="errors[0]">
                  <b-form-input id="username" name="username" required
                    v-model.trim="user.username"
                    :class="{'border-danger': errors[0] }"
                    />
                </b-form-group>
              </validation-provider>

              <validation-provider name="email" rules="required|email" v-slot="{ errors }">
                <b-form-group
                  id="input-group-1"
                  label="Email address"
                  label-for="email"
                  :description="errors[0]">
                  <b-form-input
                    id="email" name="email" autocomplete="home email"
                    :class="{'border-danger': errors[0] }"
                    v-model.trim="user.email"
                  ></b-form-input>
                </b-form-group>
              </validation-provider>

              <!-- password -->
              <ValidationObserver>
                <b-row>
                  <b-col>
                    <ValidationProvider name="password"
                    :rules="{ min: 8, regex: passwordRegex }"
                    v-slot="{ errors }" vid="repeatPassword">

                    <b-form-group
                      id="input-group-changepwd-2"
                      :label="$t('form_password')"
                      label-for="password"
                      :description="errors[0]">
                      <b-form-input
                        id="password" name="password"
                        v-model.trim="user.password"
                        type="password"
                        maxlength="80"
                        :class="{'border-danger': errors[0] }"
                        :description="errors[0]"
                      ></b-form-input>
                    </b-form-group>
                    </ValidationProvider>
                  </b-col>
                  <b-col>
                    <ValidationProvider rules="required|confirmed:repeatPassword" v-slot="{ errors }">
                      <b-form-group
                        id="input-group-changepwd-3"
                        :label="$t('form_password_repeat')"
                        label-for="repeat-password"
                        :description="errors[0]">
                        <b-form-input
                          id="repeat-password" name="repeat-password"
                          v-model.trim="repeatPassword"
                          maxlength="80"
                          :class="{'border-danger': errors[0] }"
                          type="password" />
                      </b-form-group>
                    </ValidationProvider>
                  </b-col>
                </b-row>
              </ValidationObserver><!--  password -->
              <b-row>
                <b-col>
                  <b-form-group id="input-group-2" :label="$t('form_firstname')" label-for="firstname">
                    <b-form-input
                      id="firstname" name="firstname" autocomplete="firstname"
                      v-model.trim="user.firstname"
                      maxlength="20"></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col>
                  <b-form-group id="input-group-3" :label="$t('form_lastname')" label-for="lastname">
                    <b-form-input
                      id="lastname" name="lastname" autocomplete="lastname"
                      v-model.trim="user.lastname"
                      maxlength="20"
                    ></b-form-input>
                  </b-form-group>
                </b-col>
              </b-row>

              <b-form-group id="input-group-5" :label="$t('form_displayname')" label-for="displayname">
                <b-form-input
                  id="displayname"
                  v-model.trim="user.displayName"
                  maxlength="20" />
              </b-form-group>

              <b-input-group id="input-group-4" :label="$t('form_pattern')" label-for="pattern" class="mb-4">
                <b-form-input
                  id="pattern"
                  v-model="patternAsText"
                  maxlength="70">
                </b-form-input>
                <b-input-group-append>
                  <b-form-input id="numcolors" type="number" v-model="numColors" min="2" max="10"></b-form-input>
                  <b-button size="sm" class="text-nowrap" variant="outline-primary" @click="onGeneratePattern">
                    {{$t('actions.generatePattern')}}
                  </b-button>
                </b-input-group-append>
              </b-input-group>

              <div class="d-flex w-100 mb-3">
                  <div class="color py-3" v-for="(color, k) in user.colors" v-bind:key="k" :style="getColorBandStyle(color)"></div>
              </div>

              <ValidationProvider v-if="allowUploadOfNDA" rules="required|ext:jpeg,jpg,gif,png,pdf" v-slot="{ validate, errors }">
                <b-form-group
                  id="nda"
                  label="Signed NDA"
                  label-for="nda"
                  :class="{'border-danger': errors[0] }"
                  :description="errors[0]">
                  <b-form-file
                    id="nda" :state="errors.length === 0" @input="validate" v-model="nda"
                    placeholder="Choose a file or drop it here..." />
                </b-form-group>
              </ValidationProvider>

              <b-button size="sm" type='submit' class="mt-2" variant="outline-primary" :disabled="invalid">{{
                $t('actions.requestAccount')
              }}</b-button>

            </b-form>

          </ValidationObserver>
        </b-col>
      </b-row>

    </b-container>
  </main>
</template>

<script>
import {
  ValidationProvider,
  ValidationObserver,
  extend
} from 'vee-validate';
import { required, email, confirmed, regex, ext } from 'vee-validate/dist/rules'
import { users as usersService } from '@/services'
import { PasswordRegex, UserRegex } from '@/logic/user'

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
  validate(value, { length }) {
    return value.length >= length;
  },
  params: ['length'],
  message: 'The {_field_} must have at least {length} characters'
});

extend('regex', {
  ...regex,
  message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
});

extend('userRegex', {
  validate: value => value.match(UserRegex),
  message: 'Please use only lowercase alpha-numeric characters'
});

extend('ext', {
  ...ext,
  message: 'The file must be of type IMAGE or PDF'
});


export default {
  props: {
    allowUploadOfNDA: Boolean,
  },
  data: () => ({
    passwordRegex: PasswordRegex,
    userRegex: UserRegex,
    user: {
      username: '',
      email: '',
      password: '',
      firstname: '',
      lastname: '',
      displayName: 'Researcher',
      colors: Array(),
      pattern: Array(),
    },
    isCreated: false,
    isLoading: false,
    nda: null,
    repeatPassword: '',
    errors: [],
    featherError: '',
    palettes:
    [
      '#96ceb4', '#ffeead', '#ffcc5c', '#ff6f69', '#588c7e', '#f2e394', '#f2ae72', '#d96459',
      '#a9bdc8', '#677e96', '#4a9bb1', '#ccd6e6', '#4f615b', '#3d95a6', '#d3deec', '#3c4b54',
      '#3e8696', '#dce5f4', '#45535f', '#4a818a', '#b2bdcc', '#2e4051', '#62797d',
      '#EF476F', '#06D6A0', '#EE6123', '#21295C', '#FA003F', '#00916E'
    ],
    numColors: 5,
  }),
  components: {
    ValidationProvider,
    ValidationObserver,
  },
  computed: {
    userLabel() {
      if (this.user.firstname.length || this.user.lastname.length) {
        return `${this.user.firstname} ${this.user.lastname}`;
      }
      return this.$t('signUp');
    },
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
  methods: {
    onSubmit() {
      console.info('UserRegister#onSubmit()', this.user, this.nda);
      // to be checked for validity...
      this.featherError = '';
      this.isLoading = true;
      usersService.create(this.user)
        .then((res) => {
          console.info('UserRegister#onSubmit() success, received:', res);
          this.isCreated = true;
        })
        .catch((err) => {
          console.warn(err);
          this.featherError = err.message;
        })
        .finally(() => {
          this.isLoading = false;
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
  created() {
    this.onGeneratePattern();
  },
};
</script>

<style scoped lang="scss">
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
    "form_change_password": "Change Password",
    "form_oldpassword": "Current Password",
    "form_password": "Password",
    "form_password_repeat": "Password (again)",
    "signUp": "(sign up)",
    "form_success": "Thank you for your registration. <br/> We will review it and email your login credentials as soon as possible."
  }
}
</i18n>
