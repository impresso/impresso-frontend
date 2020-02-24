<template lang="html">
  <main id="UserDashboard">
      <b-container>

      <h2 class="border-bottom my-3 pb-3">{{ $t('Register') }}</h2>

      <b-row>

        <b-col md="6" offset-md="3">

          <ValidationObserver v-slot="{ invalid }">

            <b-form @submit.prevent="onSubmit">

              <validation-provider name="username" rules="required|min:4" v-slot="{ errors }">
                <b-form-group
                  id="input-group-0"
                  label="User Name"
                  label-for="username"
                  :description="errors[0]">
                  <b-form-input id="username" name="username" required v-model.trim="user.username" />
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
                    v-model.trim="user.email"
                  ></b-form-input>
                </b-form-group>
              </validation-provider>

              <!-- password -->
              <ValidationObserver>
                <ValidationProvider name="password" rules="required|min:12" v-slot="{ errors }" vid="repeatPassword">
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
                    :description="errors[0]"
                  ></b-form-input>
                </b-form-group>
                </ValidationProvider>

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
                      type="password" />
                  </b-form-group>
                </ValidationProvider>
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

              <ValidationProvider rules="required|ext:jpeg,jpg,gif,png,pdf" v-slot="{ validate, errors }">
                <b-form-group
                  id="nda"
                  label="Signed NDA"
                  label-for="nda"
                  :description="errors[0]">
                  <b-form-file
                    id="nda" :state="errors.length === 0" @input="validate" v-model="nda"
                    placeholder="Choose a file or drop it here..." />
                </b-form-group>
              </ValidationProvider>

              <b-button size="md" type='submit' class="mt-2" variant="outline-primary" :disabled="invalid">{{$t('actions.requestAccount')}}</b-button>

            </b-form>

          </ValidationObserver>
        </b-col>
      </b-row>

    </b-container>
  </main>
</template>

<script>
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import { required, email, confirmed, ext } from 'vee-validate/dist/rules';

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

extend('ext', {
  ...ext,
  message: 'The file must be of type IMAGE or PDF'
});


export default {
  data: () => ({
    user: {
      username: '',
      email: '',
      password: '',
      firstname: '',
      lastname: '',
      displayName: 'Researcher',
    },
    nda: null,
    repeatPassword: '',
    errors: [],
  }),
  components: {
    ValidationProvider,
    ValidationObserver,
  },
  methods: {
    onSubmit() {
      console.info('UserPage.onSubmit()', this.user, this.nda);
      // to be checked for validity...
      this.$store.dispatch('user/CREATE_USER_ACCOUNT', this.user, this.nda);
    },
  },
};
</script>

<style scoped lang="less">
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
    "form_password_repeat": "Password (again)"
  }
}
</i18n>
